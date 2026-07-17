'use strict';

/**
 * Dev/integration harness — pairs this agent install against a backend and
 * points it at a printer, so the whole pipeline can be driven end to end without
 * a human typing into the pairing window.
 *
 *   set API_BASE=http://localhost:3100
 *   set PAIRING_CODE=FKN-XXXX-XXXX-XXXX
 *   npx electron ./scripts/dev-pair.js
 *
 * It writes to the SAME config store the real agent reads, so after running this
 * you can launch `npm start` and the agent is already paired.
 *
 * Never invoked by the shipped app; it is not referenced from src/.
 */
const { app, safeStorage } = require('electron');

// Electron derives the app name (and therefore userData) from package.json only
// when it is given a DIRECTORY. Given a script file it calls itself "Electron"
// and writes to %APPDATA%\Electron — a different config store from the one the
// real agent reads. Pin the name so we write where the agent will look.
app.setName('FikraNova Print Agent');

app.whenReady().then(async () => {
  const { ConfigService } = require('../src/services/config');

  const apiBase = process.env.API_BASE;
  const code = process.env.PAIRING_CODE;

  if (!apiBase || !code) {
    console.error('API_BASE and PAIRING_CODE are required.');
    app.exit(1);
    return;
  }

  const config = new ConfigService();

  // Point at the local backend, the fake printer, and disable the socket.
  config.setMany({
    apiBaseUrl: apiBase,
    wsUrl: '',
    transport: 'network',
    networkHost: '127.0.0.1',
    networkPort: 9100,
    paperWidth: 80,
    autoLaunch: false, // do NOT register start-with-Windows on a test machine
    paused: false,
  });

  const res = await fetch(`${apiBase}/api/printer/v1/devices/pair`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pairingCode: code,
      hostname: 'INTEGRATION-TEST',
      os: 'Windows 11',
      agentVersion: app.getVersion(),
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.deviceToken) {
    console.error('PAIR FAILED:', res.status, JSON.stringify(data));
    app.exit(1);
    return;
  }

  config.savePairing({
    deviceId: data.deviceId,
    deviceToken: data.deviceToken,
    restaurantId: data.restaurantId,
    restaurantName: data.restaurantName,
    pairedAt: Date.now(),
  });

  console.log(`PAIRED_OK restaurant="${data.restaurantName}" device=${data.deviceId}`);
  console.log(`dpapi_available=${safeStorage.isEncryptionAvailable()}`);

  app.exit(0);
});
