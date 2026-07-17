'use strict';

const { BrowserWindow, shell } = require('electron');

const { rendererPath, appPath } = require('../utils/paths');
const { createLogger } = require('../services/logger');

const logger = createLogger('windows');

/**
 * Window management.
 *
 * The agent is tray-only: it must run for months without a window ever being
 * open, and closing a window must never quit the app (see the 'close' handler).
 * There are exactly two windows, and only ever one of each.
 */
class WindowManager {
  constructor() {
    /** @type {BrowserWindow | null} */
    this.settings = null;
    /** @type {BrowserWindow | null} */
    this.pairing = null;
  }

  /**
   * Security baseline for every window we create.
   *
   * contextIsolation + no nodeIntegration means renderer code cannot touch the
   * filesystem, spawn processes, or read the device token even if an attacker
   * managed to inject script into it. Everything it is allowed to do goes through
   * the narrow, explicit preload bridge.
   *
   * @private
   * @returns {Electron.WebPreferences}
   */
  webPreferences() {
    return {
      preload: appPath('src', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // the preload needs require('electron'); it exposes nothing else
      spellcheck: false,
      devTools: !app_isPackaged(),
    };
  }

  /**
   * Blocks navigation and popups.
   *
   * A tray utility has no business opening windows or navigating anywhere. If a
   * link is clicked, it belongs in the user's browser, not inside our app where
   * it would inherit the preload bridge.
   *
   * @private
   * @param {BrowserWindow} win
   */
  harden(win) {
    win.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('https://')) shell.openExternal(url);
      return { action: 'deny' };
    });

    win.webContents.on('will-navigate', (event, url) => {
      // Allow only the initial file:// load of our own renderer.
      if (!url.startsWith('file://')) {
        event.preventDefault();
        logger.warn(`Blocked navigation to ${url}`);
      }
    });
  }

  /**
   * The pairing window — the ONLY thing shown on first run.
   * @returns {BrowserWindow}
   */
  showPairing() {
    if (this.pairing && !this.pairing.isDestroyed()) {
      this.pairing.show();
      this.pairing.focus();
      return this.pairing;
    }

    this.pairing = new BrowserWindow({
      width: 480,
      height: 560,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      title: 'FikraNova Print Agent — Pairing',
      autoHideMenuBar: true,
      show: false,
      webPreferences: this.webPreferences(),
    });

    this.harden(this.pairing);
    this.pairing.loadFile(rendererPath('pairing.html'));

    this.pairing.once('ready-to-show', () => this.pairing?.show());

    this.pairing.on('closed', () => {
      this.pairing = null;
    });

    return this.pairing;
  }

  /** Closes the pairing window once pairing has succeeded. */
  closePairing() {
    if (this.pairing && !this.pairing.isDestroyed()) {
      this.pairing.destroy();
    }
    this.pairing = null;
  }

  /**
   * The settings window.
   * @returns {BrowserWindow}
   */
  showSettings() {
    if (this.settings && !this.settings.isDestroyed()) {
      if (this.settings.isMinimized()) this.settings.restore();
      this.settings.show();
      this.settings.focus();
      return this.settings;
    }

    this.settings = new BrowserWindow({
      width: 560,
      height: 720,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      title: 'FikraNova Print Agent — Settings',
      autoHideMenuBar: true,
      show: false,
      webPreferences: this.webPreferences(),
    });

    this.harden(this.settings);
    this.settings.loadFile(rendererPath('settings.html'));

    this.settings.once('ready-to-show', () => this.settings?.show());

    // The X button hides the window; it does NOT quit. Quitting is only ever
    // done deliberately, from the tray menu. A cashier closing a window must not
    // silently stop the restaurant's printing for the rest of the day.
    this.settings.on('close', (event) => {
      if (!globalThis.__fikranovaQuitting) {
        event.preventDefault();
        this.settings?.hide();
      }
    });

    this.settings.on('closed', () => {
      this.settings = null;
    });

    return this.settings;
  }

  /**
   * Pushes a state update to whichever windows are open.
   * @param {string} channel
   * @param {object} payload
   */
  broadcast(channel, payload) {
    for (const win of [this.settings, this.pairing]) {
      if (win && !win.isDestroyed()) {
        win.webContents.send(channel, payload);
      }
    }
  }

  closeAll() {
    for (const win of [this.settings, this.pairing]) {
      if (win && !win.isDestroyed()) win.destroy();
    }

    this.settings = null;
    this.pairing = null;
  }
}

/**
 * Lazily read app.isPackaged without importing `app` at module scope, so this
 * file can be required before Electron is ready.
 * @returns {boolean}
 */
function app_isPackaged() {
  const { app } = require('electron');
  return app.isPackaged;
}

module.exports = { WindowManager };
