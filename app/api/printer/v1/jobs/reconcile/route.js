import { NextResponse } from 'next/server';

import PrintJob from '@/models/PrintJob';
import { authenticateDevice, fail } from '@/lib/printer/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/printer/v1/jobs/reconcile
 *
 * Called by the agent when it comes back online, BEFORE it accepts new work.
 * Body: { jobIds: [...] }  — everything the agent is still holding locally.
 *
 * This exists to fix one specific, very real bug:
 *
 *   The restaurant loses internet for two hours. During that time they cancel
 *   three orders from their phone. The moment the till reconnects, it prints all
 *   three — because as far as it knows, they are still pending.
 *
 * So we answer with three buckets:
 *
 *   pending      still wanted — keep them queued
 *   cancelled    DROP these without printing. Printing a voided order is worse
 *                than not printing it at all.
 *   acknowledged we already have the outcome; stop re-reporting it
 *
 * Anything the agent holds that we have no record of at all is reported as
 * cancelled, because we will never accept an outcome for it.
 */
export async function POST(request) {
  try {
    const { device, response } = await authenticateDevice(request);
    if (response) return response;

    let body;
    try {
      body = await request.json();
    } catch {
      return fail('Invalid request body.', 400);
    }

    const jobIds = Array.isArray(body?.jobIds) ? body.jobIds.map(String) : [];

    if (jobIds.length === 0) {
      return NextResponse.json({ pending: [], cancelled: [], acknowledged: [] });
    }

    // Only ever look at jobs belonging to THIS device. An agent asking about a
    // job id it does not own learns nothing: the id simply falls through to
    // "cancelled", exactly as an unknown id would.
    const jobs = await PrintJob.find({
      _id: { $in: jobIds.filter((id) => /^[a-f0-9]{24}$/i.test(id)) },
      targetDeviceId: device._id,
    })
      .select('_id status')
      .lean();

    const byId = new Map(jobs.map((job) => [String(job._id), job.status]));

    const pending = [];
    const cancelled = [];
    const acknowledged = [];

    for (const id of jobIds) {
      const status = byId.get(id);

      if (!status || status === 'cancelled') {
        // Unknown to us, or explicitly voided. Either way: do not print it.
        cancelled.push(id);
      } else if (status === 'completed' || status === 'failed') {
        acknowledged.push(id);
      } else {
        pending.push(id);
      }
    }

    if (cancelled.length > 0) {
      console.log(`[reconcile] device ${device._id}: dropping ${cancelled.length} cancelled job(s)`);
    }

    return NextResponse.json({ pending, cancelled, acknowledged });
  } catch (error) {
    console.error('[reconcile] error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
