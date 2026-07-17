'use strict';

const { ipcMain, app, shell } = require('electron');

const { createLogger } = require('../services/logger');
const { toAgentError } = require('../utils/errors');
const { isWellFormedPairingCode } = require('../models/Device');
const { logsDir } = require('../utils/paths');

const logger = createLogger('ipc');

/**
 * The bridge between the renderer and the agent.
 *
 * Every handler here is an explicit, named capability. The renderer cannot reach
 * anything that is not on this list — it has no Node, no filesystem, no network.
 * That matters because the settings window renders strings that ultimately came
 * from the cloud (the restaurant name), and the pairing window takes free text
 * from whoever is standing at the till.
 *
 * Handlers never throw across the boundary: an exception in the main process
 * would be surfaced to the renderer as an opaque "Error invoking remote method".
 * Instead every handler returns a plain { ok, ... } envelope that the UI can act
 * on and display.
 *
 * @param {import('./app').Agent} agent
 */
function registerIpc(agent) {
  /**
   * Wraps a handler so it always resolves to a serialisable envelope.
   * @param {string} channel
   * @param {(payload: any) => Promise<any> | any} handler
   */
  const handle = (channel, handler) => {
    ipcMain.handle(channel, async (_event, payload) => {
      try {
        const data = await handler(payload);
        return { ok: true, data };
      } catch (error) {
        const agentError = toAgentError(error);

        logger.warn(`IPC ${channel} failed: ${agentError.message}`);

        return {
          ok: false,
          error: { code: agentError.code, message: agentError.message },
        };
      }
    });
  };

  // ------------------------------------------------------------------ state

  handle('agent:getState', () => agent.trayState());

  handle('agent:getVersion', () => ({
    version: app.getVersion(),
    electron: process.versions.electron,
    node: process.versions.node,
    configPath: agent.config.path,
    logsPath: logsDir(),
  }));

  // ---------------------------------------------------------------- pairing

  handle('agent:pair', async (payload) => {
    const code = String(payload?.code || '');

    // Fail fast on an obviously wrong shape so the user gets an instant, useful
    // message instead of a round-trip and a generic server rejection.
    if (!isWellFormedPairingCode(code)) {
      throw new Error('That does not look like a pairing code. It should look like FKN-5F8D-2A9B-C7XK.');
    }

    return agent.pair(code);
  });

  // --------------------------------------------------------------- printers

  handle('printer:list', () => agent.printer.discover());

  handle('printer:status', () => agent.printer.status());

  handle('printer:test', () => agent.testPrint());

  handle('printer:openDrawer', () => agent.printer.openCashDrawer());

  // --------------------------------------------------------------- settings

  handle('settings:save', async (payload) => {
    const settings = payload && typeof payload === 'object' ? payload : {};

    /** @type {Record<string, unknown>} */
    const updates = {};

    if (typeof settings.printerName === 'string') updates.printerName = settings.printerName;
    if (typeof settings.networkHost === 'string') updates.networkHost = settings.networkHost.trim();

    if (settings.paperWidth === 58 || settings.paperWidth === 80) {
      updates.paperWidth = settings.paperWidth;
    }

    if (['auto', 'spooler', 'network'].includes(settings.transport)) {
      updates.transport = settings.transport;
    }

    const port = Number(settings.networkPort);
    if (Number.isInteger(port) && port > 0 && port <= 65535) {
      updates.networkPort = port;
    }

    if (typeof settings.openCashDrawer === 'boolean') {
      updates.openCashDrawer = settings.openCashDrawer;
    }

    agent.config.setMany(updates);

    if (typeof settings.autoLaunch === 'boolean') {
      await agent.setAutoLaunch(settings.autoLaunch);
    }

    logger.info(`Settings saved: ${Object.keys(updates).join(', ') || '(no changes)'}`);

    agent.tray.refresh();
    agent.broadcastState();

    // A printer change may have unblocked a queue that was failing.
    agent.pump();

    return agent.trayState();
  });

  // ---------------------------------------------------------------- actions

  handle('agent:reconnect', () => {
    agent.reconnect();
    return agent.trayState();
  });

  handle('agent:restart', () => {
    // Give the reply a moment to reach the renderer before the process dies.
    setTimeout(() => agent.restart(), 250);
    return { restarting: true };
  });

  handle('agent:openLogs', () => {
    shell.openPath(logsDir());
    return { opened: true };
  });

  handle('agent:checkForUpdates', () => agent.updater.check({ force: true }));
}

module.exports = { registerIpc };
