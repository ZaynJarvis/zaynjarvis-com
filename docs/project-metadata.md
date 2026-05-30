# Project Metadata Contract

`zaynjarvis.com` should be generated from GitHub repo data, with repo-local metadata used as the highest-priority override.

## README Block

Each project repo can add a YAML-like front matter block at the top of `README.md`.

```yaml
---
title: Zouk
category: Agent collaboration runtime
homepage: https://zouk.zaynjarvis.com
priority: 100
summary: Shared channels, tasks, threads, activity feeds, and live agents for multi-agent work.
signal: The operating room where agents and people coordinate real work.
links:
  github: https://github.com/ZaynJarvis/zouk
  docs:
  demo:
social:
  x:
  discord:
status: include
---
```

## Field Semantics

- `title`: display name.
- `category`: short project class.
- `homepage`: public URL. If blank, the homepage card should not invent one.
- `priority`: larger number appears earlier.
- `summary`: what the project is.
- `signal`: why it matters in the ZaynJarvis network.
- `accentColor` / `secondaryColor`: optional color overrides. If absent, `zaynjarvis-com` supplies project colors.
- `cover`: optional explicit PNG cover URL or site path. Repos do not need to carry a cover image.
- `links`: optional secondary links.
- `social`: optional project-specific social links.
- `status`: `include`, `optional`, or `hidden`.

## Cover Rule

Preferred cover source order:

1. README front matter `cover`, only when a repo has a deliberate custom cover URL or site path.
2. Site-owned imagegen cover under `/covers/{repo}.png` for repos pushed since `2026-04-30`.
3. Local imagegen fallback cover at `/covers/registry-fallback.png`.

The default is intentionally site-owned: business repos are not required to carry cover images, and the frontend does not fall back to GitHub Open Graph images.

## Generated Data

Run:

```bash
npm run sync:projects
```

This writes `public/data/projects.json`.

Each project record includes the normalized `links` object, optional project-level `social` links, site-owned color fields, local cover URLs, `recentWork`, `coverStatus`, GitHub stats, and source status.

The static frontend reads this JSON first. If it fails, it falls back to the bundled minimal project list in `src/main.tsx`.
