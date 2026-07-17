import { NextResponse } from 'next/server';

import Device from '@/models/Device';
import PrintJob from '@/models/PrintJob';
import { authenticateRestaurant, fail } from '@/lib/printer/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/business/v1/print-jobs/{id}
 * Authorization: Bearer <restaurant API key>
 *
 * For the restaurant's own admin screen: "did order 1042 actually print?"
 */
export async function GET(request, { params }) {
  try {
    const { restaurant, response } = await authenticateRestaurant(request);
    if (response) return response;

    const { id } = await params;
    const jobId = String(id || '');

    // ------------------------------------------------------------------
    // Cross-tenant reads return 404, NOT 403.
    //
    // 403 would confirm "this job exists, but it isn't yours" — which lets
    // anyone holding one valid API key enumerate other restaurants' job ids and
    // learn their order volume. 404 leaks nothing: an id belonging to someone
    // else is indistinguishable from an id that never existed.
    // ------------------------------------------------------------------
    if (!/^[a-f0-9]{24}$/i.test(jobId)) {
      return fail('No such print job.', 404);
    }

    const job = await PrintJob.findOne({
      _id: jobId,
      restaurantId: restaurant._id, // <-- tenant scope, from the key
    }).lean();

    if (!job) {
      return fail('No such print job.', 404);
    }

    const device = await Device.findById(job.targetDeviceId);

    const online = device
      ? Boolean(device.lastHeartbeatAt) &&
        Date.now() - device.lastHeartbeatAt.getTime() < 150 * 1000
      : false;

    return NextResponse.json({
      id: String(job._id),
      status: job.status,
      type: job.type,
      copies: job.copies,

      createdAt: job.createdAt?.toISOString() ?? null,
      startedAt: job.startedAt?.toISOString() ?? null,
      completedAt: job.completedAt?.toISOString() ?? null,

      attempts: job.attempts,

      device: device
        ? { id: String(device._id), name: device.hostname || 'Till', online }
        : null,

      printerStatus: job.printerStatus ?? null,

      ...(job.errorCode
        ? { error: { code: job.errorCode, message: job.errorMessage } }
        : {}),

      /**
       * A hint for the UI, because the obvious reading of this state is wrong.
       *
       * `queued` while the till is offline is the NORMAL, healthy state during an
       * internet outage — the job is safe and will print on reconnect. Showing it
       * as a failure sends restaurants into a panic and generates support calls
       * about a system that is working correctly.
       */
      ...(job.status === 'queued' && !online
        ? { hint: 'The till is offline. This job is safe and will print automatically when it reconnects.' }
        : {}),
    });
  } catch (error) {
    console.error('[print-jobs:get] error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
