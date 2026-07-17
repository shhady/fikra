'use strict';

const { contextBridge, ipcRenderer } = require('electron');

/**
 * The preload bridge.
 *
 * This is the ONLY channel between the renderer and the agent. The renderer runs
 * with contextIsolation on and nodeIntegration off, so it has no `require`, no
 * `fs`, no `process` — it can only call the functions listed here.
 *
 * Every method is an explicit verb. We deliberately do NOT expose a generic
 * `invoke(channel, args)` passthrough: that would hand any injected script the
 * full IPC surface, which is exactly the escape hatch contextIsolation exists to
 * close.
 *
 * Note the device token is not reachable from here at all, by design. The
 * renderer never needs it and therefore never gets it.
 */
contextBridge.exposeInMainWorld('fikranova', {
  // State
  getState: () => ipcRenderer.invoke('agent:getState'),
  getVersion: () => ipcRenderer.invoke('agent:getVersion'),

  // Pairing
  pair: (code) => ipcRenderer.invoke('agent:pair', { code }),

  // Printers
  listPrinters: () => ipcRenderer.invoke('printer:list'),
  printerStatus: () => ipcRenderer.invoke('printer:status'),
  testPrint: () => ipcRenderer.invoke('printer:test'),
  openCashDrawer: () => ipcRenderer.invoke('printer:openDrawer'),

  // Settings
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),

  // Actions
  reconnect: () => ipcRenderer.invoke('agent:reconnect'),
  restart: () => ipcRenderer.invoke('agent:restart'),
  openLogs: () => ipcRenderer.invoke('agent:openLogs'),
  checkForUpdates: () => ipcRenderer.invoke('agent:checkForUpdates'),

  /**
   * Subscribes to pushed state updates.
   *
   * The listener is wrapped so the renderer only ever receives the payload, never
   * Electron's IpcRendererEvent — which carries a `sender` handle that would let
   * renderer code send arbitrary IPC messages.
   *
   * @param {(state: object) => void} listener
   * @returns {() => void} unsubscribe
   */
  onState: (listener) => {
    const wrapped = (_event, state) => listener(state);

    ipcRenderer.on('agent:state', wrapped);

    return () => ipcRenderer.removeListener('agent:state', wrapped);
  },
});
