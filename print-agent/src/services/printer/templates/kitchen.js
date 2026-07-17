'use strict';

const { escapeHtml } = require('../../../utils/rtl');
const { htmlDocument, itemRow } = require('./base');

/**
 * Kitchen ticket.
 *
 * Deliberately NOT a receipt with the prices removed. A kitchen ticket is read
 * at arm's length, in a hurry, by someone holding a pan. So:
 *
 *   - No prices. Kitchen staff do not care and they add visual noise.
 *   - Quantities are huge. Misreading "1x" as "7x" is the expensive mistake.
 *   - Notes ("no onions", "allergy: nuts") are boxed and heavy, because this is
 *     the single line that most often causes a dish to come back.
 *   - The order number is the largest thing on the ticket, for matching the dish
 *     to the bag on the pass.
 */

/**
 * @param {import('../../../models/Job').Job} job
 * @returns {string}
 */
function directionSample(job) {
  const { content } = job;
  return `${content.items.map((i) => i.name).join(' ')} ${content.notes}`;
}

/**
 * @param {import('../../../models/Job').Job} job
 * @returns {string}
 */
function toHtml(job) {
  const { content } = job;

  const items = content.items
    .map((item) => itemRow(item, { showPrice: false }))
    .join('\n');

  const body = `
    <div class="center">
      <div class="title ltr">KITCHEN</div>
      ${content.orderNumber ? `<div class="title ltr" style="margin-top:4px">#${escapeHtml(content.orderNumber)}</div>` : ''}
      <div class="small ltr">${escapeHtml(new Date().toLocaleTimeString())}</div>
    </div>

    <hr class="rule-solid">

    <div style="font-size:1.15em; line-height:1.5">
      ${items}
    </div>

    ${content.notes ? `<div class="notes"><bdi>${escapeHtml(content.notes)}</bdi></div>` : ''}

    ${content.customer ? `<hr class="rule"><div class="small"><bdi>${escapeHtml(content.customer)}</bdi></div>` : ''}
  `;

  return htmlDocument({
    body,
    paperWidth: job.width,
    directionSample: directionSample(job),
    // Kitchen tickets get a heavier baseline than the customer receipt.
    extraStyles: `
      body { font-weight: 600; }
      .qty { font-size: 1.3em; }
    `,
  });
}

/**
 * @param {import('../../../models/Job').Job} job
 * @param {import('../escpos/encoder').EscPosEncoder} encoder
 */
function toEscPos(job, encoder) {
  const { content } = job;

  encoder.init().codepage(0);

  encoder.align('center').bold(true).doubleSize(true).line('KITCHEN');

  if (content.orderNumber) {
    encoder.line(`#${content.orderNumber}`);
  }

  encoder.doubleSize(false).line(new Date().toLocaleTimeString()).bold(false);

  encoder.align('left').rule('=');

  for (const item of content.items) {
    // Double-size the whole line: this is the part read from across a hot kitchen.
    encoder.bold(true).doubleSize(true).line(`${item.qty}x ${item.name}`).doubleSize(false).bold(false);
  }

  if (content.notes) {
    encoder.rule();
    encoder.bold(true).line(`** ${content.notes} **`).bold(false);
  }

  if (content.customer) {
    encoder.rule().line(content.customer);
  }
}

module.exports = { toHtml, toEscPos, directionSample };
