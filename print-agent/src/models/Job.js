'use strict';

const { AgentError, ErrorCodes } = require('../utils/errors');

/**
 * @typedef {object} JobItem
 * @property {string} name
 * @property {number} qty
 * @property {number} price
 */

/**
 * @typedef {object} JobContent
 * @property {string} [restaurant]
 * @property {string} [orderNumber]
 * @property {string} [customer]
 * @property {string} [phone]
 * @property {JobItem[]} items
 * @property {string} [notes]
 * @property {number} [total]
 */

/**
 * @typedef {object} Job
 * @property {string} id
 * @property {number} copies
 * @property {'receipt'|'kitchen'|'label'} type
 * @property {58|80} width
 * @property {string} [targetDeviceId]
 * @property {JobContent} content
 * @property {object} raw the original server payload, unmodified
 */

/** Job types this agent build knows how to render. */
const JOB_TYPES = Object.freeze(['receipt', 'kitchen', 'label']);

/** Supported paper widths, in millimetres. */
const PAPER_WIDTHS = Object.freeze([58, 80]);

/** Terminal + transient states a job can be in, locally. */
const JobState = Object.freeze({
  QUEUED: 'queued',
  PRINTING: 'printing',
  PRINTED: 'printed',
  FAILED: 'failed',
});

/**
 * @param {unknown} value
 * @param {number} fallback
 * @returns {number}
 */
function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Normalises one line item.
 * @param {unknown} raw
 * @returns {JobItem}
 */
function normaliseItem(raw) {
  const item = raw && typeof raw === 'object' ? raw : {};

  return {
    name: String(item.name ?? '').trim(),
    qty: Math.max(1, Math.floor(toNumber(item.qty, 1))),
    price: toNumber(item.price, 0),
  };
}

/**
 * Validates and normalises a job as delivered by the server.
 *
 * Forward compatibility is a hard requirement here: this agent is installed on
 * thousands of machines that we cannot upgrade on demand. The server WILL add
 * fields we have never heard of. So we read the fields we know, we never reject
 * a job for carrying extra ones, and we keep the untouched payload in `raw` so
 * templates can opt into new fields later without a queue migration.
 *
 * We reject a job only when it is genuinely unprintable (no id, unknown type).
 *
 * @param {unknown} payload
 * @returns {Job}
 * @throws {AgentError} JOB_INVALID / JOB_UNSUPPORTED_TYPE — both non-retryable
 */
function parseJob(payload) {
  const raw = payload && typeof payload === 'object' ? payload : {};

  const id = String(raw.id ?? '').trim();
  if (!id) {
    throw new AgentError(ErrorCodes.JOB_INVALID, 'Job is missing an id.', { retryable: false });
  }

  const type = String(raw.type ?? 'receipt').toLowerCase();
  if (!JOB_TYPES.includes(type)) {
    // A newer server may introduce a type this build cannot render. Fail the
    // job explicitly (so the dashboard shows why) rather than printing garbage.
    throw new AgentError(
      ErrorCodes.JOB_UNSUPPORTED_TYPE,
      `Job type "${type}" is not supported by this agent version.`,
      { retryable: false }
    );
  }

  const requestedWidth = Math.round(toNumber(raw.width, 80));
  const width = PAPER_WIDTHS.includes(requestedWidth) ? requestedWidth : 80;

  const rawContent = raw.content && typeof raw.content === 'object' ? raw.content : {};
  const items = Array.isArray(rawContent.items) ? rawContent.items.map(normaliseItem) : [];

  /** @type {JobContent} */
  const content = {
    restaurant: String(rawContent.restaurant ?? '').trim(),
    orderNumber: String(rawContent.orderNumber ?? '').trim(),
    customer: String(rawContent.customer ?? '').trim(),
    phone: String(rawContent.phone ?? '').trim(),
    items,
    notes: String(rawContent.notes ?? '').trim(),
    total: toNumber(
      rawContent.total,
      // If the server omits a total, derive one rather than printing nothing.
      items.reduce((sum, item) => sum + item.qty * item.price, 0)
    ),
  };

  return {
    id,
    copies: Math.min(10, Math.max(1, Math.floor(toNumber(raw.copies, 1)))),
    type: /** @type {'receipt'|'kitchen'|'label'} */ (type),
    width: /** @type {58|80} */ (width),
    targetDeviceId: raw.targetDeviceId ? String(raw.targetDeviceId) : undefined,
    content,
    raw,
  };
}

module.exports = { parseJob, JOB_TYPES, PAPER_WIDTHS, JobState };
