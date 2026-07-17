import { handleJobCallback } from '@/lib/printer/jobCallback';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/printer/v1/jobs/{id}/completed
 *
 * Idempotent: a second call for an already-completed job returns 200, not an
 * error. See lib/printer/jobCallback.js for why that is load-bearing.
 */
export async function POST(request, { params }) {
  return handleJobCallback(request, await params, 'completed');
}
