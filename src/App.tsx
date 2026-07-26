import React from 'react';

type SocialLink = { label: string; handle: string; url?: string };
export type ProjectRecord = {
  slug: string; repo: string; title: string; category: string; priority: number;
  homepage: string; githubUrl: string; summary: string; signal: string;
  stars: number; forks: number; updatedAt: string; pushedAt: string;
  fork: boolean; archived: boolean; recentWork?: boolean;
  status: 'include' | 'optional' | 'hidden'; reason: string;
};
type ProjectData = { generatedAt: string; social: SocialLink[]; projects: ProjectRecord[] };
type Capability = 'Context' | 'Coordination' | 'Evidence' | 'Interfaces';

const capabilityOrder: Capability[] = ['Context', 'Coordination', 'Evidence', 'Interfaces'];
const capabilities: Record<string, Capability> = {
  OpenViking: 'Context', notes: 'Context', 'context-infrastructure': 'Context', 'tmux-journal': 'Context',
  zouk: 'Coordination', openclaw: 'Coordination', 'swarm-eval': 'Evidence', termclip: 'Evidence',
  studio: 'Interfaces', aesthetics: 'Interfaces', 'night-city': 'Interfaces', 'Flutter-Sign-in-Button': 'Interfaces',
  'trackpad-studio': 'Interfaces',
};

function capability(project: ProjectRecord): Capability {
  return capabilities[project.slug] ?? 'Interfaces';
}

function formatCount(value: number) {
  return new Intl.NumberFormat('en', { notation: value >= 1000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(value));
}

function useProjects() {
  const [data, setData] = React.useState<ProjectData | null>(null);
  const [error, setError] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);
  React.useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetch('/data/projects.json', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
      .then((next: ProjectData) => setData(next))
      .catch((reason) => { if (reason.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, [attempt]);
  return { data, error, retry: () => setAttempt((value) => value + 1) };
}

function Arrow() { return <span className="arrow" aria-hidden="true">↗</span>; }

const fallbackSocial: SocialLink[] = [
  { label: 'Instagram', handle: 'zaynjarvis', url: 'https://www.instagram.com/zaynjarvis/' },
  { label: 'X', handle: 'zaynjarvis', url: 'https://x.com/zaynjarvis' },
  { label: 'LinkedIn', handle: 'zhihengliu', url: 'https://www.linkedin.com/in/zhihengliu' },
  { label: 'GitHub', handle: 'ZaynJarvis', url: 'https://github.com/ZaynJarvis' },
  { label: 'Discord', handle: 'zaynjarvis', url: 'https://discord.com/' },
];
const socialIcons: Record<string, { asset: string; mode: 'mask' | 'image' }> = {
  instagram: { asset: '/social/instagram.svg', mode: 'mask' },
  x: { asset: '/social/x.svg', mode: 'mask' },
  linkedin: { asset: '/social/LI-In-Bug.png', mode: 'image' },
  github: { asset: '/social/github.svg', mode: 'mask' },
  discord: { asset: '/social/discord.svg', mode: 'mask' },
};

function SocialIcon({ label }: { label: string }) {
  const source = socialIcons[label.toLowerCase()];
  if (!source) return null;
  if (source.mode === 'image') return <img className="social-icon social-icon--image" src={source.asset} alt="" aria-hidden="true" />;
  return <span className="social-icon social-icon--mask" aria-hidden="true" style={{ '--social-icon': `url(${source.asset})` } as React.CSSProperties} />;
}

function ProjectLinks({ project, compact = false }: { project: ProjectRecord; compact?: boolean }) {
  return <div className={compact ? 'project-links compact' : 'project-links'}>
    {project.homepage && <a href={project.homepage} target="_blank" rel="noreferrer">Live site <Arrow /></a>}
    <a href={project.githubUrl} target="_blank" rel="noreferrer">Source <Arrow /></a>
  </div>;
}

function App() {
  const { data, error, retry } = useProjects();
  const visible = data?.projects.filter((project) => project.status !== 'hidden') ?? [];
  const current = visible.filter((project) => project.status === 'include' && project.recentWork === true);
  const archive = visible.filter((project) => project.status === 'optional' || (project.status === 'include' && !project.recentWork));
  const openViking = data?.projects.find((project) => project.slug === 'OpenViking');
  const ordered = capabilityOrder.flatMap((group) => current.filter((project) => capability(project) === group));

  return <>
    <a className="skip-link" href="#content">Skip to work</a>
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="ZaynJarvis, home">Zayn&nbsp;Jarvis</a>
      <nav aria-label="Primary navigation"><a href="#focus">Focus</a><a href="#index">Index</a><a href="#about">About</a></nav>
      <a className="header-link" href="https://github.com/ZaynJarvis" target="_blank" rel="noreferrer">GitHub <Arrow /></a>
    </header>

    <main id="content">
      <section className="hero" id="top" aria-labelledby="hero-title">
        <p className="eyebrow">Open source · agent infrastructure</p>
        <h1 id="hero-title">Tools for agents that need context, coordination, and evidence.</h1>
        <p className="hero-lead">An index of the infrastructure, evaluation tools, and interfaces I build in the open — each entry linked to its source, with status and provenance kept visible.</p>
        <div className="hero-actions">
          {openViking && <a href={openViking.githubUrl} target="_blank" rel="noreferrer">View OpenViking <Arrow /></a>}
          <a href="#index">Read the index ↓</a>
        </div>
        <dl className="colophon" aria-label="Portfolio status">
          <div><dt>Focus</dt><dd>OpenViking</dd></div>
          <div><dt>Field</dt><dd>Context infrastructure</dd></div>
          <div><dt>Current projects</dt><dd>{data ? current.length : '—'}</dd></div>
        </dl>
      </section>

      {error && !data && <section className="data-error" role="alert">
        <h2>Project index unavailable</h2>
        <p>The project data could not be loaded. The source portfolio remains available on GitHub.</p>
        <div className="project-links"><button type="button" onClick={retry}>Retry</button><a href="https://github.com/ZaynJarvis">Open GitHub <Arrow /></a></div>
      </section>}
      {!data && !error && <p className="loading" role="status">Loading project field notes…</p>}

      {openViking && <section className="focus-section" id="focus" aria-labelledby="focus-title">
        <div className="focus-copy">
          <p className="eyebrow">Current focus</p>
          <h2 id="focus-title">Context should be navigable, not buried in a prompt.</h2>
          <p className="lead">{openViking.summary}</p>
          <p className="attribution"><strong>Attribution:</strong> OpenViking is an upstream project by the Volcengine team. The listed ZaynJarvis repository is a fork; these links point to the official site and upstream source.</p>
          <ProjectLinks project={openViking} />
        </div>
        <figure className="paper-terminal" aria-label="OpenViking context model">
          <figcaption className="paper-terminal-title">context://openviking</figcaption>
          <div className="context-tree" role="img" aria-label="A context tree connecting memory, resources, skills, and provenance">
            <p>viking://</p>
            <p>├── memory/ <span>what persists</span></p>
            <p>├── resources/ <span>what agents know</span></p>
            <p>├── skills/ <span>what agents can do</span></p>
            <p>└── provenance/ <span>why it can be trusted</span></p>
          </div>
        </figure>
      </section>}

      {data && <section className="ledger-section" id="index" aria-labelledby="index-title">
        <div className="section-head">
          <p className="eyebrow">Index</p>
          <h2 id="index-title">Grouped by what each project enables.</h2>
          <p className="section-lead">Current work only. Capability labels are curated; activity and repository relationships follow the maintained project record.</p>
        </div>
        {capabilityOrder.map((group) => {
          const projects = current.filter((project) => capability(project) === group);
          return projects.length ? <section className="ledger-group" key={group} aria-labelledby={`cap-${group}`}>
            <h3 className="ledger-group-title" id={`cap-${group}`}>{group}<span>{String(projects.length).padStart(2, '0')}</span></h3>
            <ul className="ledger-rows">
              {projects.map((project) => <li className="ledger-row" key={project.slug} style={{ '--plate': `url(/previews/${project.slug.toLowerCase()}.jpg)` } as React.CSSProperties}>
                <span className="ledger-num" aria-hidden="true">{String(ordered.indexOf(project) + 1).padStart(2, '0')}</span>
                <div className="ledger-main">
                  <h4>{project.title}</h4>
                  <p>{project.signal || project.summary}</p>
                </div>
                <p className="ledger-meta">
                  <span className="ledger-role">{project.category}</span>
                  <span>{project.repo}</span>
                  <span>Updated {formatDate(project.updatedAt)}{project.stars > 0 && ` · ${formatCount(project.stars)} star${project.stars === 1 ? '' : 's'}`}{project.fork && ' · Fork'}</span>
                </p>
                <ProjectLinks project={project} compact />
              </li>)}
            </ul>
          </section> : null;
        })}
      </section>}

      {archive.length > 0 && <section className="archive-section" aria-labelledby="archive-title">
        <div className="section-head section-head--compact">
          <p className="eyebrow">Archive</p>
          <h2 id="archive-title">Still useful. Not current.</h2>
          <p className="section-lead">Earlier tools and experiments retained for reference.</p>
        </div>
        <ul className="archive-rows">
          {archive.map((project) => <li key={project.slug}>
            <a href={project.githubUrl} target="_blank" rel="noreferrer">
              <span className="archive-title">{project.title}</span>
              <span className="archive-note">{project.signal || project.category}</span>
              <Arrow />
            </a>
          </li>)}
        </ul>
      </section>}

      <section className="about" id="about" aria-labelledby="about-title">
        <p className="eyebrow">About this index</p>
        <h2 id="about-title">Sources before claims.</h2>
        <p className="lead">This portfolio groups ZaynJarvis repositories by capability and links each entry to its public source. Forks and inactive work are labelled rather than presented as original or current.</p>
        <p className="support-line">If something here saved you time — <a href="https://buymeacoffee.com/zaynjarvis?status=1" target="_blank" rel="noreferrer">buy me a coffee ☕</a></p>
      </section>
    </main>

    <footer>
      <span>© {new Date().getFullYear()} ZaynJarvis</span>
      <span className="footer-links">
        {(data?.social?.length ? data.social : fallbackSocial).map((link) => link.url && (
          <a key={link.label} href={link.url} target="_blank" rel="noreferrer"><SocialIcon label={link.label} />{link.label}</a>
        ))}
        <a href="https://buymeacoffee.com/zaynjarvis?status=1" target="_blank" rel="noreferrer">Buy me a coffee</a>
      </span>
      <a href="#top">Back to top ↑</a>
    </footer>
  </>;
}

export default App;
