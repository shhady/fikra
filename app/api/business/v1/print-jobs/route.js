import { NextResponse } from 'next/server';

import Device from '@/models/Device';
import PrintJob from '@/models/PrintJob';
import { authenticateRestaurant, fail } from '@/lib/printer/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const JOB_TYPES = ['receipt', 'kitchen', 'label'];

/**
 * @param {unknown} value
 * @param {number} fallback
 * @returns {number}
 */
function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * POST /api/business/v1/print-jobs
 * Authorization: Bearer <restaurant API key>
 *
 * What a restaurant's website calls when an order comes in.
 *
 * ============================================================================
 * The restaurant is resolved from the API KEY. The body is never trusted for it.
 *
 * If a caller sends `restaurantId` in the body, it is IGNORED — not honoured,
 * not validated, ignored. A restaurant's website must not be able to create a
 * print job for a different restaurant, whether by malice or by a copy-pasted
 * integration bug. This is the single property that keeps the platform
 * multi-tenant-safe, and it is enforced here and in authenticateRestaurant().
 * ============================================================================
 */
export async function POST(request) {
  try {
    const { restaurant, response } = await authenticateRestaurant(request);
    if (response) return response;

    let body;
    try {
      body = await request.json();
    } catch {
      return fail('Invalid request body.', 400);
    }

    // ---- Resolve the target till --------------------------------------
    //
    // Note the restaurantId filter: even when the caller names a device
    // explicitly, it must be one of THEIR devices. Without this, a valid key
    // plus a guessed device id would print into someone else's kitchen.
    const requestedDeviceId = body?.targetDeviceId ? String(body.targetDeviceId) : '';

    let device;

    if (requestedDeviceId) {
      if (!/^[a-f0-9]{24}$/i.test(requestedDeviceId)) {
        return fail('Unknown target device.', 404);
      }

      device = await Device.findOne({
        _id: requestedDeviceId,
        restaurantId: restaurant._id, // <-- tenant scope
        revokedAt: null,
      });

      if (!device) return fail('Unknown target device.', 404);
    } else {
      // No device named: use the default, else the only one.
      device =
        (await Device.findOne({ restaurantId: restaurant._id, revokedAt: null, isDefault: true })) ||
        (await Device.findOne({ restaurantId: restaurant._id, revokedAt: null }));

      if (!device) {
        return fail(
          'This restaurant has no paired printer. Install the FikraNova Print Agent and pair it first.',
          409
        );
      }
    }

    // ---- Validate the payload ------------------------------------------
    const rawContent = body?.content && typeof body.content === 'object' ? body.content : {};

    const items = Array.isArray(rawContent.items)
      ? rawContent.items
          .map((item) => ({
            name: String(item?.name ?? '').trim(),
            qty: Math.max(1, Math.floor(toNumber(item?.qty, 1))),
            price: toNumber(item?.price, 0),
          }))
          .filter((item) => item.name)
      : [];

    if (items.length === 0) {
      return fail('A print job needs at least one item.', 400);
    }

    const type = JOB_TYPES.includes(String(body?.type)) ? String(body.type) : 'receipt';
    const width = toNumber(body?.width, 80) === 58 ? 58 : 80;

    // If the caller omits the total we derive it. Documented, but they should
    // send it explicitly whenever discounts, service or tax apply — otherwise the
    // printed total will disagree with what the customer actually paid.
    const derivedTotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);

    const job = await PrintJob.create({
      restaurantId: restaurant._id, // <-- from the key, never the body
      targetDeviceId: device._id,
      type,
      copies: Math.min(10, Math.max(1, Math.floor(toNumber(body?.copies, 1)))),
      width,
      content: {
        // The restaurant NAME is ours to fill in too. A caller cannot print a
        // receipt claiming to be from a different restaurant.
        restaurant: restaurant.name,
        orderNumber: String(rawContent.orderNumber ?? '').trim(),
        customer: String(rawContent.customer ?? '').trim(),
        phone: String(rawContent.phone ?? '').trim(),
        items,
        notes: String(rawContent.notes ?? '').trim(),
        total: toNumber(rawContent.total, derivedTotal),
      },
      status: 'queued',
    });

    console.log(
      `[print-jobs] queued ${job._id} (${type}) for "${restaurant.name}" -> device ${device._id}`
    );

    // The job is durable now. The agent collects it on its next poll (≤3s), or
    // whenever it next comes online if the till is currently offline — in which
    // case the job simply waits, which is exactly what should happen.
    return NextResponse.json(
      {
        id: String(job._id),
        status: job.status,
        createdAt: job.createdAt.toISOString(),
        targetDeviceId: String(device._id),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[print-jobs] error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
