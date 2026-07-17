'use strict';

const net = require('node:net');

const { createLogger } = require('../../logger');
const { AgentError, ErrorCodes } = require('../../../utils/errors');
const { EscPosEncoder } = require('../escpos/encoder');
const { PrinterState } = require('../../../models/PrinterStatus');

const logger = createLogger('net-printer');

const CONNECT_TIMEOUT_MS = 8000;
const WRITE_TIMEOUT_MS = 20000;
const STATUS_TIMEOUT_MS = 3000;

/** RAW / JetDirect. Effectively universal on Ethernet thermal printers. */
const DEFAULT_PORT = 9100;

/**
 * Direct TCP transport for Ethernet/Wi-Fi ESC/POS printers.
 *
 * The important advantage over the spooler: this socket is BIDIRECTIONAL. We can
 * send a DLE EOT status query and the printer answers with its real, physical
 * state — cover open, paper actually out, print head overheated. The Windows
 * spooler can only tell us what Windows believes, which lags reality and often
 * just says "Normal" while the printer sits there with no paper.
 *
 * That is why, when a printer is reachable over TCP, we prefer this path.
 */
class NetworkTransport {
  /**
   * @param {{ host: string, port?: number }} options
   */
  constructor({ host, port = DEFAULT_PORT }) {
    this.host = host;
    this.port = Number(port) || DEFAULT_PORT;
  }

  /** @returns {string} */
  describe() {
    return `Network printer (${this.host}:${this.port})`;
  }

  /**
   * Opens a socket, runs `handler`, and always closes it.
   *
   * A new connection per job is deliberate. Thermal printers accept exactly one
   * TCP connection at a time, and a stale half-open socket from a previous job
   * would lock every future job out of the printer until it timed out — a failure
   * mode that looks exactly like a dead printer to the restaurant.
   *
   * @private
   * @param {(socket: net.Socket) => Promise<any>} handler
   * @param {number} timeoutMs
   * @returns {Promise<any>}
   */
  withSocket(handler, timeoutMs) {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      let settled = false;

      const finish = (error, value) => {
        if (settled) return;
        settled = true;

        socket.destroy();

        if (error) reject(error);
        else resolve(value);
      };

      socket.setTimeout(timeoutMs);

      socket.once('timeout', () => {
        finish(
          new AgentError(
            ErrorCodes.PRINTER_OFFLINE,
            `Printer at ${this.host}:${this.port} did not respond within ${timeoutMs}ms.`,
            { retryable: true }
          )
        );
      });

      socket.once('error', (error) => {
        const code = /** @type {NodeJS.ErrnoException} */ (error).code;

        // ECONNREFUSED: something is at that IP but nothing is listening on 9100.
        // EHOSTUNREACH / ETIMEDOUT: the printer is off, or unplugged from the switch.
        const message =
          code === 'ECONNREFUSED'
            ? `Nothing is listening on ${this.host}:${this.port}. Is this really the printer's IP?`
            : `Cannot reach the printer at ${this.host}:${this.port} (${code || error.message}).`;

        finish(new AgentError(ErrorCodes.PRINTER_OFFLINE, message, { retryable: true, cause: error }));
      });

      socket.connect(this.port, this.host, () => {
        Promise.resolve(handler(socket))
          .then((value) => finish(null, value))
          .catch((error) => finish(error));
      });
    });
  }

  /**
   * @param {Buffer} bytes
   * @returns {Promise<void>}
   */
  async write(bytes) {
    if (!this.host) {
      throw new AgentError(
        ErrorCodes.PRINTER_NOT_CONFIGURED,
        'No printer IP address has been configured.',
        { retryable: false }
      );
    }

    await this.withSocket(
      (socket) =>
        new Promise((resolve, reject) => {
          socket.write(bytes, (error) => {
            if (error) {
              reject(
                new AgentError(ErrorCodes.PRINTER_ERROR, `Write failed: ${error.message}`, {
                  cause: error,
                })
              );
              return;
            }

            // The bytes are in the kernel's send buffer, not necessarily on
            // paper. Thermal printers have no application-level ACK, so a
            // successful flush is the strongest confirmation available on this
            // transport. We pair it with a status query afterwards to catch a
            // printer that swallowed the job and then jammed.
            resolve();
          });
        }),
      WRITE_TIMEOUT_MS
    );

    logger.info(`Sent ${bytes.length} bytes to ${this.host}:${this.port}.`);
  }

  /**
   * Asks the printer for its real physical state (DLE EOT).
   *
   * @returns {Promise<import('../../../models/PrinterStatus').PrinterStatusReport>}
   */
  async queryStatus() {
    if (!this.host) {
      return {
        state: PrinterState.NOT_CONFIGURED,
        detail: 'No printer IP configured.',
        checkedAt: Date.now(),
      };
    }

    try {
      /** @type {{ paper: number, offline: number }} */
      const replies = await this.withSocket(
        (socket) =>
          new Promise((resolve, reject) => {
            /** @type {number[]} */
            const received = [];

            const onData = (chunk) => {
              received.push(...chunk);

              // One byte per query; we asked two questions.
              if (received.length >= 2) {
                socket.off('data', onData);
                resolve({ offline: received[0], paper: received[1] });
              }
            };

            socket.on('data', onData);

            // DLE EOT 2 = offline cause (cover open?), DLE EOT 4 = paper sensor.
            socket.write(EscPosEncoder.statusQuery(2));
            socket.write(EscPosEncoder.statusQuery(4));

            // Some clones accept the query but never answer. Do not hang the
            // whole print pipeline over a status nicety.
            setTimeout(() => {
              socket.off('data', onData);
              reject(new Error('Printer did not answer the status query.'));
            }, STATUS_TIMEOUT_MS);
          }),
        CONNECT_TIMEOUT_MS
      );

      const paper = EscPosEncoder.decodePaperStatus(replies.paper);
      const offline = EscPosEncoder.decodeOfflineStatus(replies.offline);

      if (paper.paperOut) {
        return {
          state: PrinterState.OUT_OF_PAPER,
          name: this.describe(),
          detail: 'Paper roll is empty.',
          checkedAt: Date.now(),
        };
      }

      if (offline.coverOpen) {
        return {
          state: PrinterState.COVER_OPEN,
          name: this.describe(),
          detail: 'Printer cover is open.',
          checkedAt: Date.now(),
        };
      }

      if (offline.error) {
        return {
          state: PrinterState.ERROR,
          name: this.describe(),
          detail: 'Printer reports an error (jam, or head overheated).',
          checkedAt: Date.now(),
        };
      }

      return {
        state: PrinterState.READY,
        name: this.describe(),
        detail: paper.paperLow ? 'Paper is running low.' : undefined,
        checkedAt: Date.now(),
      };
    } catch (error) {
      if (error instanceof AgentError && error.code === ErrorCodes.PRINTER_OFFLINE) {
        return {
          state: PrinterState.OFFLINE,
          name: this.describe(),
          detail: error.message,
          checkedAt: Date.now(),
        };
      }

      // A printer that prints fine but ignores status queries is common among
      // cheap clones. Do not report it as broken.
      return {
        state: PrinterState.UNKNOWN,
        name: this.describe(),
        detail: String(error.message || error),
        checkedAt: Date.now(),
      };
    }
  }
}

module.exports = { NetworkTransport, DEFAULT_PORT };
