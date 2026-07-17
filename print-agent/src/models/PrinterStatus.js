'use strict';

/**
 * Printer status, as reported to the server in heartbeats and job callbacks.
 *
 * These strings are part of the API contract with the backend — the dashboard
 * renders them directly ("Printer: out of paper").
 */
const PrinterState = Object.freeze({
  READY: 'ready',
  OFFLINE: 'offline',
  OUT_OF_PAPER: 'out_of_paper',
  COVER_OPEN: 'cover_open',
  ERROR: 'error',
  NOT_CONFIGURED: 'not_configured',
  UNKNOWN: 'unknown',
});

/**
 * @typedef {object} PrinterStatusReport
 * @property {string} state one of PrinterState
 * @property {string} [name] printer name as Windows knows it
 * @property {string} [detail] human-readable detail for support
 * @property {number} [checkedAt] epoch ms
 */

/**
 * @param {string} state
 * @param {{ name?: string, detail?: string }} [extra]
 * @returns {PrinterStatusReport}
 */
function printerStatus(state, extra = {}) {
  return {
    state: Object.values(PrinterState).includes(state) ? state : PrinterState.UNKNOWN,
    name: extra.name,
    detail: extra.detail,
    checkedAt: Date.now(),
  };
}

/**
 * Maps a Windows spooler status word to our vocabulary.
 *
 * Get-Printer's PrinterStatus / Get-PrintJob surface values like "Normal",
 * "Offline", "PaperOut", "DoorOpen", "Error". We normalise them so the rest of
 * the agent (and the backend) never has to care about Windows spelling.
 *
 * @param {string} windowsStatus
 * @returns {string} a PrinterState
 */
function fromWindowsStatus(windowsStatus) {
  const value = String(windowsStatus || '').toLowerCase();

  if (!value) return PrinterState.UNKNOWN;
  if (value.includes('paperout') || value.includes('paper out') || value.includes('paperproblem')) {
    return PrinterState.OUT_OF_PAPER;
  }
  if (value.includes('dooropen') || value.includes('door open')) return PrinterState.COVER_OPEN;
  if (value.includes('offline') || value.includes('notavailable')) return PrinterState.OFFLINE;
  if (value.includes('error') || value.includes('jam')) return PrinterState.ERROR;
  if (value.includes('normal') || value.includes('idle') || value.includes('printing')) {
    return PrinterState.READY;
  }

  return PrinterState.UNKNOWN;
}

module.exports = { PrinterState, printerStatus, fromWindowsStatus };
