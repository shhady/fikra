import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/db';
import UpdatePolicy from '@/models/UpdatePolicy';
import Device from '@/models/Device';
import { requireAdmin, adminFail } from '@/lib/printer/adminGuard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SEMVER = /^\d+\.\d+\.\d+$/;

/**
 * GET /api/admin/update-policy
 *
 * Also reports which agent versions are actually out there, because the policy is
 * meaningless without knowing what the fleet is currently running.
 */
export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  await connectDB();

  const policy = await UpdatePolicy.findOne({ key: 'default' }).lean();

  const versions = await Device.aggregate([
    { $match: { revokedAt: null } },
    { $group: { _id: '$agentVersion', n: { $sum: 1 } } },
    { $sort: { n: -1 } },
  ]);

  return NextResponse.json({
    policy: policy
      ? {
          latestVersion: policy.latestVersion,
          minimumVersion: policy.minimumVersion,
          rolloutPercentage: policy.rolloutPercentage,
          mandatory: Boolean(policy.mandatory),
          updatedAt: policy.updatedAt,
        }
      : null,
    fleet: versions.map((row) => ({ version: row._id || 'unknown', devices: row.n })),
  });
}

/**
 * POST /api/admin/update-policy
 * Body: { latestVersion, minimumVersion, rolloutPercentage, mandatory }
 *
 * The staged-rollout lever.
 *
 * Each agent hashes its own deviceId + the target version into a stable bucket
 * 0-99 and updates only if bucket < rolloutPercentage. The bucket is
 * deterministic (an agent cannot re-roll itself by restarting) and version-scoped
 * (the same devices are not the guinea pigs every time).
 *
 * Ship a release by walking the percentage up — 0, 5, 25, 50, 100 — watching the
 * failed-job rate at each step. If something breaks, drop it back to 0 and the
 * agents that have not updated will not.
 *
 * To roll BACK devices that already took a bad build: you cannot un-ship a
 * version (they have replaced their own binary), so republish the good code as a
 * HIGHER version and set minimumVersion to it. The floor ignores the rollout
 * percentage, so the broken cohort heals immediately.
 */
export async function POST(request) {
  const { response } = await requireAdmin();
  if (response) return response;

  let body;
  try {
    body = await request.json();
  } catch {
    return adminFail('Invalid request body.', 400);
  }

  const latestVersion = String(body?.latestVersion || '').trim();
  const minimumVersion = String(body?.minimumVersion || '0.0.0').trim();
  const rolloutPercentage = Number(body?.rolloutPercentage);

  if (!SEMVER.test(latestVersion)) {
    return adminFail('latestVersion must look like 1.2.3.', 400);
  }

  if (!SEMVER.test(minimumVersion)) {
    return adminFail('minimumVersion must look like 1.2.3.', 400);
  }

  if (!Number.isFinite(rolloutPercentage) || rolloutPercentage < 0 || rolloutPercentage > 100) {
    return adminFail('rolloutPercentage must be between 0 and 100.', 400);
  }

  await connectDB();

  await UpdatePolicy.updateOne(
    { key: 'default' },
    {
      $set: {
        key: 'default',
        latestVersion,
        minimumVersion,
        rolloutPercentage: Math.round(rolloutPercentage),
        mandatory: Boolean(body?.mandatory),
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  return NextResponse.json({
    ok: true,
    latestVersion,
    minimumVersion,
    rolloutPercentage: Math.round(rolloutPercentage),
    mandatory: Boolean(body?.mandatory),
    // Surfaced in the UI as a warning, not a block — sometimes 100 is genuinely
    // what you want (a hotfix). It should just never be the first step.
    warning:
      rolloutPercentage >= 100
        ? 'Every till will take this build. Only do this after 5/25/50 looked healthy.'
        : null,
  });
}
