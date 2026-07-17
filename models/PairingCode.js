import mongoose from 'mongoose';

/**
 * A one-time code that binds a freshly installed agent to a restaurant.
 *
 * This is the only unauthenticated surface in the whole system, so it is the one
 * an attacker can actually reach. Three properties keep it safe:
 *
 *   1. Single use   — consumed atomically (see consume() below).
 *   2. Short lived  — ~10 minutes.
 *   3. Scoped       — a code minted for restaurant A can only ever produce a
 *                     device belonging to A. The restaurant is baked into the
 *                     code document at creation, not supplied at redemption.
 */
const PairingCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  },

  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true,
  },

  createdAt: { type: Date, default: Date.now },

  expiresAt: { type: Date, required: true },

  /** Non-null once redeemed. Presence of this value is what makes it single-use. */
  consumedAt: { type: Date, default: null },

  /** The device it produced, for the audit trail. */
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', default: null },
});

/**
 * Expired-but-unused codes clean themselves up an hour after expiry. We keep
 * them briefly past expiry so a user who types a stale code gets "expired"
 * rather than a confusing "no such code".
 */
PairingCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.models.PairingCode || mongoose.model('PairingCode', PairingCodeSchema);
