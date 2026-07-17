'use strict';

/**
 * Right-to-left script handling.
 *
 * Why this matters for thermal printing
 * -------------------------------------
 * ESC/POS printers render text by looking bytes up in a codepage. They have no
 * concept of the Unicode bidirectional algorithm and no glyph shaping engine.
 * For Arabic that is fatal: Arabic letters change shape depending on their
 * neighbours (initial / medial / final / isolated), and a codepage lookup
 * cannot do that. Hebrew has no shaping, but still needs the visual reordering
 * that bidi provides, and CP1255 support is inconsistent across printer models.
 *
 * So: when a job contains RTL text we do NOT send characters at all. We render
 * the receipt in Chromium — which has a full bidi + shaping implementation and
 * real fonts — rasterise it to a 1-bit bitmap, and send that bitmap to the
 * printer as a raster image. The printer just prints dots; correctness becomes
 * Chromium's problem, and Chromium gets it right.
 *
 * Latin-only jobs still take the fast native-text path, which is several times
 * quicker and produces crisper glyphs.
 */

/**
 * Ranges are written as escape sequences rather than literal characters on
 * purpose. Pasting real Hebrew/Arabic into a character class embeds invisible,
 * direction-flipping code points into the source, which makes the range
 * boundaries impossible to review -- and one of the boundaries is literally
 * the byte-order mark.
 *
 *   0590-05FF  Hebrew
 *   0600-06FF  Arabic
 *   0750-077F  Arabic Supplement
 *   08A0-08FF  Arabic Extended-A
 *   FB1D-FB4F  Hebrew presentation forms
 *   FB50-FDFF  Arabic Presentation Forms-A
 *   FE70-FEFC  Arabic Presentation Forms-B
 *
 * Note the last range stops at FEFC, not FEFF. The block formally ends at
 * FEFF, but that code point is the byte-order mark, not a letter. Including
 * it would mean a stray BOM anywhere in a job payload was read as "this
 * receipt is RTL", pushing an entirely Latin receipt down the slower raster
 * path for no reason. FEFC is the last actual Arabic glyph.
 */
const RTL_PATTERN = new RegExp(
  '[\\u0590-\\u05FF\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF' +
    '\\uFB1D-\\uFB4F\\uFB50-\\uFDFF\\uFE70-\\uFEFC]'
);

/**
 * Whether a string contains any right-to-left character.
 * @param {unknown} value
 * @returns {boolean}
 */
function hasRtl(value) {
  if (typeof value !== 'string') return false;
  return RTL_PATTERN.test(value);
}

/**
 * Walks an arbitrary job payload looking for RTL text anywhere in it — a
 * restaurant name, an item, a customer note. A single Hebrew word anywhere is
 * enough to force the whole receipt down the raster path, because mixing a
 * rastered line with native-text lines would misalign the two.
 *
 * @param {unknown} value any nested object/array/string
 * @returns {boolean}
 */
function containsRtl(value) {
  if (typeof value === 'string') return hasRtl(value);

  if (Array.isArray(value)) {
    return value.some((entry) => containsRtl(entry));
  }

  if (value && typeof value === 'object') {
    return Object.values(value).some((entry) => containsRtl(entry));
  }

  return false;
}

/**
 * Text direction for a given string.
 * @param {string} value
 * @returns {'rtl' | 'ltr'}
 */
function directionOf(value) {
  return hasRtl(value) ? 'rtl' : 'ltr';
}

/**
 * Escapes a value for safe interpolation into the receipt HTML.
 *
 * Job content comes from the cloud, which got it from a customer typing their
 * name into a website. Without escaping, a name like `<img onerror=...>` would
 * be injected into the rendering BrowserWindow. That window has no Node access
 * and JavaScript is disabled in it, but it is still untrusted input entering our
 * process — escape it rather than relying on a single layer of defence.
 *
 * @param {unknown} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = { hasRtl, containsRtl, directionOf, escapeHtml, RTL_PATTERN };
