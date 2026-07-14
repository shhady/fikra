import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

/**
 * `paper`, `carbon` and `rail` are residue of an earlier print-metaphor design
 * system. They are defined nowhere, so Tailwind emits nothing and the class is a
 * silent no-op — the same failure that hid a broken Header CTA. This test makes
 * a reintroduction fail loudly.
 */
const DEAD_TOKENS = /\b(?:bg|text|border|ring|divide|from|to|via)-(?:paper|carbon|rail)\b/;

async function sourceFiles(dir, acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await sourceFiles(full, acc);
    else if (/\.(js|jsx)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

test('no dead design tokens remain in app/ or components/', async () => {
  const files = [
    ...(await sourceFiles(path.join(repoRoot, 'app'))),
    ...(await sourceFiles(path.join(repoRoot, 'components'))),
  ];

  const offenders = [];
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    if (DEAD_TOKENS.test(source)) offenders.push(path.relative(repoRoot, file));
  }

  assert.deepEqual(offenders, [], `dead tokens still used in: ${offenders.join(', ')}`);
});

test('.perf is defined in globals.css', async () => {
  const css = await readFile(path.join(repoRoot, 'app', 'globals.css'), 'utf8');
  assert.match(css, /^\s*\.perf\s*\{/m, '.perf is used in 3 components but defined nowhere');
});
