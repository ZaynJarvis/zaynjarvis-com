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

function Arrow() { return <span aria-hidden="true">↗</span>; }

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
  const [activeSlug, setActiveSlug] = React.useState('OpenViking');
  const active = current.find((project) => project.slug === activeSlug) ?? current[0];

  return <>
    <a className="skip-link" href="#content">Skip to work</a>
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="ZaynJarvis, home">Z/J</a>
      <nav aria-label="Primary navigation"><a href="#focus">Focus</a><a href="#map">Map</a><a href="#index">Index</a><a href="#about">About</a></nav>
      <a className="header-link" href="https://github.com/ZaynJarvis" target="_blank" rel="noreferrer">GitHub <Arrow /></a>
    </header>

    <main id="content">
      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Context field manual · public projects</p>
          <h1 id="hero-title">Tools for agents that need <em>context</em>, coordination, and evidence.</h1>
          <p className="hero-lead">A field index of open-source agent infrastructure, evaluation tools, interfaces, and experiments—with source and project status kept visible.</p>
          <div className="hero-actions"><a href="#map">Trace the work ↓</a><a href="https://canvas.zaynjarvis.com" target="_blank" rel="noreferrer">New · Trackpad Studio <Arrow /></a>{openViking && <a href={openViking.githubUrl} target="_blank" rel="noreferrer">View OpenViking <Arrow /></a>}</div>
        </div>
        <dl className="hero-ledger" aria-label="Portfolio status">
          <div><dt>Focus</dt><dd>OpenViking</dd></div><div><dt>Field</dt><dd>Context infrastructure</dd></div><div><dt>Current projects</dt><dd>{data ? current.length : '—'}</dd></div>
        </dl>
      </section>

      {error && !data && <section className="data-error" role="alert"><h2>Project index unavailable</h2><p>The project data could not be loaded. The source portfolio remains available on GitHub.</p><button type="button" onClick={retry}>Retry</button><a href="https://github.com/ZaynJarvis">Open GitHub <Arrow /></a></section>}
      {!data && !error && <p className="loading" role="status">Loading project field notes…</p>}

      {openViking && <section className="official-section" id="focus" aria-labelledby="focus-title">
        <div className="official-copy"><p className="eyebrow">Current focus</p><h2 id="focus-title">Context should be navigable, not buried in a prompt.</h2><p>{openViking.summary}</p><p className="attribution"><strong>Attribution:</strong> OpenViking is an upstream project by the Volcengine team. The listed ZaynJarvis repository is a fork; these links point to the official site and upstream source.</p><ProjectLinks project={openViking} /></div>
        <div className="official-visual" aria-label="OpenViking context model"><div className="terminal-title"><span /> context://openviking</div><div className="context-tree" role="img" aria-label="A context tree connecting memory, resources, skills, and provenance"><p>viking://</p><p>├── memory/ <span>what persists</span></p><p>├── resources/ <span>what agents know</span></p><p>├── skills/ <span>what agents can do</span></p><p>└── provenance/ <span>why it can be trusted</span></p></div></div>
      </section>}

      {active && <section className="map-section" id="map" aria-labelledby="map-title">
        <div className="section-heading"><div><p className="eyebrow">Project field map</p><h2 id="map-title">Follow the context path.</h2></div><p>Choose a project to inspect its stated role, repository relationship, and latest recorded update.</p></div>
        <div className="constellation"><ul className="node-list" aria-label="Current projects">{current.map((project, index) => <li key={project.slug}><button type="button" className={project.slug === active.slug ? 'node active' : 'node'} onClick={() => setActiveSlug(project.slug)} aria-pressed={project.slug === active.slug}><span>{String(index + 1).padStart(2, '0')}</span>{project.title}<small>{capability(project)}</small></button></li>)}</ul>
          <article className="node-detail" aria-live="polite"><p className="eyebrow">{capability(active)} / selected project</p><h3>{active.title}</h3><p>{active.signal || active.summary}</p><dl><div><dt>Role</dt><dd>{active.category}</dd></div><div><dt>Repository</dt><dd>{active.repo}</dd></div><div><dt>Relationship</dt><dd>{active.fork ? 'Fork' : 'Repository'}</dd></div><div><dt>Updated</dt><dd>{formatDate(active.updatedAt)}</dd></div></dl><ProjectLinks project={active} /></article>
        </div>
      </section>}

      {data && <section className="projects-section" id="index" aria-labelledby="index-title"><div className="section-heading"><div><p className="eyebrow">Capability index</p><h2 id="index-title">Grouped by what each enables.</h2></div><p>Current projects only. Capability labels are curated; activity follows the maintained project record.</p></div><div className="capability-index">{capabilityOrder.map((group) => { const projects = current.filter((project) => capability(project) === group); return projects.length ? <section key={group} aria-labelledby={`cap-${group}`}><h3 id={`cap-${group}`}>{group}<span>{projects.length}</span></h3>{projects.map((project) => <article key={project.slug}><div><p className="project-kicker">{project.category}</p><h4>{project.title}</h4></div><p>{project.signal || project.summary}</p><div className="index-meta"><span>{project.repo}</span><span>Updated {formatDate(project.updatedAt)}</span>{project.stars > 0 && <span>{formatCount(project.stars)} stars</span>}<span>{project.fork ? 'Fork' : 'Repository'}</span><ProjectLinks project={project} compact /></div></article>)}</section> : null; })}</div></section>}

      {archive.length > 0 && <section className="supporting-section" aria-labelledby="archive-title"><div className="section-heading section-heading--compact"><div><p className="eyebrow">Archive</p><h2 id="archive-title">Still useful. Not current.</h2></div><p>Earlier tools and experiments retained for reference.</p></div><div className="supporting-list">{archive.map((project) => <a key={project.slug} href={project.githubUrl} target="_blank" rel="noreferrer"><span>{project.title}</span><span>{project.signal || project.category}</span><Arrow /></a>)}</div></section>}

      <section className="about" id="about" aria-labelledby="about-title"><p className="eyebrow">About this index</p><h2 id="about-title">Sources before claims.</h2><p>This portfolio groups ZaynJarvis repositories by capability and links each entry to its public source. Forks and inactive work are labelled rather than presented as original or current.</p></section>
    </main>
    <footer><span>© {new Date().getFullYear()} ZaynJarvis</span><span><a href="https://github.com/ZaynJarvis" target="_blank" rel="noreferrer">GitHub</a> · <a href="https://www.linkedin.com/in/zhihengliu" target="_blank" rel="noreferrer">LinkedIn</a> · <a href="https://buymeacoffee.com/zaynjarvis?status=1" target="_blank" rel="noreferrer">Buy me a coffee ☕</a></span><a href="#top">Back to top ↑</a></footer>
  </>;
}

export default App;
