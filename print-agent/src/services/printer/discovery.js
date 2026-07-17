'use strict';

const { execFile } = require('node:child_process');

const { createLogger } = require('../logger');

const logger = createLogger('discovery');

const QUERY_TIMEOUT_MS = 15000;

/**
 * @typedef {object} DiscoveredPrinter
 * @property {string} name          queue name, as passed to the spooler
 * @property {string} displayName   friendly name for the UI
 * @property {boolean} isDefault    the Windows default printer
 * @property {string} status        raw Windows status word
 * @property {string} [portName]    e.g. USB001, IP_192.168.1.50
 * @property {string} [driverName]
 * @property {58|80|null} [detectedWidth]
 */

/**
 * @param {string} command
 * @returns {Promise<string>}
 */
function powershell(command) {
  return new Promise((resolve, reject) => {
    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', command],
      { timeout: QUERY_TIMEOUT_MS, windowsHide: true, maxBuffer: 4 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(String(stderr || error.message).trim()));
          return;
        }
        resolve(String(stdout || '').trim());
      }
    );
  });
}

/**
 * Guesses the paper width from what Windows knows about the printer.
 *
 * There is no reliable API that says "this is a 58mm printer" — thermal printers
 * do not report their head width in any standard way. But two signals are
 * available and, between them, cover the overwhelming majority of real hardware:
 *
 *  1. The model name. Manufacturers put the width in it, because it is the single
 *     most important spec: "XP-58IIH", "RP58", "TM-T20 (80mm)", "POS-80C".
 *  2. The driver's configured paper size, which the vendor's installer sets to
 *     the physical roll width.
 *
 * When neither is conclusive we return null and default to 80mm — the more common
 * width, and the failure is benign (an 80mm layout on 58mm paper is cropped;
 * a 58mm layout on 80mm paper just looks narrow).
 *
 * @param {string} name
 * @param {string} driverName
 * @param {string} paperSize
 * @returns {58|80|null}
 */
function detectWidth(name, driverName, paperSize) {
  const haystack = `${name} ${driverName} ${paperSize}`.toLowerCase();

  // Check 58 first: "5880" style names exist, and a printer advertising both is
  // almost always the narrower one being described with its 80mm sibling.
  if (/\b58\b|58mm|xp-?58|rp-?58|pos-?58|tm-?t?58/.test(haystack)) return 58;
  if (/\b80\b|80mm|xp-?80|rp-?80|pos-?80|tm-?t?8\d/.test(haystack)) return 80;

  // Driver paper sizes are sometimes expressed in tenths of a millimetre.
  if (/\b(576|72mm)\b/.test(haystack)) return 80;
  if (/\b(384|48mm)\b/.test(haystack)) return 58;

  return null;
}

/**
 * Lists the printers installed on this machine.
 *
 * Uses Get-Printer (present on Windows 8+). We deliberately do NOT use Electron's
 * webContents.getPrintersAsync(): it omits the port name and driver, which are
 * exactly the fields we need to auto-detect paper width and to spot a printer
 * that is really a TCP/IP device we could talk to directly.
 *
 * @returns {Promise<DiscoveredPrinter[]>}
 */
async function listPrinters() {
  try {
    // Get-CimInstance Win32_Printer carries the Default flag, which Get-Printer
    // does not expose. Join the two on name.
    const script = `
      $ErrorActionPreference = 'Stop'
      $defaults = @{}
      Get-CimInstance -ClassName Win32_Printer | ForEach-Object { $defaults[$_.Name] = $_.Default }

      $result = Get-Printer | ForEach-Object {
        $paper = ''
        try { $paper = [string](Get-PrintConfiguration -PrinterName $_.Name -ErrorAction Stop).PaperSize } catch { $paper = '' }

        [PSCustomObject]@{
          name       = [string]$_.Name
          status     = [string]$_.PrinterStatus
          portName   = [string]$_.PortName
          driverName = [string]$_.DriverName
          shared     = [bool]$_.Shared
          isDefault  = [bool]$defaults[$_.Name]
          paperSize  = $paper
        }
      }

      # @() forces an array even when there is exactly one printer, so the JSON
      # shape does not change with the number of printers installed.
      ConvertTo-Json -InputObject @($result) -Compress
    `;

    const stdout = await powershell(script);

    if (!stdout) return [];

    /** @type {any[]} */
    const parsed = JSON.parse(stdout);
    const rows = Array.isArray(parsed) ? parsed : [parsed];

    return rows.map((row) => {
      const name = String(row.name || '');
      const driverName = String(row.driverName || '');
      const paperSize = String(row.paperSize || '');

      return {
        name,
        displayName: name,
        isDefault: Boolean(row.isDefault),
        status: String(row.status || ''),
        portName: String(row.portName || ''),
        driverName,
        detectedWidth: detectWidth(name, driverName, paperSize),
      };
    });
  } catch (error) {
    logger.error(`Could not list printers: ${error.message}`);
    return [];
  }
}

/**
 * The Windows default printer, if there is one.
 * @returns {Promise<DiscoveredPrinter | null>}
 */
async function defaultPrinter() {
  const printers = await listPrinters();
  return printers.find((printer) => printer.isDefault) || printers[0] || null;
}

/**
 * If a printer is attached via a TCP/IP port, digs out its IP address so we can
 * offer the (better) direct network transport instead of the spooler.
 *
 * @param {string} portName e.g. 'IP_192.168.1.50' or a named port
 * @returns {Promise<string>} the IP, or '' if this is not a TCP/IP port
 */
async function resolvePortAddress(portName) {
  if (!portName) return '';

  // The common convention is a port literally named IP_<address>.
  const direct = /^IP_(\d{1,3}(?:\.\d{1,3}){3})$/.exec(portName);
  if (direct) return direct[1];

  try {
    const stdout = await powershell(
      `$ErrorActionPreference='Stop';` +
        `$p = Get-PrinterPort -Name "${portName.replace(/"/g, '`"')}";` +
        `if ($p.PrinterHostAddress) { $p.PrinterHostAddress } else { '' }`
    );

    return /^\d{1,3}(\.\d{1,3}){3}$/.test(stdout) ? stdout : '';
  } catch {
    // Not a TCP/IP port (USB, LPT, virtual). Perfectly normal.
    return '';
  }
}

module.exports = { listPrinters, defaultPrinter, resolvePortAddress, detectWidth };
