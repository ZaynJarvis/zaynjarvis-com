import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type SocialLink = {
  label: string;
  handle: string;
  url?: string;
};

type SocialLogoSource = {
  asset?: string;
  color: string;
  mode: 'image' | 'mask';
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

const socialLogoSources: Record<string, SocialLogoSource> = {
  discord: { asset: '/social/discord.svg', color: '#5865F2', mode: 'mask' },
  github: { asset: '/social/github.svg', color: '#181717', mode: 'mask' },
  instagram: { asset: '/social/instagram.svg', color: '#E4405F', mode: 'mask' },
  linkedin: { asset: '/social/LI-In-Bug.png', color: '#0A66C2', mode: 'image' },
  x: { asset: '/social/x.svg', color: '#000000', mode: 'mask' },
};

function SocialIcon({ label }: { label: string }) {
  const source = socialLogoSources[label.toLowerCase()];
  if (!source?.asset) return null;

  if (source.mode === 'image') {
    return <img className="social-icon social-icon--asset" src={source.asset} alt="" aria-hidden="true" />;
  }

  return (
    <span
      className="social-icon social-icon--mask"
      aria-hidden="true"
      style={{ '--social-icon': `url(${source.asset})` } as React.CSSProperties}
    />
  );
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

  const socialStyle = (label: string) => ({
    '--social-color': socialLogoSources[label.toLowerCase()]?.color || '#334155',
  }) as React.CSSProperties;

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
                <a key={link.label} href={link.url} target="_blank" rel="noreferrer" title={link.label} aria-label={link.label} style={socialStyle(link.label)}>
                  <SocialIcon label={link.label} />
                </a>
              ) : (
                <span key={link.label} className="social-badge" title={link.label} aria-label={link.label} style={socialStyle(link.label)}>
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
