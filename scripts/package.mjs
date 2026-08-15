import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).version;
const artifacts = path.join(root, 'artifacts');
await rm(artifacts, { recursive: true, force: true });
await mkdir(artifacts, { recursive: true });

const outputs = [];
for (const target of ['chromium', 'firefox']) {
  const output = path.join(artifacts, `fba-finder-${version}-${target}.zip`);
  const result = spawnSync('zip', ['-X', '-q', '-r', output, '.'], {
    cwd: path.join(root, 'dist', target), encoding: 'utf8',
  });
  if (result.status !== 0) throw new Error(result.stderr || `zip failed for ${target}`);
  outputs.push(output);
  console.log(`Created ${path.relative(root, output)}`);
}

const checksums = [];
for (const output of outputs) {
  const digest = createHash('sha256').update(await readFile(output)).digest('hex');
  checksums.push(`${digest}  ${path.basename(output)}`);
}
await writeFile(path.join(artifacts, 'SHA256SUMS'), `${checksums.join('\n')}\n`);
