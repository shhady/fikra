'use strict';

/**
 * Offline job queue schema.
 *
 * The single most important line here is `id TEXT PRIMARY KEY`.
 *
 * The server may deliver the same job twice — over the socket AND over the
 * polling fallback, or twice over the socket after a reconnect where our ACK
 * was lost in flight. At-least-once delivery is the only thing a network can
 * honestly promise. The primary key turns that into exactly-once *printing*:
 * an INSERT OR IGNORE of a job we have already seen is a no-op, whatever state
 * that job is in. Dedupe is therefore enforced by the database, not by
 * application logic that could be raced by two callbacks arriving together.
 *
 * This is also why printed jobs are NOT deleted immediately (see RETENTION_MS):
 * if we forgot a job the moment we printed it, a duplicate delivery an hour
 * later would sail through and print a second receipt.
 */
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS jobs (
    id           TEXT PRIMARY KEY,
    type         TEXT NOT NULL,
    payload      TEXT NOT NULL,
    state        TEXT NOT NULL DEFAULT 'queued',
    attempts     INTEGER NOT NULL DEFAULT 0,
    last_error   TEXT,
    error_code   TEXT,
    received_at  INTEGER NOT NULL,
    updated_at   INTEGER NOT NULL,
    printed_at   INTEGER,
    reported     INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_jobs_state       ON jobs (state, received_at);
  CREATE INDEX IF NOT EXISTS idx_jobs_reported    ON jobs (reported, state);
  CREATE INDEX IF NOT EXISTS idx_jobs_printed_at  ON jobs (printed_at);
`;

/**
 * How long a printed/failed job is remembered purely so it can be deduped.
 *
 * Seven days comfortably outlives any realistic redelivery window (a server
 * retry storm, an agent offline over a weekend) while keeping the database
 * small enough to stay fast on a cheap cashier PC.
 */
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * A job is retried this many times before it is given up on and reported as
 * permanently failed. Transient causes (printer out of paper, cover open) are
 * the reason retries exist at all — staff fix them within minutes.
 */
const MAX_ATTEMPTS = 5;

module.exports = { SCHEMA, RETENTION_MS, MAX_ATTEMPTS };
