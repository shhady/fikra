'use strict';

/**
 * ESC/POS command encoder.
 *
 * Written in-house rather than pulling in node-escpos, for two concrete reasons:
 *
 *  1. node-escpos's USB adapter is built on libusb/node-usb. To use it on
 *     Windows you must replace the printer's vendor driver with WinUSB (Zadig).
 *     On thousands of restaurant PCs where the printer is already installed and
 *     working as a Windows printer, that is not a deployment step anyone will
 *     accept. We send raw bytes to the Windows spooler instead, which needs no
 *     driver surgery.
 *  2. It is a native dependency, so it would have to be recompiled for every
 *     Electron version, forever, on every machine that builds this project.
 *
 * The command set below is the Epson ESC/POS standard that every thermal
 * receipt printer worth supporting implements (Epson, Star, Xprinter, Rongta,
 * Bixolon, and the countless generic 58/80mm clones).
 *
 * Reference: Epson ESC/POS Command Reference.
 */

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

/** Dots across the print head. This is the hard physical limit per line. */
const DOTS_PER_LINE = Object.freeze({
  80: 576, // 80mm paper, 72mm printable
  58: 384, // 58mm paper, 48mm printable
});

/** Characters per line in Font A (12x24 dots). */
const CHARS_PER_LINE = Object.freeze({
  80: 48,
  58: 32,
});

const Align = Object.freeze({ LEFT: 0, CENTER: 1, RIGHT: 2 });

/**
 * Builds an ESC/POS byte stream.
 *
 * Every method returns `this`, so a receipt reads as a sequence of physical
 * actions:
 *
 *   encoder.init().align('center').bold(true).text('FikraNova').cut()
 */
class EscPosEncoder {
  /**
   * @param {object} [options]
   * @param {58|80} [options.width] paper width in mm
   */
  constructor(options = {}) {
    /** @type {number[]} */
    this.buffer = [];
    this.width = options.width === 58 ? 58 : 80;
  }

  /** @returns {number} dots across the head for this paper width */
  get dots() {
    return DOTS_PER_LINE[this.width];
  }

  /** @returns {number} characters per line in the default font */
  get columns() {
    return CHARS_PER_LINE[this.width];
  }

  /**
   * @param {...number} bytes
   * @returns {this}
   */
  raw(...bytes) {
    this.buffer.push(...bytes);
    return this;
  }

  /**
   * @param {Buffer|Uint8Array|number[]} bytes
   * @returns {this}
   */
  rawBytes(bytes) {
    this.buffer.push(...Array.from(bytes));
    return this;
  }

  /**
   * ESC @ — reset to power-on defaults.
   * Always call this first: the previous job may have left the printer in
   * double-height bold centred mode, and thermal printers have no session.
   * @returns {this}
   */
  init() {
    return this.raw(ESC, 0x40);
  }

  /**
   * ESC t n — select character code page.
   * @param {number} page 0 = CP437 (default), 16 = CP1252, 17 = CP866...
   * @returns {this}
   */
  codepage(page = 0) {
    return this.raw(ESC, 0x74, page);
  }

  /**
   * ESC a n — justification.
   * @param {'left'|'center'|'right'} alignment
   * @returns {this}
   */
  align(alignment) {
    const value =
      alignment === 'center' ? Align.CENTER : alignment === 'right' ? Align.RIGHT : Align.LEFT;

    return this.raw(ESC, 0x61, value);
  }

  /**
   * ESC E n — emphasised (bold).
   * @param {boolean} enabled
   * @returns {this}
   */
  bold(enabled = true) {
    return this.raw(ESC, 0x45, enabled ? 1 : 0);
  }

  /**
   * ESC - n — underline.
   * @param {boolean} enabled
   * @returns {this}
   */
  underline(enabled = true) {
    return this.raw(ESC, 0x2d, enabled ? 1 : 0);
  }

  /**
   * GS ! n — character size multiplier.
   *
   * The low nibble scales height, the high nibble scales width; each is a
   * 0-based multiplier (0 = 1x, 1 = 2x ... 7 = 8x). Most printers only honour
   * up to 2x reliably, which is all a receipt needs.
   *
   * @param {number} widthScale 1..8
   * @param {number} heightScale 1..8
   * @returns {this}
   */
  size(widthScale = 1, heightScale = 1) {
    const w = Math.min(8, Math.max(1, Math.floor(widthScale))) - 1;
    const h = Math.min(8, Math.max(1, Math.floor(heightScale))) - 1;

    return this.raw(GS, 0x21, (w << 4) | h);
  }

  /**
   * Convenience: double-width AND double-height.
   * @param {boolean} enabled
   * @returns {this}
   */
  doubleSize(enabled = true) {
    return enabled ? this.size(2, 2) : this.size(1, 1);
  }

  /**
   * Writes text. Encoded as latin1 — this path is for Latin scripts only.
   *
   * Hebrew and Arabic never reach here: they go through the raster path
   * (see services/printer/raster.js), because a codepage lookup cannot shape
   * Arabic letterforms or apply the bidi algorithm.
   *
   * @param {string} value
   * @returns {this}
   */
  text(value) {
    return this.rawBytes(Buffer.from(String(value ?? ''), 'latin1'));
  }

  /**
   * Text followed by a newline.
   * @param {string} [value]
   * @returns {this}
   */
  line(value = '') {
    return this.text(value).raw(LF);
  }

  /**
   * ESC d n — feed n lines.
   * @param {number} lines
   * @returns {this}
   */
  feed(lines = 1) {
    return this.raw(ESC, 0x64, Math.min(255, Math.max(0, Math.floor(lines))));
  }

  /**
   * A full-width horizontal rule, drawn with a repeated character (thermal
   * printers have no line-drawing primitive).
   * @param {string} [character]
   * @returns {this}
   */
  rule(character = '-') {
    return this.line(character.repeat(this.columns));
  }

  /**
   * Two columns: label flush left, value flush right, padded to the full width.
   * This is how every price line on a receipt is laid out.
   *
   * @param {string} left
   * @param {string} right
   * @returns {this}
   */
  columnsLR(left, right) {
    const leftText = String(left ?? '');
    const rightText = String(right ?? '');

    const padding = Math.max(1, this.columns - leftText.length - rightText.length);

    // If the label is too long to fit alongside its value, truncate the label
    // rather than letting the line wrap and push the price onto its own row.
    if (padding === 1 && leftText.length + rightText.length + 1 > this.columns) {
      const room = Math.max(0, this.columns - rightText.length - 1);
      return this.line(`${leftText.slice(0, room)} ${rightText}`);
    }

    return this.line(`${leftText}${' '.repeat(padding)}${rightText}`);
  }

  /**
   * GS ( k — QR code.
   *
   * Four sub-commands, in this order: select model, set module size, set error
   * correction, store the data, then print what was stored.
   *
   * @param {string} data
   * @param {{ size?: number, errorCorrection?: 'L'|'M'|'Q'|'H' }} [options]
   * @returns {this}
   */
  qr(data, options = {}) {
    const payload = Buffer.from(String(data ?? ''), 'utf8');

    // Module size 1..16 dots. 6 is a good default: scannable by a phone from a
    // printed 80mm receipt without eating half the paper.
    const moduleSize = Math.min(16, Math.max(1, options.size ?? 6));

    const levels = { L: 48, M: 49, Q: 50, H: 51 };
    const level = levels[options.errorCorrection ?? 'M'] ?? 49;

    // Model 2 (the ubiquitous one).
    this.raw(GS, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);
    // Module size.
    this.raw(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, moduleSize);
    // Error correction level.
    this.raw(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, level);

    // Store data. Length includes the 3 header bytes (0x31 0x50 0x30).
    const length = payload.length + 3;
    const pL = length & 0xff;
    const pH = (length >> 8) & 0xff;

    this.raw(GS, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30);
    this.rawBytes(payload);

    // Print the stored symbol.
    return this.raw(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30);
  }

  /**
   * GS k — 1D barcode (CODE128).
   *
   * CODE128 is the only sensible default: it encodes the full ASCII range, so an
   * order number like "A-1042" works, whereas EAN/UPC would reject it.
   *
   * @param {string} data
   * @param {{ height?: number, width?: number, hri?: boolean }} [options]
   * @returns {this}
   */
  barcode(data, options = {}) {
    const value = String(data ?? '');

    // GS h n — bar height in dots.
    this.raw(GS, 0x68, Math.min(255, Math.max(1, options.height ?? 80)));
    // GS w n — module width (2..6).
    this.raw(GS, 0x77, Math.min(6, Math.max(2, options.width ?? 3)));
    // GS H n — print the human-readable digits below the bars (2 = below).
    this.raw(GS, 0x48, options.hri === false ? 0 : 2);

    // Code set B covers printable ASCII. The {B prefix selects it.
    const payload = Buffer.from(`{B${value}`, 'latin1');

    // GS k 73 n d1..dn — the "with explicit length" form. The older
    // NUL-terminated form cannot carry a payload containing 0x00.
    this.raw(GS, 0x6b, 73, payload.length);
    this.rawBytes(payload);

    return this.raw(LF);
  }

  /**
   * GS v 0 — raster bit image.
   *
   * This is the command that makes correct Hebrew and Arabic possible: we hand
   * the printer a 1-bit bitmap of the receipt as rendered by Chromium, and it
   * simply burns the dots. No codepage, no shaping, no bidi — those were all
   * solved upstream by a real text engine.
   *
   * It is also how the logo is printed.
   *
   * Bit order: MSB first, 1 = black dot. Each row is ceil(width/8) bytes.
   *
   * @param {object} bitmap
   * @param {number} bitmap.width in dots; must be <= this.dots
   * @param {number} bitmap.height in dots
   * @param {Buffer|Uint8Array} bitmap.data packed 1-bit rows
   * @returns {this}
   */
  raster({ width, height, data }) {
    const bytesPerRow = Math.ceil(width / 8);

    if (bytesPerRow * height !== data.length) {
      throw new Error(
        `Raster size mismatch: expected ${bytesPerRow * height} bytes for ` +
          `${width}x${height}, received ${data.length}.`
      );
    }

    // Printers reject (or garble) an image wider than the head.
    if (width > this.dots) {
      throw new Error(`Raster is ${width} dots wide but the head is only ${this.dots}.`);
    }

    const xL = bytesPerRow & 0xff;
    const xH = (bytesPerRow >> 8) & 0xff;
    const yL = height & 0xff;
    const yH = (height >> 8) & 0xff;

    // m = 0 : normal density, no scaling.
    this.raw(GS, 0x76, 0x30, 0x00, xL, xH, yL, yH);

    return this.rawBytes(data);
  }

  /**
   * ESC p — pulse the cash-drawer solenoid.
   *
   * The drawer is wired to the printer's RJ11 port, so "open the drawer" is
   * literally a printer command. Pin 2 is the near-universal wiring; pin 5
   * exists but is rare.
   *
   * @param {{ pin?: 2|5, onMs?: number, offMs?: number }} [options]
   * @returns {this}
   */
  cashDrawer(options = {}) {
    const pin = options.pin === 5 ? 1 : 0;

    // Durations are in 2ms units. 25 -> 50ms on, 250 -> 500ms off. Long enough
    // to throw the solenoid, short enough not to cook it.
    const onTime = Math.min(255, Math.max(1, Math.round((options.onMs ?? 50) / 2)));
    const offTime = Math.min(255, Math.max(1, Math.round((options.offMs ?? 500) / 2)));

    return this.raw(ESC, 0x70, pin, onTime, offTime);
  }

  /**
   * GS V — cut the paper.
   *
   * Always feed before cutting. The blade sits several millimetres above the
   * print head, so cutting immediately would slice through the last lines of the
   * receipt.
   *
   * @param {{ partial?: boolean, feed?: number }} [options]
   * @returns {this}
   */
  cut(options = {}) {
    const feedUnits = Math.min(255, Math.max(0, options.feed ?? 4));

    // GS V 66 n : "feed n units, then cut". Function B, supported far more
    // widely than the bare GS V 0/1.
    return this.raw(GS, 0x56, options.partial === false ? 65 : 66, feedUnits);
  }

  /**
   * DLE EOT n — real-time status query.
   *
   * Returns the bytes to WRITE; the caller reads the reply from the transport.
   * Only meaningful over a bidirectional transport (network/serial). The Windows
   * spooler is write-only, so status there comes from the spooler API instead.
   *
   * @param {1|2|3|4} type 1=printer, 2=offline cause, 3=error, 4=paper sensor
   * @returns {Buffer}
   */
  static statusQuery(type = 1) {
    return Buffer.from([0x10, 0x04, type]);
  }

  /**
   * Decodes a paper-sensor status byte (DLE EOT 4).
   *
   * Bits 2 and 3 set = the "paper near end" sensor is triggered.
   * Bits 5 and 6 set = paper is actually out and the printer has stopped.
   *
   * @param {number} statusByte
   * @returns {{ paperOut: boolean, paperLow: boolean }}
   */
  static decodePaperStatus(statusByte) {
    return {
      paperLow: (statusByte & 0x0c) !== 0,
      paperOut: (statusByte & 0x60) !== 0,
    };
  }

  /**
   * Decodes a printer status byte (DLE EOT 2 — offline cause).
   * @param {number} statusByte
   * @returns {{ coverOpen: boolean, paperFeeding: boolean, offline: boolean, error: boolean }}
   */
  static decodeOfflineStatus(statusByte) {
    return {
      coverOpen: (statusByte & 0x04) !== 0,
      paperFeeding: (statusByte & 0x08) !== 0,
      offline: (statusByte & 0x08) !== 0,
      error: (statusByte & 0x40) !== 0,
    };
  }

  /** @returns {Buffer} everything encoded so far */
  encode() {
    return Buffer.from(this.buffer);
  }

  /** Empties the buffer so the encoder can be reused. @returns {this} */
  reset() {
    this.buffer = [];
    return this;
  }
}

module.exports = { EscPosEncoder, DOTS_PER_LINE, CHARS_PER_LINE, Align };
