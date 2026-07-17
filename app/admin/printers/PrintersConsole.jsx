'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The print-platform console.
 *
 * Designed around the one task you actually do at a restaurant, in order:
 *
 *   1. create the restaurant        (once)
 *   2. download the installer       (on their till)
 *   3. generate a pairing code      (expires in 10 minutes — so it is generated
 *                                    LAST, when you are standing at the machine)
 *   4. watch the till appear, then test print
 *
 * Everything else — devices, jobs, rollout — is monitoring and support.
 */

const REFRESH_MS = 10000;

/* ------------------------------------------------------------------ helpers */

function timeAgo(value) {
  if (!value) return 'never';

  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

  return new Date(value).toLocaleDateString();
}

const PRINTER_LABEL = {
  ready: ['Ready', 'text-emerald-400'],
  out_of_paper: ['Out of paper', 'text-red-400'],
  cover_open: ['Cover open', 'text-red-400'],
  offline: ['Printer offline', 'text-red-400'],
  error: ['Printer error', 'text-red-400'],
  not_configured: ['No printer selected', 'text-amber-400'],
  unknown: ['Unknown', 'text-slate-500'],
};

const JOB_BADGE = {
  completed: 'bg-emerald-950 text-emerald-400',
  failed: 'bg-red-950 text-red-400',
  queued: 'bg-amber-950 text-amber-400',
  printing: 'bg-indigo-950 text-indigo-400',
  cancelled: 'bg-slate-800 text-slate-400',
};

async function api(path, options = {}) {
  const res = await fetch(path, {
    method: options.method || 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);

  return data;
}

/* ------------------------------------------------------------- pairing code */

/**
 * The pairing code, with a live countdown.
 *
 * The countdown is not decoration. Codes die after 10 minutes, and the failure
 * mode without it is: you generate a code, get distracted plugging in the
 * printer, type it in eight minutes later, and get a confusing rejection. Seeing
 * the clock run down tells you to just generate a fresh one.
 */
function PairingCode({ result, onDismiss }) {
  const [left, setLeft] = useState(() =>
    Math.max(0, Math.round((new Date(result.expiresAt).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setLeft(Math.max(0, Math.round((new Date(result.expiresAt).getTime() - Date.now()) / 1000)));
    }, 1000);

    return () => clearInterval(timer);
  }, [result.expiresAt]);

  const expired = left === 0;
  const minutes = String(Math.floor(left / 60)).padStart(2, '0');
  const seconds = String(left % 60).padStart(2, '0');

  return (
    <div
      className={`rounded-xl border p-6 text-center ${
        expired ? 'border-red-900 bg-red-950/30' : 'border-indigo-800 bg-indigo-950/30'
      }`}
    >
      <p className="text-sm text-slate-400">
        Pairing code for <span className="font-medium text-slate-200">{result.restaurantName}</span>
      </p>

      <p
        className={`my-4 select-all font-mono text-3xl font-bold tracking-widest ${
          expired ? 'text-red-400 line-through' : 'text-white'
        }`}
      >
        {result.code}
      </p>

      {expired ? (
        <p className="text-sm text-red-400">Expired. Generate a new one.</p>
      ) : (
        <p className="text-sm text-slate-400">
          Expires in <span className="font-mono font-semibold text-slate-200">{minutes}:{seconds}</span>
        </p>
      )}

      <div className="mt-5 flex justify-center gap-2">
        <button
          type="button"
          disabled={expired}
          onClick={() => navigator.clipboard?.writeText(result.code)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40"
        >
          Copy code
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-600"
        >
          Done
        </button>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Type this into the agent&apos;s pairing screen on the till. It works once.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ console */

export default function PrintersConsole({ installerConfigured }) {
  const [restaurants, setRestaurants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [fleet, setFleet] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [pairing, setPairing] = useState(null);
  const [busy, setBusy] = useState('');

  // Keep the polling loop from fighting with an open pairing-code panel.
  const pairingOpen = useRef(false);
  pairingOpen.current = Boolean(pairing);

  const notify = (kind, text) => {
    setMessage({ kind, text });
    setTimeout(() => setMessage(null), 6000);
  };

  const load = useCallback(async () => {
    try {
      const [r, j, p] = await Promise.all([
        api('/api/admin/restaurants'),
        api('/api/admin/jobs'),
        api('/api/admin/update-policy'),
      ]);

      setRestaurants(r.restaurants);
      setJobs(j.jobs);
      setPolicy(p.policy);
      setFleet(p.fleet);
    } catch (error) {
      notify('error', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    // Tills report every 60s; refreshing every 10s keeps "online" honest without
    // hammering the database.
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  async function createRestaurant(event) {
    event.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);

    try {
      const result = await api('/api/admin/restaurants', {
        method: 'POST',
        body: { name: newName.trim() },
      });

      setNewKey(result);
      setNewName('');
      notify('success', `Created "${result.name}".`);
      load();
    } catch (error) {
      notify('error', error.message);
    } finally {
      setCreating(false);
    }
  }

  async function makePairingCode(restaurant) {
    setBusy(`pair-${restaurant.id}`);

    try {
      const result = await api(`/api/admin/restaurants/${restaurant.id}/pairing-codes`, {
        method: 'POST',
      });

      setPairing(result);
    } catch (error) {
      notify('error', error.message);
    } finally {
      setBusy('');
    }
  }

  async function deviceAction(device, action, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return;

    setBusy(`${action}-${device.id}`);

    try {
      const result = await api(`/api/admin/devices/${device.id}`, {
        method: 'POST',
        body: { action },
      });

      notify('success', result.effect || 'Done.');
      load();
    } catch (error) {
      notify('error', error.message);
    } finally {
      setBusy('');
    }
  }

  async function savePolicy(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    try {
      const result = await api('/api/admin/update-policy', {
        method: 'POST',
        body: {
          latestVersion: form.get('latestVersion'),
          minimumVersion: form.get('minimumVersion'),
          rolloutPercentage: Number(form.get('rolloutPercentage')),
          mandatory: form.get('mandatory') === 'on',
        },
      });

      notify(result.warning ? 'warn' : 'success', result.warning || 'Update policy saved.');
      load();
    } catch (error) {
      notify('error', error.message);
    }
  }

  const totalTills = restaurants.reduce((sum, r) => sum + r.devices.length, 0);
  const onlineTills = restaurants.reduce(
    (sum, r) => sum + r.devices.filter((d) => d.online).length,
    0
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      {/* Header ------------------------------------------------------- */}
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-300">
              ← Admin
            </Link>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Printers</h1>
          <p className="mt-1 text-sm text-slate-400">
            {restaurants.length} restaurant{restaurants.length === 1 ? '' : 's'} ·{' '}
            {onlineTills}/{totalTills} till{totalTills === 1 ? '' : 's'} online
          </p>
        </div>

        <a
          href="/api/installer"
          className={`rounded-lg px-4 py-2.5 text-sm font-medium ${
            installerConfigured
              ? 'bg-indigo-600 text-white hover:bg-indigo-500'
              : 'cursor-not-allowed border border-slate-700 text-slate-500'
          }`}
          onClick={(event) => {
            if (!installerConfigured) {
              event.preventDefault();
              notify(
                'warn',
                'Set INSTALLER_DOWNLOAD_URL to the hosted FikraNovaPrinterSetup.exe, then this button works.'
              );
            }
          }}
        >
          ↓ Download installer
        </a>
      </header>

      {message ? (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            message.kind === 'error'
              ? 'border-red-900/60 bg-red-950/50 text-red-300'
              : message.kind === 'warn'
                ? 'border-amber-900/60 bg-amber-950/50 text-amber-300'
                : 'border-emerald-900/60 bg-emerald-950/50 text-emerald-300'
          }`}
        >
          {message.text}
        </div>
      ) : null}

      {/* Pairing code (the star of the show) --------------------------- */}
      {pairing ? (
        <div className="mb-8">
          <PairingCode result={pairing} onDismiss={() => setPairing(null)} />
        </div>
      ) : null}

      {/* A newly minted API key — shown once, ever --------------------- */}
      {newKey ? (
        <div className="mb-8 rounded-xl border border-amber-800 bg-amber-950/30 p-5">
          <p className="text-sm font-medium text-amber-200">
            API key for {newKey.name} — copy it now, it is never shown again
          </p>
          <p className="my-3 select-all break-all rounded-lg bg-slate-950 px-3 py-2.5 font-mono text-sm text-amber-300">
            {newKey.apiKey}
          </p>
          <p className="text-xs text-amber-200/70">
            This goes in the restaurant&apos;s website, as{' '}
            <code className="text-amber-200">Authorization: Bearer …</code> on{' '}
            <code className="text-amber-200">POST /api/business/v1/print-jobs</code>. Only its hash is
            stored here, so we cannot show it to you again — if it is lost, mint a new one.
          </p>
          <button
            type="button"
            onClick={() => setNewKey(null)}
            className="mt-4 rounded-lg border border-amber-800 px-3.5 py-1.5 text-xs text-amber-200 hover:bg-amber-950"
          >
            I&apos;ve saved it
          </button>
        </div>
      ) : null}

      {/* New restaurant ------------------------------------------------ */}
      <section className="mb-8 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Add a restaurant
        </h2>

        <form onSubmit={createRestaurant} className="flex flex-wrap gap-2">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Restaurant name"
            // Password-manager / autofill extensions stamp attributes such as
            // `fdprocessedid` onto form controls before React hydrates, which
            // React reports as a hydration mismatch. The extra attribute is
            // harmless — see the same guard in admin/login/LoginForm.jsx.
            suppressHydrationWarning
            className="min-w-64 flex-1 rounded-lg border border-slate-700 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
        </form>
      </section>

      {/* Restaurants + their tills ------------------------------------- */}
      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Restaurants
        </h2>

        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : restaurants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-10 text-center">
            <p className="text-slate-400">No restaurants yet.</p>
            <p className="mt-1 text-sm text-slate-600">Add one above to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{restaurant.name}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {restaurant.devices.length} till
                      {restaurant.devices.length === 1 ? '' : 's'}
                      {restaurant.apiKeys[0] ? (
                        <>
                          {' · key '}
                          <code className="text-slate-400">{restaurant.apiKeys[0].prefix}…</code>
                        </>
                      ) : null}
                      {restaurant.jobs.completed ? ` · ${restaurant.jobs.completed} printed` : ''}
                      {restaurant.jobs.failed ? (
                        <span className="text-red-400"> · {restaurant.jobs.failed} failed</span>
                      ) : null}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => makePairingCode(restaurant)}
                    disabled={busy === `pair-${restaurant.id}`}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {busy === `pair-${restaurant.id}` ? 'Generating…' : '+ Pair a till'}
                  </button>
                </div>

                {restaurant.devices.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {restaurant.devices.map((device) => {
                      const [printerText, printerClass] =
                        PRINTER_LABEL[device.printerStatus] || PRINTER_LABEL.unknown;

                      return (
                        <div
                          key={device.id}
                          className="rounded-lg border border-slate-800 bg-slate-950/60 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="flex items-center gap-2 font-medium text-slate-200">
                                <span
                                  className={`inline-block h-2 w-2 rounded-full ${
                                    device.revoked
                                      ? 'bg-slate-600'
                                      : device.online
                                        ? 'bg-emerald-500'
                                        : 'bg-red-500'
                                  }`}
                                />
                                {device.hostname}
                                {device.isDefault ? (
                                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                                    default
                                  </span>
                                ) : null}
                                {device.paused ? (
                                  <span className="rounded bg-amber-950 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-amber-400">
                                    paused
                                  </span>
                                ) : null}
                                {device.revoked ? (
                                  <span className="rounded bg-red-950 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-red-400">
                                    revoked
                                  </span>
                                ) : null}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                v{device.agentVersion} · <span className={printerClass}>{printerText}</span>
                                {device.printerName ? ` (${device.printerName})` : ''}
                                {device.queueSize > 0 ? (
                                  <span className="text-amber-400"> · {device.queueSize} queued</span>
                                ) : null}
                                {' · seen '}
                                {timeAgo(device.lastHeartbeatAt)}
                                {' · printed '}
                                {timeAgo(device.lastPrintAt)}
                              </p>

                              {device.lastCrash ? (
                                <p className="mt-1 text-xs text-red-400">crash: {device.lastCrash}</p>
                              ) : null}

                              {device.pendingCommands.length > 0 ? (
                                <p className="mt-1 text-xs text-indigo-400">
                                  queued command: {device.pendingCommands.join(', ')} (delivered on next
                                  heartbeat)
                                </p>
                              ) : null}
                            </div>

                            {!device.revoked ? (
                              <div className="flex flex-wrap gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => deviceAction(device, 'test_print')}
                                  disabled={busy === `test_print-${device.id}`}
                                  className="rounded border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-600 hover:text-white disabled:opacity-50"
                                >
                                  Test print
                                </button>

                                <button
                                  type="button"
                                  onClick={() => deviceAction(device, device.paused ? 'resume' : 'pause')}
                                  className="rounded border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-600 hover:text-white"
                                >
                                  {device.paused ? 'Resume' : 'Pause'}
                                </button>

                                {!device.isDefault ? (
                                  <button
                                    type="button"
                                    onClick={() => deviceAction(device, 'set_default')}
                                    className="rounded border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-600 hover:text-white"
                                  >
                                    Make default
                                  </button>
                                ) : null}

                                <button
                                  type="button"
                                  onClick={() =>
                                    deviceAction(
                                      device,
                                      'revoke',
                                      `Revoke ${device.hostname}?\n\nIts token dies immediately and it will show the pairing screen. You will need a new pairing code to bring it back.`
                                    )
                                  }
                                  className="rounded border border-red-900 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-950"
                                >
                                  Revoke
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-4 rounded-lg border border-dashed border-slate-800 p-4 text-center text-sm text-slate-600">
                    No till paired yet. Click <span className="text-slate-400">Pair a till</span> when
                    you are at the machine — the code expires in 10 minutes.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent jobs --------------------------------------------------- */}
      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Recent print jobs
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Restaurant</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-600">
                    No print jobs yet.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="bg-slate-950/40">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {timeAgo(job.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{job.restaurant}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {job.orderNumber ? `#${job.orderNumber}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{job.type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          JOB_BADGE[job.status] || JOB_BADGE.cancelled
                        }`}
                      >
                        {job.status}
                      </span>
                      {job.errorCode ? (
                        <span className="ml-2 text-xs text-red-400">{job.errorCode}</span>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Staged rollout ------------------------------------------------ */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Agent updates
        </h2>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="mb-4 text-xs leading-relaxed text-slate-500">
            Agents ask before updating and obey this policy. Each till hashes its own id into a stable
            bucket 0–99 and updates only if the bucket is under the rollout percentage — so a release
            reaches a predictable, repeatable slice of the fleet.{' '}
            <span className="text-slate-400">
              Ship by walking it up: 0 → 5 → 25 → 50 → 100, watching the failed-job count at each step.
            </span>{' '}
            If something breaks, drop it back to 0 and the tills that have not updated will not.
          </p>

          {fleet.length > 0 ? (
            <p className="mb-4 text-xs text-slate-500">
              Fleet is running:{' '}
              {fleet.map((row) => (
                <span key={row.version} className="mr-2 rounded bg-slate-800 px-2 py-0.5 text-slate-300">
                  v{row.version} × {row.devices}
                </span>
              ))}
            </p>
          ) : null}

          <form onSubmit={savePolicy} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <label htmlFor="latestVersion" className="mb-1.5 block text-xs text-slate-400">
                Latest version
              </label>
              <input
                id="latestVersion"
                name="latestVersion"
                defaultValue={policy?.latestVersion || '1.0.0'}
                placeholder="1.1.0"
                suppressHydrationWarning
                className="w-full rounded-lg border border-slate-700 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="minimumVersion" className="mb-1.5 block text-xs text-slate-400">
                Minimum (rollback floor)
              </label>
              <input
                id="minimumVersion"
                name="minimumVersion"
                defaultValue={policy?.minimumVersion || '0.0.0'}
                placeholder="1.0.0"
                suppressHydrationWarning
                className="w-full rounded-lg border border-slate-700 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="rolloutPercentage" className="mb-1.5 block text-xs text-slate-400">
                Rollout %
              </label>
              <input
                id="rolloutPercentage"
                name="rolloutPercentage"
                type="number"
                min="0"
                max="100"
                defaultValue={policy?.rolloutPercentage ?? 0}
                suppressHydrationWarning
                className="w-full rounded-lg border border-slate-700 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 pb-2 text-xs text-slate-400">
                <input
                  name="mandatory"
                  type="checkbox"
                  defaultChecked={Boolean(policy?.mandatory)}
                  className="h-4 w-4 accent-indigo-600"
                />
                Mandatory
              </label>

              <button
                type="submit"
                suppressHydrationWarning
                className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Save
              </button>
            </div>
          </form>

          {!policy ? (
            <p className="mt-3 text-xs text-amber-400">
              No policy set — agents will not update (fails closed, which is the safe default).
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
