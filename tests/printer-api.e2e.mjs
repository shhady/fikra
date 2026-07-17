/**
 * End-to-end test of the FikraNova print backend against a running server.
 *
 * Drives the real HTTP API exactly as the agent and a restaurant website would,
 * then attacks it the way a hostile (or merely buggy) integration would.
 */
import mongoose from 'mongoose';
import { createHash, randomBytes } from 'node:crypto';
import nextEnv from '@next/env';

const { loadEnvConfig } = nextEnv;
loadEnvConfig('c:/Users/shhad/OneDrive/Desktop/websites/fikra', false);

const BASE = process.env.TEST_BASE || 'http://localhost:3100';

let pass = 0;
let fail = 0;

function check(ok, label, detail = '') {
  if (ok) {
    pass += 1;
    console.log(`  PASS  ${label}`);
  } else {
    fail += 1;
    console.log(`  FAIL  ${label}${detail ? `  <-- ${detail}` : ''}`);
  }
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

async function api(path, { method = 'GET', token, body } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let json = {};
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { _raw: text.slice(0, 120) };
    }
  }

  return { status: res.status, body: json };
}

// ---- direct DB helpers, standing in for the admin CLI ----
const loose = { strict: false, versionKey: false };
const Restaurant = mongoose.model('R', new mongoose.Schema({}, loose), 'restaurants');
const PairingCode = mongoose.model('P', new mongoose.Schema({}, loose), 'pairingcodes');
const Device = mongoose.model('D', new mongoose.Schema({}, loose), 'devices');

const sha = (v) => createHash('sha256').update(String(v), 'utf8').digest('hex');

async function makeRestaurant(name) {
  const key = `rk_live_${randomBytes(24).toString('hex')}`;
  const r = await Restaurant.create({
    name,
    apiKeys: [{ hash: sha(key), prefix: key.slice(0, 16), label: 'test', createdAt: new Date(), revokedAt: null }],
    createdAt: new Date(),
    disabledAt: null,
  });
  return { id: String(r._id), key, name };
}

async function makeCode(restaurantId, { expired = false } = {}) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const chars = Array.from(randomBytes(12), (b) => alphabet[b % alphabet.length]);
  const code = `FKN-${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}-${chars.slice(8, 12).join('')}`;

  await PairingCode.create({
    code,
    restaurantId: new mongoose.Types.ObjectId(restaurantId),
    createdAt: new Date(),
    expiresAt: expired ? new Date(Date.now() - 60_000) : new Date(Date.now() + 600_000),
    consumedAt: null,
    deviceId: null,
  });

  return code;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fikra' });

  // Two tenants. Everything interesting is about keeping them apart.
  const A = await makeRestaurant('E2E Cafe Levant');
  const B = await makeRestaurant('E2E Rival Diner');

  console.log(`\nRestaurant A: ${A.id}`);
  console.log(`Restaurant B: ${B.id}`);

  // ------------------------------------------------------------------
  section('1. Pairing');

  const codeA = await makeCode(A.id);

  let r = await api('/api/printer/v1/devices/pair', {
    method: 'POST',
    body: { pairingCode: codeA, hostname: 'TILL-01', os: 'Windows 11', agentVersion: '1.0.0' },
  });

  check(r.status === 200, 'valid code pairs', `got ${r.status}`);
  check(!!r.body.deviceToken, 'returns a device token');
  check(r.body.restaurantName === A.name, 'returns the right restaurant name');

  const tokenA = r.body.deviceToken;
  const deviceA = r.body.deviceId;

  // Single use.
  r = await api('/api/printer/v1/devices/pair', {
    method: 'POST',
    body: { pairingCode: codeA, hostname: 'TILL-02', os: 'Windows 11', agentVersion: '1.0.0' },
  });
  check(r.status === 409, 'the SAME code cannot be used twice', `got ${r.status}`);

  // Expiry.
  const stale = await makeCode(A.id, { expired: true });
  r = await api('/api/printer/v1/devices/pair', { method: 'POST', body: { pairingCode: stale } });
  check(r.status === 410, 'an expired code is rejected', `got ${r.status}`);

  // Unknown.
  r = await api('/api/printer/v1/devices/pair', {
    method: 'POST',
    body: { pairingCode: 'FKN-ZZZZ-ZZZZ-ZZZZ' },
  });
  check(r.status === 404, 'an unknown code is rejected', `got ${r.status}`);

  // Pair a till for restaurant B, for the isolation tests.
  const codeB = await makeCode(B.id);
  r = await api('/api/printer/v1/devices/pair', {
    method: 'POST',
    body: { pairingCode: codeB, hostname: 'RIVAL-TILL', os: 'Windows 11', agentVersion: '1.0.0' },
  });
  const tokenB = r.body.deviceToken;
  const deviceB = r.body.deviceId;

  check(!!tokenB && tokenB !== tokenA, 'each device gets a distinct token');

  // The plaintext token must never be stored.
  const stored = await Device.findById(deviceA).lean();
  check(!JSON.stringify(stored).includes(tokenA), 'the device token is NOT stored in plaintext');
  check(stored.tokenHash === sha(tokenA), 'only its SHA-256 hash is stored');

  // ------------------------------------------------------------------
  section('2. Auth');

  r = await api('/api/printer/v1/jobs');
  check(r.status === 401, 'no token -> 401', `got ${r.status}`);

  r = await api('/api/printer/v1/jobs', { token: 'dt_live_totally_made_up' });
  check(r.status === 401, 'a bogus token -> 401', `got ${r.status}`);

  r = await api('/api/business/v1/print-jobs', { method: 'POST', body: { content: {} } });
  check(r.status === 401, 'business API with no key -> 401', `got ${r.status}`);

  // ------------------------------------------------------------------
  section('3. Business API creates a job');

  r = await api('/api/business/v1/print-jobs', {
    method: 'POST',
    token: A.key,
    body: {
      type: 'receipt',
      content: {
        orderNumber: '1042',
        customer: 'Dana Cohen',
        items: [
          { name: 'Shakshuka', qty: 1, price: 52 },
          { name: 'Iced coffee', qty: 2, price: 14 },
        ],
      },
    },
  });

  check(r.status === 201, 'job created', `got ${r.status} ${JSON.stringify(r.body)}`);
  const jobA = r.body.id;
  check(r.body.targetDeviceId === deviceA, 'routed to the restaurant\'s only till');

  // ------------------------------------------------------------------
  section('4. THE ONE RULE — restaurant comes from the credential, never the body');

  // Restaurant A's key, but B's id in the body. The body must be ignored.
  r = await api('/api/business/v1/print-jobs', {
    method: 'POST',
    token: A.key,
    body: {
      restaurantId: B.id, // <-- the attack
      content: { orderNumber: 'SPOOF', items: [{ name: 'Spoofed', qty: 1, price: 1 }] },
    },
  });

  check(r.status === 201, 'request still succeeds (body field simply ignored)');
  check(
    r.body.targetDeviceId === deviceA,
    "restaurantId in the BODY is IGNORED -> job went to A's till, not B's",
    `went to ${r.body.targetDeviceId}, B's till is ${deviceB}`
  );

  const spoofJob = r.body.id;

  // A's key, but explicitly targeting B's device id.
  r = await api('/api/business/v1/print-jobs', {
    method: 'POST',
    token: A.key,
    body: {
      targetDeviceId: deviceB, // <-- print into the rival's kitchen
      content: { orderNumber: 'SPOOF2', items: [{ name: 'Spoofed', qty: 1, price: 1 }] },
    },
  });

  check(
    r.status === 404,
    "cannot target ANOTHER restaurant's till -> 404",
    `got ${r.status}`
  );

  // B must not be able to read A's job.
  r = await api(`/api/business/v1/print-jobs/${jobA}`, { token: B.key });
  check(
    r.status === 404,
    "B cannot read A's job -> 404 (not 403, which would confirm it exists)",
    `got ${r.status}`
  );

  // B's agent must not see A's jobs.
  r = await api('/api/printer/v1/jobs', { token: tokenB });
  const bJobIds = (r.body.jobs || []).map((j) => j.id);
  check(!bJobIds.includes(jobA), "B's agent does not receive A's jobs");

  // B's agent must not be able to complete A's job.
  r = await api(`/api/printer/v1/jobs/${jobA}/completed`, { method: 'POST', token: tokenB, body: {} });
  check(r.status === 404, "B's agent cannot complete A's job -> 404", `got ${r.status}`);

  // ------------------------------------------------------------------
  section('5. Agent polls and prints');

  r = await api('/api/printer/v1/jobs', { token: tokenA });
  const jobs = r.body.jobs || [];
  check(r.status === 200, 'poll returns 200');
  check(jobs.some((j) => j.id === jobA), 'the queued job is delivered');

  const job = jobs.find((j) => j.id === jobA);
  check(job?.content?.restaurant === A.name, 'restaurant name filled in by the SERVER');
  check(job?.content?.total === 80, 'total derived when omitted (52 + 2x14 = 80)', `got ${job?.content?.total}`);
  check(job?.width === 80 && job?.copies === 1, 'defaults applied (80mm, 1 copy)');

  // Poll again — the job must STILL be there (not consumed by being fetched).
  r = await api('/api/printer/v1/jobs', { token: tokenA });
  check(
    (r.body.jobs || []).some((j) => j.id === jobA),
    'job survives a second poll (not deleted on fetch — a crash must not lose it)'
  );

  await api(`/api/printer/v1/jobs/${jobA}/started`, { method: 'POST', token: tokenA, body: {} });

  r = await api(`/api/printer/v1/jobs/${jobA}/completed`, {
    method: 'POST',
    token: tokenA,
    body: { printerStatus: { state: 'ready' }, copies: 1 },
  });
  check(r.status === 200, 'completed callback accepted');

  // Idempotency — the outage scenario.
  r = await api(`/api/printer/v1/jobs/${jobA}/completed`, { method: 'POST', token: tokenA, body: {} });
  check(
    r.status === 200 && r.body.duplicate === true,
    'a DUPLICATE completed callback is a 200 no-op (must never 4xx, or the agent retries forever)',
    `got ${r.status}`
  );

  // Once completed, it must leave the feed.
  r = await api('/api/printer/v1/jobs', { token: tokenA });
  check(
    !(r.body.jobs || []).some((j) => j.id === jobA),
    'a completed job is no longer delivered'
  );

  // ------------------------------------------------------------------
  section('6. Business sees the outcome');

  r = await api(`/api/business/v1/print-jobs/${jobA}`, { token: A.key });
  check(r.status === 200 && r.body.status === 'completed', 'status is completed', `got ${r.body.status}`);
  check(!!r.body.completedAt, 'completedAt is set');
  check(r.body.device?.id === deviceA, 'reports which till printed it');

  // ------------------------------------------------------------------
  section('7. Failure reporting');

  r = await api('/api/business/v1/print-jobs', {
    method: 'POST',
    token: A.key,
    body: { content: { orderNumber: '1043', items: [{ name: 'Tea', qty: 1, price: 10 }] } },
  });
  const failJob = r.body.id;

  r = await api(`/api/printer/v1/jobs/${failJob}/failed`, {
    method: 'POST',
    token: tokenA,
    body: {
      errorCode: 'PRINTER_OUT_OF_PAPER',
      errorMessage: 'The printer ran out of paper.',
      attempts: 5,
      printerStatus: { state: 'out_of_paper' },
    },
  });
  check(r.status === 200, 'failure accepted');

  r = await api(`/api/business/v1/print-jobs/${failJob}`, { token: A.key });
  check(r.body.status === 'failed', 'status is failed');
  check(r.body.error?.code === 'PRINTER_OUT_OF_PAPER', 'errorCode surfaced to the business API');
  check(r.body.attempts === 5, 'attempt count surfaced');

  // ------------------------------------------------------------------
  section('8. Reconcile (the cancelled-order bug)');

  r = await api('/api/business/v1/print-jobs', {
    method: 'POST',
    token: A.key,
    body: { content: { orderNumber: '1044', items: [{ name: 'Cake', qty: 1, price: 30 }] } },
  });
  const cancelledJob = r.body.id;

  // The restaurant voids the order while the till is offline.
  await mongoose.connection
    .collection('printjobs')
    .updateOne(
      { _id: new mongoose.Types.ObjectId(cancelledJob) },
      { $set: { status: 'cancelled', cancelledAt: new Date() } }
    );

  r = await api('/api/printer/v1/jobs/reconcile', {
    method: 'POST',
    token: tokenA,
    body: { jobIds: [cancelledJob, spoofJob, jobA, '000000000000000000000000'] },
  });

  check(r.status === 200, 'reconcile returns 200');
  check(
    r.body.cancelled.includes(cancelledJob),
    'a VOIDED order is returned as cancelled -> the agent drops it instead of printing it'
  );
  check(r.body.pending.includes(spoofJob), 'a still-queued job is returned as pending');
  check(r.body.acknowledged.includes(jobA), 'an already-completed job is returned as acknowledged');
  check(
    r.body.cancelled.includes('000000000000000000000000'),
    'an unknown job id is treated as cancelled (never printed)'
  );

  // ------------------------------------------------------------------
  section('9. Heartbeat + remote commands');

  r = await api('/api/printer/v1/heartbeat', {
    method: 'POST',
    token: tokenA,
    body: {
      agentVersion: '1.0.0',
      queueSize: 2,
      printerStatus: { state: 'ready', name: 'XP-80C' },
      socketConnected: false,
      paused: false,
    },
  });
  check(r.status === 200, 'heartbeat accepted');
  check(Array.isArray(r.body.commands) && r.body.commands.length === 0, 'no commands pending');

  // Queue a remote command, as the CLI would.
  await Device.updateOne(
    { _id: new mongoose.Types.ObjectId(deviceA) },
    { $push: { pendingCommands: { type: 'test_print' } } }
  );

  r = await api('/api/printer/v1/heartbeat', { method: 'POST', token: tokenA, body: { queueSize: 0 } });
  check(
    r.body.commands?.[0]?.type === 'test_print',
    'a queued remote command is delivered on the next heartbeat'
  );

  // ...and delivered exactly once.
  r = await api('/api/printer/v1/heartbeat', { method: 'POST', token: tokenA, body: { queueSize: 0 } });
  check(
    (r.body.commands || []).length === 0,
    'the command is delivered EXACTLY ONCE (delivering "unpair" twice would be a support call)'
  );

  // ------------------------------------------------------------------
  section('10. Update policy');

  r = await api('/api/printer/v1/update-policy', { token: tokenA });
  check(r.status === 200, 'policy readable');
  check(
    r.body.rolloutPercentage === 0,
    'with NO policy configured, rollout is 0% — fails CLOSED, nobody updates',
    `got ${r.body.rolloutPercentage}`
  );

  // ------------------------------------------------------------------
  section('11. Revocation');

  await Device.updateOne(
    { _id: new mongoose.Types.ObjectId(deviceA) },
    { $set: { revokedAt: new Date() } }
  );

  r = await api('/api/printer/v1/jobs', { token: tokenA });
  check(r.status === 401, 'a revoked device token is rejected -> 401', `got ${r.status}`);

  r = await api('/api/printer/v1/heartbeat', { method: 'POST', token: tokenA, body: {} });
  check(r.status === 401, 'revocation applies to every endpoint', `got ${r.status}`);

  // ------------------------------------------------------------------
  console.log('\n' + '='.repeat(60));
  console.log(`  ${pass} passed, ${fail} failed`);
  console.log('='.repeat(60) + '\n');

  // Clean up the test tenants.
  await Restaurant.deleteMany({ name: /^E2E / });
  await Device.deleteMany({ _id: { $in: [deviceA, deviceB].map((id) => new mongoose.Types.ObjectId(id)) } });
  await mongoose.connection.collection('printjobs').deleteMany({
    restaurantId: { $in: [A.id, B.id].map((id) => new mongoose.Types.ObjectId(id)) },
  });
  await PairingCode.deleteMany({ restaurantId: { $in: [A.id, B.id].map((id) => new mongoose.Types.ObjectId(id)) } });

  await mongoose.disconnect();

  process.exit(fail === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error('\nTEST HARNESS ERROR:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
