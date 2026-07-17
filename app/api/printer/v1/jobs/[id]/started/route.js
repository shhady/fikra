import { handleJobCallback } from '@/lib/printer/jobCallback';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/printer/v1/jobs/{id}/started
 *
 * Best-effort. The agent does not block printing on this succeeding — a receipt
 * must come out even if we are unreachable at that instant.
 */
export async function POST(request, { params }) {
  // Next 15+ makes route params a promise.
  return handleJobCallback(request, await params, 'started');
}
