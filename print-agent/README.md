# FikraNova Print Agent

A tray-only Windows agent that receives print jobs from the FikraNova cloud and prints them on a restaurant's existing thermal printer.

**One generic installer for every customer.** Identity comes from a pairing code entered at install time — never from a per-customer build. You ship one `FikraNovaPrinterSetup.exe` and it works everywhere.

- **Plain JavaScript** (Node + Electron). No TypeScript.
- **Zero native modules.** Builds on any machine, any CI runner, with no C++ toolchain.
- **Correct Hebrew and Arabic receipts.**
- Offline-durable job queue: never loses a job, never prints one twice.
- Staged, server-governed auto-update — you can never blind-update the fleet.

---

## Contents

- [Architecture](#architecture)
- [How a job becomes paper](#how-a-job-becomes-paper)
- [Three decisions worth knowing about](#three-decisions-worth-knowing-about)
- [Development](#development)
- [Building the installer](#building-the-installer)
- [Code signing](#code-signing)
- [Hosting auto-updates](#hosting-auto-updates)
- [Staged rollout and rollback](#staged-rollout-and-rollback)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Project layout](#project-layout)

---

## Architecture

```
                              ┌──────────────────────────────┐
   Restaurant website ───────▶│      FikraNova Cloud         │
   POST /api/business/v1/     │                              │
        print-jobs            │  derives restaurant from     │
   Bearer <restaurant key>    │  the API key, never the body │
                              └───────────┬──────────────────┘
                                          │
                        WSS (primary)     │   HTTPS poll (fallback, 3s)
                        outbound only     │   outbound only
                                          ▼
╔═════════════════════════ CASHIER PC (Windows) ═══════════════════════════╗
║                                                                          ║
║   ┌────────────┐   job    ┌──────────────┐  claim  ┌──────────────────┐  ║
║   │ JobSocket  │─────────▶│  JobQueue    │────────▶│  PrintService    │  ║
║   │ ws + retry │          │  SQLite      │         │                  │  ║
║   └────────────┘          │  PK = job.id │         │  RTL?            │  ║
║   ┌────────────┐          │  = dedupe    │         │   ├── yes ──┐    │  ║
║   │ ApiClient  │◀─────────│              │◀────────│   └── no ─┐ │    │  ║
║   │ status/HB  │  outcome └──────────────┘  result └───────────┼─┼────┘  ║
║   └────────────┘                                               │ │       ║
║         ▲                                                      │ │       ║
║         │ heartbeat 60s                          ESC/POS text ─┘ │       ║
║         │ + remote commands                                      │       ║
║         │ (pause/unpair/test)              Chromium ─▶ 1-bit ────┘       ║
║         │                                  raster (Hebrew/Arabic)        ║
║   ┌─────┴───────┐                                    │                   ║
║   │ UpdateService│                                   ▼                   ║
║   │ rollout gate │                    ┌──────────────────────────┐       ║
║   └──────────────┘                    │  Windows spooler (RAW)   │       ║
║                                       │  or TCP :9100            │       ║
║   ┌──────────┐  ┌──────────┐          └────────────┬─────────────┘       ║
║   │   Tray   │  │ Watchdog │                       │                     ║
║   └──────────┘  └──────────┘                       ▼                     ║
║                                            ┌───────────────┐             ║
╚════════════════════════════════════════════│ Thermal       │═════════════╝
                                             │ printer       │
                                             │ USB/LAN/shared│
                                             └───────────────┘
```

**Nothing listens.** Every connection is outbound. The agent installs behind a restaurant's router with no firewall rules, no port forwarding, and no inbound attack surface — including for remote control, which works by the agent *asking* on its heartbeat.

---

## How a job becomes paper

1. The website POSTs an order to the Business API. The server resolves the restaurant **from the API key** and picks a target device.
2. The job is pushed over the WebSocket. If the till is offline, it waits — the agent's 3-second poll collects it on reconnect.
3. The agent validates it and `INSERT OR IGNORE`s it into SQLite. **The primary key is the job id**, so a job delivered twice (socket *and* poll, or a redelivery after a lost ACK) is queued once.
4. The pump claims one job at a time with an atomic `UPDATE … WHERE state='queued'`.
5. `PrintService` picks a rendering path **from the job's own content**:
   - Contains Hebrew/Arabic → render in Chromium, rasterise to 1-bit, send as a `GS v 0` bitmap.
   - Latin only → native ESC/POS text commands (faster, crisper).
6. Bytes go to the printer: raw to the Windows spooler, or straight down TCP :9100.
7. The outcome is recorded **locally and durably first**, then reported to the server. If the internet is down at that moment, the outcome is flagged unreported and flushed on the next reconnect.

---

## Three decisions worth knowing about

These deviate from the obvious approach. Each is deliberate.

### 1. No `node-escpos`. We write the ESC/POS bytes ourselves.

`node-escpos`'s USB adapter is built on libusb. To use it on Windows you must **replace the printer's vendor driver with WinUSB** (via Zadig). On thousands of tills where the printer already works as an installed Windows printer, that is not a deployment step anyone will accept — and it breaks every other application that prints to it.

Instead we hand raw bytes to the Windows spooler with the datatype `RAW`, which tells it: *do not render this, do not let the driver touch it, push these bytes to the device.* That is exactly what an ESC/POS stream needs, it is what commercial POS software does, and it needs no driver surgery and no native npm module.

The spooler calls live in `winspool.drv`; we reach them through a small C# P/Invoke shim compiled at call time by PowerShell's `Add-Type`, using the .NET Framework compiler present on every Windows install.

> You will see `copy /b file \\localhost\printer` suggested for this. It only works if the printer happens to be *shared*, and silently does nothing if it is not.

### 2. Hebrew and Arabic are printed as pictures, not characters.

A thermal printer renders text by looking each byte up in a **codepage**. It has no bidirectional algorithm and no glyph-shaping engine.

- **Hebrew** comes out in the wrong visual order.
- **Arabic** is worse: its letters change shape depending on their neighbours (initial/medial/final/isolated). A codepage lookup physically cannot do that, so you get a row of disconnected letterforms a native speaker cannot read.

No amount of codepage fiddling fixes this, because the missing capability is not a character set — it is a *text engine*.

Chromium has one. So for RTL jobs we let Chromium lay the receipt out (full bidi, full shaping, real fonts), rasterise it to a 1-bit bitmap, and send the printer a grid of dots. The printer's only remaining job is burning dots, which it does perfectly.

Latin jobs still take the native text path, which is several times faster.

### 3. No `better-sqlite3`. WASM SQLite instead.

`better-sqlite3` is a V8-API native module, so it must be **recompiled for every Electron version, forever, on every machine that builds this project** — including your CI. `node-sqlite3-wasm` is real SQLite compiled to WebAssembly: same SQL, same durability, same primary-key dedupe, zero build step.

The result: `git clone && npm install && npm run dist` works on a machine with no C++ toolchain at all.

---

## Development

**Requirements: Node ≥ 20.19** (or ≥ 22). No Python, no Visual Studio, no `windows-build-tools` — the zero-native architecture means there is nothing to compile.

> ### Why 20.19 and not just "Node 20"
>
> This is worth knowing before you set up a CI runner, because the failure is confusing.
>
> Both `electron`'s postinstall and `electron-builder` now `require()` packages that are **ESM-only** (`@electron/get`, `@noble/hashes`). Calling `require()` on an ESM module only works from **Node 20.19+ / 22.12+**, where `require(esm)` landed. On Node 20.12 you get:
>
> ```
> Error [ERR_REQUIRE_ESM]: require() of ES Module … not supported.
> ```
>
> …which surfaces as *"Electron failed to install correctly"* or a crash deep inside `electron-builder`, neither of which points at the real cause. **Upgrade Node; do not downgrade the toolchain.**
>
> ```bash
> winget upgrade --id OpenJS.NodeJS.20     # -> 20.20.x
> ```

```bash
cd print-agent
npm install
npm run assets     # generates icons (icon.ico, tray PNGs, receipt logo)
npm run dev        # starts the agent with verbose logging
```

### If `npm run dist` fails extracting `winCodeSign`

```
ERROR: Cannot create symbolic link : A required privilege is not held by the client.
       …winCodeSign\…\darwin\10.12\lib\libcrypto.dylib
```

electron-builder's signing bundle contains **macOS symlinks**, and Windows refuses to create symlinks without elevation. The Windows build does not need that `darwin/` directory at all.

Fix it once, either way:

- **Enable Developer Mode** (Settings → System → For developers), which grants symlink privileges — this is the standard fix and also unblocks other Electron tooling; **or**
- run the build once from an **Administrator** terminal.

On first launch you will get the pairing screen. To develop against a local backend, point the agent at it before pairing — see [Configuration](#configuration).

```bash
npm run lint          # ESLint (plain JS, flat config)
npm run format        # Prettier
npm run pack          # unpacked build in dist/win-unpacked (fast, no installer)
npm run dist          # full NSIS installer -> dist/FikraNovaPrinterSetup.exe
```

### Testing without a real printer

Any ESC/POS emulator that listens on TCP :9100 works. Set the transport to **Network** in Settings and point it at `127.0.0.1`. To see the exact bytes the agent would send, the `EscPosEncoder` is a pure function — `require('./src/services/printer/escpos/encoder')` and inspect `.encode()`.

---

## Building the installer

```bash
npm run dist
```

Produces `dist/FikraNovaPrinterSetup.exe` — a single NSIS installer for **every** customer.

| Property | Value |
|---|---|
| Install scope | Per-user (no admin rights needed) |
| Shortcuts | Desktop + Start Menu |
| Publisher | FikraNova |
| Auto-start | Registers a `Run` key, launches minimised to the tray |
| Silent install | `FikraNovaPrinterSetup.exe /S` |

Silent install is what makes fleet deployment possible: push the same `.exe` via RMM/GPO to a hundred tills, and each one shows only the pairing screen on first launch.

The installer kills any running instance before overwriting files (locked binaries are the most common cause of a "successful" update that did nothing).

---

## Code signing

### Launching unsigned (the current build)

This build ships **unsigned**, on purpose. That is a legitimate way to start when *you* install each till yourself (over AnyDesk, or on site):

- Windows SmartScreen shows *"Windows protected your PC"* → **More info** → **Run anyway**. Installs normally.
- Chrome warns *"isn't commonly downloaded"* at download time → **Keep**.
- Nothing is harmed. SmartScreen is a **reputation** check, not a malware scan. It does not slow the machine, damage Windows, or disable antivirus.
- There is **no UAC "Unknown Publisher" prompt**, because we install per-user (`requestedExecutionLevel: asInvoker`). SmartScreen is the only gate.

> **Tip:** SmartScreen fires on the *Mark of the Web* — a tag Windows adds to files downloaded by a browser. An installer copied to the till via AnyDesk file transfer or a USB stick often carries no MOTW, and installs with **no warning at all**.

#### The part that is easy to get wrong

`electron-updater` verifies the Authenticode signature of every update it downloads against `publisherName`. If a `publisherName` is baked into `app-update.yml` and the downloaded installer is unsigned, the update is **discarded** with `ERR_UPDATER_INVALID_SIGNATURE` — silently. The agent would download each update, refuse it, log an error nobody reads, and stay on the old version forever. You would discover this the first time you tried to ship a fix to the fleet.

So `electron-builder.yml` sets:

```yaml
win:
  verifyUpdateCodeSignature: false   # <-- required while unsigned
```

which omits `publisherName` from `app-update.yml` and makes the updater skip the check. **Auto-update and staged rollout work correctly on the unsigned build.**

The cost: signature verification is what would catch a *compromised update host*. We still check the SHA-512 from `latest.yml` over HTTPS, but that hash comes from the same host — so it does not help if the host itself is owned. This is an accepted temporary risk, not a permanent design.

**When your certificate arrives:** delete `verifyUpdateCodeSignature: false`, uncomment the `signtoolOptions` block, rebuild. Verification comes back on.

### When to actually buy the certificate

Buy one when you stop installing tills yourself and start emailing the installer to restaurants who install it unaided. That is the point where SmartScreen stops being a five-second click for you and starts being the reason a customer never completes onboarding.

### The two options

| | **Standard OV certificate** | **EV certificate** |
|---|---|---|
| Cost | ~$100–300/yr | ~$300–600/yr |
| Key storage | File (`.pfx`) — usable in CI | **Hardware token or HSM** |
| SmartScreen | Warns until you build reputation | **Trusted immediately** |
| Reputation | Accumulates over weeks/months and installs | Instant |
| CI/CD | Straightforward | Needs a cloud HSM (Azure Key Vault, DigiCert KeyLocker) |

> **The catch with a standard certificate:** it does *not* make SmartScreen warnings go away on day one. You still get warned until enough people install your app for Microsoft to trust it — which, for a new product with a handful of restaurants, can take months. And **the reputation resets when you renew the certificate.**
>
> **For a product going to thousands of tills, buy the EV certificate.** It is the difference between an install that just works and a support call for every single customer.

Since June 2023 Microsoft requires OV/EV private keys to be stored on hardware (FIPS 140-2 Level 2+), so even a "standard" certificate now typically arrives on a token — check what your CA actually ships.

### Signing the build

Never put a certificate or password in the repo. electron-builder reads them from the environment:

```bash
# Standard certificate (.pfx)
set CSC_LINK=C:\path\to\certificate.pfx
set CSC_KEY_PASSWORD=<password>
npm run dist
```

For an EV token or cloud HSM, use a signing hook — the key never leaves the hardware, so electron-builder cannot do it directly:

```yaml
# electron-builder.yml
win:
  signtoolOptions:
    sign: ./scripts/sign.js
```

```js
// scripts/sign.js — invoked once per file that needs signing
exports.default = async function sign(configuration) {
  const { execFileSync } = require('node:child_process');

  execFileSync('signtool', [
    'sign',
    '/fd', 'SHA256',
    '/tr', 'http://timestamp.digicert.com',   // timestamping is essential — see below
    '/td', 'SHA256',
    '/sha1', process.env.CERT_THUMBPRINT,     // cert on the token
    configuration.path,
  ], { stdio: 'inherit' });
};
```

**Always timestamp (`/tr`).** Without a timestamp, every copy of your app stops validating the moment the certificate expires — including the installers already sitting on customers' machines. With one, signatures remain valid forever.

Verify before shipping:

```powershell
Get-AuthenticodeSignature .\dist\FikraNovaPrinterSetup.exe | Format-List
# Status must be: Valid
```

`publisherName: FikraNova` in `electron-builder.yml` **must match the CN of your certificate**, or Windows will report a mismatch.

---

## Hosting auto-updates

Configured for a **generic HTTPS host** — any static file server, S3, or Cloudflare R2:

```yaml
publish:
  - provider: generic
    url: https://updates.fikranova.com/print-agent/
```

Publish with:

```bash
npm run release
```

Which uploads three things to that URL:

```
FikraNovaPrinterSetup.exe          the installer
FikraNovaPrinterSetup.exe.blockmap differential updates (only changed chunks download)
latest.yml                         version + SHA-512 — this is what agents poll
```

**Requirements for the host**

- **HTTPS with a valid certificate.** The agent validates it and will refuse a bad one.
- Serve `latest.yml` with a **short cache TTL** (≤60s). A CDN caching it for an hour means your staged rollout — and, worse, your *rollback* — is delayed by that hour.
- The `.exe` can be cached aggressively; its filename changes with each version.

`electron-updater` verifies the downloaded installer against the SHA-512 in `latest.yml` before running it, so a corrupted or tampered download is rejected.

### Why not GitHub Releases?

You can (`provider: github`), but for a commercial product it means either **public binaries**, or a **private repo requiring a GitHub token embedded in the agent** — a credential sitting on thousands of customer machines. A generic host avoids both.

---

## Staged rollout and rollback

**The agent never blind-updates.** Before downloading anything it fetches `GET /api/printer/v1/update-policy` and obeys it.

```json
{ "latestVersion": "1.1.0", "minimumVersion": "1.0.0", "rolloutPercentage": 10, "mandatory": false }
```

Each agent hashes `deviceId + version` into a stable bucket `0–99` and updates only if `bucket < rolloutPercentage`. That bucket is:

- **Stable** — an agent cannot re-roll itself by restarting.
- **Uniform** — SHA-256 spreads devices evenly.
- **Version-scoped** — a device unlucky at 1.1.0 is not the guinea pig for 1.2.0 too.

**Shipping a release:**

```
rollout 0    publish; nobody takes it
rollout 5    ~150 of 3,000 tills. Watch crash telemetry in the heartbeats.
rollout 25 → 50 → 100
```

**Rolling back.** You cannot un-ship a version — those agents have already replaced their own binary. Instead, **republish the good code as a higher version and force it**:

```json
{ "latestVersion": "1.1.1", "minimumVersion": "1.1.1", "rolloutPercentage": 100, "mandatory": true }
```

`minimumVersion` is a floor that **ignores the rollout percentage**, so the broken cohort heals immediately.

The agent also **defers the restart while jobs are queued** — it will not take a till offline mid-service to update itself.

---

## Configuration

Stored in `%APPDATA%\FikraNova Print Agent\config.json`.

| Key | Default | Notes |
|---|---|---|
| `apiBaseUrl` | `https://api.fikranova.com` | Point at staging/local here |
| `wsUrl` | `wss://api.fikranova.com/api/printer/v1/socket` | **Must be `wss://`** — the agent refuses plain `ws://` |
| `printerName` | auto-detected | Windows queue name |
| `paperWidth` | auto-detected | `80` or `58` |
| `transport` | `auto` | `auto` \| `spooler` \| `network` |
| `networkHost` / `networkPort` | — / `9100` | For direct TCP printers |
| `openCashDrawer` | `false` | Kick the drawer after a receipt |
| `autoLaunch` | `true` | Start with Windows |
| `paused` | `false` | Set remotely by the server |
| `pinnedVersion` | `""` | Freeze this one device on a version |

### On "encrypted local storage"

The config file uses `electron-store`'s `encryptionKey`, which is **obfuscation, not security** — the key is compiled into the binary. It stops a curious cashier reading the file in Notepad. That is all it is for, and all we claim for it.

**The device token is different.** It is a live credential that can print to a restaurant, so it is protected with Electron's `safeStorage`, backed by **DPAPI** on Windows: the ciphertext is bound to the Windows user account, and copying `config.json` to another machine yields nothing. Tokens are also revocable server-side per device.

---

## Troubleshooting

**Run a Test Print first.** It is a deliberate diagnostic, not a decoration — it exercises alignment, bold, double-size, a full-width ruler, **Hebrew and Arabic sample lines**, a QR code, and the cutter. A photo of that slip is usually enough to diagnose a problem without remote access.

| Symptom | Likely cause |
|---|---|
| Ruler on the test slip **wraps** onto a second line | Paper width is set to 80mm but the printer is 58mm |
| Hebrew/Arabic prints as boxes or backwards | Should be impossible — the RTL path is a bitmap. Check the agent version; a very old build may predate it. |
| Nothing prints, no error | Printer is paused in Windows, or the queue name changed. Check **Settings → Printer**, hit Refresh. |
| `PRINTER_NOT_FOUND` | The printer was renamed or unplugged. Reselect it. |
| Tray icon is red | No cloud connection. **Jobs are still being queued** and will print on reconnect — this is not data loss. |
| Jobs queue but never print | Check whether the device is **paused** (tray menu shows it). |

**Logs:** `%APPDATA%\FikraNova Print Agent\logs\agent.log` (rotating, 5 MB). Tray → Settings → **Open Logs**. Device tokens are redacted before anything is written, so logs are safe to email to support.

**Crash reports:** `%APPDATA%\FikraNova Print Agent\crashes\`. The most recent one is attached to the next heartbeat automatically.

---

## Project layout

```
print-agent/
├── src/
│   ├── main/
│   │   ├── main.js            entry: single-instance lock, crash handlers
│   │   ├── app.js             the Agent: job pump, reconcile, heartbeat
│   │   ├── tray.js            tray icon + menu
│   │   ├── windows.js         pairing + settings windows (hardened)
│   │   ├── ipc.js             the renderer's entire capability surface
│   │   ├── updater.js         staged rollout gate
│   │   ├── watchdog.js        detects a wedged (not crashed) agent
│   │   └── crashReporter.js
│   ├── preload/preload.js     contextBridge — no generic invoke() passthrough
│   ├── renderer/              pairing + settings UI (no Node access)
│   ├── services/
│   │   ├── api/               pair, jobs, callbacks, heartbeat, update-policy
│   │   ├── websocket/         reconnect w/ backoff + jitter, half-open detection
│   │   ├── queue/             SQLite; PK = job id = the dedupe guarantee
│   │   ├── printer/
│   │   │   ├── escpos/encoder.js    ESC/POS command builder
│   │   │   ├── transports/          Windows spooler (RAW) + TCP :9100
│   │   │   ├── raster.js            Chromium → 1-bit bitmap (RTL)
│   │   │   ├── discovery.js         printer list + width auto-detect
│   │   │   └── templates/           receipt, kitchen, label, testPrint
│   │   ├── config/            encrypted store; token under DPAPI
│   │   └── logger/            rotating files, secrets redacted
│   ├── models/                Job, Device, PrinterStatus
│   └── utils/                 backoff, rollout hash, RTL detection, errors
├── scripts/generate-assets.js icons, generated not committed
├── build/installer.nsh        NSIS hooks
├── electron-builder.yml
├── SERVER-API.md              ← what your backend must implement
├── DEPLOYMENT-CHECKLIST.md
└── TESTING-CHECKLIST.md
```

### Adding a new document type

The template layer is the extension point. To add, say, a barcode label for a delivery bag:

1. Write `src/services/printer/templates/deliveryTag.js` exporting `{ toHtml, toEscPos, directionSample }`.
2. Register it in `templates/index.js`.
3. Add the type to `JOB_TYPES` in `src/models/Job.js`.

The queue, transports, RTL detection, retry logic, and status callbacks all keep working untouched — none of them know what a receipt is.
