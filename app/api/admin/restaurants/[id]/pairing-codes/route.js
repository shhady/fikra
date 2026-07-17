import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/db';
import Restaurant from '@/models/Restaurant';
import PairingCode from '@/models/PairingCode';
import { generatePairingCode } from '@/lib/printer/auth';
import { requireAdmin, adminFail, isObjectId } from '@/lib/printer/adminGuard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Codes are short-lived on purpose: this is the one unauthenticated surface. */
const TTL_MS = 10 * 60 * 1000;

/**
 * POST /api/admin/restaurants/{id}/pairing-codes
 *
 * Mints a one-time pairing code for a till.
 *
 * This is the moment a restaurant is bound to a device, and it is why there is
 * ONE generic installer for every customer rather than a per-customer build:
 * identity is established here, at install time, not baked into a binary.
 *
 * The code is single-use, expires in ~10 minutes, and is scoped to this
 * restaurant — a code minted here can only ever produce a device belonging to
 * this restaurant, whatever the agent claims about itself.
 */
export async function POST(request, { params }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;

  if (!isObjectId(id)) return adminFail('No such restaurant.', 404);

  await connectDB();

  const restaurant = await Restaurant.findById(id);

  if (!restaurant) return adminFail('No such restaurant.', 404);
  if (restaurant.disabledAt) return adminFail('That restaurant is disabled.', 403);

  const expiresAt = new Date(Date.now() + TTL_MS);

  const code = await PairingCode.create({
    code: generatePairingCode(),
    restaurantId: restaurant._id,
    expiresAt,
  });

  return NextResponse.json(
    {
      code: code.code,
      restaurantName: restaurant.name,
      expiresAt: expiresAt.toISOString(),
      expiresInSeconds: Math.round(TTL_MS / 1000),
    },
    { status: 201 }
  );
}
