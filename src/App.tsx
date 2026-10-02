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
  OpenViking: 'Context', notes: 'Context', 'tmux-journal': 'Context',
  'swarm-eval': 'Evidence', termclip: 'Evidence',
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

type ExperienceEntry = { period: string; org: string; role: string; notes: string[] };
const experience: ExperienceEntry[] = [
  {
    period: '2021 – now', org: 'TikTok', role: 'Software Engineer III · Context Engineering · Singapore',
    notes: [
      'Building OpenViking, an open-source context database for agent memory and knowledge, and leading a Singapore team of three on it.',
      'Built an agent-based fault-attribution system for automated alarm analysis.',
      'Before that on TikTok VOD: cut per-video storage cost by 90% (over 500 PB saved in one quarter) and led the VideoPlay strategy platform.',
    ],
  },
  {
    period: '2019', org: 'KnowledgeDB', role: 'Founding engineer',
    notes: ['Legal-tech knowledge project.'],
  },
  {
    period: '2017 – 2021', org: 'Nanyang Technological University', role: 'B.Eng. Electrical and Electronic Engineering',
    notes: ["Highest Distinction, GPA 4.92 / 5.00, Dean's List, full scholarship."],
  },
];

// Inline SVG instead of U+2197: iOS Safari falls back to the emoji glyph for that codepoint.
function Arrow() {
  return <svg className="arrow" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
    <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

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
    <a className="skip-link" href="#content">Skip to content</a>
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="ZaynJarvis, home">Zayn&nbsp;Jarvis</a>
      <nav aria-label="Primary navigation"><a href="#focus">Now</a><a href="#experience">Experience</a><a href="#index">Projects</a><a href="#about">Contact</a></nav>
      <a className="header-link" href="https://github.com/ZaynJarvis" target="_blank" rel="noreferrer">GitHub <Arrow /></a>
    </header>

    <main id="content">
      <section className="hero" id="top" aria-labelledby="hero-title">
        <p className="eyebrow">Zhiheng Liu · Singapore</p>
        <h1 id="hero-title">Hi, I'm Zayn. I build tools that give AI agents context.</h1>
        <p className="hero-lead">I'm a software engineer at TikTok, working on OpenViking, an open-source context database for agent memory and knowledge. Before that I worked on TikTok's video platform, and in 2019 I was the founding engineer of a legal-tech knowledge project. This site collects what I build in the open.</p>
        <div className="hero-actions">
          <a href="https://resume.zaynjarvis.com" target="_blank" rel="noreferrer">Résumé <Arrow /></a>
          <a href="https://github.com/ZaynJarvis" target="_blank" rel="noreferrer">GitHub <Arrow /></a>
          <a href="#index">Projects ↓</a>
        </div>
        <dl className="colophon" aria-label="About me">
          <div><dt>Now</dt><dd>OpenViking at TikTok</dd></div>
          <div><dt>Based in</dt><dd>Singapore</dd></div>
          <div><dt>Previously</dt><dd>TikTok VOD · KnowledgeDB</dd></div>
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

      <section className="experience-section" id="experience" aria-labelledby="experience-title">
        <div className="section-head section-head--compact">
          <p className="eyebrow">Experience</p>
          <h2 id="experience-title">Production systems first, open source now.</h2>
          <p className="section-lead">The short version. The full résumé is at <a href="https://resume.zaynjarvis.com" target="_blank" rel="noreferrer">resume.zaynjarvis.com <Arrow /></a></p>
        </div>
        <ol className="experience-rows">
          {experience.map((entry) => <li key={entry.org}>
            <span className="experience-period">{entry.period}</span>
            <div className="experience-main">
              <h3>{entry.org}<span>{entry.role}</span></h3>
              {entry.notes.map((note) => <p key={note}>{note}</p>)}
            </div>
          </li>)}
        </ol>
      </section>

      {data && <section className="ledger-section" id="index" aria-labelledby="index-title">
        <div className="section-head">
          <p className="eyebrow">Projects</p>
          <h2 id="index-title">Things I'm building in the open.</h2>
          <p className="section-lead">Current work, grouped by what each project is for. Every entry links to its source.</p>
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
        <p className="eyebrow">Contact</p>
        <h2 id="about-title">Say hi.</h2>
        <p className="lead">X or LinkedIn is the quickest way to reach me; the links are below. The full résumé is at <a href="https://resume.zaynjarvis.com" target="_blank" rel="noreferrer">resume.zaynjarvis.com</a>.</p>
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
