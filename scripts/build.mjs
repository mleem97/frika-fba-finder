import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const sharedFiles = [
  'background.js', 'content.js', 'detector.js', 'options.html', 'options.js',
  'popup.html', 'popup.js', 'ui.css', 'whats-new.html', 'whats-new.js',
  'PRIVACY.md', 'LICENSE',
];

await rm(dist, { recursive: true, force: true });
for (const target of ['chromium', 'firefox']) {
  const targetDir = path.join(dist, target);
  await mkdir(targetDir, { recursive: true });
  await Promise.all(sharedFiles.map((file) => cp(path.join(root, file), path.join(targetDir, file))));
  await cp(path.join(root, 'icons'), path.join(targetDir, 'icons'), { recursive: true });
  const manifest = await readFile(path.join(root, 'manifests', `manifest.${target}.json`), 'utf8');
  await writeFile(path.join(targetDir, 'manifest.json'), `${JSON.stringify(JSON.parse(manifest), null, 2)}\n`);
}

console.log('Built dist/chromium and dist/firefox');
