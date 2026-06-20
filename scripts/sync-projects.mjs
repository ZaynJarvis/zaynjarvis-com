import { Buffer } from 'node:buffer';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const owner = 'ZaynJarvis';
const generatedAt = new Date().toISOString();
const recentWorkWindowDays = 60;
const recentWorkCutoff = new Date(Date.now() - recentWorkWindowDays * 24 * 60 * 60 * 1000);
const outFile = path.join(process.cwd(), 'public/data/projects.json');
const includeRepos = new Map([
  ['OpenViking', {
    priority: 120,
    homepage: 'https://openviking.ai',
    category: 'Official context infrastructure',
    summary: 'Open-source context database for AI agents: memory, resources, skills, provenance, and lifecycle control behind a viking:// filesystem.',
    signal: 'The official infrastructure project: context as an inspectable runtime contract.',
    reason: 'Current official flagship project.',
    githubUrl: 'https://github.com/volcengine/OpenViking',
    statsRepo: 'volcengine/OpenViking',
  }],
  ['zouk', { priority: 96, signal: 'The operating room where agents and people coordinate real work.' }],
  ['swarm-eval', {
    priority: 94,
    category: 'Agent evaluation infrastructure',
    summary: 'Agent-swarm pipeline for eval-session analysis: worker classification, coordinator reflection, persistent pattern libraries, and reusable diagnostics across datasets.',
    signal: 'Evaluation workbench for turning agent failures into structured, reusable pattern knowledge.',
  }],
  ['termclip', {
    priority: 90,
    category: 'Terminal capture tooling',
    signal: 'A small infrastructure tool for turning terminal sessions into shareable evidence.',
  }],
  ['notes', { priority: 88, signal: 'Judgment updates turned into durable public artifacts.' }],
  ['oh-my-ppt', {
    priority: 86,
    status: 'hidden',
    category: 'Presentation generation surface',
    signal: 'A structured creative surface for turning intent into editable decks.',
  }],
  ['studio', {
    priority: 84,
    homepage: 'https://studio.zaynjarvis.com',
    category: 'Creative production surface',
    summary: 'A visual workflow surface for media generation, project previews, and embedded Zouk collaboration.',
    signal: 'Where artifacts become visible enough to judge and iterate.',
  }],
  ['hua-sheng-site', {
    priority: 82,
    status: 'hidden',
    category: 'Business website system',
    signal: 'A multilingual commercial web surface with SEO, content, and deployment discipline.',
  }],
  ['openviking-blog', {
    priority: 80,
    category: 'Technical publishing system',
    signal: 'A focused channel for making OpenViking architecture and agent runtime work legible.',
  }],
  ['context-infrastructure', {
    priority: 78,
    category: 'Agent context infrastructure',
    signal: 'Practical context, memory, and skill infrastructure for coding agents.',
  }],
  ['aesthetics', { priority: 74, signal: 'A visual memory bank for making product and media taste inspectable.' }],
  ['skills', {
    priority: 72,
    status: 'hidden',
    category: 'Agent skill library',
    signal: 'Reusable operating knowledge packaged as skills for AI builders.',
  }],
  ['agent-env-bridge', {
    priority: 70,
    category: 'Agent environment bridge',
    signal: 'A prototype bridge between cloud agents and trusted worker environments.',
  }],
  ['openclaw', {
    priority: 42,
    recentWork: false,
    status: 'optional',
    signal: 'A related assistant experiment kept as archive context, not current active work.',
  }],
  ['night-city', { priority: 40, signal: 'A style system packaged as a reusable product surface.' }],
  ['wanman', { priority: 36, status: 'hidden', signal: 'A control-room metaphor for multi-agent delegation.' }],
  ['tmux-journal', { priority: 40, status: 'optional', signal: 'Developer workflow memory for terminal sessions.' }],
  ['Flutter-Sign-in-Button', { priority: 20, status: 'optional', signal: 'Legacy open-source utility with durable external usage.' }],
]);

const categoryByRepo = {
  zouk: 'Agent collaboration runtime',
  'swarm-eval': 'Agent evaluation infrastructure',
  termclip: 'Terminal capture tooling',
  notes: 'Public thinking system',
  'oh-my-ppt': 'Presentation generation surface',
  studio: 'Creative production surface',
  OpenViking: 'Context infrastructure',
  'hua-sheng-site': 'Business website system',
  'openviking-blog': 'Technical publishing system',
  openclaw: 'Personal assistant system',
  'context-infrastructure': 'Agent context infrastructure',
  aesthetics: 'Visual reference workbook',
  skills: 'Agent skill library',
  'agent-env-bridge': 'Agent environment bridge',
  'night-city': 'Design-system experiment',
  wanman: 'Agent matrix runtime',
  'tmux-journal': 'Developer workflow tooling',
  'Flutter-Sign-in-Button': 'Legacy open-source utility',
};

const titleByRepo = {
  zouk: 'Zouk',
  'swarm-eval': 'Swarm Eval',
  termclip: 'Termclip',
  notes: 'Notes',
  'oh-my-ppt': 'Oh My PPT',
  studio: 'Studio',
  OpenViking: 'OpenViking',
  'hua-sheng-site': 'HuaSheng Site',
  'openviking-blog': 'OpenViking Blog',
  openclaw: 'OpenClaw',
  'context-infrastructure': 'Context Infrastructure',
  aesthetics: 'Aesthetics Gallery',
  skills: 'Skills',
  'agent-env-bridge': 'Agent Environment Bridge',
  'night-city': 'Night City',
  wanman: 'Wanman',
  'tmux-journal': 'tmux-journal',
  'Flutter-Sign-in-Button': 'Flutter Sign-in Button',
};

const visualByRepo = {
  zouk: { accent: '#0f766e', secondary: '#0ea5e9' },
  'swarm-eval': { accent: '#4338ca', secondary: '#06b6d4' },
  termclip: { accent: '#0f172a', secondary: '#22c55e' },
  notes: { accent: '#b45309', secondary: '#2563eb' },
  'oh-my-ppt': { accent: '#be123c', secondary: '#7c3aed' },
  studio: { accent: '#7c3aed', secondary: '#db2777' },
  OpenViking: { accent: '#047857', secondary: '#0891b2' },
  'hua-sheng-site': { accent: '#b91c1c', secondary: '#d97706' },
  'openviking-blog': { accent: '#0f766e', secondary: '#4f46e5' },
  openclaw: { accent: '#1d4ed8', secondary: '#0f766e' },
  'context-infrastructure': { accent: '#4338ca', secondary: '#0891b2' },
  aesthetics: { accent: '#c2410c', secondary: '#9333ea' },
  skills: { accent: '#0369a1', secondary: '#0f766e' },
  'agent-env-bridge': { accent: '#0f766e', secondary: '#f59e0b' },
  'night-city': { accent: '#4f46e5', secondary: '#db2777' },
  wanman: { accent: '#c2410c', secondary: '#0891b2' },
  'tmux-journal': { accent: '#0f172a', secondary: '#16a34a' },
  'Flutter-Sign-in-Button': { accent: '#0284c7', secondary: '#f59e0b' },
};

const social = [
  { label: 'Instagram', handle: 'zaynjarvis', url: 'https://www.instagram.com/zaynjarvis/' },
  { label: 'X', handle: 'zaynjarvis', url: 'https://x.com/zaynjarvis' },
  { label: 'LinkedIn', handle: 'zhihengliu', url: 'https://www.linkedin.com/in/zhihengliu' },
  { label: 'GitHub', handle: 'ZaynJarvis', url: 'https://github.com/ZaynJarvis' },
  { label: 'Discord', handle: 'zaynjarvis', url: 'https://discord.com/' },
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
  const payload = await ghMaybe(`https://api.github.com/repos/${owner}/${repo.name}/readme`);
  if (!payload?.content) return { meta: {}, readmePath: null, readmeCover: null };
  const markdown = Buffer.from(payload.content, payload.encoding || 'base64').toString('utf8');
  return {
    meta: parseFrontMatter(markdown),
    readmePath: payload.path || 'README.md',
    readmeCover: extractReadmeTopCover(markdown, payload, repo),
  };
}

function extractReadmeTopCover(markdown, payload, repo) {
  const body = stripFrontMatter(markdown);
  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('<!--')) continue;
    if (line.startsWith('#')) return null;

    const markdownImage = line.match(/^!\[[^\]]*]\(([^)\s]+)(?:\s+['"][^)]*['"])?\)$/);
    if (markdownImage) return resolveReadmeAsset(markdownImage[1], payload, repo);

    const htmlImage = line.match(/^<img\b[^>]*\bsrc=['"]([^'"]+)['"][^>]*>/i);
    if (htmlImage) return resolveReadmeAsset(htmlImage[1], payload, repo);

    return null;
  }
  return null;
}

function stripFrontMatter(markdown) {
  if (!markdown.startsWith('---\n')) return markdown;
  const end = markdown.indexOf('\n---', 4);
  return end === -1 ? markdown : markdown.slice(end + 4);
}

function resolveReadmeAsset(source, payload, repo) {
  const cleanSource = String(source || '').trim().replace(/^<|>$/g, '');
  if (!cleanSource || cleanSource.startsWith('data:') || cleanSource.startsWith('#')) return null;
  if (/^https?:\/\//i.test(cleanSource)) return cleanSource;
  if (cleanSource.startsWith('//')) return `https:${cleanSource}`;
  if (cleanSource.startsWith('/')) {
    return `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}${cleanSource}`;
  }
  const base = payload.download_url || `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/${payload.path || 'README.md'}`;
  return new URL(cleanSource, base).toString();
}

function coverSlug(repo) {
  return repo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function siteCoverFor(repo) {
  const relativePath = `/covers/${coverSlug(repo)}.png`;
  const filePath = path.join(process.cwd(), 'public', relativePath);
  return existsSync(filePath) ? relativePath : null;
}

function visualFor(repo) {
  return visualByRepo[repo] || { accent: '#0f766e', secondary: '#2563eb' };
}

function isRecentWork(repo) {
  const pushed = Date.parse(repo.pushed_at || '');
  return (pushed || 0) >= recentWorkCutoff.getTime();
}

function normalizeProject(repo, meta, readme, statsRepo = repo) {
  const overrides = includeRepos.get(repo.name) || {};
  const status = readme.status || overrides.status || 'include';
  const homepage = readme.homepage ?? overrides.homepage ?? repo.homepage ?? '';
  const githubUrl = readme.githubUrl || overrides.githubUrl || repo.html_url;
  const summary = readme.summary || overrides.summary || repo.description || '';
  const links = {
    github: githubUrl,
    ...(isPlainObject(readme.links) ? readme.links : {}),
  };
  const projectSocial = isPlainObject(readme.social) ? readme.social : {};
  const recentWork =
    typeof overrides.recentWork === 'boolean'
      ? overrides.recentWork
      : isRecentWork(repo);
  const visual = visualFor(repo.name);
  const generatedCover = siteCoverFor(repo.name);
  const explicitCover = readme.cover || meta.readmeCover || null;

  return {
    slug: repo.name,
    repo: repo.full_name,
    title: readme.title || overrides.title || titleByRepo[repo.name] || repo.name,
    category: readme.category || overrides.category || categoryByRepo[repo.name] || 'Project',
    priority: Number(readme.priority || overrides.priority || 0),
    homepage,
    githubUrl,
    links,
    social: projectSocial,
    summary,
    signal: readme.signal || overrides.signal || summary,
    accentColor: readme.accentColor || visual.accent,
    secondaryColor: readme.secondaryColor || visual.secondary,
    cover: explicitCover,
    generatedCover,
    fallbackCover: '/covers/registry-fallback.png',
    coverStatus: readme.cover ? 'explicit' : meta.readmeCover ? 'repo-readme' : generatedCover ? 'site-color' : 'site-fallback',
    stars: statsRepo.stargazers_count || 0,
    forks: statsRepo.forks_count || 0,
    starsSource: overrides.statsRepo || repo.full_name,
    updatedAt: repo.updated_at,
    pushedAt: repo.pushed_at,
    fork: Boolean(repo.fork),
    archived: Boolean(repo.archived),
    recentWork,
    recentWorkCutoff: recentWorkCutoff.toISOString(),
    status,
    readmePath: meta.readmePath,
    source: Object.keys(readme).length ? 'readme' : 'github+curated',
    reason: overrides.reason || (status === 'hidden'
      ? 'Hidden from the current public homepage.'
      : status === 'include'
        ? 'Selected for the public ZaynJarvis project network.'
        : 'Optional project.'),
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
    const meta = await readmeMetadata(repo);
    const overrides = includeRepos.get(repo.name) || {};
    const statsRepo = overrides.statsRepo
      ? await ghMaybe(`https://api.github.com/repos/${overrides.statsRepo}`)
      : null;
    projects.push(normalizeProject(repo, meta, meta.meta, statsRepo || repo));
  }

  projects.sort((a, b) => b.priority - a.priority || a.title.localeCompare(b.title));
  const data = {
    schemaVersion: 1,
    generatedAt,
    owner,
    source: 'github-api + README metadata/front matter/top cover + zaynjarvis-com visual fallback',
    social,
    schema: {
      readmeFrontMatterDelimiter: '---',
      coverConvention: 'README front matter cover, README top image, or zaynjarvis-com owned color covers',
      generatedCoverConvention: '/covers/{repo}.png',
      fallbackCover: '/covers/registry-fallback.png',
      recentWorkCutoff: recentWorkCutoff.toISOString(),
      recentWorkWindowDays,
      fields: ['title', 'category', 'homepage', 'priority', 'summary', 'signal', 'accentColor', 'secondaryColor', 'cover', 'links', 'social', 'status'],
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
