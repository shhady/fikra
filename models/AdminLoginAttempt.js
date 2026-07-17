import mongoose from 'mongoose';

/**
 * Audit trail of admin login attempts, used for brute-force rate limiting.
 *
 * Stored in MongoDB rather than in process memory because the app runs on
 * serverless functions — an in-memory counter would reset on every cold start
 * and would not be shared across concurrent instances, making it trivial to
 * bypass. Rows self-delete after 24h via a TTL index.
 */
const AdminLoginAttemptSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    index: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  success: {
    type: Boolean,
    required: true,
    default: false,
  },
  userAgent: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // TTL: MongoDB removes the document 24h after createdAt.
    expires: 60 * 60 * 24,
  },
});

// Supports "recent failures for this IP" lookups.
AdminLoginAttemptSchema.index({ ip: 1, success: 1, createdAt: -1 });

export default mongoose.models.AdminLoginAttempt ||
  mongoose.model('AdminLoginAttempt', AdminLoginAttemptSchema);
