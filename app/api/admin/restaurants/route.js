import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/db';
import Restaurant from '@/models/Restaurant';
import Device from '@/models/Device';
import PrintJob from '@/models/PrintJob';
import { generateApiKey, hashToken } from '@/lib/printer/auth';
import { requireAdmin, adminFail } from '@/lib/printer/adminGuard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** A device that has not been heard from in 2.5 heartbeats is offline. */
const ONLINE_WINDOW_MS = 150 * 1000;

/**
 * GET /api/admin/restaurants
 *
 * The whole fleet, shaped for the console: every restaurant with its tills,
 * their live state, and how their jobs are going.
 */
export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  await connectDB();

  const restaurants = await Restaurant.find({}).sort({ createdAt: -1 }).lean();
  const devices = await Device.find({}).lean();

  // One aggregation instead of a query per restaurant — this page is opened
  // constantly and a fleet of a few thousand tills would otherwise crawl.
  const jobStats = await PrintJob.aggregate([
    { $group: { _id: { restaurantId: '$restaurantId', status: '$status' }, n: { $sum: 1 } } },
  ]);

  /** @type {Map<string, Record<string, number>>} */
  const statsByRestaurant = new Map();

  for (const row of jobStats) {
    const key = String(row._id.restaurantId);
    const bucket = statsByRestaurant.get(key) || {};

    bucket[row._id.status] = row.n;
    statsByRestaurant.set(key, bucket);
  }

  const now = Date.now();

  return NextResponse.json({
    restaurants: restaurants.map((restaurant) => {
      const id = String(restaurant._id);

      const tills = devices
        .filter((device) => String(device.restaurantId) === id)
        .map((device) => ({
          id: String(device._id),
          hostname: device.hostname || 'Unnamed till',
          agentVersion: device.agentVersion || '?',
          isDefault: Boolean(device.isDefault),
          paused: Boolean(device.paused),
          revoked: Boolean(device.revokedAt),
          online:
            Boolean(device.lastHeartbeatAt) &&
            now - new Date(device.lastHeartbeatAt).getTime() < ONLINE_WINDOW_MS,
          lastHeartbeatAt: device.lastHeartbeatAt || null,
          lastPrintAt: device.lastPrintAt || null,
          queueSize: device.queueSize ?? 0,
          printerStatus: device.printerStatus?.state || 'unknown',
          printerName: device.printerStatus?.name || '',
          pendingCommands: (device.pendingCommands || []).map((c) => c?.type).filter(Boolean),
          lastCrash: device.lastCrash?.message || null,
        }));

      return {
        id,
        name: restaurant.name,
        createdAt: restaurant.createdAt,
        // Only the prefix — we cannot show the key itself, we never stored it.
        apiKeys: (restaurant.apiKeys || [])
          .filter((key) => !key.revokedAt)
          .map((key) => ({ prefix: key.prefix, label: key.label, createdAt: key.createdAt })),
        devices: tills,
        jobs: statsByRestaurant.get(id) || {},
      };
    }),
  });
}

/**
 * POST /api/admin/restaurants
 * Body: { name }
 *
 * Creates a restaurant and mints its first API key. The plaintext key is
 * returned exactly once, here, and never again — only its SHA-256 hash is
 * stored, so there is no way to recover it later. Lost keys are replaced.
 */
export async function POST(request) {
  const { response } = await requireAdmin();
  if (response) return response;

  let body;
  try {
    body = await request.json();
  } catch {
    return adminFail('Invalid request body.', 400);
  }

  const name = String(body?.name || '').trim();

  if (!name) return adminFail('A restaurant name is required.', 400);
  if (name.length > 120) return adminFail('That name is too long.', 400);

  await connectDB();

  const apiKey = generateApiKey();

  const restaurant = await Restaurant.create({
    name,
    apiKeys: [
      {
        hash: hashToken(apiKey),
        prefix: apiKey.slice(0, 16),
        label: 'default',
        createdAt: new Date(),
        revokedAt: null,
      },
    ],
  });

  return NextResponse.json(
    {
      id: String(restaurant._id),
      name: restaurant.name,
      // Shown once. Copy it now.
      apiKey,
    },
    { status: 201 }
  );
}
