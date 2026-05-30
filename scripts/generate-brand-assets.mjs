import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const coversDir = path.join(root, 'public/covers');

const covers = [
  {
    slug: 'zouk',
    title: 'Zouk',
    category: 'Agent collaboration runtime',
    lines: ['Shared channels, tasks, threads, activity feeds, and live agents.'],
    signal: 'The operating room for human-agent work.',
    url: 'zouk.zaynjarvis.com',
    accent: '#0f766e',
    secondary: '#0ea5e9',
  },
  {
    slug: 'notes',
    title: 'Notes',
    category: 'Public thinking system',
    lines: ['Judgment updates, mental models, and durable public artifacts.'],
    signal: 'Compressed learning that can be reused.',
    url: 'notes.zaynjarvis.com',
    accent: '#b45309',
    secondary: '#2563eb',
  },
  {
    slug: 'studio',
    title: 'Studio',
    category: 'Creative production surface',
    lines: ['Media generation, project previews, and embedded collaboration.'],
    signal: 'Artifacts visible enough to judge and iterate.',
    url: 'studio.zaynjarvis.com',
    accent: '#7c3aed',
    secondary: '#db2777',
  },
  {
    slug: 'openviking',
    title: 'OpenViking',
    category: 'Context infrastructure',
    lines: ['Memory, provenance, rehydration, and context lifecycle.'],
    signal: 'Runtime state that survives beyond one session.',
    url: 'openviking.ai',
    accent: '#047857',
    secondary: '#0891b2',
  },
  {
    slug: 'openclaw',
    title: 'OpenClaw',
    category: 'Personal assistant system',
    lines: ['A user-facing assistant layer over local and cloud agent capability.'],
    signal: 'Capability made reachable through a product surface.',
    url: 'openclaw.ai',
    accent: '#1d4ed8',
    secondary: '#0f766e',
  },
  {
    slug: 'aesthetics',
    title: 'Aesthetics',
    category: 'Visual reference workbook',
    lines: ['Design styles, image prompts, and reusable taste references.'],
    signal: 'A taste bank for product and media direction.',
    url: 'gallery.zaynjarvis.com',
    accent: '#c2410c',
    secondary: '#9333ea',
  },
];

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function coverSvg(item) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-label="${esc(item.title)} project cover">
  <defs>
    <linearGradient id="accent" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${item.accent}"/>
      <stop offset="1" stop-color="${item.secondary}"/>
    </linearGradient>
    <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M80 0H0V80" fill="none" stroke="#d8dee9" stroke-width="2"/>
    </pattern>
  </defs>
  <rect width="1600" height="900" fill="#f8fafc"/>
  <rect width="1600" height="900" fill="url(#grid)" opacity="0.42"/>
  <rect x="72" y="72" width="1456" height="756" rx="34" fill="#ffffff" stroke="#111827" stroke-width="3"/>
  <rect x="72" y="72" width="1456" height="18" fill="url(#accent)"/>
  <circle cx="1330" cy="256" r="148" fill="url(#accent)" opacity="0.12"/>
  <rect x="1130" y="520" width="278" height="136" rx="22" fill="#111827"/>
  <path d="M1180 610h176M1180 568h94M1180 652h134" stroke="#f8fafc" stroke-width="18" stroke-linecap="round"/>
  <path d="M1374 560l62 48-62 48" fill="none" stroke="${item.secondary}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="128" y="172" fill="${item.accent}" font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="34" font-weight="700" letter-spacing="0">${esc(item.category).toUpperCase()}</text>
  <text x="128" y="356" fill="#111827" font-family="'Instrument Serif', Georgia, serif" font-size="148" font-weight="400" letter-spacing="0">${esc(item.title)}</text>
  <text x="132" y="470" fill="#334155" font-family="'Space Grotesk', Arial, sans-serif" font-size="48" font-weight="600" letter-spacing="0">${esc(item.lines[0])}</text>
  <rect x="128" y="570" width="14" height="122" rx="7" fill="${item.accent}"/>
  <text x="174" y="620" fill="#111827" font-family="'Space Grotesk', Arial, sans-serif" font-size="42" font-weight="700" letter-spacing="0">${esc(item.signal)}</text>
  <text x="174" y="686" fill="#64748b" font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="30" font-weight="600" letter-spacing="0">${esc(item.url)}</text>
  <text x="128" y="780" fill="#111827" font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="28" font-weight="700" letter-spacing="0">ZAYNJARVIS.COM / PROJECT COVER</text>
</svg>
`;
}

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = makeCrcTable();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function png(width, height, draw) {
  const rgba = Buffer.alloc(width * height * 4);
  const set = (x, y, color) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = (y * width + x) * 4;
    rgba[i] = color[0];
    rgba[i + 1] = color[1];
    rgba[i + 2] = color[2];
    rgba[i + 3] = color[3];
  };
  draw({ width, height, set });

  const rows = [];
  for (let y = 0; y < height; y += 1) {
    rows.push(Buffer.from([0]), rgba.subarray(y * width * 4, (y + 1) * width * 4));
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(Buffer.concat(rows))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function drawIcon(size) {
  return png(size, size, ({ width, height, set }) => {
    const ink = [17, 24, 39, 255];
    const paper = [248, 250, 252, 255];
    const accent = [15, 118, 110, 255];
    const border = Math.round(size * 0.1);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        set(x, y, ink);
      }
    }
    const line = Math.max(10, Math.round(size * 0.085));
    const x1 = border * 1.55;
    const x2 = size - border * 1.55;
    const yTop = border * 1.65;
    const yBottom = size - border * 1.65;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const top = Math.abs(y - yTop) < line / 2 && x >= x1 && x <= x2;
        const bottom = Math.abs(y - yBottom) < line / 2 && x >= x1 && x <= x2;
        const dx = x2 - x1;
        const dy = yTop - yBottom;
        const distance = Math.abs(dy * x - dx * y + x2 * yBottom - yTop * x1) / Math.hypot(dx, dy);
        const diagonal = distance < line / 2 && x >= x1 && x <= x2 && y >= yTop && y <= yBottom;
        if (top || bottom || diagonal) set(x, y, paper);
      }
    }
    for (let y = Math.round(yBottom - line / 2); y < Math.round(yBottom + line / 2); y += 1) {
      for (let x = Math.round(x1); x < Math.round(x1 + size * 0.16); x += 1) set(x, y, accent);
    }
  });
}

async function main() {
  await mkdir(coversDir, { recursive: true });
  for (const item of covers) {
    await writeFile(path.join(coversDir, `${item.slug}.svg`), coverSvg(item));
  }
  await writeFile(path.join(root, 'public/icon-192.png'), drawIcon(192));
  await writeFile(path.join(root, 'public/icon-512.png'), drawIcon(512));
  await writeFile(path.join(root, 'public/maskable-icon-512.png'), drawIcon(512));
  await writeFile(path.join(root, 'public/apple-touch-icon.png'), drawIcon(180));
  console.log(`Generated ${covers.length} covers and PWA icons.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
