import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/db';
import PairingCode from '@/models/PairingCode';
import Device from '@/models/Device';
import Restaurant from '@/models/Restaurant';
import { generateDeviceToken, hashToken, fail } from '@/lib/printer/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/printer/v1/devices/pair
 *
 * Exchanges a one-time pairing code for a permanent device token.
 * This is the ONLY unauthenticated endpoint in the system.
 *
 * Body: { pairingCode, hostname, os, agentVersion }
 * 200:  { deviceToken, deviceId, restaurantId, restaurantName }
 */
export async function POST(request) {
  try {
    await connectDB();

    let body;
    try {
      body = await request.json();
    } catch {
      return fail('Invalid request body.', 400);
    }

    const code = String(body?.pairingCode || '')
      .trim()
      .toUpperCase();

    if (!/^FKN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
      return fail('Malformed pairing code.', 400);
    }

    // ------------------------------------------------------------------
    // Consume the code ATOMICALLY.
    //
    // findOneAndUpdate with `consumedAt: null` in the filter is a single
    // compare-and-set inside MongoDB. If two tills race on the same code — which
    // happens for real when someone pastes it into the wrong machine and then
    // the right one — exactly one of them matches an unconsumed document. The
    // loser sees consumedAt already set and gets "already used".
    //
    // Doing this as read-then-write would leave a window where both reads see
    // null and both writes succeed, producing two devices from one code.
    // ------------------------------------------------------------------
    const claimed = await PairingCode.findOneAndUpdate(
      { code, consumedAt: null, expiresAt: { $gt: new Date() } },
      { $set: { consumedAt: new Date() } },
      { new: true }
    );

    if (!claimed) {
      // Work out *why* it failed, so the person at the till gets a message they
      // can act on. This is safe to disclose: they already hold the code.
      const existing = await PairingCode.findOne({ code });

      if (!existing) return fail('No such pairing code.', 404);
      if (existing.consumedAt) return fail('This pairing code has already been used.', 409);

      return fail('This pairing code has expired. Generate a new one.', 410);
    }

    const restaurant = await Restaurant.findById(claimed.restaurantId);

    if (!restaurant || restaurant.disabledAt) {
      return fail('This restaurant account is disabled.', 403);
    }

    // The restaurant comes from the CODE, not from anything the agent sent.
    const deviceToken = generateDeviceToken();

    // First device for a restaurant becomes the default target for jobs that do
    // not name one — which is every job, for the single-till restaurants that
    // make up most of the fleet.
    const existingDevices = await Device.countDocuments({
      restaurantId: restaurant._id,
      revokedAt: null,
    });

    const device = await Device.create({
      restaurantId: restaurant._id,
      tokenHash: hashToken(deviceToken), // the token itself is never stored
      hostname: String(body?.hostname || '').slice(0, 200),
      os: String(body?.os || '').slice(0, 200),
      agentVersion: String(body?.agentVersion || '').slice(0, 50),
      isDefault: existingDevices === 0,
    });

    claimed.deviceId = device._id;
    await claimed.save();

    console.log(
      `[pair] device ${device._id} paired to "${restaurant.name}" (${device.hostname})`
    );

    // The ONLY time the plaintext token ever leaves this server.
    return NextResponse.json({
      deviceToken,
      deviceId: String(device._id),
      restaurantId: String(restaurant._id),
      restaurantName: restaurant.name,
    });
  } catch (error) {
    console.error('[pair] error:', error);
    return fail('Something went wrong. Please try again.', 500);
  }
}
