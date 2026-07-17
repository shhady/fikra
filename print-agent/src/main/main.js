'use strict';

const { app } = require('electron');

/**
 * Entry point.
 *
 * Order is load-bearing here:
 *   1. single-instance lock  — before ANY state is touched
 *   2. logging               — before anything that can throw
 *   3. crash handlers        — before the agent is constructed
 *   4. the agent itself
 */

// ---------------------------------------------------------------------------
// 1. Single instance.
//
// Two agents on one till would both claim the same job from the server, both
// print it, and both fight over the same SQLite file. Windows makes a second
// instance easy to trigger by accident: the Desktop shortcut, the Start Menu
// shortcut, and the auto-launch Run key are three separate ways to start us.
//
// This must run before the queue is opened, which is why it is the first thing
// in the file rather than inside Agent.start().
// ---------------------------------------------------------------------------
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Another agent is already running and has been told to surface its window.
  app.quit();
} else {
  bootstrap();
}

function bootstrap() {
  const { initLogger, createLogger } = require('../services/logger');
  const { logsDir, crashDir } = require('../utils/paths');

  // ------------------------------------------------------------------------
  // 2. Logging. Nothing above this line may throw, because nothing above this
  //    line can be diagnosed after the fact.
  // ------------------------------------------------------------------------
  initLogger({
    logsDir: logsDir(),
    version: app.getVersion(),
    verbose: Boolean(process.env.FIKRANOVA_DEV) || !app.isPackaged,
  });

  const logger = createLogger('main');

  const { installCrashHandlers } = require('./crashReporter');
  const { registerIpc } = require('./ipc');
  const { Agent } = require('./app');

  /** @type {import('./app').Agent | null} */
  let agent = null;

  // ------------------------------------------------------------------------
  // 3. Crash handling, installed before the agent exists so that a failure
  //    during construction is still captured.
  // ------------------------------------------------------------------------
  installCrashHandlers({
    crashDir: crashDir(),
    onFatal: () => agent?.shutdown(),
  });

  // A second launch attempt (double-clicked shortcut, or Windows starting us at
  // login while we are already running) surfaces the existing window instead of
  // starting a rival process.
  app.on('second-instance', () => {
    logger.info('A second instance was launched; focusing the existing agent.');
    agent?.showMainWindow();
  });

  // Chromium's default is to quit when the last window closes. For a tray app
  // that would mean the agent dies the moment someone closes Settings — and the
  // restaurant silently stops printing. Explicitly do nothing.
  app.on('window-all-closed', () => {
    logger.debug('All windows closed; the agent keeps running in the tray.');
  });

  app.on('before-quit', () => {
    globalThis.__fikranovaQuitting = true;
    agent?.shutdown();
  });

  // Windows is shutting down / the user is logging off. Flush the queue cleanly
  // so no job is left in the 'printing' limbo state.
  app.on('session-end', () => {
    logger.warn('Windows session is ending; shutting down cleanly.');
    agent?.shutdown();
  });

  app
    .whenReady()
    .then(async () => {
      logger.info(`Electron ready (Electron ${process.versions.electron}, Node ${process.versions.node}).`);

      // Windows uses this to group taskbar entries and to attribute notifications.
      app.setAppUserModelId('com.fikranova.printagent');

      agent = new Agent();

      registerIpc(agent);

      await agent.start();

      logger.info('Agent started.');
    })
    .catch((error) => {
      // Startup failed outright. The crash handler has already written a report;
      // exiting non-zero tells Windows (and us) this was not a clean stop.
      logger.error('Fatal error during startup:', error);
      app.exit(1);
    });
}
