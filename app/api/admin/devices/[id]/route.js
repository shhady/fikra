import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/db';
import Device from '@/models/Device';
import { requireAdmin, adminFail, isObjectId } from '@/lib/printer/adminGuard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Commands the agent understands. Anything else it ignores rather than crashing. */
const COMMANDS = ['pause', 'resume', 'test_print', 'unpair', 'update'];

/**
 * POST /api/admin/devices/{id}
 * Body: { action: 'pause' | 'resume' | 'test_print' | 'unpair' | 'update' | 'revoke' | 'set_default' }
 *
 * How remote control actually works
 * --------------------------------
 * We never push anything to a till. The agent has no inbound port, no listening
 * socket, and sits behind the restaurant's router with no firewall changes — that
 * is precisely what makes it deployable.
 *
 * So a "command" is really a note we leave in the device's record. The agent
 * collects it on its next heartbeat (within 60 seconds) and acts on it. The
 * heartbeat handler hands the commands over and clears them in the same atomic
 * write, so each one is delivered exactly once — delivering "unpair" twice would
 * be a support call.
 *
 * `revoke` is different, and stronger: it kills the device token server-side
 * immediately, so the till's very next request gets a 401 whether or not it ever
 * collects the note.
 */
export async function POST(request, { params }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  if (!isObjectId(id)) return adminFail('No such device.', 404);

  let body;
  try {
    body = await request.json();
  } catch {
    return adminFail('Invalid request body.', 400);
  }

  const action = String(body?.action || '');

  await connectDB();

  const device = await Device.findById(id);
  if (!device) return adminFail('No such device.', 404);

  // ---- revoke: kill the credential now, do not wait for a heartbeat --------
  if (action === 'revoke') {
    await Device.updateOne(
      { _id: device._id },
      {
        $set: { revokedAt: new Date() },
        // Also tell it to unpair, so it stops retrying with a dead token and
        // shows the pairing screen instead of looking silently broken.
        $push: { pendingCommands: { type: 'unpair' } },
      }
    );

    return NextResponse.json({
      ok: true,
      action,
      effect: 'Token revoked immediately. The next request from this till gets a 401.',
    });
  }

  // ---- set_default: choose which till unaddressed jobs go to ---------------
  if (action === 'set_default') {
    await Device.updateMany({ restaurantId: device.restaurantId }, { $set: { isDefault: false } });
    await Device.updateOne({ _id: device._id }, { $set: { isDefault: true } });

    return NextResponse.json({ ok: true, action, effect: 'This till is now the default target.' });
  }

  // ---- queued commands ----------------------------------------------------
  if (!COMMANDS.includes(action)) {
    return adminFail(`Unknown action "${action}".`, 400);
  }

  /** @type {Record<string, unknown>} */
  const set = {};

  // pause/resume are also persisted as state, not just sent as a command, so the
  // pause survives an agent restart. A till that reboots must not quietly start
  // printing again.
  if (action === 'pause') set.paused = true;
  if (action === 'resume') set.paused = false;

  await Device.updateOne(
    { _id: device._id },
    {
      ...(Object.keys(set).length ? { $set: set } : {}),
      $push: { pendingCommands: { type: action } },
    }
  );

  return NextResponse.json({
    ok: true,
    action,
    effect: 'Queued. The till collects it on its next heartbeat (within 60s).',
  });
}

/**
 * DELETE /api/admin/devices/{id}
 *
 * Forgets a till entirely. Use for a device that was replaced or mis-paired;
 * prefer `revoke` when you just want to cut off access but keep the record.
 */
export async function DELETE(request, { params }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  if (!isObjectId(id)) return adminFail('No such device.', 404);

  await connectDB();

  const result = await Device.deleteOne({ _id: id });

  if (result.deletedCount === 0) return adminFail('No such device.', 404);

  return NextResponse.json({ ok: true, deleted: id });
}
