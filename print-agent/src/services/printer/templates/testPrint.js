'use strict';

const { htmlDocument } = require('./base');

/**
 * Built-in test print.
 *
 * This is a diagnostic, not a decoration. It is the first thing support asks a
 * restaurant to run, so it deliberately exercises every capability that could be
 * broken, and prints the result where a human can see it:
 *
 *   - Alignment (left / centre / right)  -> proves justification works
 *   - Bold + double-size                 -> proves the size commands land
 *   - A full-width ruler                 -> proves the paper width is right;
 *                                           if the ruler wraps, the agent is
 *                                           configured for 80mm on 58mm paper
 *   - Hebrew and Arabic sample lines     -> proves the RTL raster path works,
 *                                           which is the thing most likely to be
 *                                           wrong and hardest to diagnose remotely
 *   - A QR code                          -> proves GS ( k is supported
 *   - The paper cut                      -> proves the blade is wired
 *
 * If a restaurant sends a photo of this slip, we can diagnose almost any print
 * problem from it without remote access.
 */

/** @type {import('../../../models/Job').Job} */
const TEST_JOB_SHAPE = {
  id: 'test-print',
  copies: 1,
  type: 'receipt',
  width: 80,
  content: { items: [], restaurant: '', orderNumber: '', customer: '', phone: '', notes: '', total: 0 },
  raw: {},
};

/**
 * @param {object} options
 * @param {58|80} options.paperWidth
 * @param {string} options.restaurantName
 * @param {string} options.deviceId
 * @param {string} options.version
 * @param {string} options.printerName
 * @returns {string}
 */
function toHtml({ paperWidth, restaurantName, deviceId, version, printerName }) {
  // The ruler is exactly as many characters as the paper can hold. If it wraps
  // onto a second line on paper, the width setting is wrong — which is a
  // diagnosis anyone can make by eye, with no tools.
  const columns = paperWidth === 58 ? 32 : 48;
  const ruler = Array.from({ length: columns }, (_, i) => String((i + 1) % 10)).join('');

  const body = `
    <div class="center">
      <div class="title">FikraNova</div>
      <div class="bold">Test Print</div>
    </div>

    <hr class="rule">

    <div class="small">
      <div class="meta">Restaurant: ${restaurantName || '(not paired)'}</div>
      <div class="meta">Device: ${deviceId || '(not paired)'}</div>
      <div class="meta">Printer: ${printerName || '(none)'}</div>
      <div class="meta">Paper: ${paperWidth}mm</div>
      <div class="meta">Agent: v${version}</div>
      <div class="meta">Time: ${new Date().toLocaleString()}</div>
    </div>

    <hr class="rule">

    <div class="left small">Left aligned</div>
    <div class="center small">Centre aligned</div>
    <div class="right small">Right aligned</div>

    <div class="spacer"></div>

    <div class="bold">Bold text</div>
    <div class="total">Double size</div>

    <hr class="rule">

    <div class="small">Width check (must not wrap):</div>
    <div style="font-family: monospace; font-size: ${paperWidth === 58 ? 17 : 21}px; white-space: pre;">${ruler}</div>

    <hr class="rule">

    <div class="small">RTL check &mdash; these must read correctly:</div>
    <div dir="rtl" lang="he" style="font-size:1.1em">שלום, זהו מבחן הדפסה בעברית</div>
    <div dir="rtl" lang="ar" style="font-size:1.1em">مرحبا، هذه طباعة تجريبية بالعربية</div>
    <div dir="ltr" lang="en" style="font-size:1.1em">Mixed: order #42 / הזמנה מספר 42</div>

    <hr class="rule">

    <div class="center small">If every line above is correct,<br>this printer is ready.</div>
  `;

  return htmlDocument({
    body,
    paperWidth,
    // Force RTL layout off for the page as a whole; the RTL samples above carry
    // their own dir, which is exactly the mixed-content case we want to exercise.
    directionSample: 'FikraNova Test Print',
  });
}

/**
 * Native ESC/POS test print.
 *
 * Note this variant cannot show the Hebrew/Arabic lines — that is the whole
 * point of the raster path. The agent always runs the HTML version for the test
 * print, so the RTL check is always exercised; this function exists so the
 * native path is itself testable in isolation.
 *
 * @param {import('../escpos/encoder').EscPosEncoder} encoder
 * @param {{ version: string, printerName: string, paperWidth: 58|80 }} info
 */
function toEscPos(encoder, info) {
  encoder.init().codepage(0);

  encoder.align('center').bold(true).doubleSize(true).line('FikraNova').doubleSize(false);
  encoder.line('Test Print').bold(false);

  encoder.align('left').rule();
  encoder.line(`Printer: ${info.printerName || '(none)'}`);
  encoder.line(`Paper:   ${info.paperWidth}mm`);
  encoder.line(`Agent:   v${info.version}`);
  encoder.line(`Time:    ${new Date().toLocaleString()}`);

  encoder.rule();
  encoder.align('left').line('Left aligned');
  encoder.align('center').line('Centre aligned');
  encoder.align('right').line('Right aligned');
  encoder.align('left');

  encoder.rule();
  encoder.bold(true).line('Bold text').bold(false);
  encoder.doubleSize(true).line('Double size').doubleSize(false);

  encoder.rule();
  encoder.line('Width check (must not wrap):');
  encoder.line(
    Array.from({ length: encoder.columns }, (_, i) => String((i + 1) % 10)).join('')
  );

  encoder.rule();
  encoder.align('center').qr('https://fikranova.com', { size: 6 });
  encoder.line('QR OK').align('left');
}

module.exports = { toHtml, toEscPos, TEST_JOB_SHAPE };
