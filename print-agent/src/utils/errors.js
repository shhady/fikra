'use strict';

/**
 * Stable, machine-readable error codes.
 *
 * These are sent verbatim to the server in job-failure callbacks
 * (POST /jobs/{id}/failed { errorCode, ... }), so support staff and dashboards
 * can classify failures without parsing English text. Treat them as an API
 * contract: rename one and you break the backend's reporting.
 */
const ErrorCodes = Object.freeze({
  // Pairing / auth
  PAIRING_CODE_INVALID: 'PAIRING_CODE_INVALID',
  PAIRING_CODE_EXPIRED: 'PAIRING_CODE_EXPIRED',
  DEVICE_UNAUTHORIZED: 'DEVICE_UNAUTHORIZED', // token revoked or rejected
  NOT_PAIRED: 'NOT_PAIRED',

  // Transport
  NETWORK_UNREACHABLE: 'NETWORK_UNREACHABLE',
  SERVER_ERROR: 'SERVER_ERROR',
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',

  // Printer
  PRINTER_NOT_CONFIGURED: 'PRINTER_NOT_CONFIGURED',
  PRINTER_NOT_FOUND: 'PRINTER_NOT_FOUND',
  PRINTER_OFFLINE: 'PRINTER_OFFLINE',
  PRINTER_OUT_OF_PAPER: 'PRINTER_OUT_OF_PAPER',
  PRINTER_COVER_OPEN: 'PRINTER_COVER_OPEN',
  PRINTER_ERROR: 'PRINTER_ERROR',
  PRINT_TIMEOUT: 'PRINT_TIMEOUT',

  // Job
  JOB_INVALID: 'JOB_INVALID',
  JOB_UNSUPPORTED_TYPE: 'JOB_UNSUPPORTED_TYPE',
  RENDER_FAILED: 'RENDER_FAILED',

  // Agent
  PRINTING_PAUSED: 'PRINTING_PAUSED',
  UNKNOWN: 'UNKNOWN',
});

/**
 * An error carrying a stable code, suitable for reporting to the server.
 */
class AgentError extends Error {
  /**
   * @param {string} code one of ErrorCodes
   * @param {string} message human-readable detail (may be logged, not parsed)
   * @param {{ retryable?: boolean, cause?: unknown }} [options]
   */
  constructor(code, message, options = {}) {
    super(message);
    this.name = 'AgentError';
    this.code = code in ErrorCodes ? code : ErrorCodes.UNKNOWN;

    /**
     * Whether retrying the same operation could plausibly succeed.
     * A printer that is out of paper is retryable (staff will reload it);
     * a malformed job is not (it will fail identically forever).
     */
    this.retryable = options.retryable !== false;

    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }

  /**
   * @returns {{ errorCode: string, errorMessage: string }} shape the server expects
   */
  toCallback() {
    return { errorCode: this.code, errorMessage: this.message };
  }
}

/**
 * Coerces anything thrown into an AgentError, so callers never have to guess.
 *
 * @param {unknown} error
 * @param {string} [fallbackCode]
 * @returns {AgentError}
 */
function toAgentError(error, fallbackCode = ErrorCodes.UNKNOWN) {
  if (error instanceof AgentError) return error;

  const message = error instanceof Error ? error.message : String(error);
  return new AgentError(fallbackCode, message, { cause: error });
}

module.exports = { ErrorCodes, AgentError, toAgentError };
