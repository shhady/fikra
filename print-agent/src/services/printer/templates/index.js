'use strict';

const receipt = require('./receipt');
const kitchen = require('./kitchen');
const label = require('./label');
const testPrint = require('./testPrint');

const { AgentError, ErrorCodes } = require('../../../utils/errors');

/**
 * Template registry.
 *
 * This indirection is the extension point the product needs. To support a new
 * document type — a barcode tag, a delivery manifest, a second kitchen station's
 * chit — you write one file exporting { toHtml, toEscPos, directionSample } and
 * add one line here. The queue, the transports, the RTL detection, the retry
 * logic and the status callbacks all keep working untouched, because none of them
 * know what a receipt is.
 *
 * @type {Record<string, { toHtml: Function, toEscPos: Function, directionSample: Function }>}
 */
const TEMPLATES = {
  receipt,
  kitchen,
  label,
};

/**
 * @param {string} type
 * @returns {{ toHtml: Function, toEscPos: Function, directionSample: Function }}
 * @throws {AgentError} JOB_UNSUPPORTED_TYPE — non-retryable
 */
function getTemplate(type) {
  const template = TEMPLATES[String(type)];

  if (!template) {
    // A newer server sent a document type this agent build does not know. Fail
    // the job explicitly so the dashboard says why, instead of printing nothing
    // and looking like a dead printer.
    throw new AgentError(
      ErrorCodes.JOB_UNSUPPORTED_TYPE,
      `No template registered for job type "${type}". This agent may need updating.`,
      { retryable: false }
    );
  }

  return template;
}

/** @returns {string[]} */
function supportedTypes() {
  return Object.keys(TEMPLATES);
}

module.exports = { getTemplate, supportedTypes, testPrint, TEMPLATES };
