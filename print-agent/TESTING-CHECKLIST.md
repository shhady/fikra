# Testing Checklist — FikraNova Print Agent

Run before every release. The tests marked **★** are the ones that catch the failures that actually happen in restaurants — do not skip them because they are inconvenient to stage.

The rule for all of them: **a receipt must never be lost, and must never print twice.**

---

## ⚠ THE ONE THING NOT YET VERIFIED — do this first, on real hardware

Everything below has been exercised **except paper**. Specifically, here is what is and is not proven as of the first build:

| | Status |
|---|---|
| Job delivery (poll), queue, dedupe, retries, status callbacks | ✅ verified end-to-end against a live backend |
| ESC/POS command stream (init, align, bold, QR, barcode, cut, drawer) | ✅ verified byte-for-byte |
| Hebrew/Arabic raster path | ✅ verified — bytes decoded back into an image and read |
| **Network transport** (Ethernet printer, TCP :9100) | ✅ verified against a socket that captured the bytes |
| **Windows spooler transport** (USB / shared printers) | ⚠️ **`WritePrinter` succeeds, but no physical printer has ever received the bytes** |
| A real thermal printer physically printing | ❌ **never tested** |
| 58mm paper | ❌ never tested on paper |
| Cash drawer kick | ❌ never tested on real hardware |
| Auto-update installing a real update | ❌ never tested (needs an update host) |

**Most restaurant printers are USB, and they take the spooler path.** That path builds the ESC/POS stream correctly and Windows accepts it (`WRITE_OK`), but the last few centimetres — spooler → driver → USB → print head — have never been exercised. `RAW` datatype is *documented* to pass bytes through untouched, and the write succeeds, so the risk is low. It is not zero.

### First hardware test (20 minutes, do it before any customer)

1. Plug in the thermal printer. Confirm Windows lists it (Settings → Printers).
2. Test the spooler path **without the full agent**:
   ```powershell
   cd print-agent
   $env:TEST_PRINTER = "XP-80C"      # whatever Windows calls it
   npx electron ./scripts/dev-print-test.js
   ```
   Expect `WRITE_OK` **and a slip out of the printer** with a title, a rule, an item line, a total, and a clean cut.
   - Nothing comes out → the printer is not ESC/POS, or the driver is not passing RAW through. Try the network transport instead if it has an Ethernet port.
   - Garbage characters → it is not an ESC/POS printer.
3. Then run the agent's built-in **Test Print** (tray → Test Print). This is the real check: it exercises alignment, bold, double-size, a width ruler, **Hebrew and Arabic sample lines**, a QR code, and the cutter.
4. Photograph the slip. If every line is right, the printer is good.
   - Ruler wraps to a second line → paper width is set to 80mm on a 58mm printer.
   - Hebrew/Arabic wrong → stop and report it; that path is a bitmap and should be impossible to get wrong.
5. Only then send a real order through the Business API.

---

## 0. Setup

- [ ] Build: `npm run lint && npm run dist` — both must pass clean
- [ ] Install `dist/FikraNovaPrinterSetup.exe` on a **real Windows machine** with a **real thermal printer** (a VM with a virtual printer will not surface driver, spooler, or cutter problems)
- [ ] Have a second till available for multi-device tests
- [ ] Have the backend's job dashboard open — half of these tests are about what the *server* believes

---

## 1. Pairing

- [ ] First launch shows **only** the pairing screen. No tray-only silent start, no settings window.
- [ ] A malformed code (`ABC`) is rejected instantly, client-side, with a readable message.
- [ ] Lowercase input (`fkn-5f8d-2a9b-c7xk`) is accepted — it is upper-cased and dashed automatically.
- [ ] Pasting a code with stray spaces works.
- [ ] A wrong-but-well-formed code shows the server's error, and the field stays editable.
- [ ] **An expired code (>10 min) is rejected by the server.**
- [ ] **A code that was already used once is rejected.** ★
- [ ] On success: the pairing window closes, the tray icon appears, the restaurant name shows in the tray tooltip.
- [ ] Restart the agent → it does **not** ask to pair again.
- [ ] `%APPDATA%\FikraNova Print Agent\config.json` contains **no plaintext token** (search it for the token string — it must not appear).

### Token binding (DPAPI)

- [ ] Copy `config.json` to a **different Windows user account** or machine, start the agent there → it must fail to decrypt the token and show the pairing screen, not print.

---

## 2. Printing basics

- [ ] Print a receipt. Layout, alignment, total are correct.
- [ ] **Test Print** from the tray menu produces the diagnostic slip.
- [ ] On the slip, the **ruler does not wrap** onto a second line.
- [ ] Paper cut fires.
- [ ] `copies: 3` produces **exactly three** slips.
- [ ] Cash drawer opens when `openCashDrawer` is enabled (and does *not* when disabled).
- [ ] Kitchen ticket: no prices, large quantities, notes boxed.
- [ ] Label: prints with a scannable barcode.
- [ ] QR code on a receipt scans with a phone.

---

## 3. Paper width

- [ ] **58mm test** ★ — set paper width to 58, print a receipt and a test slip on **actual 58mm paper**.
  - [ ] Nothing is cut off at the right edge.
  - [ ] The ruler fits on one line (32 characters).
  - [ ] Item names wrap rather than pushing prices off the page.
- [ ] Set width to 80 on a 58mm printer → content is visibly clipped (proves the setting is actually applied, not ignored).
- [ ] Auto-detection: a printer named e.g. `XP-58IIH` is detected as 58mm on first pair.

---

## 4. Hebrew / Arabic RTL ★

**This is the test most likely to be quietly broken and the hardest to notice from a code review.** Have a native reader check it if you can.

- [ ] Print a receipt with a Hebrew restaurant name, Hebrew customer name, and Hebrew item names.
  - [ ] Text reads **right to left** in the correct visual order.
  - [ ] Letters are not reversed or mirrored.
- [ ] Print a receipt with **Arabic** item names.
  - [ ] Letters are **joined** (connected cursive), not a row of isolated letterforms. ★ *This is the failure a codepage approach produces, and it is unmistakable once you look for it.*
- [ ] **Mixed content**: Hebrew item names with Latin/numeric prices on the same line.
  - [ ] Prices stay in the right column and are not reordered.
  - [ ] `Order #42` embedded in a Hebrew line renders correctly (this is the bidi algorithm doing real work).
- [ ] Numbers and totals are correct — not reversed (`52.00` must not print as `00.25`).
- [ ] The Test Print slip's built-in Hebrew and Arabic lines render correctly.
- [ ] A Latin-only receipt still takes the **fast native-text path** (check the log for "using the raster path" — it should be *absent*).

---

## 5. Internet loss ★

### Kill the internet mid-job

- [ ] Send a job. **As it starts printing, unplug the network cable / disable Wi-Fi.**
  - [ ] The receipt **still prints completely** (printing is local; it does not depend on the cloud).
  - [ ] The tray icon turns red.
  - [ ] The completion callback fails, and the log says it will retry on reconnect.
  - [ ] **Reconnect the network** → the outcome is flushed to the server. The dashboard shows `completed`, not `queued`.
  - [ ] **The receipt does not print a second time.** ★

### Jobs sent while offline

- [ ] Disconnect the network. Send 3 jobs from the website.
- [ ] Reconnect.
  - [ ] All 3 print, **once each**, in order.
  - [ ] The dashboard shows all 3 as completed.

### Long outage

- [ ] Disconnect for 30+ minutes with jobs queued.
  - [ ] Reconnect delay grows but is capped (~60s), and is **jittered** — not a fixed interval.
  - [ ] On reconnect everything drains.
  - [ ] Log shows a `reconcile` call **before** new jobs are accepted.

### Half-open connection ★

The nastiest network failure: the socket looks alive but packets go nowhere.

- [ ] With the agent connected, **block outbound traffic with a firewall rule** (do not disable the adapter — that would close the socket cleanly and defeat the test).
  - [ ] Within ~40s the agent detects the missing pong and forces a reconnect.
  - [ ] It does **not** sit there showing "Connected" while deaf. ★

---

## 6. Server loss ★

- [ ] With the agent connected, **stop the backend**.
  - [ ] The agent detects the drop and starts polling.
  - [ ] It retries with backoff, not in a tight loop (check CPU usage stays near zero).
- [ ] **Kill the server mid-job** (after the job is delivered, before the completion callback).
  - [ ] The receipt prints.
  - [ ] The outcome is stored locally as unreported.
  - [ ] On server restart, the outcome is flushed. No duplicate print. ★
- [ ] Restart the server with **many agents connected** → they do not all reconnect in the same second (jitter is working).

---

## 7. Duplicate delivery ★

The core "never print twice" guarantee.

- [ ] Send the **same job id twice** over the WebSocket.
  - [ ] It prints **once**.
  - [ ] The log says `Duplicate delivery of job … ignored`.
- [ ] Deliver a job over the socket **and** return it from the polling endpoint at the same time.
  - [ ] It prints once.
- [ ] Re-deliver a job that has **already printed and been acknowledged**.
  - [ ] It does **not** print again (the queue remembers printed ids for 7 days).
- [ ] Re-deliver a job **8 days** after it printed (or shorten `RETENTION_MS` to test).
  - [ ] It prints again — this is correct and expected; the dedupe window is bounded on purpose. Confirm the server would never legitimately redeliver that late.

---

## 8. Printer failures

### Out of paper ★

- [ ] Remove the paper roll. Send a job.
  - [ ] The job fails with `PRINTER_OUT_OF_PAPER`.
  - [ ] A tray balloon tells the user to load paper.
  - [ ] The job **stays in the queue** and is retried.
  - [ ] **Load paper** → the job prints automatically, without anyone touching the agent. ★
  - [ ] It prints **once**, not once per retry attempt.

### Printer off / unplugged

- [ ] Turn the printer off. Send a job.
  - [ ] Fails with `PRINTER_OFFLINE`, stays queued, retried.
  - [ ] Turn the printer on → it prints.
- [ ] Unplug the USB cable entirely → same behaviour.

### Cover open

- [ ] Open the printer cover. Send a job → `PRINTER_COVER_OPEN`, queued, retried. Close it → prints.

### Retry exhaustion

- [ ] Leave a printer offline through **5 retry attempts**.
  - [ ] The job is finally marked `failed` and reported to the server with the attempt count.
  - [ ] It does **not** retry forever.

### Printer renamed / removed

- [ ] Rename the printer in Windows. Send a job.
  - [ ] Fails with `PRINTER_NOT_FOUND` and is **not** retried (retrying cannot help).
  - [ ] Reselect the printer in Settings → the queue drains.

---

## 9. Crash and restart ★

- [ ] **Kill the agent process** (`taskkill /F`) while a job is queued.
  - [ ] On restart, the queue survives and the job prints.
- [ ] **Kill the process mid-print** (while the printer is physically printing). ★
  - [ ] On restart, the job is marked `PRINT_INTERRUPTED`, reported as failed, and **not silently reprinted**.
  - [ ] The dashboard surfaces it for a human to decide.
  - *(This is the deliberate resolution of "never lose a job" vs "never print twice" — the agent cannot know whether paper came out, and a silent duplicate charge is worse than a prompt.)*
- [ ] **Pull the power cord** with jobs queued.
  - [ ] The SQLite queue is intact on reboot (no corruption).
  - [ ] Queued jobs print.
- [ ] A crash writes a report to `%APPDATA%\…\crashes\`.
- [ ] That report is attached to the **next heartbeat**, and only once.

### Watchdog

- [ ] Simulate a wedged agent (queue non-empty, pump stalled >10 min).
  - [ ] The watchdog restarts it.
  - [ ] It refuses to restart more than 3 times per hour (no crash-loop).

---

## 10. Single instance

- [ ] Double-click the Desktop shortcut while the agent is running.
  - [ ] **No second process starts** (check Task Manager).
  - [ ] The existing agent's window is focused instead.
- [ ] Both the Start Menu shortcut and the auto-launch entry behave the same.

---

## 11. Tray and UI

- [ ] Tray icon is **green when connected, red when not**, and changes within seconds of a state change.
- [ ] Tooltip shows restaurant, connection, queue depth, printer.
- [ ] Menu: Show, Settings, Test Print, Reconnect, Restart Agent, Exit — all work.
- [ ] **Closing the Settings window does not quit the agent.** ★ (It must keep printing.)
- [ ] Exit from the tray genuinely quits.
- [ ] The agent **runs with no window open for an extended period** and still prints.
- [ ] Reboot Windows → the agent auto-starts, minimised to the tray, and prints without anyone opening it. ★

---

## 12. Remote control

- [ ] **Pause** from the server.
  - [ ] Jobs queue but do not print.
  - [ ] Tray shows "Printing paused".
  - [ ] The pause **survives an agent restart**.
- [ ] **Resume** → the queue drains immediately.
- [ ] **Test print** command from the server → the slip prints.
- [ ] **Unpair / revoke** ★
  - [ ] Revoke the device token server-side.
  - [ ] The agent detects it (401/403 or socket close 4401), **stops reconnecting**, wipes the token, and shows the pairing screen.
  - [ ] It does **not** sit in a retry loop hammering the server with a dead credential.
  - [ ] The old token no longer works if replayed.

---

## 13. Staged rollout ★

Test with a **fake update policy** before you ever need it for real.

- [ ] Policy `rolloutPercentage: 0` → **no agent updates**, even though a newer version exists.
- [ ] Policy `rolloutPercentage: 100` → all agents update.
- [ ] Policy `rolloutPercentage: 50` across ~10 devices → roughly half update.
- [ ] **Determinism** ★ — an agent that is *out* of the rollout stays out across restarts. Restart it 5 times; it must not eventually sneak in.
  - *(Verify directly: `rolloutBucket(deviceId, version)` in `src/utils/rollout.js` must return the same number every call.)*
- [ ] **`minimumVersion` overrides the percentage** — an agent below the minimum updates even at `rolloutPercentage: 0`.
- [ ] **`mandatory: true`** → updates regardless of bucket.
- [ ] **`pinnedVersion`** on one device → that device does not update, even at 100%.
- [ ] **Update deferral**: with jobs queued, a downloaded update does **not** restart the agent. It applies once the queue is empty. ★
- [ ] **Rollback drill**: publish `1.1.1` (containing the good 1.0.0 code) with `minimumVersion: 1.1.1, mandatory: true` → the "broken" cohort updates immediately.
- [ ] The agent tolerates an update-policy response containing **unknown extra fields** (add `"foo": "bar"` — it must not crash).

---

## 14. Forward compatibility

The fleet cannot be upgraded on demand, so old agents must survive new servers.

- [ ] Add an unknown field to a **job** payload → the job still prints.
- [ ] Send an unknown **job type** → reported as `JOB_UNSUPPORTED_TYPE`, not a crash.
- [ ] Send an unknown **WebSocket frame type** → ignored, connection stays up. ★
- [ ] Send an unknown **remote command** → ignored, agent keeps running. ★
- [ ] Add unknown fields to the heartbeat response → no crash.

---

## 15. Security

- [ ] The agent **refuses a `ws://` URL** (must be `wss://`).
- [ ] With an invalid TLS certificate on the server, the agent **refuses to connect** (certificate validation is on).
- [ ] **No inbound port is opened.** Verify: `netstat -ano | findstr <agent PID>` shows no `LISTENING` sockets. ★
- [ ] The device token **never appears in the logs** (grep `agent.log` for it).
- [ ] The token is not in `config.json` in plaintext.
- [ ] `restaurantId` is **never sent as an auth input** — check the request bodies in a proxy; the server must derive it from the token.
- [ ] The renderer cannot reach Node (`window.require` is `undefined` in DevTools).
- [ ] A customer name containing HTML (`<img src=x onerror=alert(1)>`) prints as **literal text**, and does not execute. ★

---

## 16. Build and install

- [ ] `npm run lint` passes with zero errors.
- [ ] `npm run dist` produces `FikraNovaPrinterSetup.exe`.
- [ ] **The build works on a machine with no C++ toolchain** (no Visual Studio, no Python). ★
- [ ] Silent install works: `FikraNovaPrinterSetup.exe /S`.
- [ ] Desktop and Start Menu shortcuts are created.
- [ ] Installing **over a running agent** works (the installer kills it first).
- [ ] Uninstall removes the auto-start registry entry (no orphaned `Run` key pointing at a deleted exe).
- [ ] Uninstall **preserves** `%APPDATA%` config, so a reinstall does not require re-pairing.

### Signing state

If shipping **unsigned**:

- [ ] `dist/win-unpacked/resources/app-update.yml` contains **no `publisherName`**. ★
      If it does, every auto-update will be silently rejected as unsigned and the fleet will never update.
- [ ] Confirm an update actually installs end-to-end on an unsigned build (publish a 1.0.1, set rollout 100, watch the agent take it).
- [ ] SmartScreen shows *"Windows protected your PC"* → **More info** → **Run anyway** installs cleanly.

If shipping **signed**:

- [ ] The installer shows **Publisher: FikraNova**, not "Unknown publisher".
- [ ] `verifyUpdateCodeSignature` is back ON and `publisherName` is present in `app-update.yml`.
- [ ] The signature is **timestamped** (`/tr`) — otherwise every installed copy stops validating when the certificate expires.

---

## Sign-off

| | |
|---|---|
| Version tested | |
| Windows version | |
| Printer model(s) | |
| Paper widths tested | 58mm ☐ 80mm ☐ |
| Hebrew verified by a native reader | ☐ |
| Arabic verified by a native reader | ☐ |
| All ★ tests passed | ☐ |
| Tester | |
| Date | |
