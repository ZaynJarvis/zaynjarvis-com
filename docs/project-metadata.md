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
cover: /cover.png
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
- `cover`: preferred cover path. Use `/cover.png` for repo-root covers.
- `links`: optional secondary links.
- `social`: optional project-specific social links.
- `status`: `include`, `optional`, or `hidden`.

## Cover Rule

Preferred cover source order:

1. README front matter `cover`
2. repo root `/cover.png`
3. generated local cover under `/covers/{repo}.svg` for repos pushed since `2026-04-30`
4. GitHub Open Graph fallback image

No checked repo currently has root `/cover.png` or README metadata. The current site therefore uses generated cover pages for recently pushed projects and falls back to GitHub Open Graph images for older projects.

## Generated Data

Run:

```bash
npm run sync:projects
```

This writes `public/data/projects.json`.

Each project record includes the normalized `links` object, optional project-level `social` links, detected or fallback cover URLs, `recentWork`, `coverStatus`, GitHub stats, and source status.

The static frontend reads this JSON first. If it fails, it falls back to the bundled minimal project list in `src/main.tsx`.
