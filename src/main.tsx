import React from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, BookOpen, Boxes, Cpu, Github, Globe2, Image, Layers3, Radio, Sparkles } from 'lucide-react';
import './styles.css';

type Project = {
  id: string;
  name: string;
  repo: string;
  domain: string;
  url: string;
  category: string;
  summary: string;
  signal: string;
  accent: string;
  icon: React.ComponentType<{ size?: number }>;
};

type RepoMeta = {
  stargazers_count?: number;
  forks_count?: number;
  updated_at?: string;
  description?: string;
  homepage?: string;
  html_url?: string;
};

const owner = 'ZaynJarvis';

const projects: Project[] = [
  {
    id: 'zouk',
    name: 'Zouk',
    repo: 'zouk',
    domain: 'zouk.zaynjarvis.com',
    url: 'https://zouk.zaynjarvis.com',
    category: 'Agent collaboration runtime',
    summary: 'Shared channels, tasks, threads, activity feeds, and live agents for multi-agent work.',
    signal: 'The operating room where agents and people coordinate real work.',
    accent: '#2563eb',
    icon: Radio,
  },
  {
    id: 'notes',
    name: 'Notes',
    repo: 'notes',
    domain: 'notes.zaynjarvis.com',
    url: 'https://notes.zaynjarvis.com',
    category: 'Public thinking system',
    summary: 'A static notes site for mental models, agent engineering, context lifecycle, and product judgment.',
    signal: 'Judgment updates turned into durable public artifacts.',
    accent: '#0f766e',
    icon: BookOpen,
  },
  {
    id: 'studio',
    name: 'Studio',
    repo: 'studio',
    domain: 'studio.zaynjarvis.com',
    url: 'https://studio.zaynjarvis.com',
    category: 'Creative production surface',
    summary: 'A visual workflow surface for media generation, project previews, and embedded Zouk collaboration.',
    signal: 'Where artifacts become visible enough to judge and iterate.',
    accent: '#be123c',
    icon: Sparkles,
  },
  {
    id: 'openviking',
    name: 'OpenViking',
    repo: 'OpenViking',
    domain: 'openviking.ai',
    url: 'https://openviking.ai',
    category: 'Context infrastructure',
    summary: 'A context database for AI agents, organizing memory, resources, and skills through file-system semantics.',
    signal: 'Memory plus context lifecycle, provenance, and rehydration.',
    accent: '#4f46e5',
    icon: Layers3,
  },
  {
    id: 'openclaw',
    name: 'OpenClaw',
    repo: 'openclaw',
    domain: 'openclaw.ai',
    url: 'https://openclaw.ai',
    category: 'Personal assistant system',
    summary: 'An open personal AI assistant project across platforms and operating environments.',
    signal: 'A user-facing assistant layer around local and cloud agent capability.',
    accent: '#ca8a04',
    icon: Cpu,
  },
  {
    id: 'gallery',
    name: 'Aesthetics Gallery',
    repo: 'aesthetics',
    domain: 'gallery.zaynjarvis.com',
    url: 'https://gallery.zaynjarvis.com',
    category: 'Visual reference workbook',
    summary: 'Design styles, aesthetics, prompts, and image generation references for reusable visual taste.',
    signal: 'A visual memory bank for making product and media taste inspectable.',
    accent: '#9333ea',
    icon: Image,
  },
  {
    id: 'night-city',
    name: 'Night City',
    repo: 'night-city',
    domain: 'night-city.zaynjarvis.com',
    url: 'https://night-city.zaynjarvis.com',
    category: 'Design-system experiment',
    summary: 'A Cyberpunk-inspired design-system bundle with tokens, documentation, and interface examples.',
    signal: 'A style system packaged as a reusable product surface.',
    accent: '#16a34a',
    icon: Boxes,
  },
  {
    id: 'wanman',
    name: 'Wanman',
    repo: 'wanman',
    domain: 'wanman.ai',
    url: 'http://wanman.ai',
    category: 'Agent matrix runtime',
    summary: 'A runtime idea for letting humans observe while local agents coordinate workflows and artifacts.',
    signal: 'A control-room metaphor for multi-agent delegation.',
    accent: '#ea580c',
    icon: Globe2,
  },
];

function openGraphImage(repo: string) {
  return `https://opengraph.githubassets.com/zaynjarvis-com/${owner}/${repo}`;
}

function useRepoMeta() {
  const [data, setData] = React.useState<Record<string, RepoMeta>>({});

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      const entries = await Promise.all(
        projects.map(async (project) => {
          try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${project.repo}`, {
              headers: { Accept: 'application/vnd.github+json' },
            });
            if (!response.ok) return [project.repo, {}] as const;
            const json = (await response.json()) as RepoMeta;
            return [project.repo, json] as const;
          } catch {
            return [project.repo, {}] as const;
          }
        }),
      );

      if (!cancelled) setData(Object.fromEntries(entries));
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}

function formatDate(value?: string) {
  if (!value) return 'curated';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'curated';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span>{value}</span>
      <small>{label}</small>
    </div>
  );
}

function ProjectCard({ project, meta }: { project: Project; meta?: RepoMeta }) {
  const Icon = project.icon;
  const description = meta?.description || project.summary;

  return (
    <article className="project-card" style={{ '--accent': project.accent } as React.CSSProperties}>
      <a className="project-image" href={project.url} target="_blank" rel="noreferrer" aria-label={`Open ${project.name}`}>
        <img src={openGraphImage(project.repo)} alt={`${project.name} GitHub preview`} loading="lazy" />
      </a>
      <div className="project-body">
        <div className="project-kicker">
          <span className="project-icon"><Icon size={18} /></span>
          {project.category}
        </div>
        <h3>{project.name}</h3>
        <p>{description}</p>
        <p className="project-signal">{project.signal}</p>
        <div className="project-meta">
          <span>{project.domain}</span>
          <span>{formatDate(meta?.updated_at)}</span>
        </div>
        <div className="project-actions">
          <a href={project.url} target="_blank" rel="noreferrer">
            Visit <ArrowUpRight size={15} />
          </a>
          <a href={meta?.html_url || `https://github.com/${owner}/${project.repo}`} target="_blank" rel="noreferrer">
            Repo <Github size={15} />
          </a>
        </div>
      </div>
    </article>
  );
}

function App() {
  const repoMeta = useRepoMeta();
  const stars = Object.values(repoMeta).reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
  const activeRepos = Object.keys(repoMeta).length || projects.length;

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">ZaynJarvis project network</p>
          <h1>Agent systems, context infrastructure, media tools, and public notes.</h1>
          <p className="hero-lead">
            A map of the projects around ZaynJarvis: collaboration runtimes, context databases,
            creative production surfaces, visual workbooks, and the notes that compress what was learned.
          </p>
          <div className="hero-actions">
            <a href="#projects">Explore projects</a>
            <a href="https://github.com/ZaynJarvis" target="_blank" rel="noreferrer">
              GitHub <Github size={16} />
            </a>
          </div>
        </div>
        <div className="hero-panel" aria-label="Project preview collage">
          <img className="avatar" src="https://github.com/ZaynJarvis.png" alt="ZaynJarvis GitHub avatar" />
          <div className="preview-stack">
            {projects.slice(0, 4).map((project) => (
              <img key={project.id} src={openGraphImage(project.repo)} alt={`${project.name} repository preview`} />
            ))}
          </div>
        </div>
      </section>

      <section className="stats-section" aria-label="Network status">
        <Stat label="curated project surfaces" value={String(projects.length)} />
        <Stat label="GitHub repos loaded" value={String(activeRepos)} />
        <Stat label="public stars loaded" value={stars ? stars.toLocaleString() : 'live'} />
        <Stat label="deployment target" value="Cloudflare Pages" />
      </section>

      <section className="thesis">
        <div>
          <p className="eyebrow">Operating thesis</p>
          <h2>The site should stay close to the source of truth.</h2>
        </div>
        <p>
          Curated copy explains why each surface exists. GitHub metadata keeps the cards current enough
          to show repo activity without rebuilding the site. Cloudflare can serve the static shell while
          the browser enriches project cards from GitHub on load.
        </p>
      </section>

      <section id="projects" className="projects-section">
        <div className="section-heading">
          <p className="eyebrow">Subdomains and product surfaces</p>
          <h2>What is live, what it is for, and where the source lives.</h2>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} meta={repoMeta[project.repo]} />
          ))}
        </div>
      </section>

      <section className="principles">
        <div className="section-heading">
          <p className="eyebrow">How this homepage should evolve</p>
          <h2>Make the project map useful before making it decorative.</h2>
        </div>
        <div className="principle-grid">
          <div>
            <h3>Default path as product contract</h3>
            <p>The first screen should answer what Zayn is building, what is live, and where to inspect source.</p>
          </div>
          <div>
            <h3>Dynamic where it matters</h3>
            <p>Repo activity, descriptions, stars, and links come from GitHub when available. The site still works offline from curated data.</p>
          </div>
          <div>
            <h3>Static deployment surface</h3>
            <p>No server is required for v1. Cloudflare Pages can build with Vite and serve the generated dist directory.</p>
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
