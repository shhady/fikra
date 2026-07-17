import mongoose from 'mongoose';

/**
 * The fleet update policy. A single document (singleton).
 *
 * This is the lever that stops one bad build from taking every till in the
 * country offline at dinner service. The agent asks BEFORE it downloads anything
 * and obeys the answer:
 *
 *   rolloutPercentage  Each agent hashes its own deviceId + version into a
 *                      stable bucket 0..99 and only updates if bucket < this.
 *                      Hold a release at 5% overnight, watch the crash rate,
 *                      then widen it.
 *
 *   minimumVersion     A floor that IGNORES the percentage. This is the rollback
 *                      lever: republish the good code as a higher version, set
 *                      the floor to it, and the broken cohort heals itself.
 *
 *   mandatory          Bypasses the rollout gate entirely.
 *
 * Never publish a new version straight to rolloutPercentage 100 — that throws
 * away the entire mechanism.
 */
const UpdatePolicySchema = new mongoose.Schema({
  /** Discriminator so there is exactly one policy document, ever. */
  key: { type: String, default: 'default', unique: true, index: true },

  latestVersion: { type: String, default: '1.0.0' },
  minimumVersion: { type: String, default: '0.0.0' },

  rolloutPercentage: { type: Number, default: 0, min: 0, max: 100 },
  mandatory: { type: Boolean, default: false },

  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.UpdatePolicy || mongoose.model('UpdatePolicy', UpdatePolicySchema);
