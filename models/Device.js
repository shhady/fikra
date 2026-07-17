import mongoose from 'mongoose';

/**
 * One installed Print Agent — i.e. one till.
 *
 * `tokenHash` is the anchor of the entire trust model. When an agent calls us it
 * presents a device token; we hash it, look up THIS document, and read
 * `restaurantId` from it. The restaurant is therefore derived from the
 * credential and can never be asserted by the caller.
 *
 * The token itself is never stored. If this collection leaks, nobody can
 * impersonate a till.
 */
const DeviceSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true,
  },

  /** SHA-256 of the device token. Unique so two devices can never share one. */
  tokenHash: { type: String, required: true, unique: true, index: true },

  hostname: { type: String, default: '' },
  os: { type: String, default: '' },
  agentVersion: { type: String, default: '' },

  /**
   * The device jobs go to when the caller does not name one. A restaurant with a
   * single till (the common case) never has to think about this.
   */
  isDefault: { type: Boolean, default: false },

  /** Set by the operator; the agent honours it on its next heartbeat. */
  paused: { type: Boolean, default: false },

  /**
   * Commands waiting to be collected on the next heartbeat. This is how remote
   * control works without any inbound port on the restaurant's network: we never
   * push, the agent asks.
   */
  pendingCommands: { type: [mongoose.Schema.Types.Mixed], default: [] },

  // ---- Last known state, refreshed every heartbeat (60s) ----
  lastHeartbeatAt: { type: Date, default: null },
  lastPrintAt: { type: Date, default: null },
  queueSize: { type: Number, default: 0 },
  printerStatus: { type: mongoose.Schema.Types.Mixed, default: null },
  socketConnected: { type: Boolean, default: false },
  lastCrash: { type: mongoose.Schema.Types.Mixed, default: null },

  pairedAt: { type: Date, default: Date.now },

  /** Revocation. A revoked token is rejected on the next request. */
  revokedAt: { type: Date, default: null },
});

/**
 * A device is considered online if we heard from it within ~2.5 heartbeats.
 * Heartbeats are every 60s, so 150s tolerates one lost beat without flapping.
 * @returns {boolean}
 */
DeviceSchema.methods.isOnline = function isOnline() {
  if (!this.lastHeartbeatAt) return false;
  return Date.now() - this.lastHeartbeatAt.getTime() < 150 * 1000;
};

export default mongoose.models.Device || mongoose.model('Device', DeviceSchema);
