import { access, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

const requiredAssets = [
  'public/covers/zouk.png',
  'public/covers/notes.png',
  'public/covers/studio.png',
  'public/covers/openviking.png',
  'public/covers/openclaw.png',
  'public/covers/aesthetics.png',
  'public/covers/registry-fallback.png',
  'public/favicon.png',
  'public/icon-192.png',
  'public/icon-512.png',
  'public/maskable-icon-512.png',
  'public/apple-touch-icon.png',
  'public/og-cover.png',
];

async function verifyAsset(relativePath) {
  const fullPath = path.join(root, relativePath);
  await access(fullPath);
  const info = await stat(fullPath);
  if (!info.isFile() || info.size === 0) {
    throw new Error(`${relativePath} is missing or empty`);
  }
}

async function main() {
  await Promise.all(requiredAssets.map(verifyAsset));
  console.log(`Verified ${requiredAssets.length} imagegen PNG assets.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
