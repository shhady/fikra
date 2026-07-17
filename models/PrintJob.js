import mongoose from 'mongoose';

/**
 * One thing to print.
 *
 * Lifecycle: queued -> printing -> completed | failed | cancelled
 *
 * A job stays visible to `GET /jobs` until the agent acknowledges it with a
 * completed/failed callback. It is NOT removed just because it was fetched — if
 * the till crashes between fetching and printing, the job must survive and be
 * handed out again. Duplicate delivery is safe: the agent deduplicates by job id
 * with a database primary key, so a job can be delivered many times and printed
 * exactly once.
 */
const JobItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    qty: { type: Number, default: 1, min: 1 },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const JobContentSchema = new mongoose.Schema(
  {
    /** Filled in by the server from the restaurant record — never from the caller. */
    restaurant: { type: String, default: '' },

    orderNumber: { type: String, default: '' },
    customer: { type: String, default: '' },
    phone: { type: String, default: '' },
    items: { type: [JobItemSchema], default: [] },
    notes: { type: String, default: '' },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

const PrintJobSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true,
  },

  targetDeviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
    index: true,
  },

  type: {
    type: String,
    enum: ['receipt', 'kitchen', 'label'],
    default: 'receipt',
  },

  copies: { type: Number, default: 1, min: 1, max: 10 },
  width: { type: Number, enum: [58, 80], default: 80 },

  content: { type: JobContentSchema, default: () => ({}) },

  status: {
    type: String,
    enum: ['queued', 'printing', 'completed', 'failed', 'cancelled'],
    default: 'queued',
    index: true,
  },

  attempts: { type: Number, default: 0 },

  /** Stable machine-readable code from the agent, e.g. PRINTER_OUT_OF_PAPER. */
  errorCode: { type: String, default: null },
  errorMessage: { type: String, default: null },

  /** Printer state as reported alongside the outcome. */
  printerStatus: { type: mongoose.Schema.Types.Mixed, default: null },

  createdAt: { type: Date, default: Date.now, index: true },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  failedAt: { type: Date, default: null },
  cancelledAt: { type: Date, default: null },
});

/** Supports the agent's "give me my outstanding jobs, oldest first" poll. */
PrintJobSchema.index({ targetDeviceId: 1, status: 1, createdAt: 1 });

export default mongoose.models.PrintJob || mongoose.model('PrintJob', PrintJobSchema);
