'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { app } = require('electron');

const { createLogger } = require('../services/logger');

const logger = createLogger('crash');

/** Keep the most recent N crash files; older ones are pruned. */
const MAX_CRASH_FILES = 20;

/**
 * Crash capture.
 *
 * A tray app has no window to show an error in and no console anyone will read.
 * If it dies, it dies silently and the restaurant simply stops printing — with
 * no clue why, and nothing for support to work from. So every abnormal exit is
 * written to disk as a JSON file before the process goes down, and the last one
 * is attached to the next heartbeat so we learn about it centrally.
 *
 * We deliberately do NOT swallow the exception and carry on: a process whose
 * invariants have already broken should die and be restarted clean by the
 * watchdog, not limp along printing corrupted receipts.
 */

/**
 * @param {string} crashDir
 * @param {string} kind
 * @param {unknown} error
 * @param {object} [context]
 */
function writeCrashReport(crashDir, kind, error, context = {}) {
  try {
    fs.mkdirSync(crashDir, { recursive: true });

    const report = {
      kind,
      at: new Date().toISOString(),
      version: app.getVersion(),
      platform: `${process.platform} ${process.arch}`,
      electron: process.versions.electron,
      node: process.versions.node,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
    };

    const file = path.join(crashDir, `crash-${Date.now()}.json`);
    fs.writeFileSync(file, JSON.stringify(report, null, 2), 'utf8');

    logger.error(`Crash report written to ${file}`);
  } catch (writeError) {
    // We are already crashing; there is nothing useful left to do.
    logger.error(`Could not write crash report: ${writeError.message}`);
  }
}

/**
 * Removes all but the newest MAX_CRASH_FILES reports.
 * @param {string} crashDir
 */
function pruneCrashReports(crashDir) {
  try {
    if (!fs.existsSync(crashDir)) return;

    const files = fs
      .readdirSync(crashDir)
      .filter((name) => name.startsWith('crash-') && name.endsWith('.json'))
      .sort()
      .reverse();

    for (const stale of files.slice(MAX_CRASH_FILES)) {
      fs.rmSync(path.join(crashDir, stale), { force: true });
    }
  } catch (error) {
    logger.warn(`Could not prune crash reports: ${error.message}`);
  }
}

/**
 * Reads (and consumes) the most recent crash report, so it can be attached to
 * the next heartbeat. Consuming it means we report each crash exactly once.
 *
 * @param {string} crashDir
 * @returns {object | null}
 */
function takeLatestCrashReport(crashDir) {
  try {
    if (!fs.existsSync(crashDir)) return null;

    const files = fs
      .readdirSync(crashDir)
      .filter((name) => name.startsWith('crash-') && name.endsWith('.json'))
      .sort();

    const latest = files.at(-1);
    if (!latest) return null;

    const file = path.join(crashDir, latest);
    const report = JSON.parse(fs.readFileSync(file, 'utf8'));

    // Mark as reported by renaming rather than deleting, so the file is still on
    // disk if a support engineer needs it.
    fs.renameSync(file, path.join(crashDir, `reported-${latest}`));

    return report;
  } catch (error) {
    logger.warn(`Could not read crash report: ${error.message}`);
    return null;
  }
}

/**
 * Installs global handlers. Call once, before anything else can throw.
 *
 * @param {object} options
 * @param {string} options.crashDir
 * @param {() => void} [options.onFatal] last-chance cleanup (flush the queue, etc.)
 */
function installCrashHandlers({ crashDir, onFatal }) {
  pruneCrashReports(crashDir);

  process.on('uncaughtException', (error) => {
    writeCrashReport(crashDir, 'uncaughtException', error);

    try {
      onFatal?.();
    } catch {
      // Nothing left to do.
    }

    // Exit non-zero so the watchdog knows this was a crash, not a clean quit.
    app.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    // A rejected promise is a bug, but it has not necessarily corrupted state.
    // Record it and keep printing rather than taking the restaurant offline.
    writeCrashReport(crashDir, 'unhandledRejection', reason);
    logger.error('Unhandled promise rejection (agent will continue):', reason);
  });

  // Electron's own renderer/GPU process crashes.
  app.on('render-process-gone', (_event, _contents, details) => {
    writeCrashReport(crashDir, 'render-process-gone', new Error(details.reason), details);
  });

  app.on('child-process-gone', (_event, details) => {
    writeCrashReport(crashDir, 'child-process-gone', new Error(details.reason), details);
  });
}

module.exports = {
  installCrashHandlers,
  writeCrashReport,
  takeLatestCrashReport,
  pruneCrashReports,
};
