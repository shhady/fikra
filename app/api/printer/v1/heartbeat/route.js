import { NextResponse } from 'next/server';

import Device from '@/models/Device';
import { authenticateDevice } from '@/lib/printer/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/printer/v1/heartbeat
 *
 * Every 60 seconds, from every till. Two jobs:
 *
 *   1. Telemetry in.  Version, queue depth, printer status, last print time, and
 *      — exactly once per crash — the agent's last crash report. This is how you
 *      know a till is in trouble before the restaurant phones you.
 *
 *   2. Commands out.  The response carries any queued remote commands (pause,
 *      unpair, test print). This is the ONLY way we reach a till.
 *
 * That second point is the whole reason the product is deployable: the agent
 * opens no ports and listens on nothing. It sits behind the restaurant's router
 * with no firewall changes, and remote control works because it keeps asking us.
 * Anything that requires us to *push* to the till is off the table.
 */
export async function POST(request) {
  try {
    const { device, response } = await authenticateDevice(request);
    if (response) return response;

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    /** @type {Record<string, unknown>} */
    const update = {
      lastHeartbeatAt: new Date(),
      queueSize: Number(body?.queueSize) || 0,
      socketConnected: Boolean(body?.socketConnected),
      paused: Boolean(body?.paused),
    };

    if (body?.agentVersion) update.agentVersion = String(body.agentVersion).slice(0, 50);
    if (body?.printerStatus) update.printerStatus = body.printerStatus;

    if (body?.lastPrintAt) {
      const at = new Date(body.lastPrintAt);
      if (!Number.isNaN(at.getTime())) update.lastPrintAt = at;
    }

    // The agent sends a crash report exactly once — it consumes it locally after
    // sending. If we drop it here it is gone, so store it unconditionally.
    if (body?.lastCrash) {
      update.lastCrash = body.lastCrash;
      console.error(
        `[heartbeat] device ${device._id} reported a crash: ${body.lastCrash?.message || 'unknown'}`
      );
    }

    // Hand over any queued commands and clear the queue in the SAME write.
    //
    // Read-then-clear would risk delivering a command twice if the agent's next
    // heartbeat arrived while we were still processing this one — and delivering
    // "unpair" twice, or a second test print, is a support call.
    const updated = await Device.findOneAndUpdate(
      { _id: device._id },
      { $set: { ...update, pendingCommands: [] } },
      { new: false } // return the PRE-update doc, so we still see the commands
    );

    const commands = Array.isArray(updated?.pendingCommands) ? updated.pendingCommands : [];

    if (commands.length > 0) {
      console.log(
        `[heartbeat] delivering ${commands.length} command(s) to device ${device._id}: ` +
          commands.map((c) => c?.type).join(', ')
      );
    }

    return NextResponse.json({ commands });
  } catch (error) {
    console.error('[heartbeat] error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
