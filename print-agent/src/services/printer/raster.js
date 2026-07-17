'use strict';

const { BrowserWindow } = require('electron');

const { createLogger } = require('../logger');
const { AgentError, ErrorCodes } = require('../../utils/errors');
const { DOTS_PER_LINE } = require('./escpos/encoder');

const logger = createLogger('raster');

/** A page that will not render in this long is broken, not slow. */
const RENDER_TIMEOUT_MS = 15000;

/** Thermal paper is pure black-and-white; this is the mid-point cutoff. */
const DEFAULT_THRESHOLD = 128;

/**
 * Canvas height we render onto before trimming, in dots.
 *
 * At 203 dpi (8 dots/mm) this is ~75cm of paper — far longer than any real
 * receipt, including a 60-item catering order. We render tall and crop rather
 * than measuring the layout with JavaScript, because measuring would require
 * enabling a script engine on customer-supplied content. See renderHtmlToPixels.
 */
const MAX_RENDER_HEIGHT = 6000;

/** Blank dots kept below the last line, so text is not flush with the cut. */
const BOTTOM_MARGIN_DOTS = 16;

/**
 * Renders HTML to a 1-bit bitmap suitable for the ESC/POS raster command.
 *
 * This is the mechanism that makes correct Hebrew and Arabic receipts possible.
 *
 * A thermal printer renders text by looking each byte up in a codepage. It has
 * no bidirectional algorithm and no glyph-shaping engine. Hebrew therefore comes
 * out in the wrong visual order, and Arabic — whose letters change shape based on
 * their neighbours — comes out as a row of disconnected, isolated forms that a
 * native speaker cannot read. No amount of codepage fiddling fixes this, because
 * the missing capability is not a character set, it is a text engine.
 *
 * Chromium *has* that text engine. So instead of sending characters, we let
 * Chromium lay the receipt out — full bidi, full shaping, real fonts — take a
 * picture of the result, reduce it to black and white, and send the printer a
 * grid of dots. The printer's only job becomes burning dots, which it does
 * perfectly.
 *
 * The same path prints the bitmap logo, and it is why adding a barcode/label
 * printer later needs no new rendering code.
 */

/**
 * Renders an HTML string offscreen and returns raw pixels.
 *
 * @param {object} options
 * @param {string} options.html complete HTML document
 * @param {number} options.width bitmap width in dots (= CSS pixels at scale 1)
 * @returns {Promise<{ width: number, height: number, bitmap: Buffer }>} BGRA pixels
 */
async function renderHtmlToPixels({ html, width }) {
  /** @type {BrowserWindow | null} */
  let win = null;

  try {
    win = new BrowserWindow({
      width,
      // Render onto a canvas tall enough for any realistic receipt, then trim the
      // blank tail off the captured bitmap (see trimBlankRows).
      //
      // The obvious alternative — measure document.scrollHeight and resize to fit
      // — needs executeJavaScript, which needs `javascript: true`. This content is
      // customer-supplied (a name typed into a website, relayed by the cloud), so
      // we keep scripting OFF and pay for it with a crop instead. Trimming is a
      // few milliseconds of arithmetic; enabling a script engine to render a
      // static receipt is a standing invitation.
      height: MAX_RENDER_HEIGHT,
      show: false,
      frame: false,
      useContentSize: true,
      webPreferences: {
        offscreen: true, // render without ever touching the screen
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        javascript: false, // templates are static HTML; nothing should execute
        images: true,
        backgroundThrottling: false, // hidden windows are throttled by default
        // Force 1 CSS pixel == 1 printer dot. Without this, a machine with a
        // 150% display scale would silently render the receipt 1.5x too wide.
        zoomFactor: 1,
      },
    });

    const contents = win.webContents;

    const loaded = new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new AgentError(ErrorCodes.RENDER_FAILED, 'Receipt rendering timed out.')),
        RENDER_TIMEOUT_MS
      );

      contents.once('did-finish-load', () => {
        clearTimeout(timer);
        resolve(undefined);
      });

      contents.once('did-fail-load', (_event, code, description) => {
        clearTimeout(timer);
        reject(
          new AgentError(ErrorCodes.RENDER_FAILED, `Receipt failed to render: ${description} (${code})`)
        );
      });
    });

    await contents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    await loaded;

    // Give the compositor a frame to paint before we capture.
    await new Promise((resolve) => setTimeout(resolve, 150));

    const image = await contents.capturePage();
    const size = image.getSize();

    if (size.width === 0 || size.height === 0) {
      throw new AgentError(ErrorCodes.RENDER_FAILED, 'Rendered receipt was empty.');
    }

    return {
      width: size.width,
      height: size.height,
      bitmap: image.toBitmap(), // BGRA, 4 bytes per pixel, top-left origin
    };
  } finally {
    if (win && !win.isDestroyed()) win.destroy();
  }
}

/**
 * Finds where the receipt actually ends, so we do not feed and print half a
 * metre of blank paper.
 *
 * Scans upward for the last row containing any non-white pixel, then keeps a
 * small margin below it.
 *
 * @param {object} options
 * @param {Buffer} options.bitmap BGRA
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} [options.threshold]
 * @returns {{ height: number, truncated: boolean }}
 */
function trimBlankRows({ bitmap, width, height, threshold = DEFAULT_THRESHOLD }) {
  let lastInkRow = -1;

  for (let y = height - 1; y >= 0; y -= 1) {
    let hasInk = false;

    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;

      const blue = bitmap[offset];
      const green = bitmap[offset + 1];
      const red = bitmap[offset + 2];
      const alpha = bitmap[offset + 3];

      const luma = 0.299 * red + 0.587 * green + 0.114 * blue;
      const alphaRatio = alpha / 255;
      const value = luma * alphaRatio + 255 * (1 - alphaRatio);

      if (value < threshold) {
        hasInk = true;
        break;
      }
    }

    if (hasInk) {
      lastInkRow = y;
      break;
    }
  }

  // A completely blank render means the template produced nothing — a bug worth
  // failing on rather than silently cutting a blank receipt.
  if (lastInkRow < 0) {
    return { height: 0, truncated: false };
  }

  // If ink reaches the very bottom of the canvas, the receipt was longer than we
  // allowed for and has been cut off. Extremely unlikely (MAX_RENDER_HEIGHT is
  // ~75cm of paper), but a silently truncated receipt is exactly the kind of bug
  // that reaches a customer, so say so.
  const truncated = lastInkRow >= height - 1;

  return {
    height: Math.min(height, lastInkRow + 1 + BOTTOM_MARGIN_DOTS),
    truncated,
  };
}

/**
 * Converts BGRA pixels to a packed 1-bit-per-pixel buffer for GS v 0.
 *
 * Thermal output is binary: a dot is either burned or it is not. We convert each
 * pixel to luminance and compare against a threshold.
 *
 * Plain thresholding (not dithering) is the right default here because receipts
 * are overwhelmingly text: dithering anti-aliased glyph edges scatters stray dots
 * around every letter and makes small type look muddy. Dithering is offered for
 * photographic logos, where banding would otherwise be obvious.
 *
 * @param {object} options
 * @param {Buffer} options.bitmap BGRA pixels
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} [options.threshold] 0..255
 * @param {boolean} [options.dither] Floyd-Steinberg; use for photos, not text
 * @returns {{ width: number, height: number, data: Buffer }}
 */
function packMonochrome({ bitmap, width, height, threshold = DEFAULT_THRESHOLD, dither = false }) {
  // Luminance per pixel, as floats so dithering can push error into neighbours.
  const luminance = new Float32Array(width * height);

  for (let i = 0; i < width * height; i += 1) {
    const offset = i * 4;

    const blue = bitmap[offset];
    const green = bitmap[offset + 1];
    const red = bitmap[offset + 2];
    const alpha = bitmap[offset + 3];

    // Rec. 601 luma. Transparent pixels are treated as white paper, not black —
    // otherwise every margin would come out as a solid burned block.
    const luma = 0.299 * red + 0.587 * green + 0.114 * blue;
    const alphaRatio = alpha / 255;

    luminance[i] = luma * alphaRatio + 255 * (1 - alphaRatio);
  }

  const bytesPerRow = Math.ceil(width / 8);
  const data = Buffer.alloc(bytesPerRow * height, 0);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const value = luminance[index];

      // Dark pixel -> burn a dot. In GS v 0, a set bit means "black".
      const isBlack = value < threshold;

      if (isBlack) {
        const byteIndex = y * bytesPerRow + (x >> 3);
        // MSB first: the leftmost pixel of each group of 8 is bit 7.
        data[byteIndex] |= 0x80 >> (x & 7);
      }

      if (dither) {
        // Floyd-Steinberg: push the quantisation error into the pixels we have
        // not visited yet, so large flat areas average out to the right grey.
        const error = value - (isBlack ? 0 : 255);

        const spread = (dx, dy, factor) => {
          const nx = x + dx;
          const ny = y + dy;

          if (nx < 0 || nx >= width || ny >= height) return;
          luminance[ny * width + nx] += error * factor;
        };

        spread(1, 0, 7 / 16);
        spread(-1, 1, 3 / 16);
        spread(0, 1, 5 / 16);
        spread(1, 1, 1 / 16);
      }
    }
  }

  return { width, height, data };
}

/**
 * Renders a receipt's HTML straight to a printable 1-bit raster.
 *
 * @param {object} options
 * @param {string} options.html
 * @param {58|80} options.paperWidth
 * @param {boolean} [options.dither]
 * @returns {Promise<{ width: number, height: number, data: Buffer }>}
 */
async function renderToRaster({ html, paperWidth, dither = false }) {
  const width = DOTS_PER_LINE[paperWidth] || DOTS_PER_LINE[80];

  const pixels = await renderHtmlToPixels({ html, width });

  // Chromium can hand back a surface a pixel or two wider than we asked for on
  // fractional-scale displays. Crop rather than let the printer reject the image.
  const cropped = Math.min(pixels.width, width);

  // The canvas is deliberately far taller than the receipt; find where the
  // content actually ends so we do not print (and cut) a metre of blank paper.
  const trimmed = trimBlankRows({
    bitmap: pixels.bitmap,
    width: cropped,
    height: pixels.height,
  });

  if (trimmed.height === 0) {
    throw new AgentError(
      ErrorCodes.RENDER_FAILED,
      'The rendered receipt was completely blank — the template produced no content.'
    );
  }

  if (trimmed.truncated) {
    logger.warn(
      `Receipt content reached the bottom of the ${MAX_RENDER_HEIGHT}-dot render canvas ` +
        'and may be truncated. This receipt is unusually long.'
    );
  }

  const raster = packMonochrome({
    bitmap: pixels.bitmap,
    width: cropped,
    height: trimmed.height,
    dither,
  });

  logger.info(
    `Rasterised receipt: ${raster.width}x${raster.height} dots ` +
      `(trimmed from ${pixels.height}).`
  );

  return raster;
}

module.exports = { renderToRaster, renderHtmlToPixels, packMonochrome, DEFAULT_THRESHOLD };
