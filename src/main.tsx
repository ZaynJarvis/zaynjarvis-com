import React from 'react';
import { createRoot } from 'react-dom/client';
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
    recentWorkWindowDays?: number;
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
    { label: 'LinkedIn', handle: 'zhihengliu', url: 'https://www.linkedin.com/in/zhihengliu' },
    { label: 'GitHub', handle: 'ZaynJarvis', url: 'https://github.com/ZaynJarvis' },
    { label: 'Discord', handle: 'zaynjarvis', url: 'https://discord.com/' },
  ],
  schema: {
    readmeFrontMatterDelimiter: '---',
    coverConvention: 'zaynjarvis-com owned color covers',
    fallbackCover: '/covers/registry-fallback.png',
    fields: ['title', 'category', 'homepage', 'priority', 'summary', 'signal', 'accentColor', 'secondaryColor', 'cover', 'links', 'social', 'status'],
  },
  projects: [
    {
      slug: 'OpenViking',
      repo: 'ZaynJarvis/OpenViking',
      title: 'OpenViking',
      category: 'Official context infrastructure',
      priority: 120,
      homepage: 'https://openviking.ai',
      githubUrl: 'https://github.com/ZaynJarvis/OpenViking',
      summary: 'Open-source context database for AI agents: memory, resources, skills, provenance, and lifecycle control behind a viking:// filesystem.',
      signal: 'The official infrastructure project: context as an inspectable runtime contract.',
      accentColor: '#047857',
      secondaryColor: '#0891b2',
      cover: null,
      generatedCover: '/covers/openviking.png',
      fallbackCover: '/covers/registry-fallback.png',
      coverStatus: 'site-color',
      stars: 0,
      forks: 0,
      updatedAt: '2026-06-19T03:13:17Z',
      pushedAt: '2026-06-19T03:13:17Z',
      fork: true,
      archived: false,
      recentWork: true,
      recentWorkCutoff: '2026-04-20T00:00:00.000Z',
      status: 'include',
      readmePath: null,
      source: 'github+curated',
      reason: 'Current official flagship project.',
    },
  ],
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

function coverFor(project: ProjectRecord) {
  if (project.cover?.startsWith('http')) return project.cover;
  if (project.cover?.startsWith('/')) return project.cover;
  if (project.generatedCover) return project.generatedCover;
  return project.fallbackCover;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function SocialIcon({ label }: { label: string }) {
  const key = label.toLowerCase();

  if (key === 'instagram') {
    return (
      <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17" cy="7" r="1.35" fill="currentColor" />
      </svg>
    );
  }

  if (key === 'x') {
    return (
      <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 4l16 16M20 4L4 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.8" />
      </svg>
    );
  }

  if (key === 'linkedin') {
    return (
      <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" />
        <circle cx="8" cy="8" r="1.45" fill="#ffffff" />
        <path d="M6.75 10.5h2.5V18h-2.5v-7.5ZM11 10.5h2.35v1.05c.45-.72 1.22-1.23 2.46-1.23 1.88 0 3.19 1.2 3.19 3.77V18h-2.5v-3.55c0-1.25-.44-1.88-1.38-1.88-.98 0-1.62.67-1.62 1.88V18H11v-7.5Z" fill="#ffffff" />
      </svg>
    );
  }

  if (key === 'github') {
    return (
      <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 2.75a9.25 9.25 0 0 0-2.92 18.03c.46.08.63-.2.63-.44v-1.7c-2.55.55-3.1-1.08-3.1-1.08-.42-1.06-1.02-1.35-1.02-1.35-.83-.57.07-.56.07-.56.92.06 1.41.95 1.41.95.82 1.4 2.14 1 2.66.76.08-.6.32-1 .58-1.23-2.04-.23-4.18-1.02-4.18-4.54 0-1 .36-1.82.95-2.47-.1-.23-.41-1.17.09-2.43 0 0 .77-.25 2.54.94A8.86 8.86 0 0 1 12 5.32c.78 0 1.56.1 2.29.31 1.76-1.19 2.54-.94 2.54-.94.5 1.26.18 2.2.09 2.43.59.65.95 1.47.95 2.47 0 3.53-2.15 4.3-4.2 4.53.33.29.63.85.63 1.72v2.5c0 .24.17.53.64.44A9.25 9.25 0 0 0 12 2.75Z" fill="currentColor" />
      </svg>
    );
  }

  if (key === 'discord') {
    return (
      <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7.2 5.45A13.2 13.2 0 0 1 10.4 4.5l.38.75a12.3 12.3 0 0 1 2.44 0l.38-.75a13.2 13.2 0 0 1 3.2.95c2.04 3.03 2.6 5.98 2.33 8.88a13.3 13.3 0 0 1-4.04 2.04l-.82-1.34c.45-.17.88-.38 1.29-.63a8.38 8.38 0 0 1-7.12 0c.41.25.84.46 1.3.63l-.83 1.34a13.3 13.3 0 0 1-4.04-2.04c-.3-3.36.52-6.28 2.33-8.88Z" fill="currentColor" />
        <circle cx="9.25" cy="11.9" r="1.25" fill="#ffffff" />
        <circle cx="14.75" cy="11.9" r="1.25" fill="#ffffff" />
      </svg>
    );
  }

  return null;
}

function ProjectCard({ project }: { project: ProjectRecord }) {
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
          {project.category}
        </div>
        <h3>{project.title}</h3>
        <p>{project.signal || project.summary}</p>
        <div className="project-meta">
          <span>pushed {formatDate(project.pushedAt)}</span>
          <span>{project.stars} stars</span>
        </div>
        <div className="project-actions">
          {project.homepage ? (
            <a href={project.homepage} target="_blank" rel="noreferrer">
              Visit
            </a>
          ) : null}
          <a href={project.githubUrl} target="_blank" rel="noreferrer">
            Repo
          </a>
        </div>
      </div>
    </article>
  );
}

function App() {
  const { data } = useProjectData();
  const projects = data.projects.filter((project) => project.status !== 'hidden');
  const officialProject = projects.find((project) => project.slug === 'OpenViking') || projects[0] || fallbackData.projects[0];
  const currentProjects = projects.filter(
    (project) =>
      project.status === 'include' &&
      project.recentWork &&
      project.slug !== officialProject.slug,
  );
  const supportingProjects = projects.filter((project) => project.status === 'optional');
  const heroStyle = {
    '--hero-accent': officialProject.accentColor || '#047857',
    '--hero-secondary': officialProject.secondaryColor || '#0891b2',
  } as React.CSSProperties;

  return (
    <main>
      <section className="hero" style={heroStyle}>
        <img className="hero-backdrop" src={coverFor(officialProject)} alt="" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">Official project first</p>
          <h1>ZaynJarvis</h1>
          <p className="hero-lead">
            OpenViking is the current official work. The surrounding projects are working notes, tools, and public surfaces around agent context infrastructure.
          </p>
          <div className="hero-actions">
            <a href={officialProject.homepage || officialProject.githubUrl} target="_blank" rel="noreferrer">OpenViking</a>
            <a href="#projects">Current work</a>
            <a href="https://github.com/ZaynJarvis" target="_blank" rel="noreferrer">GitHub</a>
          </div>
          <dl className="hero-ledger" aria-label="Homepage registry state">
            <div>
              <dt>registry</dt>
              <dd>{projects.length} projects</dd>
            </div>
            <div>
              <dt>current</dt>
              <dd>{currentProjects.length + 1} active</dd>
            </div>
            <div>
              <dt>updated</dt>
              <dd>{formatDate(data.generatedAt)}</dd>
            </div>
          </dl>
          <div className="social-row">
            {data.social.map((link) => (
              link.url ? (
                <a key={link.label} href={link.url} target="_blank" rel="noreferrer" title={link.label} aria-label={link.label}>
                  <SocialIcon label={link.label} />
                </a>
              ) : (
                <span key={link.label} className="social-badge" title={link.label} aria-label={link.label}>
                  <SocialIcon label={link.label} />
                </span>
              )
            ))}
          </div>
        </div>
      </section>

      <section className="official-section" aria-label="Official project">
        <div className="official-copy">
          <p className="eyebrow">Official project</p>
          <h2>{officialProject.title}.</h2>
          <p>{officialProject.summary}</p>
          <div className="official-actions">
            {officialProject.homepage ? (
              <a href={officialProject.homepage} target="_blank" rel="noreferrer">
                Site
              </a>
            ) : null}
            <a href={officialProject.githubUrl} target="_blank" rel="noreferrer">
              Repository
            </a>
          </div>
        </div>
        <div className="official-visual">
          <img src={coverFor(officialProject)} alt={`${officialProject.title} project cover`} />
          <div className="official-panel" aria-label="OpenViking runtime contract">
            <span>viking://user/context</span>
            <span>memory / resources / skills</span>
            <span>provenance {'->'} retrieval {'->'} runtime</span>
          </div>
        </div>
      </section>

      <section id="projects" className="projects-section">
        <div className="section-heading">
          <p className="eyebrow">Current work</p>
          <h2>Active project surface.</h2>
        </div>
        <div className="project-grid">
          {currentProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      {supportingProjects.length ? (
        <section className="supporting-section" aria-label="Supporting archive">
          <div className="section-heading section-heading--compact">
            <p className="eyebrow">Archive context</p>
            <h2>Related, not active.</h2>
          </div>
          <div className="supporting-list">
            {supportingProjects.map((project) => (
              <a key={project.slug} href={project.githubUrl} target="_blank" rel="noreferrer">
                <span>{project.title}</span>
                <span>{project.category}</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <footer>
        <span>ZaynJarvis</span>
        <span>OpenViking first. Projects and notes around it.</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
