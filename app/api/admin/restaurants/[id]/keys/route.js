import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/db';
import Restaurant from '@/models/Restaurant';
import { generateApiKey, hashToken } from '@/lib/printer/auth';
import { requireAdmin, adminFail, isObjectId } from '@/lib/printer/adminGuard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/restaurants/{id}/keys
 * Body: { label? }
 *
 * Mints an additional API key for a restaurant's website. Returned once.
 */
export async function POST(request, { params }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  if (!isObjectId(id)) return adminFail('No such restaurant.', 404);

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  await connectDB();

  const restaurant = await Restaurant.findById(id);
  if (!restaurant) return adminFail('No such restaurant.', 404);

  const apiKey = generateApiKey();
  const label = String(body?.label || 'website').trim().slice(0, 40) || 'website';

  await Restaurant.updateOne(
    { _id: restaurant._id },
    {
      $push: {
        apiKeys: {
          hash: hashToken(apiKey),
          prefix: apiKey.slice(0, 16),
          label,
          createdAt: new Date(),
          revokedAt: null,
        },
      },
    }
  );

  return NextResponse.json({ apiKey, label }, { status: 201 });
}

/**
 * DELETE /api/admin/restaurants/{id}/keys?prefix=rk_live_xxxx
 *
 * Revokes a key. We mark it revoked rather than pulling it from the array so the
 * audit trail survives — "which key was leaked, and when did we kill it" is a
 * question you only get to answer if you kept the record.
 */
export async function DELETE(request, { params }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  if (!isObjectId(id)) return adminFail('No such restaurant.', 404);

  const prefix = new URL(request.url).searchParams.get('prefix');
  if (!prefix) return adminFail('Which key? Pass ?prefix=', 400);

  await connectDB();

  const result = await Restaurant.updateOne(
    { _id: id, 'apiKeys.prefix': prefix },
    { $set: { 'apiKeys.$.revokedAt': new Date() } }
  );

  if (result.matchedCount === 0) return adminFail('No such key.', 404);

  return NextResponse.json({ revoked: prefix });
}
