import { NextResponse } from 'next/server';

import PrintJob from '@/models/PrintJob';
import { authenticateDevice } from '@/lib/printer/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Never hand an agent an unbounded batch; it prints them one at a time anyway. */
const MAX_JOBS_PER_POLL = 25;

/**
 * GET /api/printer/v1/jobs
 *
 * The agent's job feed. With no WebSocket in v1 this is the primary delivery
 * channel, polled every 3 seconds.
 *
 * Critical semantics — a job is NOT removed when it is fetched.
 * It stays in this feed until the agent acknowledges it with a /completed or
 * /failed callback. If the till crashes between fetching and printing, the job
 * survives and is handed out again on the next poll.
 *
 * That means the same job WILL be delivered more than once, and that is fine by
 * design: the agent deduplicates by job id using a database primary key, so a
 * job delivered ten times still prints exactly once. At-least-once delivery here
 * plus exactly-once printing there is the whole contract.
 */
export async function GET(request) {
  try {
    const { device, response } = await authenticateDevice(request);
    if (response) return response;

    // A paused device still receives its jobs — the agent queues them locally and
    // prints the moment it is resumed. Withholding them here would mean a resume
    // has nothing to print until the next order comes in.
    const jobs = await PrintJob.find({
      // Scoped to THIS device, whose restaurant came from the token.
      targetDeviceId: device._id,
      status: { $in: ['queued', 'printing'] },
    })
      .sort({ createdAt: 1 }) // oldest first: receipts must print in order
      .limit(MAX_JOBS_PER_POLL)
      .lean();

    return NextResponse.json({
      jobs: jobs.map((job) => ({
        id: String(job._id),
        copies: job.copies,
        type: job.type,
        width: job.width,
        targetDeviceId: String(job.targetDeviceId),
        content: {
          restaurant: job.content?.restaurant || '',
          orderNumber: job.content?.orderNumber || '',
          customer: job.content?.customer || '',
          phone: job.content?.phone || '',
          items: (job.content?.items || []).map((item) => ({
            name: item.name,
            qty: item.qty,
            price: item.price,
          })),
          notes: job.content?.notes || '',
          total: job.content?.total ?? 0,
        },
      })),
    });
  } catch (error) {
    console.error('[jobs] error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
