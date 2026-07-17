'use strict';

const { app } = require('electron');

const { createLogger } = require('../services/logger');

const logger = createLogger('watchdog');

/** How often the watchdog checks that the agent is still doing its job. */
const CHECK_INTERVAL_MS = 60000;

/**
 * If the job pump has not run in this long while jobs are waiting, something is
 * wedged. 10 minutes is far longer than any legitimate print, retry or backoff.
 */
const STALL_THRESHOLD_MS = 10 * 60 * 1000;

/**
 * Restarts are rate-limited: if restarting does not fix the problem, restarting
 * forty more times will not either, and a crash-loop that respawns instantly is
 * worse than a process that stays down where someone will notice it.
 */
const MAX_RESTARTS_PER_HOUR = 3;

/**
 * Liveness watchdog.
 *
 * The failure this exists for is not a crash — a crash is handled, logged, and
 * the process exits so Windows/auto-launch brings it back. The nastier failure is
 * the agent that is still *running* but has silently stopped working: a promise
 * that never settled, a socket callback that threw and unwound the pump, a
 * printer call wedged on a driver that never returns.
 *
 * From the outside that looks identical to a healthy idle agent. The only way to
 * tell them apart is to check whether work that *should* be moving is moving:
 * if jobs are queued and nothing has been attempted for ten minutes, the agent is
 * stuck, and the safest thing we can do is restart it clean.
 */
class Watchdog {
  /**
   * @param {object} deps
   * @param {() => { queueSize: number, lastPumpAt: number }} deps.getState
   * @param {() => void} deps.onStall called before the restart, to flush state
   */
  constructor({ getState, onStall }) {
    this.getState = getState;
    this.onStall = onStall;

    /** @type {NodeJS.Timeout | null} */
    this.timer = null;

    /** @type {number[]} epoch ms of recent restarts */
    this.restarts = [];
  }

  start() {
    if (this.timer) return;

    this.timer = setInterval(() => this.check(), CHECK_INTERVAL_MS);
    logger.info('Watchdog started.');
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** @private */
  check() {
    const { queueSize, lastPumpAt } = this.getState();

    // An idle agent with an empty queue is healthy, not stalled.
    if (queueSize === 0) return;

    const idleFor = Date.now() - lastPumpAt;

    if (idleFor < STALL_THRESHOLD_MS) return;

    logger.error(
      `Watchdog: ${queueSize} job(s) queued but the pump has not run for ` +
        `${Math.round(idleFor / 1000)}s. The agent appears stalled.`
    );

    this.restart();
  }

  /** @private */
  restart() {
    const hourAgo = Date.now() - 60 * 60 * 1000;
    this.restarts = this.restarts.filter((at) => at > hourAgo);

    if (this.restarts.length >= MAX_RESTARTS_PER_HOUR) {
      logger.error(
        `Watchdog: already restarted ${this.restarts.length} times this hour. ` +
          'Refusing to restart again — this needs a human. The agent will keep ' +
          'running (and keep queueing jobs) so nothing is lost.'
      );
      return;
    }

    this.restarts.push(Date.now());

    try {
      this.onStall();
    } catch (error) {
      logger.error(`Watchdog cleanup failed: ${error.message}`);
    }

    logger.warn('Watchdog: restarting the agent.');

    // relaunch() queues a new instance to start as this one exits; exit(0) then
    // lets the single-instance lock go so the new process can take it.
    app.relaunch();
    app.exit(0);
  }
}

module.exports = { Watchdog, STALL_THRESHOLD_MS };
