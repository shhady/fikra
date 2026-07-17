import { NextResponse } from 'next/server';

import PrintJob from '@/models/PrintJob';
import Device from '@/models/Device';
import { authenticateDevice, fail } from '@/lib/printer/auth';

/**
 * Shared plumbing for the three job status callbacks
 * (/started, /completed, /failed).
 *
 * ============================================================================
 * IDEMPOTENCY IS NOT OPTIONAL HERE
 * ----------------------------------------------------------------------------
 * These callbacks are retried by the agent and can arrive late, out of order,
 * and more than once. The normal sequence during an internet outage is:
 *
 *   1. the receipt prints
 *   2. the agent tries to call /completed  -> network is down, fails
 *   3. the agent stores the outcome on disk, flagged "unreported"
 *   4. hours later, on reconnect, it flushes -> /completed finally arrives
 *
 * ...and if our 200 response is itself lost in flight, the agent will send it
 * again. So a second /completed for an already-completed job must be a quiet
 * 200 no-op, never an error. If we 4xx'd it, the agent would retry forever and
 * the job would never leave its queue.
 * ============================================================================
 *
 * @param {Request} request
 * @param {{ id: string }} params
 * @param {'started'|'completed'|'failed'} kind
 * @returns {Promise<NextResponse>}
 */
export async function handleJobCallback(request, params, kind) {
  try {
    const { device, response } = await authenticateDevice(request);
    if (response) return response;

    const jobId = String(params?.id || '');

    if (!/^[a-f0-9]{24}$/i.test(jobId)) {
      return fail('Unknown job.', 404);
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      // A body-less callback is acceptable; the id and the URL carry the meaning.
      body = {};
    }

    // Scope by device, not just by job id. An agent must not be able to move
    // another till's job to "completed" by guessing its id — even within the
    // same restaurant.
    const job = await PrintJob.findOne({ _id: jobId, targetDeviceId: device._id });

    if (!job) {
      return fail('Unknown job.', 404);
    }

    const printerStatus = body?.printerStatus ?? null;

    if (printerStatus) {
      // Free telemetry: every callback tells us what the printer looked like.
      await Device.updateOne({ _id: device._id }, { $set: { printerStatus } });
    }

    // ---- started -------------------------------------------------------
    if (kind === 'started') {
      // Only a queued job can start. If it is already completed, this is a stale
      // retry arriving after the fact — accept it and change nothing.
      if (job.status === 'queued') {
        job.status = 'printing';
        job.startedAt = new Date();
        await job.save();
      }

      return NextResponse.json({ ok: true, status: job.status });
    }

    // ---- completed -----------------------------------------------------
    if (kind === 'completed') {
      if (job.status === 'completed') {
        // Duplicate acknowledgement. Quietly agree.
        return NextResponse.json({ ok: true, status: 'completed', duplicate: true });
      }

      // A cancelled job that somehow printed anyway: record the truth rather
      // than silently overwriting the cancellation.
      if (job.status === 'cancelled') {
        console.warn(`[job] ${jobId} reported completed but was cancelled — leaving cancelled.`);
        return NextResponse.json({ ok: true, status: 'cancelled' });
      }

      job.status = 'completed';
      job.completedAt = new Date();
      job.errorCode = null;
      job.errorMessage = null;
      if (printerStatus) job.printerStatus = printerStatus;
      if (!job.startedAt) job.startedAt = new Date();

      await job.save();

      await Device.updateOne({ _id: device._id }, { $set: { lastPrintAt: new Date() } });

      console.log(`[job] ${jobId} completed on device ${device._id}`);

      return NextResponse.json({ ok: true, status: 'completed' });
    }

    // ---- failed --------------------------------------------------------
    if (job.status === 'completed') {
      // It already printed. A late failure report cannot un-print paper.
      return NextResponse.json({ ok: true, status: 'completed', ignored: true });
    }

    job.status = 'failed';
    job.failedAt = new Date();
    job.attempts = Number(body?.attempts) || job.attempts + 1;
    job.errorCode = String(body?.errorCode || 'UNKNOWN');
    job.errorMessage = String(body?.errorMessage || '').slice(0, 1000);
    if (printerStatus) job.printerStatus = printerStatus;

    await job.save();

    console.warn(`[job] ${jobId} FAILED on device ${device._id}: ${job.errorCode} — ${job.errorMessage}`);

    return NextResponse.json({ ok: true, status: 'failed' });
  } catch (error) {
    console.error(`[job:${kind}] error:`, error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
