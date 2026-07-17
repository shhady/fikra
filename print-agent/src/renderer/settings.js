'use strict';

/**
 * Settings window.
 *
 * Driven entirely by state pushed from the main process (`onState`), so it can
 * never disagree with the tray. There is no local copy of the truth here — the
 * agent is the only thing that knows whether it is connected.
 */

const el = {
  restaurant: document.getElementById('restaurant'),
  message: document.getElementById('message'),
  connection: document.getElementById('connection'),
  printerStatus: document.getElementById('printer-status'),
  queue: document.getElementById('queue'),
  lastPrint: document.getElementById('last-print'),
  printer: document.getElementById('printer'),
  refresh: document.getElementById('refresh'),
  width: document.getElementById('width'),
  transport: document.getElementById('transport'),
  networkFields: document.getElementById('network-fields'),
  host: document.getElementById('host'),
  port: document.getElementById('port'),
  drawer: document.getElementById('drawer'),
  autolaunch: document.getElementById('autolaunch'),
  save: document.getElementById('save'),
  test: document.getElementById('test'),
  reconnect: document.getElementById('reconnect'),
  logs: document.getElementById('logs'),
  updates: document.getElementById('updates'),
  about: document.getElementById('about'),
};

/** Set while the user is editing, so a pushed state update cannot clobber a
 *  half-typed IP address under their fingers. */
let editing = false;

/** @type {number | undefined} */
let messageTimer;

/**
 * @param {'error'|'success'|'info'} kind
 * @param {string} text
 * @param {number} [ms] auto-hide after this long
 */
function show(kind, text, ms = 6000) {
  el.message.className = `message show ${kind}`;
  el.message.textContent = text;

  clearTimeout(messageTimer);

  if (ms > 0) {
    messageTimer = setTimeout(() => {
      el.message.className = 'message';
    }, ms);
  }
}

/**
 * Human-readable printer state.
 * @param {object} status
 * @returns {{ dot: string, text: string }}
 */
function describePrinter(status) {
  switch (status?.state) {
    case 'ready':
      return { dot: 'ok', text: 'Ready' };
    case 'out_of_paper':
      return { dot: 'bad', text: 'Out of paper' };
    case 'cover_open':
      return { dot: 'bad', text: 'Cover open' };
    case 'offline':
      return { dot: 'bad', text: 'Offline' };
    case 'error':
      return { dot: 'bad', text: 'Error' };
    case 'not_configured':
      return { dot: 'warn', text: 'Not selected' };
    default:
      return { dot: 'warn', text: 'Unknown' };
  }
}

/**
 * @param {number|null} timestamp
 * @returns {string}
 */
function formatLastPrint(timestamp) {
  if (!timestamp) return 'Never';

  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;

  return new Date(timestamp).toLocaleDateString();
}

/**
 * Renders agent state into the window.
 * @param {object} state
 */
function render(state) {
  el.restaurant.textContent = state.paired ? state.restaurantName : 'Not paired';

  const connected = Boolean(state.connected);
  const paused = Boolean(state.paused);

  el.connection.innerHTML = paused
    ? '<span class="dot warn"></span>Paused by FikraNova'
    : connected
      ? '<span class="dot ok"></span>Connected'
      : '<span class="dot bad"></span>Disconnected — jobs are queued';

  const printer = describePrinter(state.printerStatus);
  el.printerStatus.innerHTML = `<span class="dot ${printer.dot}"></span>${printer.text}`;

  el.queue.textContent = String(state.queueSize ?? 0);
  el.lastPrint.textContent = formatLastPrint(state.lastPrintAt);

  el.test.disabled = !state.printerConfigured;

  // Do not fight the user for control of the inputs.
  if (!editing) {
    el.width.value = String(state.paperWidth ?? 80);
    el.transport.value = state.transport ?? 'auto';
    el.host.value = state.networkHost ?? '';
    el.port.value = String(state.networkPort ?? 9100);
    el.drawer.checked = Boolean(state.openCashDrawer);
    el.autolaunch.checked = Boolean(state.autoLaunch);

    toggleNetworkFields();
  }
}

/** Network fields are only relevant for the network transport. */
function toggleNetworkFields() {
  const needsNetwork = el.transport.value === 'network' || el.transport.value === 'auto';
  el.networkFields.style.display = needsNetwork ? 'grid' : 'none';
}

/** Populates the printer dropdown. */
async function loadPrinters(selectedName) {
  el.printer.innerHTML = '<option>Loading…</option>';

  const result = await window.fikranova.listPrinters();

  el.printer.innerHTML = '';

  if (!result.ok || result.data.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No printers found';
    el.printer.appendChild(option);
    return;
  }

  for (const printer of result.data) {
    const option = document.createElement('option');

    option.value = printer.name;
    option.textContent = printer.isDefault ? `${printer.name} (default)` : printer.name;

    el.printer.appendChild(option);
  }

  if (selectedName) el.printer.value = selectedName;
}

// --------------------------------------------------------------------- events

for (const input of [el.width, el.transport, el.host, el.port, el.drawer, el.autolaunch, el.printer]) {
  input.addEventListener('focus', () => {
    editing = true;
  });
  input.addEventListener('change', () => {
    editing = true;
  });
}

el.transport.addEventListener('change', toggleNetworkFields);

el.refresh.addEventListener('click', async () => {
  el.refresh.disabled = true;

  const state = await window.fikranova.getState();
  await loadPrinters(state.ok ? state.data.printerName : '');

  el.refresh.disabled = false;
  show('info', 'Printer list refreshed.', 3000);
});

el.save.addEventListener('click', async () => {
  el.save.disabled = true;
  el.save.textContent = 'Saving…';

  const result = await window.fikranova.saveSettings({
    printerName: el.printer.value,
    paperWidth: Number(el.width.value) === 58 ? 58 : 80,
    transport: el.transport.value,
    networkHost: el.host.value,
    networkPort: Number(el.port.value),
    openCashDrawer: el.drawer.checked,
    autoLaunch: el.autolaunch.checked,
  });

  el.save.disabled = false;
  el.save.textContent = 'Save';

  if (!result.ok) {
    show('error', result.error.message);
    return;
  }

  // Let pushed state take over the inputs again now that the user is done.
  editing = false;

  render(result.data);
  show('success', 'Settings saved.');
});

el.test.addEventListener('click', async () => {
  el.test.disabled = true;
  el.test.innerHTML = '<span class="spin"></span>Printing…';

  const result = await window.fikranova.testPrint();

  el.test.disabled = false;
  el.test.textContent = 'Test Print';

  if (!result.ok) {
    show('error', `Test print failed: ${result.error.message}`, 0);
    return;
  }

  show('success', 'Test print sent. Check that every line on the slip is correct.');
});

el.reconnect.addEventListener('click', async () => {
  el.reconnect.disabled = true;

  await window.fikranova.reconnect();

  el.reconnect.disabled = false;
  show('info', 'Reconnecting…', 3000);
});

el.logs.addEventListener('click', () => window.fikranova.openLogs());

el.updates.addEventListener('click', async () => {
  el.updates.disabled = true;
  el.updates.textContent = 'Checking…';

  const result = await window.fikranova.checkForUpdates();

  el.updates.disabled = false;
  el.updates.textContent = 'Check for Updates';

  if (!result.ok) {
    show('error', `Update check failed: ${result.error.message}`);
    return;
  }

  const messages = {
    'up-to-date': 'You are running the latest version.',
    updating: 'An update is downloading. The agent will restart when the queue is empty.',
    'not-in-rollout': 'A newer version exists, but this device is not in the current rollout yet.',
    pinned: 'This device is pinned to a specific version.',
    'check-failed': 'Could not reach the update server.',
    'no-policy': 'No update policy is published yet.',
  };

  show('info', messages[result.data.decision] || `Update check: ${result.data.decision}`);
});

// ----------------------------------------------------------------- bootstrap

window.fikranova.onState(render);

(async function init() {
  const [state, version] = await Promise.all([
    window.fikranova.getState(),
    window.fikranova.getVersion(),
  ]);

  if (state.ok) {
    render(state.data);
    await loadPrinters(state.data.printerName);
  }

  if (version.ok) {
    el.about.textContent =
      `FikraNova Print Agent v${version.data.version} · Electron ${version.data.electron}`;
  }
})();

// The queue and "last print" age visibly; refresh them without waiting for the
// next pushed update.
setInterval(async () => {
  const state = await window.fikranova.getState();
  if (state.ok) render(state.data);
}, 5000);
