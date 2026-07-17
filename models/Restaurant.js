import mongoose from 'mongoose';

/**
 * A tenant. Every device, pairing code and print job belongs to exactly one.
 *
 * API keys are stored HASHED, never in plaintext — the same way passwords are.
 * We never need to read a key back; we only ever need to check whether the key
 * a caller presented matches one we issued. Storing them in the clear would mean
 * a read-only leak of this collection hands an attacker the ability to print
 * into every restaurant on the platform.
 */
const ApiKeySchema = new mongoose.Schema(
  {
    /** SHA-256 of the key. The only copy we keep. */
    hash: { type: String, required: true, index: true },

    /** First few characters, e.g. "rk_live_8c2f…", so the UI can show which key is which. */
    prefix: { type: String, required: true },

    label: { type: String, default: 'default' },
    createdAt: { type: Date, default: Date.now },

    /** Set to disable a key without deleting it (keeps the audit trail intact). */
    revokedAt: { type: Date, default: null },
  },
  { _id: false }
);

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },

  apiKeys: { type: [ApiKeySchema], default: [] },

  createdAt: { type: Date, default: Date.now },
  disabledAt: { type: Date, default: null },
});

export default mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema);
