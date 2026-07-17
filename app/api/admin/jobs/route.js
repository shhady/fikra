import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/db';
import PrintJob from '@/models/PrintJob';
import Restaurant from '@/models/Restaurant';
import Device from '@/models/Device';
import { requireAdmin, isObjectId } from '@/lib/printer/adminGuard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 40;

/**
 * GET /api/admin/jobs?restaurantId=&status=
 *
 * Recent print jobs across the fleet. This is the support view: when a
 * restaurant phones to say "order 1042 never printed", this is the screen that
 * answers why.
 */
export async function GET(request) {
  const { response } = await requireAdmin();
  if (response) return response;

  await connectDB();

  const params = new URL(request.url).searchParams;

  /** @type {Record<string, unknown>} */
  const filter = {};

  const restaurantId = params.get('restaurantId');
  if (restaurantId && isObjectId(restaurantId)) filter.restaurantId = restaurantId;

  const status = params.get('status');
  if (status && ['queued', 'printing', 'completed', 'failed', 'cancelled'].includes(status)) {
    filter.status = status;
  }

  const jobs = await PrintJob.find(filter).sort({ createdAt: -1 }).limit(PAGE_SIZE).lean();

  const [restaurants, devices] = await Promise.all([
    Restaurant.find({}).select('name').lean(),
    Device.find({}).select('hostname').lean(),
  ]);

  const restaurantName = new Map(restaurants.map((r) => [String(r._id), r.name]));
  const deviceName = new Map(devices.map((d) => [String(d._id), d.hostname || 'Till']));

  return NextResponse.json({
    jobs: jobs.map((job) => ({
      id: String(job._id),
      restaurant: restaurantName.get(String(job.restaurantId)) || '—',
      till: deviceName.get(String(job.targetDeviceId)) || '—',
      type: job.type,
      status: job.status,
      orderNumber: job.content?.orderNumber || '',
      total: job.content?.total ?? 0,
      items: (job.content?.items || []).length,
      attempts: job.attempts,
      errorCode: job.errorCode,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    })),
  });
}
