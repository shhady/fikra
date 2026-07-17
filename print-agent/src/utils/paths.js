'use strict';

const path = require('node:path');
const { app } = require('electron');

/**
 * Filesystem locations used by the agent.
 *
 * Everything mutable lives under app.getPath('userData')
 * (%APPDATA%\FikraNova Print Agent), never next to the .exe in Program Files —
 * that directory is read-only for a standard user and would break the queue.
 */

/** @returns {string} %APPDATA%\FikraNova Print Agent */
function userDataDir() {
  return app.getPath('userData');
}

/** @returns {string} SQLite file backing the offline job queue */
function queueDbPath() {
  return path.join(userDataDir(), 'queue.db');
}

/** @returns {string} directory holding rotating log files */
function logsDir() {
  return path.join(userDataDir(), 'logs');
}

/** @returns {string} directory holding crash reports */
function crashDir() {
  return path.join(userDataDir(), 'crashes');
}

/**
 * Resolves a file inside the packaged app (asar-aware).
 * @param {...string} segments
 * @returns {string}
 */
function appPath(...segments) {
  return path.join(app.getAppPath(), ...segments);
}

/**
 * Resolves a renderer HTML file.
 * @param {string} file e.g. 'settings.html'
 * @returns {string}
 */
function rendererPath(file) {
  return appPath('src', 'renderer', file);
}

/**
 * Resolves a bundled asset (icons).
 * @param {string} file
 * @returns {string}
 */
function assetPath(file) {
  return appPath('assets', file);
}

module.exports = {
  userDataDir,
  queueDbPath,
  logsDir,
  crashDir,
  appPath,
  rendererPath,
  assetPath,
};
