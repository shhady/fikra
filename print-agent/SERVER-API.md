# FikraNova Print — Server API Specification

This is the contract your backend must implement. It has two halves:

- **Part A — Agent API** (`/api/printer/v1/*`): spoken by the Windows agent running on the restaurant's till. Authenticated by **device token**.
- **Part B — Business API** (`/api/business/v1/*`): spoken by restaurant websites and your own admin. Authenticated by **restaurant API key**.

They are deliberately separate surfaces with separate credentials. A leaked restaurant API key must not let anyone impersonate a till, and a stolen device token must not let anyone create print jobs for other restaurants.

---

## The one security rule that governs everything

**The server derives the restaurant from the credential. Never from the request body.**

This is not a style preference — it is the property that makes the whole system multi-tenant-safe:

- The agent sends a **device token**. The server looks up which device that is, and therefore which restaurant. The agent **never** sends `restaurantId` as a trust input. If it did, a tampered agent on one till could print into a competitor's kitchen, or read another restaurant's orders, just by changing a number in a JSON body.
- The business API sends a **restaurant API key**. The server looks up which restaurant that key belongs to. If a caller passes `restaurantId` in the body, **ignore it**. A restaurant's website must not be able to create print jobs for a different restaurant, even by accident.

Any endpoint below that receives an id in the body treats it as *addressing within the caller's own tenant* (e.g. "which of **my** devices"), never as *proof of tenancy*.

---

## Conventions

| | |
|---|---|
| Transport | HTTPS only. Reject plain HTTP; do not redirect it. |
| Content type | `application/json` |
| Versioning | Version lives in the path (`/v1/`). A `/v2/` server must keep serving `/v1/` until the fleet has moved. |
| Unknown fields | The agent ignores response fields it does not recognise. **You may add fields freely.** You may not remove or repurpose existing ones. |
| Timestamps | ISO 8601 UTC (`2026-07-13T14:22:31.512Z`) |
| Errors | Non-2xx with `{ "error": "human readable" }`. The agent logs the message and retries 5xx, but not 4xx. |

### Error responses

```json
{ "error": "Pairing code has expired." }
```

The agent treats status codes as follows:

| Status | Agent behaviour |
|---|---|
| `2xx` | Success. |
| `401`, `403` | **Token is dead.** The agent unpairs itself, stops the socket, and shows the pairing screen. Use these *only* when you mean it. |
| `4xx` (other) | Permanent failure. Not retried. |
| `5xx` | Transient. Retried with exponential backoff. |

---

# Part A — Agent API

Base path: `/api/printer/v1`

All endpoints except `/devices/pair` require:

```http
Authorization: Bearer <deviceToken>
```

---

## A1. Pair a device

Exchanges a one-time pairing code for a permanent device token. **This is the only unauthenticated endpoint.**

```http
POST /api/printer/v1/devices/pair
```

**Request** (no auth header)

```json
{
  "pairingCode": "FKN-5F8D-2A9B-C7XK",
  "hostname": "TILL-01",
  "os": "Windows_NT 10.0.26200 (x64)",
  "agentVersion": "1.0.0"
}
```

**Response `200`**

```json
{
  "deviceToken": "dt_live_9f3a1c8e2b7d4a6f0e5c3b9a8d7f6e4c",
  "deviceId": "dev_01HQ8Z9K2M3N4P5Q6R7S8T",
  "restaurantId": "rst_01HQ8Z9K2M3N4P",
  "restaurantName": "Cafe Levant"
}
```

`restaurantId` and `restaurantName` are **display data only**. The agent stores them to show in the tray and settings window. It never sends `restaurantId` back as an authentication input.

**Server requirements**

1. **Codes are one-time.** Mark the code consumed in the same transaction that issues the token. Two tills racing on the same code must result in exactly one success.
2. **Codes expire.** ~10 minutes. Return `410 Gone` after that.
3. **Codes are restaurant-scoped.** A code generated for restaurant A can only ever produce a device belonging to A.
4. **Tokens are per-device and revocable.** Revoking one till must not affect the others.
5. Rate-limit by IP. This endpoint is unauthenticated, so it is the one attack surface a stranger can reach.

**Failure responses**

| Status | When |
|---|---|
| `400` | Malformed code |
| `404` | No such code |
| `409` | Code already used |
| `410` | Code expired |
| `429` | Too many attempts from this IP |

---

## A2. Job delivery — WebSocket (primary)

> ### ⚠ Not implemented in v1 — polling is the live channel
>
> The reference backend runs on **Vercel**, whose serverless functions cannot hold
> a persistent socket. So `wss://…/socket` **does not exist yet**, and job delivery
> today runs entirely through the 3-second poll in [A3](#a3-job-delivery--polling-fallback).
>
> **The agent needs no change when you add it.** It already tries the socket first
> and silently falls back to polling when it is unreachable — that is what it is
> doing right now. Stand up a WebSocket server (a small standalone Node service on
> Railway/Fly/Render) implementing the frames below, point `wsUrl` at it, and
> delivery becomes instant with no agent redeploy.
>
> Until then: receipts arrive **within 3 seconds**, and nothing is ever lost.
> The section below is the contract to build against when you are ready.

```
wss://api.fikranova.com/api/printer/v1/socket
```

The agent connects with:

```http
Authorization: Bearer <deviceToken>
```

**The server picks the subscription room from the token.** The agent never names a room, a restaurant, or a device — so it is structurally incapable of subscribing to another restaurant's jobs.

### Frames: server → agent

**A print job.** The agent accepts the job under `job`, `payload`, or as the message itself:

```json
{
  "type": "job",
  "job": {
    "id": "job_01HQ8Z9K2M3N4P5Q",
    "copies": 1,
    "type": "receipt",
    "width": 80,
    "targetDeviceId": "dev_01HQ8Z9K2M3N4P5Q6R7S8T",
    "content": {
      "restaurant": "Cafe Levant",
      "orderNumber": "1042",
      "customer": "Dana Cohen",
      "phone": "+972-50-123-4567",
      "items": [
        { "name": "Shakshuka", "qty": 1, "price": 52.0 },
        { "name": "Iced coffee", "qty": 2, "price": 14.0 }
      ],
      "notes": "No bread, allergy",
      "total": 80.0
    }
  }
}
```

**A remote command:**

```json
{ "type": "command", "command": { "type": "pause" } }
```

**Keepalive.** The agent replies to `{"type":"ping"}` with `{"type":"pong"}`. It also sends WebSocket protocol-level pings every 30s and force-reconnects if no pong arrives within 10s — this is how it detects a half-open connection where TCP still thinks it is alive.

### Close codes

| Code | Meaning | Agent behaviour |
|---|---|---|
| `1000` | Normal | Reconnects with backoff |
| `4401` | Token invalid | **Stops reconnecting**, unpairs, shows pairing screen |
| `4403` | Device revoked | Same as above |
| anything else | Transient | Reconnects with exponential backoff + full jitter (1s → 60s) |

> **Use 4401/4403 only when the token is genuinely dead.** Sending them for a transient problem will unpair a working till and require someone to physically walk over with a new pairing code.

### Reconnect storms

The agent uses **full jitter** — a uniform random delay in `[0, cap]` rather than a fixed backoff. When your server restarts, thousands of agents notice within the same second; without jitter they would reconnect in lockstep and immediately knock it over again.

---

## A3. Job delivery — polling (fallback)

Used **only while the WebSocket is down**, every 3 seconds.

```http
GET /api/printer/v1/jobs
Authorization: Bearer <deviceToken>
```

**Response `200`** — either shape is accepted:

```json
{
  "jobs": [
    { "id": "job_01HQ8Z9K2M3N4P5Q", "copies": 1, "type": "receipt", "width": 80, "content": { "...": "..." } }
  ]
}
```

**Server requirements**

- Return jobs that are **still outstanding** for *this device* (derived from the token).
- **Keep returning a job until the agent acknowledges it** via `/completed` or `/failed`. Do not delete a job just because it was fetched — if the agent crashes between fetching and printing, the job must survive.
- It is **safe and expected** to deliver the same job over both the socket and a poll. The agent deduplicates by `job.id` using a database primary key, so a job is never printed twice.

---

## A4. Job status callbacks

The agent reports every job outcome. These three endpoints are how the restaurant's admin knows what happened.

### Started

```http
POST /api/printer/v1/jobs/{id}/started
```

```json
{ "startedAt": "2026-07-13T14:22:31.512Z" }
```

Best-effort. A failure here is logged and ignored — it must not stop the job printing.

### Completed

```http
POST /api/printer/v1/jobs/{id}/completed
```

```json
{
  "completedAt": "2026-07-13T14:22:34.902Z",
  "copies": 1,
  "printerStatus": { "state": "ready", "name": "XP-80C", "checkedAt": 1783941754902 }
}
```

### Failed

```http
POST /api/printer/v1/jobs/{id}/failed
```

```json
{
  "failedAt": "2026-07-13T14:22:34.902Z",
  "errorCode": "PRINTER_OUT_OF_PAPER",
  "errorMessage": "The printer ran out of paper while printing this job.",
  "attempts": 3,
  "printerStatus": { "state": "out_of_paper", "name": "XP-80C", "checkedAt": 1783941754902 }
}
```

**These callbacks are retried and may arrive late.** If the internet drops between printing and acknowledging, the agent stores the outcome durably and flushes it on the next reconnect — possibly hours later. **Make these endpoints idempotent.** A second `/completed` for an already-completed job must be a no-op returning `200`, not an error.

### `errorCode` values

Stable strings. Safe to switch on; safe to display.

| Code | Meaning | Retryable |
|---|---|---|
| `PRINTER_OUT_OF_PAPER` | Paper roll empty | yes |
| `PRINTER_COVER_OPEN` | Cover open | yes |
| `PRINTER_OFFLINE` | Off, unplugged, or unreachable | yes |
| `PRINTER_NOT_FOUND` | Windows has no such printer (renamed/removed) | no |
| `PRINTER_NOT_CONFIGURED` | No printer selected in the agent | no |
| `PRINTER_ERROR` | Jam, overheated head, spooler rejected the data | yes |
| `PRINT_TIMEOUT` | Printer accepted nothing within 30s | yes |
| `PRINT_INTERRUPTED` | **Agent died mid-print — outcome unknown** (see below) | — |
| `RENDER_FAILED` | The agent could not lay the receipt out | no |
| `JOB_INVALID` | Malformed job | no |
| `JOB_UNSUPPORTED_TYPE` | Job type this agent version cannot render | no |
| `PRINTING_PAUSED` | Device is paused | yes |
| `DEVICE_UNAUTHORIZED` | Token rejected | no |
| `NETWORK_UNREACHABLE` / `SERVER_ERROR` / `REQUEST_TIMEOUT` | Transport | yes |

#### `PRINT_INTERRUPTED` deserves special handling

If the till loses power *after* bytes reach the printer but *before* the agent records success, nobody can know whether paper came out. The agent resolves this in favour of **not double-printing**: on restart it marks such jobs failed with `PRINT_INTERRUPTED` and never silently reprints them.

**Your backend should surface these to a human** ("this receipt may not have printed — resend?") rather than auto-redispatching. If you do redispatch, **issue a new job id** — reusing the old one will be deduplicated by the agent and silently dropped.

---

## A5. Reconcile (on reconnect)

Called when the socket comes back up, **before** the agent accepts new work.

```http
POST /api/printer/v1/jobs/reconcile
```

```json
{ "jobIds": ["job_01HQ8Z...", "job_01HQ9A..."] }
```

**Response `200`**

```json
{
  "pending": ["job_01HQ8Z..."],
  "cancelled": ["job_01HQ9A..."],
  "acknowledged": []
}
```

| Field | Meaning |
|---|---|
| `pending` | Still wanted. The agent keeps them queued. |
| `cancelled` | **The agent deletes these without printing.** Use for orders voided while the till was offline — printing a cancelled order is worse than not printing it. |
| `acknowledged` | You already have the outcome; the agent stops re-reporting. |

This is what prevents the classic outage bug: the restaurant loses internet for two hours, cancels three orders on their phone, and the moment the till reconnects it prints all three.

---

## A6. Heartbeat

Every 60 seconds.

```http
POST /api/printer/v1/heartbeat
```

```json
{
  "agentVersion": "1.0.0",
  "queueSize": 0,
  "printerStatus": { "state": "ready", "name": "XP-80C", "checkedAt": 1783941754902 },
  "lastPrintAt": "2026-07-13T14:22:34.902Z",
  "socketConnected": true,
  "paused": false,
  "sentAt": "2026-07-13T14:23:00.000Z",
  "lastCrash": {
    "kind": "uncaughtException",
    "at": "2026-07-13T09:14:02.113Z",
    "version": "1.0.0",
    "message": "…",
    "stack": "…"
  }
}
```

`lastCrash` appears **only once per crash** — the agent consumes it after sending. Store it; it is your fleet crash telemetry.

**Response `200`** — this is your channel to push commands back:

```json
{
  "commands": [
    { "type": "test_print" }
  ]
}
```

### Remote commands

| `type` | Effect on the agent |
|---|---|
| `pause` | Queues jobs but does not print. Survives restart. |
| `resume` | Resumes printing and immediately drains the queue. |
| `unpair` | Wipes the device token. The till shows the pairing screen. **Irreversible without a new pairing code.** |
| `test_print` | Prints the diagnostic slip. |
| `update` | Forces an immediate update check, bypassing the rollout gate. |

The agent **ignores unknown command types** rather than crashing, so you can add new ones without breaking installed agents.

> **There is no inbound port anywhere in this design.** Remote control works because the agent holds an outbound connection open and asks. That is what lets it install behind a restaurant's router with no firewall changes and no security exposure.

---

## A7. Update policy

Fetched every 6 hours, and **before any update is downloaded**.

```http
GET /api/printer/v1/update-policy
```

**Response `200`**

```json
{
  "latestVersion": "1.1.0",
  "minimumVersion": "1.0.0",
  "rolloutPercentage": 10,
  "mandatory": false
}
```

### How the agent uses this

The agent **never blind-updates**. It hashes its own `deviceId` together with the target version into a stable bucket `0–99`, and only updates if `bucket < rolloutPercentage`.

| Field | Effect |
|---|---|
| `latestVersion` | The version to move to. Agents at or above it do nothing. |
| `rolloutPercentage` | `0` = nobody. `10` = a stable, reproducible 10% of the fleet. `100` = everybody. |
| `minimumVersion` | **A hard floor.** Any agent below it updates immediately, *ignoring* `rolloutPercentage`. |
| `mandatory` | Bypasses the rollout gate entirely. |

Because the bucket is `hash(deviceId + version)`, it is:

- **Stable** — an agent cannot re-roll itself into the cohort by restarting.
- **Uniform** — SHA-256 spreads devices evenly.
- **Version-scoped** — a device unlucky at 1.1.0 is not systematically the guinea pig for 1.2.0 too.

### Shipping a release safely

```
1.  latestVersion 1.1.0, rollout 0    → published, nobody takes it
2.  rollout 5                         → ~150 of 3,000 tills update. Watch crash telemetry.
3.  rollout 25 → 50 → 100             → widen as confidence grows
```

### Rolling back

You **cannot** un-ship a version — agents that already updated have replaced their own binary, and `allowDowngrade` is off (a silent downgrade is unauditable).

**To roll back: publish the previous code as a *higher* version and force it.**

```json
{ "latestVersion": "1.1.1", "minimumVersion": "1.1.1", "rolloutPercentage": 100, "mandatory": true }
```

Where `1.1.1` contains the known-good `1.0.0` code. `minimumVersion` drags the broken cohort forward regardless of their rollout bucket.

**Per-device pinning** exists too, for freezing one problem site while the fleet moves on. It is set locally (`pinnedVersion` in the agent's config) and overrides everything except a forced check.

---

# Part B — Business API

Base path: `/api/business/v1`

This is what a restaurant's **website** calls when an order comes in. Authenticated with a **restaurant API key**:

```http
Authorization: Bearer <restaurant API key>
```

**The server derives the restaurant from the key.** If the body contains `restaurantId`, ignore it.

---

## B1. Create a print job

```http
POST /api/business/v1/print-jobs
Authorization: Bearer rk_live_8c2f9a1e7d3b6045
Content-Type: application/json
```

```json
{
  "type": "receipt",
  "copies": 1,
  "width": 80,
  "content": {
    "orderNumber": "1042",
    "customer": "דנה כהן",
    "phone": "+972-50-123-4567",
    "items": [
      { "name": "שקשוקה", "qty": 1, "price": 52.0 },
      { "name": "קפה קר", "qty": 2, "price": 14.0 }
    ],
    "notes": "בלי לחם",
    "total": 80.0
  }
}
```

**Response `201`**

```json
{
  "id": "job_01HQ8Z9K2M3N4P5Q",
  "status": "queued",
  "createdAt": "2026-07-13T14:22:30.001Z",
  "targetDeviceId": "dev_01HQ8Z9K2M3N4P5Q6R7S8T"
}
```

### Fields

| Field | Required | Notes |
|---|---|---|
| `type` | no | `receipt` (default), `kitchen`, `label` |
| `copies` | no | Default `1`. The agent clamps to `1..10`. |
| `width` | no | `80` (default) or `58`. Falls back to the device's configured width. |
| `content.items[]` | yes | `{ name, qty, price }` |
| `content.total` | no | **If omitted, the agent computes `Σ qty × price`.** Send it explicitly if you apply discounts, service charges or tax — otherwise the receipt total will disagree with what the customer paid. |
| `targetDeviceId` | no | Address a specific till. Omit to send to the restaurant's default/only device. |

`restaurant` is filled in by the server from the API key — the caller does not send it.

### Server requirements

1. **Resolve the restaurant from the key.** Never the body.
2. **Pick the target device.** If `targetDeviceId` is absent, choose the restaurant's default device. If the restaurant has multiple tills and no default, that is a configuration error — return `409` rather than guessing.
3. **Persist the job before returning `201`.** The website's HTTP request must not be what keeps the job alive.
4. **Push it over the WebSocket** to that device's room, if connected. If not, do nothing extra — the agent's 3-second poll will collect it when it comes back.
5. Rate-limit per key.

### Hebrew and Arabic

Send UTF-8. **Do not attempt any reshaping, reordering, or transliteration.** The agent detects RTL text, renders the receipt in Chromium (full bidi + glyph shaping), and prints it as a bitmap. Anything you "help" with will be wrong.

### Failure responses

| Status | When |
|---|---|
| `400` | Malformed body / no items |
| `401` | Bad or missing API key |
| `403` | Key is valid but disabled |
| `409` | No target device (restaurant has no paired till) |
| `429` | Rate limited |

---

## B2. Get job status

For the restaurant's admin UI — "did order 1042 print?"

```http
GET /api/business/v1/print-jobs/{id}
Authorization: Bearer rk_live_8c2f9a1e7d3b6045
```

**Response `200`**

```json
{
  "id": "job_01HQ8Z9K2M3N4P5Q",
  "status": "completed",
  "type": "receipt",
  "copies": 1,
  "createdAt": "2026-07-13T14:22:30.001Z",
  "startedAt": "2026-07-13T14:22:31.512Z",
  "completedAt": "2026-07-13T14:22:34.902Z",
  "attempts": 1,
  "device": {
    "id": "dev_01HQ8Z9K2M3N4P5Q6R7S8T",
    "name": "TILL-01",
    "online": true
  },
  "printerStatus": { "state": "ready", "name": "XP-80C" }
}
```

**Failed example:**

```json
{
  "id": "job_01HQ9A...",
  "status": "failed",
  "attempts": 5,
  "error": {
    "code": "PRINTER_OUT_OF_PAPER",
    "message": "The printer ran out of paper while printing this job."
  },
  "device": { "id": "dev_01HQ8Z...", "name": "TILL-01", "online": true }
}
```

**The server must scope this to the caller's restaurant.** A `GET` for a job belonging to a different restaurant returns `404` — **not** `403`. Returning `403` would confirm the job exists, letting anyone with a valid key enumerate other restaurants' job ids.

### `status` values

| Status | Meaning for the admin UI |
|---|---|
| `queued` | Accepted; not yet sent, or the till is offline |
| `printing` | The agent has claimed it |
| `completed` | On paper |
| `failed` | Gave up — see `error` |
| `cancelled` | Voided before printing |

> `queued` while `device.online` is `false` is the **normal** state during an internet outage, not an error. The job is safe and will print when the till reconnects. Say so in the UI rather than showing it as a failure.

---

## Summary of what your backend must store

| Entity | Key fields |
|---|---|
| **Restaurant** | id, name, API key(s) |
| **PairingCode** | code, restaurantId, expiresAt, consumedAt |
| **Device** | id, restaurantId, deviceToken (hashed), hostname, os, agentVersion, lastHeartbeatAt, printerStatus, queueSize, revokedAt, isDefault |
| **PrintJob** | id, restaurantId, targetDeviceId, type, copies, width, content, status, attempts, errorCode, errorMessage, createdAt/startedAt/completedAt |
| **UpdatePolicy** | latestVersion, minimumVersion, rolloutPercentage, mandatory |

**Store the device token hashed** (e.g. SHA-256), the same way you would a password. You never need to read it back — only to compare it against what an agent presents.
