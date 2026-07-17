#!/usr/bin/env node
/**
 * Publishes a built release to Tigris (S3-compatible object storage).
 *
 * Uploads the three files electron-updater needs, and the one a human needs:
 *
 *   FikraNovaPrinterSetup.exe            the installer (what customers download)
 *   FikraNovaPrinterSetup.exe.blockmap   lets updates download only changed chunks
 *   latest.yml                           version + SHA-512; this is what agents poll
 *
 * Why the binary is not in git
 * ----------------------------
 * It is ~96 MB. GitHub hard-blocks files over 100 MB, and git history is forever —
 * every release would add another ~96 MB blob that can never be removed. Five
 * versions in, a `git clone` drags down half a gigabyte. Object storage is where
 * build artifacts belong.
 *
 * Usage:
 *   npm run dist          # build first
 *   npm run release       # then upload
 *
 * Required environment (same names your other projects already use):
 *   TIGRIS_BUCKET          bucket name, e.g. fikranova-releases
 *   AWS_ACCESS_KEY_ID
 *   AWS_SECRET_ACCESS_KEY
 *   AWS_ENDPOINT_URL_S3    e.g. https://t3.storage.dev
 *   AWS_REGION             'auto' if unset
 *   TIGRIS_PUBLIC_HOST     public host, e.g. fikranova-releases.t3.storage.dev
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

/**
 * Loads environment from print-agent/.env, then falls back to the site's .env in
 * the parent directory — which is where the Tigris credentials already live.
 *
 * Copying secrets into a second file is how they end up committed: two copies
 * drift, one of them gets moved somewhere unwatched, and eventually one is not
 * gitignored. Read the existing file instead.
 *
 * Hand-rolled rather than pulling in dotenv, because this is a build script and
 * the whole point of the project is having no dependency it does not need. Values
 * are NOT expanded: the Next.js site learned that the hard way when dotenv's
 * `$VAR` expansion silently ate the admin password hash.
 */
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return false;

  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // First file to define a key wins, and a real shell variable beats both.
    if (!(key in process.env)) process.env[key] = value;
  }

  return true;
}

loadEnvFile(path.join(ROOT, '.env'));
loadEnvFile(path.join(ROOT, '..', '.env'));

/**
 * No key prefix: the bucket is already called `print-agent`, and a `print-agent/`
 * prefix inside it would make every URL read `…/print-agent/print-agent/…`.
 * Artifacts sit at the bucket root.
 */
const PREFIX = '';

const BUCKET = process.env.TIGRIS_BUCKET_NAME || process.env.TIGRIS_BUCKET;

/** Full public base URL, e.g. https://print-agent.t3.tigrisfiles.io */
const PUBLIC_BASE = (process.env.PUBLIC_ACCESS_URL || '').replace(/\/+$/, '');

const ENDPOINT = process.env.AWS_ENDPOINT_URL_S3 || process.env.TIGRIS_STORAGE_ENDPOINT;

/**
 * The three artifacts, and how each should be cached.
 *
 * The cache headers are the important part, and the easiest thing to get wrong:
 *
 *   latest.yml  MUST be near-uncached. It is the file every agent polls to decide
 *               whether to update. If a CDN holds it for an hour, your staged
 *               rollout is an hour late — and far worse, so is your ROLLBACK.
 *               An hour of tills taking a broken build because a cache was warm.
 *
 *   the .exe    Can be cached hard. Its content never changes for a given version,
 *               and a new version arrives under the same name only after latest.yml
 *               has already changed — which is why latest.yml is the one that must
 *               stay fresh.
 */
const ARTIFACTS = [
  {
    file: 'FikraNovaPrinterSetup.exe',
    contentType: 'application/octet-stream',
    cacheControl: 'public, max-age=300',
    required: true,
  },
  {
    file: 'FikraNovaPrinterSetup.exe.blockmap',
    contentType: 'application/octet-stream',
    cacheControl: 'public, max-age=300',
    required: false,
  },
  {
    file: 'latest.yml',
    contentType: 'text/yaml; charset=utf-8',
    cacheControl: 'no-cache, max-age=0, must-revalidate',
    required: true,
  },
];

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

function checkEnv() {
  const missing = [
    ['TIGRIS_BUCKET_NAME', BUCKET],
    ['AWS_ACCESS_KEY_ID', process.env.AWS_ACCESS_KEY_ID],
    ['AWS_SECRET_ACCESS_KEY', process.env.AWS_SECRET_ACCESS_KEY],
    ['AWS_ENDPOINT_URL_S3', ENDPOINT],
    ['PUBLIC_ACCESS_URL', PUBLIC_BASE],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length) {
    fail(
      `Missing environment: ${missing.join(', ')}\n\n` +
        '  These live in the site .env (fikra/.env), which this script already reads.\n' +
        '  Expected:\n' +
        '    TIGRIS_BUCKET_NAME=print-agent\n' +
        '    PUBLIC_ACCESS_URL=https://print-agent.t3.tigrisfiles.io\n' +
        '    AWS_ENDPOINT_URL_S3=https://t3.storage.dev\n' +
        '    AWS_REGION=auto\n' +
        '    AWS_ACCESS_KEY_ID=...\n' +
        '    AWS_SECRET_ACCESS_KEY=...'
    );
  }
}

/**
 * @param {string} file
 * @returns {string} object key in the bucket
 */
function keyFor(file) {
  return PREFIX ? `${PREFIX}/${file}` : file;
}

/** @param {string} file @returns {string} */
function sha256(file) {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 12);
}

/** @param {number} bytes @returns {string} */
function mb(bytes) {
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

async function main() {
  checkEnv();

  if (!fs.existsSync(DIST)) {
    fail('No dist/ directory. Run `npm run dist` first.');
  }

  const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;

  const client = new S3Client({
    region: process.env.AWS_REGION || 'auto',
    endpoint: ENDPOINT,
    // Tigris uses virtual-hosted-style URLs, same as your other projects.
    forcePathStyle: false,
  });

  console.log(`\n  Publishing FikraNova Print Agent v${version}`);
  console.log(`  Bucket: ${BUCKET}  ->  ${PUBLIC_BASE}\n`);

  const uploaded = [];

  for (const artifact of ARTIFACTS) {
    const local = path.join(DIST, artifact.file);

    if (!fs.existsSync(local)) {
      if (artifact.required) fail(`Missing ${artifact.file} — run \`npm run dist\` first.`);

      console.log(`  skip   ${artifact.file} (not built)`);
      continue;
    }

    const body = fs.readFileSync(local);
    const key = keyFor(artifact.file);

    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: artifact.contentType,
        CacheControl: artifact.cacheControl,
        // The installer is generic and carries no customer identity — it is inert
        // until someone types a one-time pairing code into it. So a public object
        // is not a leak; it is the whole distribution model.
        ACL: 'public-read',
        Metadata: { version },
      })
    );

    const url = `${PUBLIC_BASE}/${key}`;

    console.log(`  up     ${artifact.file.padEnd(36)} ${mb(body.length).padStart(9)}  ${sha256(local)}`);

    uploaded.push({ ...artifact, key, url, size: body.length });
  }

  // ---- verify the objects are actually reachable ---------------------------
  //
  // A silent ACL/bucket-policy problem is the classic failure here: the upload
  // succeeds, and the download 403s for everyone but you. Check it now rather
  // than when a restaurant owner calls.
  console.log('');

  for (const artifact of uploaded) {
    await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: artifact.key }));

    const response = await fetch(artifact.url, { method: 'HEAD' });

    if (!response.ok) {
      fail(
        `${artifact.file} uploaded, but ${artifact.url} returns HTTP ${response.status}.\n` +
          '  The bucket is probably not public. In the Tigris dashboard, make the\n' +
          '  bucket public (or add a public-read policy for this prefix).'
      );
    }

    console.log(`  ok     ${artifact.url}`);
  }

  const base = `${PUBLIC_BASE}/`;

  console.log('\n  ' + '-'.repeat(72));
  console.log(`  Published v${version}.\n`);
  console.log('  Set this in Vercel (Settings -> Environment Variables):\n');
  console.log(`    INSTALLER_DOWNLOAD_URL=${base}FikraNovaPrinterSetup.exe\n`);
  console.log('  The Download button in /admin/printers then works immediately, and');
  console.log(`  agents already poll ${base}latest.yml for updates.`);
  console.log('  ' + '-'.repeat(72) + '\n');
}

main().catch((error) => {
  console.error(`\n  Upload failed: ${error.message}\n`);
  process.exit(1);
});
