'use strict';

const { escapeHtml } = require('../../../utils/rtl');
const { htmlDocument } = require('./base');

/**
 * Label / sticker.
 *
 * Goes on the bag or the container, so it is short by construction: who it is
 * for, which order, and a scannable code. It exists mainly to prove the template
 * layer generalises beyond receipts — a barcode label printer (Zebra/TSC-style)
 * can be added later by writing a sibling of this file, with no change to the
 * queue, the transports, or the job pipeline.
 */

/**
 * @param {import('../../../models/Job').Job} job
 * @returns {string}
 */
function directionSample(job) {
  return `${job.content.customer} ${job.content.restaurant}`;
}

/**
 * @param {import('../../../models/Job').Job} job
 * @returns {string}
 */
function toHtml(job) {
  const { content } = job;

  const itemCount = content.items.reduce((sum, item) => sum + item.qty, 0);

  const body = `
    <div class="center">
      ${content.orderNumber ? `<div class="title ltr">#${escapeHtml(content.orderNumber)}</div>` : ''}
      ${content.customer ? `<div class="bold" style="margin-top:6px; font-size:1.2em"><bdi>${escapeHtml(content.customer)}</bdi></div>` : ''}
      ${content.phone ? `<div class="small ltr">${escapeHtml(content.phone)}</div>` : ''}

      <hr class="rule">

      <div class="small"><bdi>${escapeHtml(content.restaurant || '')}</bdi></div>
      <div class="small ltr">${itemCount} item(s) &middot; ${escapeHtml(new Date().toLocaleDateString())}</div>
    </div>
  `;

  return htmlDocument({
    body,
    paperWidth: job.width,
    directionSample: directionSample(job),
    extraStyles: `body { padding-bottom: 8px; }`,
  });
}

/**
 * @param {import('../../../models/Job').Job} job
 * @param {import('../escpos/encoder').EscPosEncoder} encoder
 */
function toEscPos(job, encoder) {
  const { content } = job;
  const itemCount = content.items.reduce((sum, item) => sum + item.qty, 0);

  encoder.init().codepage(0).align('center');

  if (content.orderNumber) {
    encoder.bold(true).doubleSize(true).line(`#${content.orderNumber}`).doubleSize(false).bold(false);
  }

  if (content.customer) encoder.bold(true).line(content.customer).bold(false);
  if (content.phone) encoder.line(content.phone);

  encoder.rule();

  if (content.restaurant) encoder.line(content.restaurant);
  encoder.line(`${itemCount} item(s)`);

  // A scannable code is the whole point of a label — it is what the driver or
  // the pass scans to match bag to order.
  if (content.orderNumber) {
    encoder.feed(1).barcode(String(content.orderNumber), { height: 60, width: 2 });
  }

  encoder.align('left');
}

module.exports = { toHtml, toEscPos, directionSample };
