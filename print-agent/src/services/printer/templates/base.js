'use strict';

const { escapeHtml, directionOf } = require('../../../utils/rtl');
const { DOTS_PER_LINE } = require('../escpos/encoder');

/**
 * Shared HTML shell for every rastered template.
 *
 * Sizing model
 * ------------
 * Thermal heads are 203 dpi, i.e. 8 dots per millimetre. We render at
 * 1 CSS pixel == 1 printer dot, so the document width is exactly the head width
 * (576 dots for 80mm paper, 384 for 58mm) and nothing has to be scaled at print
 * time. Type sizes below are therefore in *dots*, and were chosen so that body
 * text lands at roughly 3mm — the smallest size that stays legible after a
 * thermal head has burned it onto cheap paper.
 *
 * Direction
 * ---------
 * `dir` is set from the content itself rather than from a locale setting,
 * because a single restaurant routinely prints a Hebrew receipt for one customer
 * and an English one for the next. Chromium then applies the full Unicode
 * bidirectional algorithm, which is the entire reason we render receipts as
 * pictures instead of characters.
 */

/**
 * Fonts that ship with every Windows install and cover Hebrew *and* Arabic.
 *
 * Segoe UI covers Hebrew and Arabic on Windows 8+; Tahoma is the long-standing
 * fallback with excellent Hebrew and Arabic coverage going back to XP. Listing
 * both means we never depend on a font we would have to bundle and license.
 */
const FONT_STACK = "'Segoe UI', 'Tahoma', 'Arial Unicode MS', Arial, sans-serif";

/**
 * @param {58|80} paperWidth
 * @returns {number} document width in CSS px (== printer dots)
 */
function widthInDots(paperWidth) {
  return DOTS_PER_LINE[paperWidth] || DOTS_PER_LINE[80];
}

/**
 * Base stylesheet, scaled to the paper width.
 *
 * @param {58|80} paperWidth
 * @returns {string}
 */
function baseStyles(paperWidth) {
  const width = widthInDots(paperWidth);
  const narrow = paperWidth === 58;

  // 58mm paper has a third less room, so everything steps down a notch.
  const bodySize = narrow ? 20 : 24;
  const smallSize = narrow ? 17 : 20;
  const titleSize = narrow ? 32 : 40;
  const totalSize = narrow ? 26 : 32;

  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }

    html, body {
      width: ${width}px;
      background: #fff;
      color: #000;
    }

    body {
      font-family: ${FONT_STACK};
      font-size: ${bodySize}px;
      line-height: 1.35;
      /* Thermal heads cannot print to the very edge; keep a small quiet zone. */
      padding: 8px 6px 24px;
      /* Anti-aliased grey edges become scattered dots after thresholding.
         Turning it off gives noticeably crisper small text on paper. */
      -webkit-font-smoothing: none;
      font-smooth: never;
    }

    .center { text-align: center; }
    .right  { text-align: right; }
    .left   { text-align: left; }

    /* ---------------------------------------------------------------------
     * Bidi isolation. This is not cosmetic — without it, receipts are WRONG.
     *
     * Characters like + - / , ! : and digits are "neutral": they have no
     * inherent direction, so the Unicode bidi algorithm resolves them from the
     * surrounding paragraph. Inside a Hebrew (RTL) receipt that means:
     *
     *     +972-50-123-4567   prints as   972-50-123-4567+
     *     Thank you!         prints as   !Thank you
     *     7/13/2026, 7:23 PM prints as   PM 7:23 ,7/13/2026
     *
     * A phone number with the + on the wrong end is not a cosmetic nit; it is a
     * number the customer cannot dial. So every run that is inherently
     * left-to-right -- phone numbers, timestamps, Latin text -- is wrapped in
     * .ltr and isolated, which tells bidi to resolve it as its own little
     * LTR island and not let the RTL paragraph reach inside it.
     *
     * isolate (rather than embed or bidi-override) is the right primitive: it
     * keeps the run's internal order intact AND stops it perturbing the text
     * around it.
     *
     * NOTE: no backticks anywhere in this comment. It lives inside a JS template
     * literal, and a backtick here would terminate the string and turn the rest
     * of the CSS into JavaScript.
     * ------------------------------------------------------------------- */
    .ltr {
      direction: ltr;
      unicode-bidi: isolate;
    }

    /* Names can be in either script (a Hebrew restaurant with an English
     * customer, or vice versa). <bdi> isolates without asserting a direction —
     * the browser infers it from the content itself, per element. */
    bdi {
      unicode-bidi: isolate;
    }

    .bold   { font-weight: 700; }
    .title  { font-size: ${titleSize}px; font-weight: 700; line-height: 1.2; }
    .small  { font-size: ${smallSize}px; }
    .total  { font-size: ${totalSize}px; font-weight: 700; }

    .rule {
      border: 0;
      border-top: 2px dashed #000;
      margin: 10px 0;
    }

    .rule-solid {
      border: 0;
      border-top: 3px solid #000;
      margin: 10px 0;
    }

    .row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
      margin: 4px 0;
    }

    /* The item name must be allowed to wrap; the price never should, or a long
       dish name would push the price onto its own line and misalign the column. */
    .row .name  { flex: 1 1 auto; word-break: break-word; }
    .row .value { flex: 0 0 auto; white-space: nowrap; font-variant-numeric: tabular-nums; }

    .qty {
      font-weight: 700;
      /* Keep the quantity column a fixed width so names line up down the page. */
      display: inline-block;
      min-width: ${narrow ? 34 : 42}px;
      /* Logical, not left/right: bidi isolation removes the whitespace that
       * would otherwise separate "2x" from the dish name, and the gap has to
       * land on the correct side in both an English and a Hebrew receipt. */
      margin-inline-end: 6px;
    }

    .notes {
      margin-top: 8px;
      padding: 8px;
      border: 2px solid #000;
      font-weight: 700;
    }

    .meta { margin: 2px 0; }

    .spacer { height: 12px; }

    img.logo {
      display: block;
      margin: 0 auto 8px;
      max-width: 60%;
      /* Photographic logos must not be smoothed into greys we then threshold. */
      image-rendering: pixelated;
    }
  `;
}

/**
 * Wraps template body HTML in a complete document.
 *
 * @param {object} options
 * @param {string} options.body inner HTML
 * @param {58|80} options.paperWidth
 * @param {string} [options.directionSample] text used to decide LTR vs RTL
 * @param {string} [options.extraStyles]
 * @returns {string} a full HTML document
 */
function htmlDocument({ body, paperWidth, directionSample = '', extraStyles = '' }) {
  const dir = directionOf(directionSample);

  return `<!doctype html>
<html lang="${dir === 'rtl' ? 'he' : 'en'}" dir="${dir}">
<head>
<meta charset="utf-8">
<style>${baseStyles(paperWidth)}${extraStyles}</style>
</head>
<body>
${body}
</body>
</html>`;
}

/**
 * Formats money. Kept locale-neutral on purpose: the server sends numbers, and a
 * receipt that silently reformats them (grouping, decimal comma) is a support
 * ticket waiting to happen. Two decimal places, currency symbol as given.
 *
 * @param {number} value
 * @param {string} [currency]
 * @returns {string}
 */
function money(value, currency = '₪') {
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `${amount.toFixed(2)}${currency}`;
}

/**
 * A single item row as HTML.
 *
 * @param {import('../../../models/Job').JobItem} item
 * @param {{ showPrice?: boolean, currency?: string }} [options]
 * @returns {string}
 */
function itemRow(item, options = {}) {
  const { showPrice = true, currency = '₪' } = options;

  const name = escapeHtml(item.name);
  const qty = escapeHtml(String(item.qty));

  // The price is inherently LTR ("52.00₪" must never become "₪52.00" reversed),
  // and "2x" is a Latin run. The item NAME may be either script, so <bdi> lets
  // the renderer infer its direction per item — a Hebrew menu with one English
  // dish on it still comes out right.
  const price = showPrice
    ? `<span class="value ltr">${escapeHtml(money(item.qty * item.price, currency))}</span>`
    : '';

  // NOTE: .qty is deliberately NOT given the .ltr class.
  //
  // "1x" needs no isolation — the digit is a European number and "x" is a strong
  // left-to-right letter, so bidi already orders it correctly in a Hebrew
  // receipt. Forcing direction:ltr on it would be actively harmful: it flips
  // which side the min-width padding falls on, collapsing the gap between the
  // quantity and the dish name ("2xקפה קר" instead of "2x קפה קר").
  return `<div class="row">
    <span class="name"><span class="qty">${qty}x</span><bdi>${name}</bdi></span>
    ${price}
  </div>`;
}

module.exports = {
  htmlDocument,
  baseStyles,
  widthInDots,
  money,
  itemRow,
  FONT_STACK,
};
