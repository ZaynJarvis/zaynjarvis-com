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
  Layers3,
  Radio,
  Sparkles,
} from 'lucide-react';
import './styles.css';

type SocialLink = {
  label: string;
  handle: string;
  url?: string;
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
  accentColor?: string;
  secondaryColor?: string;
  cover: string | null;
  generatedCover?: string | null;
  fallbackCover: string;
  coverStatus?: 'explicit' | 'site-color' | 'site-fallback';
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
    fallbackCover?: string;
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
    { label: 'Instagram', handle: 'zaynjarvis', url: 'https://www.instagram.com/zaynjarvis/' },
    { label: 'X', handle: 'zaynjarvis', url: 'https://x.com/zaynjarvis' },
    { label: 'GitHub', handle: 'ZaynJarvis', url: 'https://github.com/ZaynJarvis' },
    { label: 'Discord', handle: 'zaynjarvis' },
  ],
  schema: {
    readmeFrontMatterDelimiter: '---',
    coverConvention: 'zaynjarvis-com owned color covers',
    fallbackCover: '/covers/registry-fallback.svg',
    fields: ['title', 'category', 'homepage', 'priority', 'summary', 'signal', 'accentColor', 'secondaryColor', 'cover', 'links', 'social', 'status'],
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
      accentColor: '#0f766e',
      secondaryColor: '#0ea5e9',
      cover: null,
      generatedCover: '/covers/zouk.svg',
      fallbackCover: '/covers/registry-fallback.svg',
      coverStatus: 'site-color',
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

function socialMark(label: string) {
  const key = label.toLowerCase();
  const text = key.includes('instagram') ? 'IG' : key === 'x' ? 'X' : key.includes('github') ? 'GH' : key.includes('discord') ? 'DC' : '@';
  return <span className={`brand-mark brand-mark--${text.toLowerCase()}`} aria-hidden="true">{text}</span>;
}

function coverFor(project: ProjectRecord) {
  if (project.cover?.startsWith('http')) return project.cover;
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
  const style = {
    '--project-accent': project.accentColor || '#0f766e',
    '--project-secondary': project.secondaryColor || '#2563eb',
  } as React.CSSProperties;

  return (
    <article className={`project-card project-card--${project.status}`} style={style}>
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

function App() {
  const { data } = useProjectData();
  const projects = data.projects.filter((project) => project.status !== 'hidden');
  const recentProjects = projects.filter((project) => project.recentWork);
  const archiveProjects = projects.filter((project) => !project.recentWork);
  const stars = projects.reduce((sum, repo) => sum + (repo.stars || 0), 0);
  const withHomepage = projects.filter((project) => project.homepage).length;

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">ZaynJarvis project atlas</p>
          <h1>ZaynJarvis</h1>
          <p className="hero-lead">
            Agent runtimes, memory systems, tools, and public notes.
          </p>
          <div className="hero-actions">
            <a href="#projects">Explore projects</a>
            <a href="https://github.com/ZaynJarvis" target="_blank" rel="noreferrer">
              GitHub <Github size={16} />
            </a>
          </div>
          <div className="social-row">
            {data.social.map((link) => (
              link.url ? (
                <a key={link.label} href={link.url} target="_blank" rel="noreferrer" title={link.label}>
                  {socialMark(link.label)}
                  <span>{link.handle}</span>
                </a>
              ) : (
                <span key={link.label} className="social-badge" title={link.label}>
                  {socialMark(link.label)}
                  <span>{link.handle}</span>
                </span>
              )
            ))}
          </div>
        </div>
        <div className="hero-panel" aria-label="Project preview collage">
          <img className="hero-art" src="/og-cover.png" alt="ZaynJarvis project atlas artwork" />
          <img className="avatar" src="https://github.com/ZaynJarvis.png" alt="ZaynJarvis GitHub avatar" />
          <div className="panel-label">
            <span>recent work</span>
            <strong>{recentProjects.length}</strong>
          </div>
        </div>
      </section>

      <section className="stats-section" aria-label="Network status">
        <Stat label="recent work" value={String(recentProjects.length)} />
        <Stat label="public projects" value={String(projects.length)} />
        <Stat label="live surfaces" value={String(withHomepage)} />
        <Stat label="GitHub stars" value={stars.toLocaleString()} />
      </section>

      <section className="thesis">
        <div>
          <p className="eyebrow">Current focus</p>
          <h2>Building tools where agents, memory, media, and judgment meet.</h2>
        </div>
        <p>
          The recent work is centered on Zouk, OpenViking, Studio, OpenClaw, notes,
          and visual systems. The older links are kept as context, but the front page
          is about what has been moving lately.
        </p>
      </section>

      <section id="projects" className="projects-section">
        <div className="section-heading">
          <p className="eyebrow">Recent work</p>
          <h2>Projects I have been actively shaping this month.</h2>
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
            <p className="eyebrow">Earlier work</p>
            <h2>Older public projects that still give useful context.</h2>
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
          <p className="eyebrow">Shape</p>
          <h2>The work clusters around three surfaces.</h2>
        </div>
        <div className="principle-grid">
          <div>
            <h3>Collaboration runtime</h3>
            <p>Zouk is the place where humans, agents, threads, tasks, and activity become one working surface.</p>
          </div>
          <div>
            <h3>Context infrastructure</h3>
            <p>OpenViking treats context as recoverable runtime state, not just text stored after a chat.</p>
          </div>
          <div>
            <h3>Public artifacts</h3>
            <p>Notes and visual systems turn private judgment updates into reusable public material.</p>
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
