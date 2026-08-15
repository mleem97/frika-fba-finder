import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageVersion = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).version;
const required = [
  'background.js', 'content.js', 'detector.js', 'popup.html', 'popup.js',
  'options.html', 'options.js', 'ui.css', 'whats-new.html', 'whats-new.js',
  'icons/icon16.png', 'icons/icon48.png', 'icons/icon128.png',
];

for (const target of ['chromium', 'firefox']) {
  const manifestPath = path.join(root, 'manifests', `manifest.${target}.json`);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (manifest.manifest_version !== 3) throw new Error(`${target}: manifest_version must be 3`);
  if (manifest.version !== packageVersion) throw new Error(`${target}: version does not match package.json`);
  if (target === 'chromium' && !manifest.background?.service_worker) throw new Error('Chromium service worker missing');
  if (target === 'firefox' && !manifest.background?.scripts) throw new Error('Firefox background scripts missing');
  if (target === 'firefox' && manifest.browser_specific_settings?.gecko?.data_collection_permissions?.required?.[0] !== 'none') {
    throw new Error('Firefox data collection declaration missing');
  }
  if (!manifest.content_scripts?.[0]?.js?.includes('detector.js')) throw new Error(`${target}: detector content script missing`);
}

await Promise.all(required.map((file) => access(path.join(root, file))));
for (const htmlFile of ['popup.html', 'options.html', 'whats-new.html']) {
  const html = await readFile(path.join(root, htmlFile), 'utf8');
  if (/<script(?![^>]+src=)/i.test(html)) throw new Error(`${htmlFile}: inline script detected`);
  if (/https?:\/\//i.test(html)) throw new Error(`${htmlFile}: remote resource detected`);
}

console.log('Validated Chromium and Firefox manifests and extension assets');
