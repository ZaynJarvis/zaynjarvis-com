import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowUpRight,
  AtSign,
  BookOpen,
  Boxes,
  Cpu,
  Database,
  FileJson,
  Github,
  Globe2,
  Image,
  Instagram,
  Layers3,
  MessageCircle,
  Radio,
  Sparkles,
} from 'lucide-react';
import './styles.css';

type SocialLink = {
  label: string;
  handle: string;
  url: string;
};

type ProjectRecord = {
  slug: string;
  repo: string;
  title: string;
  category: string;
  priority: number;
  homepage: string;
  githubUrl: string;
  links?: Record<string, string>;
  social?: Record<string, string>;
  summary: string;
  signal: string;
  cover: string | null;
  generatedCover?: string | null;
  fallbackCover: string;
  coverStatus?: 'repo' | 'generated' | 'github-og';
  stars: number;
  forks: number;
  updatedAt: string;
  pushedAt: string;
  fork: boolean;
  archived: boolean;
  recentWork?: boolean;
  recentWorkCutoff?: string;
  status: 'include' | 'optional' | 'hidden';
  readmePath: string | null;
  source: string;
  reason: string;
};

type ProjectData = {
  schemaVersion: number;
  generatedAt: string;
  owner: string;
  source: string;
  social: SocialLink[];
  schema: {
    readmeFrontMatterDelimiter: string;
    coverConvention: string;
    fields: string[];
    generatedCoverConvention?: string;
    recentWorkCutoff?: string;
  };
  projects: ProjectRecord[];
};

const fallbackData: ProjectData = {
  schemaVersion: 1,
  generatedAt: '2026-05-30T11:20:00.000Z',
  owner: 'ZaynJarvis',
  source: 'bundled fallback',
  social: [
    { label: 'Instagram', handle: 'zaynjarvis', url: 'https://instagram.com/zaynjarvis' },
    { label: 'X', handle: 'zaynjarvis', url: 'https://x.com/zaynjarvis' },
    { label: 'GitHub', handle: 'ZaynJarvis', url: 'https://github.com/ZaynJarvis' },
    { label: 'Discord', handle: 'zaynjarvis', url: 'https://discord.com/users/zaynjarvis' },
  ],
  schema: {
    readmeFrontMatterDelimiter: '---',
    coverConvention: '/cover.png',
    fields: ['title', 'category', 'homepage', 'priority', 'summary', 'signal', 'cover', 'links', 'social', 'status'],
  },
  projects: [
    {
      slug: 'zouk',
      repo: 'ZaynJarvis/zouk',
      title: 'Zouk',
      category: 'Agent collaboration runtime',
      priority: 100,
      homepage: 'https://zouk.zaynjarvis.com',
      githubUrl: 'https://github.com/ZaynJarvis/zouk',
      summary: 'Zouk - collaborative AI agent platform',
      signal: 'The operating room where agents and people coordinate real work.',
      cover: null,
      generatedCover: '/covers/zouk.svg',
      fallbackCover: 'https://opengraph.githubassets.com/zaynjarvis-com/ZaynJarvis/zouk',
      coverStatus: 'generated',
      stars: 6,
      forks: 0,
      updatedAt: '2026-05-30T10:23:58Z',
      pushedAt: '2026-05-30T10:23:54Z',
      fork: false,
      archived: false,
      recentWork: true,
      recentWorkCutoff: '2026-04-30T00:00:00.000Z',
      status: 'include',
      readmePath: null,
      source: 'github+curated',
      reason: 'Active owned flagship project with live domain.',
    },
  ],
};

const iconBySlug: Record<string, React.ComponentType<{ size?: number }>> = {
  zouk: Radio,
  notes: BookOpen,
  studio: Sparkles,
  OpenViking: Layers3,
  openclaw: Cpu,
  aesthetics: Image,
  'night-city': Boxes,
  wanman: Globe2,
  'tmux-journal': Database,
  'Flutter-Sign-in-Button': AtSign,
};

function useProjectData() {
  const [data, setData] = React.useState<ProjectData>(fallbackData);
  const [state, setState] = React.useState<'bundled' | 'loaded' | 'error'>('bundled');

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch('/data/projects.json', { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`projects.json ${response.status}`);
        const json = (await response.json()) as ProjectData;
        if (!cancelled) {
          setData(json);
          setState('loaded');
        }
      } catch {
        if (!cancelled) setState('error');
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, state };
}

function formatDate(value?: string) {
  if (!value) return 'blank';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'blank';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function socialIcon(label: string) {
  const key = label.toLowerCase();
  if (key.includes('instagram')) return <Instagram size={16} />;
  if (key.includes('github')) return <Github size={16} />;
  if (key.includes('discord')) return <MessageCircle size={16} />;
  return <AtSign size={16} />;
}

function coverFor(project: ProjectRecord) {
  if (project.cover?.startsWith('http')) return project.cover;
  if (project.cover === '/cover.png') {
    return `https://raw.githubusercontent.com/${project.repo}/HEAD/cover.png`;
  }
  if (project.cover?.startsWith('/')) return project.cover;
  if (project.generatedCover) return project.generatedCover;
  return project.fallbackCover;
}

function hostLabel(value?: string) {
  if (!value) return 'no public URL yet';
  try {
    return new URL(value).host;
  } catch {
    return value;
  }
}

function coverLabel(project: ProjectRecord) {
  if (project.coverStatus === 'repo') return 'repo cover';
  if (project.coverStatus === 'generated') return 'recent cover';
  return 'github fallback';
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span>{value}</span>
      <small>{label}</small>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectRecord }) {
  const Icon = iconBySlug[project.slug] || FileJson;
  const destination = project.homepage || project.githubUrl;

  return (
    <article className={`project-card project-card--${project.status}`}>
      <a className="project-image" href={destination} target="_blank" rel="noreferrer" aria-label={`Open ${project.title}`}>
        <img src={coverFor(project)} alt={`${project.title} project cover`} loading="lazy" />
      </a>
      <div className="project-body">
        <div className="project-kicker">
          <span className="project-icon"><Icon size={18} /></span>
          {project.category}
          {project.recentWork ? <span className="status-pill status-pill--recent">recent</span> : null}
          {project.status === 'optional' ? <span className="status-pill">optional</span> : null}
        </div>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <p className="project-signal">{project.signal}</p>
        <div className="project-meta">
          <span>{hostLabel(project.homepage)}</span>
          <span>{coverLabel(project)}</span>
          <span>{formatDate(project.pushedAt || project.updatedAt)}</span>
        </div>
        <div className="project-actions">
          {project.homepage ? (
            <a href={project.homepage} target="_blank" rel="noreferrer">
              Visit <ArrowUpRight size={15} />
            </a>
          ) : null}
          <a href={project.githubUrl} target="_blank" rel="noreferrer">
            Repo <Github size={15} />
          </a>
        </div>
      </div>
    </article>
  );
}

function SchemaPanel({ data }: { data: ProjectData }) {
  return (
    <section className="schema-panel" aria-label="Project metadata contract">
      <div>
        <p className="eyebrow">README metadata contract</p>
        <h2>Repo data first, curated overrides where needed.</h2>
        <p>
          The scanner reads public GitHub repos, checks README front matter, looks for repo-root
          <code> /cover.png</code>, then writes <code>/data/projects.json</code>. If a repo has no
          homepage URL, the data intentionally leaves it blank.
        </p>
      </div>
      <pre>{`---
title: Zouk
category: Agent collaboration runtime
homepage: https://zouk.zaynjarvis.com
priority: 100
summary: Shared channels, tasks, threads, activity feeds.
signal: The operating room for human-agent work.
cover: /cover.png
status: include
---`}</pre>
      <div className="schema-meta">
        <span>schema v{data.schemaVersion}</span>
        <span>cover: {data.schema.coverConvention}</span>
        <span>delimiter: {data.schema.readmeFrontMatterDelimiter}</span>
      </div>
    </section>
  );
}

function App() {
  const { data, state } = useProjectData();
  const projects = data.projects.filter((project) => project.status !== 'hidden');
  const recentProjects = projects.filter((project) => project.recentWork);
  const archiveProjects = projects.filter((project) => !project.recentWork);
  const stars = projects.reduce((sum, repo) => sum + (repo.stars || 0), 0);
  const generatedCovers = projects.filter((project) => project.coverStatus === 'generated').length;
  const withHomepage = projects.filter((project) => project.homepage).length;

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">ZaynJarvis project atlas</p>
          <h1>ZaynJarvis</h1>
          <p className="hero-lead">
            Agent runtimes, context infrastructure, creative systems, and public notes,
            assembled from GitHub repo data and repo-owned metadata.
          </p>
          <div className="hero-actions">
            <a href="#projects">Explore projects</a>
            <a href="https://github.com/ZaynJarvis" target="_blank" rel="noreferrer">
              GitHub <Github size={16} />
            </a>
          </div>
          <div className="social-row">
            {data.social.map((link) => (
              <a key={link.label} href={link.url} target="_blank" rel="noreferrer" title={link.label}>
                {socialIcon(link.label)}
                <span>{link.handle}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="hero-panel" aria-label="Project preview collage">
          <img className="avatar" src="https://github.com/ZaynJarvis.png" alt="ZaynJarvis GitHub avatar" />
          <div className="panel-label">
            <span>recent covers</span>
            <strong>{generatedCovers}</strong>
          </div>
          <div className="preview-stack">
            {recentProjects.slice(0, 4).map((project) => (
              <img key={project.slug} src={coverFor(project)} alt={`${project.title} repository cover`} />
            ))}
          </div>
        </div>
      </section>

      <section className="stats-section" aria-label="Network status">
        <Stat label="recent project covers" value={String(generatedCovers)} />
        <Stat label="public repos in registry" value={String(projects.length)} />
        <Stat label="cards with homepage URL" value={String(withHomepage)} />
        <Stat label="public stars loaded" value={stars.toLocaleString()} />
      </section>

      <section className="thesis">
        <div>
          <p className="eyebrow">Data source</p>
          <h2>Repo metadata decides the page. Local covers only fill recent gaps.</h2>
        </div>
        <p>
          Current load state: <strong>{state}</strong>. Source: {data.source}. Generated at {formatDate(data.generatedAt)}.
          The scanner reads README front matter and repo-root <code>/cover.png</code> first. For projects active since
          {` ${formatDate(data.schema.recentWorkCutoff)}`}, the site supplies generated cover pages until the repo owns one.
        </p>
      </section>

      <SchemaPanel data={data} />

      <section id="projects" className="projects-section">
        <div className="section-heading">
          <p className="eyebrow">Recent work</p>
          <h2>Projects touched in the last month get first-class cover pages.</h2>
        </div>
        <div className="project-grid">
          {recentProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      {archiveProjects.length ? (
        <section className="archive-section" aria-label="Archived project links">
          <div className="section-heading">
            <p className="eyebrow">Registry archive</p>
            <h2>Older surfaces stay linked, but do not receive cover work in this pass.</h2>
          </div>
          <div className="archive-list">
            {archiveProjects.map((project) => (
              <a key={project.slug} href={project.homepage || project.githubUrl} target="_blank" rel="noreferrer">
                <span>{project.title}</span>
                <small>{project.homepage ? hostLabel(project.homepage) : project.repo}</small>
                <ArrowUpRight size={15} />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className="principles">
        <div className="section-heading">
          <p className="eyebrow">Operating rule</p>
          <h2>The site stays static, but the project data can keep moving.</h2>
        </div>
        <div className="principle-grid">
          <div>
            <h3>Repo-owned metadata</h3>
            <p>Each important repo should own its title, homepage, priority, summary, signal, and cover path.</p>
          </div>
          <div>
            <h3>Generated covers</h3>
            <p>Recent projects get local cover pages now. Repo-root <code>/cover.png</code> still wins when added later.</p>
          </div>
          <div>
            <h3>Static deployment surface</h3>
            <p>Cloudflare Pages still only needs the Vite build output. No server credentials are needed for the frontend.</p>
          </div>
        </div>
      </section>

      <footer>
        <span>ZaynJarvis</span>
        <span>Runtime state, context infrastructure, public artifacts.</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
