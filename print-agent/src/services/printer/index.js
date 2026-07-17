'use strict';

const { createLogger } = require('../logger');
const { EscPosEncoder } = require('./escpos/encoder');
const { createTransport } = require('./transports');
const { renderToRaster } = require('./raster');
const { getTemplate, testPrint } = require('./templates');
const { listPrinters, defaultPrinter, resolvePortAddress } = require('./discovery');
const { containsRtl } = require('../../utils/rtl');
const { AgentError, ErrorCodes, toAgentError } = require('../../utils/errors');
const { PrinterState, printerStatus } = require('../../models/PrinterStatus');

const logger = createLogger('printer');

/**
 * Turns jobs into paper.
 *
 * The one interesting decision in here is which rendering path a job takes:
 *
 *   RTL content (Hebrew / Arabic)  -> render in Chromium, rasterise, send dots
 *   Latin content                  -> send native ESC/POS text commands
 *
 * It is chosen per job, from the job's own content, not from a global setting —
 * a restaurant in Haifa prints a Hebrew receipt for one customer and an English
 * one for the next, and both must be right. See utils/rtl.js for why the raster
 * path is mandatory for RTL rather than merely nicer.
 */
class PrintService {
  /**
   * @param {object} deps
   * @param {import('../config').ConfigService} deps.config
   * @param {string} deps.version
   */
  constructor({ config, version }) {
    this.config = config;
    this.version = version;
  }

  /**
   * Builds the transport from current settings, every time. Settings can change
   * under us (the operator picks a different printer in the Settings window while
   * a job is queued), and a cached transport would keep printing to the old one.
   *
   * @private
   * @returns {import('./transports/windowsSpooler').WindowsSpoolerTransport | import('./transports/network').NetworkTransport}
   */
  transport() {
    return createTransport({
      transport: this.config.get('transport'),
      printerName: this.config.get('printerName'),
      networkHost: this.config.get('networkHost'),
      networkPort: this.config.get('networkPort'),
    });
  }

  /** @returns {58|80} */
  paperWidth() {
    return this.config.get('paperWidth') === 58 ? 58 : 80;
  }

  // ------------------------------------------------------------- discovery

  /**
   * @returns {Promise<import('./discovery').DiscoveredPrinter[]>}
   */
  async discover() {
    return listPrinters();
  }

  /**
   * Picks a sensible printer on first run so the operator does not have to.
   *
   * Also auto-detects paper width and, when the printer turns out to be attached
   * over a TCP/IP port, records its IP — which silently upgrades that install to
   * the bidirectional network transport (real out-of-paper detection) without
   * anyone configuring anything.
   *
   * @returns {Promise<import('./discovery').DiscoveredPrinter | null>}
   */
  async autoConfigure() {
    const printer = await defaultPrinter();

    if (!printer) {
      logger.warn('No printers are installed on this machine.');
      return null;
    }

    /** @type {Record<string, unknown>} */
    const updates = { printerName: printer.name };

    if (printer.detectedWidth) {
      updates.paperWidth = printer.detectedWidth;
      logger.info(`Detected ${printer.detectedWidth}mm paper for "${printer.name}".`);
    }

    const ip = await resolvePortAddress(printer.portName || '');

    if (ip) {
      updates.networkHost = ip;
      logger.info(`"${printer.name}" is on a TCP/IP port (${ip}); enabling direct network printing.`);
    }

    this.config.setMany(updates);

    logger.info(`Auto-selected printer "${printer.name}".`);

    return printer;
  }

  // ---------------------------------------------------------------- status

  /**
   * @returns {Promise<import('../../models/PrinterStatus').PrinterStatusReport>}
   */
  async status() {
    try {
      return await this.transport().queryStatus();
    } catch (error) {
      if (error instanceof AgentError && error.code === ErrorCodes.PRINTER_NOT_CONFIGURED) {
        return printerStatus(PrinterState.NOT_CONFIGURED, { detail: error.message });
      }

      return printerStatus(PrinterState.UNKNOWN, { detail: String(error.message || error) });
    }
  }

  // ----------------------------------------------------------------- print

  /**
   * Encodes a job into an ESC/POS byte stream.
   *
   * @private
   * @param {import('../../models/Job').Job} job
   * @returns {Promise<Buffer>}
   */
  async encodeJob(job) {
    const template = getTemplate(job.type);
    const encoder = new EscPosEncoder({ width: job.width });

    const needsRaster = containsRtl(job.content);

    if (needsRaster) {
      logger.info(`Job ${job.id} contains RTL text — using the raster path.`);

      const html = template.toHtml(job);
      const raster = await renderToRaster({ html, paperWidth: job.width });

      encoder.init().align('center').raster(raster).align('left');
    } else {
      template.toEscPos(job, encoder);
    }

    // Feed the printed area clear of the head before cutting, then cut.
    encoder.feed(3).cut();

    // Receipts are the only thing that should open the till.
    if (job.type === 'receipt' && this.config.get('openCashDrawer')) {
      encoder.cashDrawer();
    }

    return encoder.encode();
  }

  /**
   * Prints a job.
   *
   * Copies are sent as separate documents rather than one document repeated
   * N times, so that a jam on copy 2 does not lose copy 1 — and so the spooler
   * shows a job per copy, which is what staff expect when they cancel one.
   *
   * @param {import('../../models/Job').Job} job
   * @returns {Promise<{ copies: number, printerStatus: object }>}
   * @throws {AgentError}
   */
  async print(job) {
    if (this.config.get('paused')) {
      throw new AgentError(
        ErrorCodes.PRINTING_PAUSED,
        'Printing is paused for this device.',
        { retryable: true }
      );
    }

    const transport = this.transport();

    let bytes;

    try {
      bytes = await this.encodeJob(job);
    } catch (error) {
      // A rendering failure is our bug or a malformed job — never the printer's
      // fault, and retrying it would fail identically. Mark it non-retryable so
      // it does not occupy the queue forever.
      const agentError = toAgentError(error, ErrorCodes.RENDER_FAILED);
      agentError.retryable = false;
      throw agentError;
    }

    logger.info(
      `Printing job ${job.id} (${job.type}, ${job.width}mm, ${job.copies} copy/copies) ` +
        `via ${transport.describe()} — ${bytes.length} bytes.`
    );

    for (let copy = 1; copy <= job.copies; copy += 1) {
      await transport.write(bytes, { docName: `FikraNova ${job.type} ${job.id} (${copy}/${job.copies})` });
    }

    // Ask the printer how it feels afterwards. A printer that accepted the bytes
    // and then ran out of paper mid-receipt would otherwise be reported as a
    // clean success, and the restaurant would never learn why nothing came out.
    const status = await this.status();

    if (status.state === PrinterState.OUT_OF_PAPER) {
      throw new AgentError(
        ErrorCodes.PRINTER_OUT_OF_PAPER,
        'The printer ran out of paper while printing this job.',
        { retryable: true }
      );
    }

    if (status.state === PrinterState.COVER_OPEN) {
      throw new AgentError(ErrorCodes.PRINTER_COVER_OPEN, 'The printer cover is open.', {
        retryable: true,
      });
    }

    return { copies: job.copies, printerStatus: status };
  }

  /**
   * Prints the built-in diagnostic slip.
   *
   * Always takes the raster path, because its whole purpose is to prove the
   * Hebrew/Arabic pipeline works on this specific machine and printer.
   *
   * @returns {Promise<{ printerStatus: object }>}
   */
  async printTestPage() {
    const transport = this.transport();
    const paperWidth = this.paperWidth();

    const html = testPrint.toHtml({
      paperWidth,
      restaurantName: String(this.config.get('restaurantName') || ''),
      deviceId: String(this.config.get('deviceId') || ''),
      version: this.version,
      printerName: String(this.config.get('printerName') || this.config.get('networkHost') || ''),
    });

    const raster = await renderToRaster({ html, paperWidth });

    const encoder = new EscPosEncoder({ width: paperWidth });
    encoder.init().align('center').raster(raster).align('left').feed(3).cut();

    await transport.write(encoder.encode(), { docName: 'FikraNova Test Print' });

    logger.info('Test print sent.');

    return { printerStatus: await this.status() };
  }

  /**
   * Kicks the cash drawer without printing anything.
   * @returns {Promise<void>}
   */
  async openCashDrawer() {
    const encoder = new EscPosEncoder({ width: this.paperWidth() });
    encoder.init().cashDrawer();

    await this.transport().write(encoder.encode(), { docName: 'FikraNova Cash Drawer' });
  }
}

module.exports = { PrintService };
