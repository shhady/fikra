'use strict';

/**
 * Exponential backoff with full jitter.
 *
 * The jitter is not cosmetic. When our server restarts, every agent in the
 * fleet notices within the same second and would otherwise reconnect in
 * lockstep, re-creating the outage we just recovered from (a thundering herd).
 * Full jitter — picking uniformly from [0, cap] rather than a fixed delay —
 * spreads thousands of reconnects across the whole window.
 *
 * See: AWS Architecture Blog, "Exponential Backoff And Jitter".
 */
class Backoff {
  /**
   * @param {object} [options]
   * @param {number} [options.initialDelayMs] delay after the first failure
   * @param {number} [options.maxDelayMs] ceiling for the exponential growth
   * @param {number} [options.factor] multiplier per consecutive failure
   */
  constructor(options = {}) {
    this.initialDelayMs = options.initialDelayMs ?? 1000;
    this.maxDelayMs = options.maxDelayMs ?? 60000;
    this.factor = options.factor ?? 2;
    this.attempt = 0;
  }

  /**
   * Consumes one attempt and returns how long to wait before it.
   * @returns {number} milliseconds to sleep
   */
  nextDelay() {
    const exponential = this.initialDelayMs * Math.pow(this.factor, this.attempt);
    const cap = Math.min(exponential, this.maxDelayMs);

    this.attempt += 1;

    // Full jitter: uniform in [0, cap]. Floor at 100ms so a burst of failures
    // cannot spin us into a hot loop.
    return Math.max(100, Math.floor(Math.random() * cap));
  }

  /**
   * Call after a successful connection so the next failure starts over.
   */
  reset() {
    this.attempt = 0;
  }
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { Backoff, sleep };
