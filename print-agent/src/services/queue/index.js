'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { Database } = require('node-sqlite3-wasm');

const { createLogger } = require('../logger');
const { SCHEMA, RETENTION_MS, MAX_ATTEMPTS } = require('./schema');
const { JobState } = require('../../models/Job');

const logger = createLogger('queue');

/**
 * Durable, de-duplicating job queue backed by SQLite (WASM build — no native
 * compilation, so the agent installs on any Windows box and the project builds
 * on any CI runner).
 *
 * Crash semantics — the deliberate choice
 * ---------------------------------------
 * "Never lose a job" and "never print twice" are in genuine conflict at exactly
 * one moment: the machine dies after we hand bytes to the printer but before we
 * record success. We cannot know whether paper came out. Windows may well have
 * spooled it already.
 *
 * We resolve it in favour of NOT double-printing: on startup, any job left in
 * 'printing' is marked failed with PRINT_INTERRUPTED and reported to the server.
 * We never silently reprint it. The job is not lost — the backend knows exactly
 * what happened and can re-issue it as a NEW job id if the restaurant confirms
 * nothing came out. A duplicate receipt that silently charges a customer twice
 * is worse than a receipt a human is told to re-send.
 */
class JobQueue {
  /**
   * @param {object} deps
   * @param {string} deps.dbPath
   */
  constructor({ dbPath }) {
    this.dbPath = dbPath;
    /** @type {Database | null} */
    this.db = null;
  }

  /** Opens the database and applies the schema. */
  open() {
    fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });

    this.db = new Database(this.dbPath);

    // FULL means the write is on the platter before we consider a job durable.
    // A cashier PC gets its power cut by staff flipping the socket at closing
    // time; NORMAL would risk losing the last transaction group.
    this.db.run('PRAGMA synchronous = FULL');
    this.db.run('PRAGMA foreign_keys = ON');

    this.db.exec(SCHEMA);

    logger.info(`Queue opened at ${this.dbPath}`);

    this.recoverInterrupted();
    this.prune();
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /** @private @returns {Database} */
  get handle() {
    if (!this.db) throw new Error('Queue is not open.');
    return this.db;
  }

  /**
   * Jobs stuck in 'printing' at startup were interrupted by a crash or power
   * cut. See the class comment: we do not reprint them, we report them.
   * @private
   */
  recoverInterrupted() {
    const stuck = this.handle.all(`SELECT id FROM jobs WHERE state = ?`, [JobState.PRINTING]);

    if (stuck.length === 0) return;

    logger.warn(
      `${stuck.length} job(s) were interrupted mid-print by a crash or power loss. ` +
        'They will be reported as failed, not reprinted.'
    );

    this.handle.run(
      `UPDATE jobs
          SET state = ?, error_code = ?, last_error = ?, reported = 0, updated_at = ?
        WHERE state = ?`,
      [
        JobState.FAILED,
        'PRINT_INTERRUPTED',
        'Agent stopped while this job was printing; outcome unknown.',
        Date.now(),
        JobState.PRINTING,
      ]
    );
  }

  /**
   * Adds a job. Idempotent by job id — this is the dedupe guarantee.
   *
   * @param {import('../../models/Job').Job} job
   * @returns {boolean} true if newly queued, false if we had already seen it
   */
  enqueue(job) {
    const now = Date.now();

    const result = this.handle.run(
      `INSERT OR IGNORE INTO jobs (id, type, payload, state, received_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [job.id, job.type, JSON.stringify(job.raw), JobState.QUEUED, now, now]
    );

    const isNew = result.changes > 0;

    if (isNew) {
      logger.info(`Queued job ${job.id} (${job.type}, ${job.width}mm, ${job.copies} copies).`);
    } else {
      // Not an error — this is at-least-once delivery working as designed.
      logger.info(`Duplicate delivery of job ${job.id} ignored (already known).`);
    }

    return isNew;
  }

  /**
   * Atomically claims the oldest queued job and marks it 'printing'.
   *
   * The UPDATE ... WHERE state = 'queued' is what makes this atomic: if two
   * callers race, only one UPDATE reports changes > 0, so a job can never be
   * handed to two printers.
   *
   * @returns {{ id: string, payload: object, attempts: number } | null}
   */
  claimNext() {
    const row = this.handle.get(
      `SELECT id, payload, attempts
         FROM jobs
        WHERE state = ?
        ORDER BY received_at ASC
        LIMIT 1`,
      [JobState.QUEUED]
    );

    if (!row) return null;

    const claimed = this.handle.run(
      `UPDATE jobs SET state = ?, updated_at = ? WHERE id = ? AND state = ?`,
      [JobState.PRINTING, Date.now(), row.id, JobState.QUEUED]
    );

    // Lost the race to another claimer — let the caller try again.
    if (claimed.changes === 0) return null;

    /** @type {object} */
    let payload;

    try {
      payload = JSON.parse(String(row.payload));
    } catch {
      // Corrupt row: fail it permanently rather than crash-looping on it.
      this.markFailed(String(row.id), {
        errorCode: 'JOB_INVALID',
        errorMessage: 'Stored job payload is not valid JSON.',
        permanent: true,
      });
      return null;
    }

    return { id: String(row.id), payload, attempts: Number(row.attempts) };
  }

  /**
   * Marks a job printed. Called ONLY after the transport confirms the bytes
   * were accepted — never optimistically.
   *
   * @param {string} id
   */
  markPrinted(id) {
    const now = Date.now();

    this.handle.run(
      `UPDATE jobs
          SET state = ?, printed_at = ?, updated_at = ?, reported = 0, last_error = NULL, error_code = NULL
        WHERE id = ?`,
      [JobState.PRINTED, now, now, id]
    );

    logger.info(`Job ${id} printed.`);
  }

  /**
   * Records a failure. Retryable failures go back to 'queued' until MAX_ATTEMPTS
   * is exhausted; permanent ones (malformed job, unsupported type) fail at once,
   * because retrying them would fail identically forever.
   *
   * @param {string} id
   * @param {{ errorCode: string, errorMessage: string, permanent?: boolean }} failure
   * @returns {{ state: string, attempts: number }}
   */
  markFailed(id, failure) {
    const now = Date.now();

    const row = this.handle.get(`SELECT attempts FROM jobs WHERE id = ?`, [id]);
    const attempts = Number(row?.attempts ?? 0) + 1;

    const exhausted = failure.permanent || attempts >= MAX_ATTEMPTS;
    const state = exhausted ? JobState.FAILED : JobState.QUEUED;

    this.handle.run(
      `UPDATE jobs
          SET state = ?, attempts = ?, last_error = ?, error_code = ?, updated_at = ?,
              reported = CASE WHEN ? = 1 THEN 0 ELSE reported END
        WHERE id = ?`,
      [state, attempts, failure.errorMessage, failure.errorCode, now, exhausted ? 1 : 0, id]
    );

    if (exhausted) {
      logger.error(`Job ${id} failed permanently after ${attempts} attempt(s): ${failure.errorMessage}`);
    } else {
      logger.warn(
        `Job ${id} failed (attempt ${attempts}/${MAX_ATTEMPTS}), will retry: ${failure.errorMessage}`
      );
    }

    return { state, attempts };
  }

  /**
   * Marks that we successfully told the server about a job's outcome.
   * Until this is set, the job is re-reported on every reconnect — which is how
   * an outcome survives an outage between printing and acknowledging.
   *
   * @param {string} id
   */
  markReported(id) {
    this.handle.run(`UPDATE jobs SET reported = 1, updated_at = ? WHERE id = ?`, [Date.now(), id]);
  }

  /**
   * Outcomes we printed (or gave up on) but never managed to report, because the
   * internet was down at the time. Flushed on reconnect.
   *
   * @returns {Array<{ id: string, state: string, error_code: string|null, last_error: string|null, attempts: number }>}
   */
  unreportedOutcomes() {
    return this.handle.all(
      `SELECT id, state, error_code, last_error, attempts
         FROM jobs
        WHERE reported = 0 AND state IN (?, ?)
        ORDER BY updated_at ASC`,
      [JobState.PRINTED, JobState.FAILED]
    );
  }

  /**
   * Ids of everything still outstanding locally — sent to the server on
   * reconnect so both sides can agree on what is still owed.
   *
   * @returns {string[]}
   */
  outstandingIds() {
    return this.handle
      .all(`SELECT id FROM jobs WHERE state IN (?, ?)`, [JobState.QUEUED, JobState.PRINTING])
      .map((row) => String(row.id));
  }

  /**
   * Drops jobs the server says it has cancelled (e.g. the restaurant voided the
   * order while we were offline). Printing a cancelled order is worse than not
   * printing it.
   *
   * @param {string[]} ids
   * @returns {number} how many were dropped
   */
  cancel(ids) {
    if (!ids.length) return 0;

    let dropped = 0;

    for (const id of ids) {
      const result = this.handle.run(
        `DELETE FROM jobs WHERE id = ? AND state IN (?, ?)`,
        [id, JobState.QUEUED, JobState.PRINTING]
      );
      dropped += result.changes;
    }

    if (dropped) logger.warn(`Dropped ${dropped} job(s) cancelled by the server.`);

    return dropped;
  }

  /** @returns {number} jobs waiting to print (what the heartbeat reports) */
  size() {
    const row = this.handle.get(`SELECT COUNT(*) AS n FROM jobs WHERE state IN (?, ?)`, [
      JobState.QUEUED,
      JobState.PRINTING,
    ]);

    return Number(row?.n ?? 0);
  }

  /** @returns {number|null} epoch ms of the last successful print */
  lastPrintAt() {
    const row = this.handle.get(`SELECT MAX(printed_at) AS at FROM jobs`);
    const value = Number(row?.at ?? 0);

    return value > 0 ? value : null;
  }

  /**
   * @returns {{ queued: number, printing: number, printed: number, failed: number }}
   */
  stats() {
    const rows = this.handle.all(`SELECT state, COUNT(*) AS n FROM jobs GROUP BY state`);

    const stats = { queued: 0, printing: 0, printed: 0, failed: 0 };

    for (const row of rows) {
      const key = String(row.state);
      if (key in stats) stats[key] = Number(row.n);
    }

    return stats;
  }

  /**
   * Deletes terminal jobs older than the retention window. Keeps the dedupe
   * memory bounded without ever forgetting a job that could still be redelivered.
   */
  prune() {
    const cutoff = Date.now() - RETENTION_MS;

    const result = this.handle.run(
      `DELETE FROM jobs
        WHERE state IN (?, ?)
          AND reported = 1
          AND updated_at < ?`,
      [JobState.PRINTED, JobState.FAILED, cutoff]
    );

    if (result.changes > 0) {
      logger.info(`Pruned ${result.changes} job(s) older than 7 days.`);
    }
  }
}

module.exports = { JobQueue, MAX_ATTEMPTS };
