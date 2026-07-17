import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/db';
import UpdatePolicy from '@/models/UpdatePolicy';
import { authenticateDevice } from '@/lib/printer/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/printer/v1/update-policy
 *
 * The agent fetches this every 6 hours and BEFORE it downloads any update. It
 * never blind-updates.
 *
 * How the agent uses the answer:
 *
 *   rolloutPercentage  It hashes its own deviceId + the target version into a
 *                      stable bucket 0..99 and updates only if bucket < this.
 *                      The bucket is deterministic, so an agent cannot re-roll
 *                      itself into the cohort by restarting; and it is scoped to
 *                      the version, so the same unlucky devices are not the
 *                      guinea pigs for every release.
 *
 *   minimumVersion     A floor that IGNORES the percentage. Any agent below it
 *                      updates at once. This is the rollback lever.
 *
 *   mandatory          Bypasses the gate entirely.
 *
 * To ship: publish at 0%, then 5, 25, 50, 100, watching the failed-job rate at
 * each step. To roll back: you cannot un-ship a version (those agents already
 * replaced their own binary), so republish the good code as a HIGHER version and
 * set minimumVersion to it.
 *
 * ---------------------------------------------------------------------------
 * If no policy document exists we return rolloutPercentage 0 and the agent's own
 * current version as `latestVersion`. That means: nobody updates. Failing closed
 * is the only safe default — a misconfiguration must never trigger a fleet-wide
 * update.
 * ---------------------------------------------------------------------------
 */
export async function GET(request) {
  try {
    const { device, response } = await authenticateDevice(request);
    if (response) return response;

    await connectDB();

    const policy = await UpdatePolicy.findOne({ key: 'default' }).lean();

    if (!policy) {
      return NextResponse.json({
        latestVersion: device.agentVersion || '1.0.0',
        minimumVersion: '0.0.0',
        rolloutPercentage: 0, // fail closed
        mandatory: false,
      });
    }

    return NextResponse.json({
      latestVersion: policy.latestVersion,
      minimumVersion: policy.minimumVersion,
      rolloutPercentage: policy.rolloutPercentage,
      mandatory: Boolean(policy.mandatory),
    });
  } catch (error) {
    console.error('[update-policy] error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
