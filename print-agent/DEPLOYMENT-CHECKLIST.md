# Deployment Checklist — FikraNova Print Agent

From "code is written" to "3,000 restaurants are printing". Work top to bottom; the ordering is deliberate.

---

## Phase 0 — Before you can ship anything

These are the long-lead items. Start them **weeks** before your first customer, because two of them cannot be rushed.

- [ ] **Decide on code signing.**

  **You can launch unsigned** if you install each till yourself (AnyDesk / on site). SmartScreen shows *"Windows protected your PC"* → **More info** → **Run anyway**, and it installs normally. Nothing is harmed; it is a reputation check, not a malware scan. Many products start this way.

  - [ ] If launching unsigned: confirm `verifyUpdateCodeSignature: false` is set in `electron-builder.yml`. ★
        **Without it, auto-update is silently broken** — every downloaded update is rejected as unsigned and the fleet never updates. Verify by checking that `dist/win-unpacked/resources/app-update.yml` contains **no** `publisherName`.

  - [ ] If buying a certificate: start now — CA identity validation takes **days to weeks** and an EV token ships as physical hardware. This is the most common cause of a delayed Windows launch.
        *Standard OV is cheaper but does not silence SmartScreen on day one; reputation accrues over months and resets on renewal. Buy EV once you are shipping to tills you will not personally touch.*

  - [ ] On the day the certificate arrives: remove `verifyUpdateCodeSignature: false`, uncomment `signtoolOptions`, rebuild, re-verify. ★

- [ ] **Register the update host.** `updates.fikranova.com`, HTTPS with a valid certificate.
- [ ] **Register the API host.** `api.fikranova.com`, HTTPS with a valid certificate.
- [ ] Decide who owns the DNS, the certificates, and their renewal. Put the expiry dates in a calendar that somebody actually reads.

---

## Phase 1 — Backend

The agent is useless without a server. Implement [SERVER-API.md](./SERVER-API.md) in full.

### Agent API (`/api/printer/v1`)

- [ ] `POST /devices/pair` — one-time codes, ~10 min expiry, restaurant-scoped
- [ ] `WSS /socket` — **room chosen from the token**, never from anything the agent sends
- [ ] `GET /jobs` — polling fallback; jobs persist until acknowledged
- [ ] `POST /jobs/{id}/started` · `/completed` · `/failed`
- [ ] `POST /jobs/reconcile`
- [ ] `POST /heartbeat` — returns remote commands
- [ ] `GET /update-policy`

### Business API (`/api/business/v1`)

- [ ] `POST /print-jobs` — restaurant resolved **from the API key**
- [ ] `GET /print-jobs/{id}` — scoped to the caller; cross-tenant returns `404`, not `403`

### The security rules, verified

- [ ] **The server derives the restaurant from the credential, never from the request body.** ★
      Write a test that sends a *valid* device token together with a *different* `restaurantId` in the body, and assert the server ignores the body. This is the check that keeps one restaurant from printing into another's kitchen.
- [ ] Device tokens are stored **hashed** (like passwords).
- [ ] Tokens are **revocable per device**, and revocation takes effect on the next request *and* closes the open socket (`4401`).
- [ ] Pairing codes are single-use — **enforced transactionally**, so two tills racing on one code yields exactly one device.
- [ ] `/devices/pair` is rate-limited by IP (it is the only unauthenticated endpoint).
- [ ] `POST /print-jobs` is rate-limited per API key.
- [ ] Job status callbacks are **idempotent** — a second `/completed` returns `200`, not an error. They arrive late and more than once by design.

---

## Phase 2 — Build and sign

- [ ] `npm ci` on a clean checkout (proves no stray local state)
- [ ] `npm run lint` — zero errors
- [ ] `npm run assets`
- [ ] `npm run dist`
- [ ] **Verify the build works on a machine with no C++ toolchain.** ★ (It should — that is the point of the zero-native architecture. Verify it anyway; a stray dependency can reintroduce a native build.)
- [ ] Sign the installer:
      ```powershell
      Get-AuthenticodeSignature .\dist\FikraNovaPrinterSetup.exe | Format-List
      # Status must be: Valid
      ```
- [ ] `publisherName` in `electron-builder.yml` **matches the CN on the certificate** (otherwise Windows reports a mismatch).
- [ ] The signature is **timestamped** (`/tr`). Without it, every installed copy stops validating the day the certificate expires.
- [ ] Install the signed `.exe` on a clean Windows VM → UAC shows **Publisher: FikraNova**, not "Unknown publisher".

---

## Phase 3 — Update host

- [ ] Upload to `https://updates.fikranova.com/print-agent/`:
  - `FikraNovaPrinterSetup.exe`
  - `FikraNovaPrinterSetup.exe.blockmap`
  - `latest.yml`
- [ ] `latest.yml` is served with a **short cache TTL (≤60s)**. ★
      *A CDN caching it for an hour delays your staged rollout by an hour — and, far worse, delays your **rollback** by an hour, during which tills keep taking the bad build.*
- [ ] The `.exe` may be cached aggressively (its name changes per version).
- [ ] Fetch `latest.yml` from **outside your network** and confirm it is reachable and correct.
- [ ] Confirm HTTPS certificate is valid — the agent validates it and will refuse a bad one.

---

## Phase 4 — Pilot (one restaurant)

Do not skip this. One real restaurant will surface things no test rig does.

- [ ] Generate a pairing code in the dashboard.
- [ ] Install on the real till. Pair. **Time it** — if it takes more than 2 minutes, the onboarding needs work before you scale.
- [ ] Run the **Test Print**. Photograph the slip. Confirm the ruler does not wrap and the Hebrew/Arabic lines are correct.
- [ ] Take **real orders through a full service**.
- [ ] Confirm on the dashboard: every order printed, statuses are `completed`.
- [ ] Deliberately run the paper out during a quiet moment → confirm the queue holds and drains when reloaded.
- [ ] Leave it running **overnight** → confirm it is still connected in the morning (this catches socket/keepalive bugs that only appear after hours of idling).
- [ ] Reboot the till → confirm the agent auto-starts and prints without anyone touching it.

---

## Phase 5 — Set the update policy *before* the fleet exists

Do this **now**, while you have one device, not later when you have three thousand.

- [ ] Publish the policy endpoint with:
      ```json
      { "latestVersion": "1.0.0", "minimumVersion": "1.0.0", "rolloutPercentage": 0, "mandatory": false }
      ```
- [ ] Confirm the agent fetches it and decides "up-to-date".
- [ ] **Rehearse a rollout** with a fake 1.0.1: set `rolloutPercentage: 100` on your pilot device, confirm it updates, then set it back.
- [ ] **Rehearse a rollback.** ★ Publish `1.0.2` containing the *older* code, with `minimumVersion: 1.0.2, mandatory: true`. Confirm the device takes it.
      *The first time you do a rollback must not be the first time you have ever tried one.*

---

## Phase 6 — Fleet rollout

- [ ] Deploy the installer to customers (RMM, GPO, or a download link).
      Silent install: `FikraNovaPrinterSetup.exe /S`
- [ ] Each restaurant gets a **unique pairing code**. Codes are one-time and expire in ~10 minutes — generate them at install time, not in advance.
- [ ] Monitor heartbeats. You should see, per device: version, queue size, printer status, last print time.
- [ ] **Alert on**:
  - [ ] a device silent for >5 minutes (heartbeat is 60s — five missed beats is a real problem)
  - [ ] `queueSize` growing and not draining
  - [ ] repeated `PRINTER_OUT_OF_PAPER` / `PRINTER_OFFLINE` at one site
  - [ ] any `PRINT_INTERRUPTED` (a till lost power mid-print — a human needs to decide whether to resend)
  - [ ] crash reports arriving in heartbeats
  - [ ] a spike in `failed` jobs right after a rollout widens ← **this is your rollout kill signal**

---

## Phase 7 — Shipping updates (every time, forever)

- [ ] Bump `version` in `package.json`.
- [ ] Build, sign, upload.
- [ ] Publish the policy with **`rolloutPercentage: 0`**. Nothing happens yet. This is intentional.
- [ ] Raise to **5%**. Wait. Watch crash telemetry and the failed-job rate.
- [ ] **25% → 50% → 100%**, pausing at each step.
- [ ] If anything looks wrong: **drop the percentage back to 0 immediately.** Devices that have not updated will not.
- [ ] For devices that *did* take a bad build, roll back by publishing the good code as a **higher** version with `minimumVersion` set to it and `mandatory: true`. (You cannot un-ship a version — those agents have already replaced their own binary.)

> **Never publish a new version with `rolloutPercentage: 100`.** The whole point of the rollout gate is that a bad build cannot reach the whole fleet before a human sees it. Setting 100 on day one throws that away and is exactly the mistake the mechanism exists to prevent.

---

## Phase 8 — Support runbook

Make sure whoever answers the phone has this.

| Restaurant says | First thing to do |
|---|---|
| "Nothing is printing" | Check the heartbeat: is the device online? Is `queueSize` growing? Is it **paused**? |
| "It printed twice" | Should be impossible. Get the job ids. Check whether the *server* dispatched two jobs with different ids — the agent dedupes by id, so two ids means two jobs. |
| "It's printing gibberish" | Wrong paper width, or a non-ESC/POS printer. Ask for a photo of the **Test Print** slip. |
| "Hebrew is backwards" | Ask for the agent version. The RTL raster path makes this impossible on current builds. |
| "It stopped after we changed our internet" | The agent should reconnect on its own. Tray → **Reconnect**. Check the tray icon colour. |
| Anything unexplained | Tray → Settings → **Open Logs**. Tokens are redacted, so logs are safe to email. |

- [ ] Support can **remotely**: pause a device, trigger a test print, unpair a device, force an update check.
- [ ] Support knows that **a red tray icon during an outage is not data loss** — jobs are queued and will print on reconnect. Communicating this calmly prevents a lot of unnecessary escalation.

---

## Sign-off

| | |
|---|---|
| Version | |
| Installer signed & timestamped | ☐ |
| Backend implements SERVER-API.md in full | ☐ |
| "Restaurant derived from credential, never body" test passes | ☐ |
| `latest.yml` cache TTL ≤ 60s | ☐ |
| Rollback rehearsed successfully | ☐ |
| Pilot restaurant ran a full service | ☐ |
| Monitoring + alerts live | ☐ |
| Update policy starts at `rolloutPercentage: 0` | ☐ |
| Released by | |
| Date | |
