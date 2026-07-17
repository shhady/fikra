'use strict';

const { WindowsSpoolerTransport } = require('./windowsSpooler');
const { NetworkTransport, DEFAULT_PORT } = require('./network');
const { AgentError, ErrorCodes } = require('../../../utils/errors');

/**
 * Chooses how to talk to the configured printer.
 *
 * 'auto' (the default) prefers the network transport whenever an IP is
 * configured, because it is bidirectional — it can tell us the printer is
 * genuinely out of paper, where the spooler can only relay what Windows guesses.
 * Otherwise we fall back to the Windows spooler, which covers USB, shared and
 * driver-installed printers.
 *
 * @param {object} settings
 * @param {'auto'|'spooler'|'network'} settings.transport
 * @param {string} settings.printerName
 * @param {string} settings.networkHost
 * @param {number} settings.networkPort
 * @returns {WindowsSpoolerTransport | NetworkTransport}
 * @throws {AgentError} PRINTER_NOT_CONFIGURED
 */
function createTransport(settings) {
  const { transport, printerName, networkHost, networkPort } = settings;

  if (transport === 'network') {
    if (!networkHost) {
      throw new AgentError(
        ErrorCodes.PRINTER_NOT_CONFIGURED,
        'Network printing is selected but no printer IP address has been set.',
        { retryable: false }
      );
    }

    return new NetworkTransport({ host: networkHost, port: networkPort || DEFAULT_PORT });
  }

  if (transport === 'spooler') {
    if (!printerName) {
      throw new AgentError(
        ErrorCodes.PRINTER_NOT_CONFIGURED,
        'Windows printing is selected but no printer has been chosen.',
        { retryable: false }
      );
    }

    return new WindowsSpoolerTransport({ printerName });
  }

  // auto
  if (networkHost) {
    return new NetworkTransport({ host: networkHost, port: networkPort || DEFAULT_PORT });
  }

  if (printerName) {
    return new WindowsSpoolerTransport({ printerName });
  }

  throw new AgentError(
    ErrorCodes.PRINTER_NOT_CONFIGURED,
    'No printer has been selected. Open Settings and choose one.',
    { retryable: false }
  );
}

module.exports = { createTransport, WindowsSpoolerTransport, NetworkTransport, DEFAULT_PORT };
