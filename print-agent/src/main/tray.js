'use strict';

const { Tray, Menu, nativeImage, app } = require('electron');

const { assetPath } = require('../utils/paths');
const { createLogger } = require('../services/logger');

const logger = createLogger('tray');

/**
 * The tray icon is the agent's entire user interface for 99.9% of its life.
 *
 * Its single most important job is to answer, at a glance and without anyone
 * clicking anything: "is this thing working?" Hence two distinct icons and a
 * tooltip that always carries the real state — restaurant, connection, queue
 * depth, printer. A manager can hover over it and know whether to worry.
 */
class TrayController {
  /**
   * @param {object} deps
   * @param {() => object} deps.getState
   * @param {object} deps.actions
   * @param {() => void} deps.actions.showSettings
   * @param {() => void} deps.actions.testPrint
   * @param {() => void} deps.actions.reconnect
   * @param {() => void} deps.actions.restart
   * @param {() => void} deps.actions.quit
   */
  constructor({ getState, actions }) {
    this.getState = getState;
    this.actions = actions;

    /** @type {Tray | null} */
    this.tray = null;
    this.connected = false;
  }

  /**
   * @private
   * @param {boolean} connected
   * @returns {Electron.NativeImage}
   */
  icon(connected) {
    const file = connected ? 'tray-connected.png' : 'tray-disconnected.png';
    const image = nativeImage.createFromPath(assetPath(file));

    // If the asset is missing we must NOT crash — an agent with an invisible
    // tray icon still prints, and printing is the product.
    if (image.isEmpty()) {
      logger.warn(`Tray icon ${file} could not be loaded.`);
    }

    return image;
  }

  create() {
    this.tray = new Tray(this.icon(false));

    this.tray.setToolTip('FikraNova Print Agent');

    // Double-click is the reflex action for a tray icon on Windows.
    this.tray.on('double-click', () => this.actions.showSettings());

    this.refresh();

    logger.info('Tray icon created.');
  }

  /**
   * Rebuilds the menu and tooltip from current state.
   *
   * Called on every state change (connect, disconnect, job printed, pause), so
   * the menu is never stale when it is opened.
   */
  refresh() {
    if (!this.tray || this.tray.isDestroyed()) return;

    const state = this.getState();

    if (state.connected !== this.connected) {
      this.connected = Boolean(state.connected);
      this.tray.setImage(this.icon(this.connected));
    }

    this.tray.setToolTip(this.tooltip(state));
    this.tray.setContextMenu(this.menu(state));
  }

  /**
   * @private
   * @param {object} state
   * @returns {string}
   */
  tooltip(state) {
    const lines = [
      `FikraNova Print Agent v${app.getVersion()}`,
      state.paired ? state.restaurantName : 'Not paired',
      state.connected ? 'Connected' : 'Disconnected — jobs are being queued',
    ];

    if (state.queueSize > 0) {
      lines.push(`${state.queueSize} job(s) waiting`);
    }

    if (state.paused) {
      lines.push('PRINTING PAUSED');
    }

    if (state.printerName) {
      lines.push(`Printer: ${state.printerName}`);
    }

    return lines.filter(Boolean).join('\n');
  }

  /**
   * @private
   * @param {object} state
   * @returns {Electron.Menu}
   */
  menu(state) {
    return Menu.buildFromTemplate([
      {
        // A non-clickable status header. Cheaper for a manager to read than
        // opening the settings window.
        label: state.paired ? state.restaurantName : 'Not paired',
        enabled: false,
      },
      {
        label: state.connected ? '● Connected' : '○ Disconnected',
        enabled: false,
      },
      ...(state.paused ? [{ label: '⏸ Printing paused', enabled: false }] : []),
      ...(state.queueSize > 0 ? [{ label: `${state.queueSize} job(s) queued`, enabled: false }] : []),
      { type: 'separator' },
      { label: 'Show', click: () => this.actions.showSettings() },
      { label: 'Settings…', click: () => this.actions.showSettings() },
      { type: 'separator' },
      {
        label: 'Test Print',
        enabled: Boolean(state.printerConfigured),
        click: () => this.actions.testPrint(),
      },
      {
        label: 'Reconnect',
        enabled: Boolean(state.paired),
        click: () => this.actions.reconnect(),
      },
      { label: 'Restart Agent', click: () => this.actions.restart() },
      { type: 'separator' },
      { label: `Version ${app.getVersion()}`, enabled: false },
      { label: 'Exit', click: () => this.actions.quit() },
    ]);
  }

  /**
   * A balloon notification. Used sparingly — only for things a human must act on
   * (out of paper), never for routine successes.
   *
   * @param {string} title
   * @param {string} content
   */
  notify(title, content) {
    if (!this.tray || this.tray.isDestroyed()) return;

    try {
      this.tray.displayBalloon({ title, content, iconType: 'warning' });
    } catch (error) {
      logger.warn(`Could not show tray balloon: ${error.message}`);
    }
  }

  destroy() {
    if (this.tray && !this.tray.isDestroyed()) {
      this.tray.destroy();
    }
    this.tray = null;
  }
}

module.exports = { TrayController };
