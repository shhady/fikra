'use strict';

const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFile } = require('node:child_process');

const { createLogger } = require('../../logger');
const { AgentError, ErrorCodes } = require('../../../utils/errors');
const { PrinterState, fromWindowsStatus } = require('../../../models/PrinterStatus');

const logger = createLogger('spooler');

/** A print call that has not returned in this long is considered wedged. */
const PRINT_TIMEOUT_MS = 30000;
const QUERY_TIMEOUT_MS = 15000;

/**
 * Sends raw ESC/POS bytes to an installed Windows printer.
 *
 * How this works, and why it is the right approach
 * -----------------------------------------------
 * A thermal printer on a cashier PC is almost always already installed as a
 * normal Windows printer (USB, shared, or TCP/IP port) with its vendor driver.
 * We do not want to fight that: we want to hand the spooler a blob of bytes and
 * have it deliver them to the device untouched.
 *
 * Windows has exactly one supported way to do that — open the printer, start a
 * document whose datatype is "RAW", and WritePrinter the bytes. "RAW" is the
 * magic word: it tells the spooler "do not render this, do not let the driver
 * interpret it, just push these bytes down the wire". That is precisely what an
 * ESC/POS command stream needs.
 *
 * Those calls live in winspool.drv. Rather than take on a native Node addon
 * (which would need recompiling for every Electron release), we reach them via
 * PowerShell's Add-Type, which compiles a tiny C# P/Invoke shim using the .NET
 * Framework compiler that ships with every Windows install. Zero dependencies,
 * zero build step, works on Windows 8 through 11.
 *
 * The alternative you will see suggested — `copy /b file \\localhost\printer` —
 * only works if the printer happens to be shared, and silently does nothing if
 * it is not. This is the real API.
 */

/**
 * The C# shim, embedded as a string.
 *
 * It is written to a temp .ps1 at call time rather than shipped as a file
 * because PowerShell is an external process and cannot read from inside our
 * app.asar archive.
 */
const RAW_PRINT_SCRIPT = `
param(
  [Parameter(Mandatory=$true)][string]$PrinterName,
  [Parameter(Mandatory=$true)][string]$DataFile,
  [string]$DocName = "FikraNova Print Job"
)

$ErrorActionPreference = 'Stop'

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public static class FikraNovaRawPrinter
{
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct DOCINFO
    {
        [MarshalAs(UnmanagedType.LPWStr)] public string pDocName;
        [MarshalAs(UnmanagedType.LPWStr)] public string pOutputFile;
        [MarshalAs(UnmanagedType.LPWStr)] public string pDataType;
    }

    [DllImport("winspool.Drv", EntryPoint = "OpenPrinterW", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern bool OpenPrinter(string src, out IntPtr hPrinter, IntPtr pd);

    [DllImport("winspool.Drv", EntryPoint = "ClosePrinter", SetLastError = true)]
    public static extern bool ClosePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "StartDocPrinterW", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern bool StartDocPrinter(IntPtr hPrinter, int level, ref DOCINFO di);

    [DllImport("winspool.Drv", EntryPoint = "EndDocPrinter", SetLastError = true)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "StartPagePrinter", SetLastError = true)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "EndPagePrinter", SetLastError = true)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "WritePrinter", SetLastError = true)]
    public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, int dwCount, out int dwWritten);

    public static void SendBytes(string printerName, byte[] bytes, string docName)
    {
        IntPtr hPrinter;

        if (!OpenPrinter(printerName, out hPrinter, IntPtr.Zero))
        {
            throw new Exception("OPEN_FAILED:" + Marshal.GetLastWin32Error());
        }

        try
        {
            DOCINFO di = new DOCINFO();
            di.pDocName = docName;
            di.pOutputFile = null;
            // RAW = hand the bytes to the device untouched.
            di.pDataType = "RAW";

            if (!StartDocPrinter(hPrinter, 1, ref di))
            {
                throw new Exception("START_DOC_FAILED:" + Marshal.GetLastWin32Error());
            }

            try
            {
                if (!StartPagePrinter(hPrinter))
                {
                    throw new Exception("START_PAGE_FAILED:" + Marshal.GetLastWin32Error());
                }

                IntPtr unmanaged = Marshal.AllocHGlobal(bytes.Length);

                try
                {
                    Marshal.Copy(bytes, 0, unmanaged, bytes.Length);

                    int written = 0;

                    if (!WritePrinter(hPrinter, unmanaged, bytes.Length, out written))
                    {
                        throw new Exception("WRITE_FAILED:" + Marshal.GetLastWin32Error());
                    }

                    if (written != bytes.Length)
                    {
                        throw new Exception("SHORT_WRITE:" + written + "/" + bytes.Length);
                    }
                }
                finally
                {
                    Marshal.FreeHGlobal(unmanaged);
                }

                EndPagePrinter(hPrinter);
            }
            finally
            {
                EndDocPrinter(hPrinter);
            }
        }
        finally
        {
            ClosePrinter(hPrinter);
        }
    }
}
"@

$bytes = [System.IO.File]::ReadAllBytes($DataFile)
[FikraNovaRawPrinter]::SendBytes($PrinterName, $bytes, $DocName)
Write-Output "PRINT_OK"
`;

/**
 * Runs powershell.exe with the given arguments.
 *
 * -NoProfile matters: a cashier PC may have a corporate PowerShell profile that
 * prints a banner or, worse, prompts. -NonInteractive guarantees we never block
 * on a prompt that nobody is there to answer.
 *
 * @param {string[]} args
 * @param {number} timeoutMs
 * @returns {Promise<string>} stdout
 */
function runPowerShell(args, timeoutMs) {
  return new Promise((resolve, reject) => {
    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', ...args],
      { timeout: timeoutMs, windowsHide: true, maxBuffer: 4 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            reject(
              new AgentError(
                ErrorCodes.PRINT_TIMEOUT,
                `PowerShell did not return within ${timeoutMs}ms.`,
                { cause: error }
              )
            );
            return;
          }

          reject(new Error(String(stderr || error.message).trim()));
          return;
        }

        resolve(String(stdout || '').trim());
      }
    );
  });
}

/**
 * Translates a Win32 error code from the spooler into something a restaurant
 * owner (and our dashboard) can act on.
 *
 * @param {string} message raw error text from the script
 * @returns {AgentError}
 */
function interpretSpoolerError(message) {
  // 1801 ERROR_INVALID_PRINTER_NAME — the selected printer no longer exists,
  // usually because it was renamed or unplugged.
  if (message.includes('OPEN_FAILED:1801') || message.includes('OPEN_FAILED:5')) {
    return new AgentError(
      ErrorCodes.PRINTER_NOT_FOUND,
      'Windows does not have a printer by that name (it may have been renamed, removed, or the USB cable unplugged).',
      { retryable: false }
    );
  }

  if (message.includes('OPEN_FAILED')) {
    return new AgentError(
      ErrorCodes.PRINTER_OFFLINE,
      `Could not open the printer: ${message}`,
      { retryable: true }
    );
  }

  if (message.includes('WRITE_FAILED') || message.includes('SHORT_WRITE')) {
    return new AgentError(
      ErrorCodes.PRINTER_ERROR,
      `The spooler rejected the data mid-write: ${message}`,
      { retryable: true }
    );
  }

  return new AgentError(ErrorCodes.PRINTER_ERROR, message, { retryable: true });
}

/**
 * Windows spooler transport.
 *
 * Covers USB, shared (\\\\host\\printer) and TCP/IP-port printers alike — as far
 * as we are concerned they are all just a print queue name.
 */
class WindowsSpoolerTransport {
  /**
   * @param {{ printerName: string }} options
   */
  constructor({ printerName }) {
    this.printerName = printerName;
  }

  /** @returns {string} */
  describe() {
    return `Windows spooler (${this.printerName})`;
  }

  /**
   * Writes raw bytes to the print queue.
   *
   * @param {Buffer} bytes an ESC/POS command stream
   * @param {{ docName?: string }} [options]
   * @returns {Promise<void>}
   * @throws {AgentError}
   */
  async write(bytes, options = {}) {
    if (!this.printerName) {
      throw new AgentError(ErrorCodes.PRINTER_NOT_CONFIGURED, 'No printer has been selected.', {
        retryable: false,
      });
    }

    const id = crypto.randomBytes(6).toString('hex');
    const tempDir = os.tmpdir();
    const dataFile = path.join(tempDir, `fikranova-${id}.bin`);
    const scriptFile = path.join(tempDir, `fikranova-${id}.ps1`);

    try {
      await fs.writeFile(dataFile, bytes);
      await fs.writeFile(scriptFile, RAW_PRINT_SCRIPT, 'utf8');

      const stdout = await runPowerShell(
        [
          '-File',
          scriptFile,
          '-PrinterName',
          this.printerName,
          '-DataFile',
          dataFile,
          '-DocName',
          options.docName || 'FikraNova Print Job',
        ],
        PRINT_TIMEOUT_MS
      );

      if (!stdout.includes('PRINT_OK')) {
        throw new Error(`Unexpected response from print helper: ${stdout || '(no output)'}`);
      }

      logger.info(`Sent ${bytes.length} bytes to "${this.printerName}".`);
    } catch (error) {
      if (error instanceof AgentError) throw error;
      throw interpretSpoolerError(String(error.message || error));
    } finally {
      // Receipts contain customer names and phone numbers. Do not leave them
      // lying around in %TEMP%.
      await fs.rm(dataFile, { force: true }).catch(() => {});
      await fs.rm(scriptFile, { force: true }).catch(() => {});
    }
  }

  /**
   * Queries the spooler for this printer's state.
   *
   * The spooler is a write-only channel for our bytes, so we cannot ask the
   * printer directly (as we can over TCP with DLE EOT). What we CAN do is ask
   * Windows what it thinks — which is how Windows itself decides to grey out a
   * printer as "Offline" or show "Out of paper".
   *
   * @returns {Promise<import('../../../models/PrinterStatus').PrinterStatusReport>}
   */
  async queryStatus() {
    if (!this.printerName) {
      return {
        state: PrinterState.NOT_CONFIGURED,
        detail: 'No printer selected.',
        checkedAt: Date.now(),
      };
    }

    try {
      // ConvertTo-Json on a single object is not an array, hence the @() wrap.
      const stdout = await runPowerShell(
        [
          '-Command',
          `$ErrorActionPreference='Stop';` +
            `$p = Get-Printer -Name "${this.printerName.replace(/"/g, '`"')}";` +
            `@{ status = [string]$p.PrinterStatus; state = [string]$p.JobCount } | ConvertTo-Json -Compress`,
        ],
        QUERY_TIMEOUT_MS
      );

      /** @type {{ status?: string }} */
      const parsed = JSON.parse(stdout || '{}');
      const state = fromWindowsStatus(parsed.status || '');

      return {
        state,
        name: this.printerName,
        detail: parsed.status || undefined,
        checkedAt: Date.now(),
      };
    } catch (error) {
      const message = String(error.message || error);

      // Get-Printer throws when the queue does not exist at all.
      if (/cannot find|not found|1801/i.test(message)) {
        return {
          state: PrinterState.OFFLINE,
          name: this.printerName,
          detail: 'Printer not found in Windows.',
          checkedAt: Date.now(),
        };
      }

      logger.warn(`Could not query printer status: ${message}`);

      return {
        state: PrinterState.UNKNOWN,
        name: this.printerName,
        detail: message,
        checkedAt: Date.now(),
      };
    }
  }
}

module.exports = { WindowsSpoolerTransport, RAW_PRINT_SCRIPT };
