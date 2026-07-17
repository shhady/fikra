import { handleJobCallback } from '@/lib/printer/jobCallback';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/printer/v1/jobs/{id}/failed
 *
 * Body: { errorCode, errorMessage, printerStatus, attempts }
 *
 * Watch for errorCode PRINT_INTERRUPTED — it means the till died mid-print and
 * nobody knows whether paper came out. The agent deliberately does NOT reprint
 * those. Surface them to a human; if you re-issue the job, use a NEW job id, or
 * the agent will dedupe it away.
 */
export async function POST(request, { params }) {
  return handleJobCallback(request, await params, 'failed');
}
