'use strict';

const { escapeHtml } = require('../../../utils/rtl');
const { htmlDocument, money, itemRow } = require('./base');

/**
 * Customer receipt.
 *
 * Every template exposes the same pair of renderers:
 *
 *   toHtml()   — laid out by Chromium, rasterised, printed as dots.
 *                Required for Hebrew/Arabic; used whenever RTL text is present.
 *   toEscPos() — native printer text commands. Faster and crisper, but Latin
 *                script only (see utils/rtl.js for why).
 *
 * PrintService picks between them per job. Adding a new document type — a label,
 * a barcode tag, a kitchen chit for a second station — means adding a file with
 * these two functions and registering it in ./index.js. Nothing else changes.
 */

/**
 * @param {import('../../../models/Job').Job} job
 * @returns {string} text used to decide the document's direction
 */
function directionSample(job) {
  const { content } = job;
  return `${content.restaurant} ${content.customer} ${content.items.map((i) => i.name).join(' ')}`;
}

/**
 * @param {import('../../../models/Job').Job} job
 * @param {{ currency?: string }} [options]
 * @returns {string} complete HTML document
 */
function toHtml(job, options = {}) {
  const currency = options.currency ?? '₪';
  const { content } = job;

  const header = `
    <div class="center">
      ${content.restaurant ? `<div class="title"><bdi>${escapeHtml(content.restaurant)}</bdi></div>` : ''}
      ${content.orderNumber ? `<div class="bold" style="margin-top:6px"><span class="ltr">#${escapeHtml(content.orderNumber)}</span></div>` : ''}
      <div class="small ltr" style="margin-top:4px">${escapeHtml(new Date().toLocaleString())}</div>
    </div>
  `;

  const customer =
    content.customer || content.phone
      ? `<hr class="rule">
         ${content.customer ? `<div class="meta"><span class="bold"><bdi>${escapeHtml(content.customer)}</bdi></span></div>` : ''}
         ${content.phone ? `<div class="meta small"><span class="ltr">${escapeHtml(content.phone)}</span></div>` : ''}`
      : '';

  const items = content.items.map((item) => itemRow(item, { currency })).join('\n');

  const notes = content.notes
    ? `<div class="notes"><bdi>${escapeHtml(content.notes)}</bdi></div>`
    : '';

  // A QR pointing at the order gives the customer a way to check status without
  // phoning the restaurant. Only printed when we actually have an order number.
  const qr = content.orderNumber
    ? `<div class="center spacer"></div>
       <div class="center small ltr">${escapeHtml(String(content.orderNumber))}</div>`
    : '';

  const body = `
    ${header}
    ${customer}
    <hr class="rule">
    ${items}
    <hr class="rule-solid">
    <div class="row total">
      <span class="name">TOTAL</span>
      <span class="value ltr">${escapeHtml(money(content.total, currency))}</span>
    </div>
    ${notes}
    ${qr}
    <div class="center small spacer ltr">Thank you!</div>
  `;

  return htmlDocument({
    body,
    paperWidth: job.width,
    directionSample: directionSample(job),
  });
}

/**
 * Native ESC/POS rendering (Latin scripts only).
 *
 * @param {import('../../../models/Job').Job} job
 * @param {import('../escpos/encoder').EscPosEncoder} encoder
 * @param {{ currency?: string }} [options]
 */
function toEscPos(job, encoder, options = {}) {
  const currency = options.currency ?? '$';
  const { content } = job;

  encoder.init().codepage(0);

  if (content.restaurant) {
    encoder.align('center').bold(true).doubleSize(true).line(content.restaurant).doubleSize(false).bold(false);
  }

  if (content.orderNumber) {
    encoder.align('center').bold(true).line(`#${content.orderNumber}`).bold(false);
  }

  encoder.align('center').line(new Date().toLocaleString()).align('left');

  if (content.customer || content.phone) {
    encoder.rule();
    if (content.customer) encoder.bold(true).line(content.customer).bold(false);
    if (content.phone) encoder.line(content.phone);
  }

  encoder.rule();

  for (const item of content.items) {
    encoder.columnsLR(`${item.qty}x ${item.name}`, money(item.qty * item.price, currency));
  }

  encoder.rule('=');

  encoder.bold(true).doubleSize(true);
  encoder.columnsLR('TOTAL', money(content.total, currency));
  encoder.doubleSize(false).bold(false);

  if (content.notes) {
    encoder.feed(1).bold(true).line(content.notes).bold(false);
  }

  if (content.orderNumber) {
    encoder.feed(1).align('center').qr(String(content.orderNumber), { size: 6 });
  }

  encoder.align('center').feed(1).line('Thank you!').align('left');
}

module.exports = { toHtml, toEscPos, directionSample };
