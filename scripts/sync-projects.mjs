import { Buffer } from 'node:buffer';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const owner = 'ZaynJarvis';
const generatedAt = new Date().toISOString();
const outFile = path.join(process.cwd(), 'public/data/projects.json');
const includeRepos = new Map([
  ['zouk', { priority: 100, signal: 'The operating room where agents and people coordinate real work.' }],
  ['notes', { priority: 95, signal: 'Judgment updates turned into durable public artifacts.' }],
  ['studio', {
    priority: 90,
    homepage: 'https://studio.zaynjarvis.com',
    category: 'Creative production surface',
    summary: 'A visual workflow surface for media generation, project previews, and embedded Zouk collaboration.',
    signal: 'Where artifacts become visible enough to judge and iterate.',
  }],
  ['OpenViking', { priority: 88, signal: 'Memory plus context lifecycle, provenance, and rehydration.' }],
  ['openclaw', { priority: 82, signal: 'A user-facing assistant layer around local and cloud agent capability.' }],
  ['aesthetics', { priority: 76, signal: 'A visual memory bank for making product and media taste inspectable.' }],
  ['night-city', { priority: 70, signal: 'A style system packaged as a reusable product surface.' }],
  ['wanman', { priority: 64, signal: 'A control-room metaphor for multi-agent delegation.' }],
  ['tmux-journal', { priority: 40, status: 'optional', signal: 'Developer workflow memory for terminal sessions.' }],
  ['Flutter-Sign-in-Button', { priority: 20, status: 'optional', signal: 'Legacy open-source utility with durable external usage.' }],
]);

const categoryByRepo = {
  zouk: 'Agent collaboration runtime',
  notes: 'Public thinking system',
  studio: 'Creative production surface',
  OpenViking: 'Context infrastructure',
  openclaw: 'Personal assistant system',
  aesthetics: 'Visual reference workbook',
  'night-city': 'Design-system experiment',
  wanman: 'Agent matrix runtime',
  'tmux-journal': 'Developer workflow tooling',
  'Flutter-Sign-in-Button': 'Legacy open-source utility',
};

const titleByRepo = {
  zouk: 'Zouk',
  notes: 'Notes',
  studio: 'Studio',
  OpenViking: 'OpenViking',
  openclaw: 'OpenClaw',
  aesthetics: 'Aesthetics Gallery',
  'night-city': 'Night City',
  wanman: 'Wanman',
  'tmux-journal': 'tmux-journal',
  'Flutter-Sign-in-Button': 'Flutter Sign-in Button',
};

const social = [
  { label: 'Instagram', handle: 'zaynjarvis', url: 'https://instagram.com/zaynjarvis' },
  { label: 'X', handle: 'zaynjarvis', url: 'https://x.com/zaynjarvis' },
  { label: 'GitHub', handle: 'ZaynJarvis', url: 'https://github.com/ZaynJarvis' },
  { label: 'Discord', handle: 'zaynjarvis', url: 'https://discord.com/users/zaynjarvis' },
];

function githubHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'zaynjarvis-com-project-sync',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

async function gh(url) {
  const response = await fetch(url, { headers: githubHeaders() });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`${response.status} ${response.statusText}: ${url}\n${text.slice(0, 300)}`);
  }
  return response.json();
}

async function ghMaybe(url) {
  const response = await fetch(url, { headers: githubHeaders() });
  if (!response.ok) return null;
  return response.json();
}

function parseFrontMatter(readme) {
  if (!readme.startsWith('---\n')) return {};
  const end = readme.indexOf('\n---', 4);
  if (end === -1) return {};
  const block = readme.slice(4, end).trim();
  const result = {};
  let currentList = null;

  for (const rawLine of block.split('\n')) {
    const line = rawLine.replace(/\s+$/, '');
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const listMatch = line.match(/^([A-Za-z0-9_-]+):\s*$/);
    if (listMatch) {
      currentList = listMatch[1];
      result[currentList] = {};
      continue;
    }
    const nestedMatch = line.match(/^\s+([A-Za-z0-9_-]+):\s*(.*)$/);
    if (nestedMatch && currentList && typeof result[currentList] === 'object') {
      result[currentList][nestedMatch[1]] = cleanScalar(nestedMatch[2]);
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      currentList = null;
      result[kv[1]] = cleanScalar(kv[2]);
    }
  }
  return result;
}

function cleanScalar(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  return trimmed.replace(/^['"]|['"]$/g, '');
}

async function readmeMetadata(repo) {
  const payload = await ghMaybe(`https://api.github.com/repos/${owner}/${repo}/readme`);
  if (!payload?.content) return { meta: {}, readmePath: null };
  const markdown = Buffer.from(payload.content, payload.encoding || 'base64').toString('utf8');
  return { meta: parseFrontMatter(markdown), readmePath: payload.path || 'README.md' };
}

async function coverFor(repo, branch) {
  const tree = await ghMaybe(`https://api.github.com/repos/${owner}/${repo}/contents/cover.png?ref=${branch}`);
  if (!tree?.download_url) return null;
  return tree.download_url;
}

function fallbackCover(repo) {
  return `https://opengraph.githubassets.com/zaynjarvis-com/${owner}/${repo}`;
}

function normalizeProject(repo, meta, readme, cover) {
  const overrides = includeRepos.get(repo.name) || {};
  const status = readme.status || overrides.status || 'include';
  const homepage = readme.homepage ?? overrides.homepage ?? repo.homepage ?? '';
  const summary = readme.summary || overrides.summary || repo.description || '';
  const links = {
    github: repo.html_url,
    ...(isPlainObject(readme.links) ? readme.links : {}),
  };
  const projectSocial = isPlainObject(readme.social) ? readme.social : {};

  return {
    slug: repo.name,
    repo: repo.full_name,
    title: readme.title || overrides.title || titleByRepo[repo.name] || repo.name,
    category: readme.category || overrides.category || categoryByRepo[repo.name] || 'Project',
    priority: Number(readme.priority || overrides.priority || 0),
    homepage,
    githubUrl: repo.html_url,
    links,
    social: projectSocial,
    summary,
    signal: readme.signal || overrides.signal || summary,
    cover: readme.cover || cover || null,
    fallbackCover: fallbackCover(repo.name),
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    updatedAt: repo.updated_at,
    pushedAt: repo.pushed_at,
    fork: Boolean(repo.fork),
    archived: Boolean(repo.archived),
    status,
    readmePath: meta.readmePath,
    source: Object.keys(readme).length ? 'readme' : 'github+curated',
    reason: overrides.reason || (status === 'include' ? 'Selected for the public ZaynJarvis project network.' : 'Optional project.'),
  };
}

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

async function main() {
  const repos = await gh(`https://api.github.com/users/${owner}/repos?per_page=100&type=public&sort=updated`);
  const selected = repos.filter((repo) => includeRepos.has(repo.name));
  const projects = [];

  for (const repo of selected) {
    const meta = await readmeMetadata(repo.name);
    const cover = await coverFor(repo.name, repo.default_branch);
    projects.push(normalizeProject(repo, meta, meta.meta, cover));
  }

  projects.sort((a, b) => b.priority - a.priority || a.title.localeCompare(b.title));
  const data = {
    schemaVersion: 1,
    generatedAt,
    owner,
    source: 'github-api + README metadata front matter + curated fallback',
    social,
    schema: {
      readmeFrontMatterDelimiter: '---',
      coverConvention: '/cover.png',
      fields: ['title', 'category', 'homepage', 'priority', 'summary', 'signal', 'cover', 'links', 'social', 'status'],
    },
    projects,
  };

  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Wrote ${outFile} with ${projects.length} projects from ${repos.length} public repos.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
