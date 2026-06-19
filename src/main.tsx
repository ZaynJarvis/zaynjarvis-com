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
    { label: 'GitHub', handle: 'ZaynJarvis', url: 'https://github.com/ZaynJarvis' },
    { label: 'Discord', handle: 'zaynjarvis' },
  ],
  schema: {
    readmeFrontMatterDelimiter: '---',
    coverConvention: 'zaynjarvis-com owned color covers',
    fallbackCover: '/covers/registry-fallback.png',
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
      generatedCover: '/covers/zouk.png',
      fallbackCover: '/covers/registry-fallback.png',
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
        <p>{project.summary}</p>
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
  const recentProjects = projects.filter((project) => project.recentWork);

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">ZaynJarvis project atlas</p>
          <h1>ZaynJarvis</h1>
          <p className="hero-lead">
            Agent systems, context infrastructure, creative tools, and public notes.
          </p>
          <div className="hero-actions">
            <a href="#projects">Explore projects</a>
            <a href="https://github.com/ZaynJarvis" target="_blank" rel="noreferrer">GitHub</a>
          </div>
          <div className="social-row">
            {data.social.map((link) => (
              link.url ? (
                <a key={link.label} href={link.url} target="_blank" rel="noreferrer" title={link.label}>
                  {link.label}
                </a>
              ) : (
                <span key={link.label} className="social-badge" title={link.label}>
                  {link.label}
                </span>
              )
            ))}
          </div>
        </div>
        <div className="hero-panel" aria-label="Project preview">
          <img className="hero-art" src="/og-cover.png" alt="ZaynJarvis project atlas artwork" />
          <img className="avatar" src="https://github.com/ZaynJarvis.png" alt="ZaynJarvis GitHub avatar" />
        </div>
      </section>

      <section id="projects" className="projects-section">
        <div className="section-heading">
          <p className="eyebrow">Recent work</p>
          <h2>Recent projects.</h2>
        </div>
        <div className="project-grid">
          {recentProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      <footer>
        <span>ZaynJarvis</span>
        <span>Projects and notes.</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
