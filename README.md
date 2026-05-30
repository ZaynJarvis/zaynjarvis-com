# zaynjarvis.com

Static homepage for the ZaynJarvis project network.

The site is a Vite + React app intended for Cloudflare Pages. It renders a curated set of product/project surfaces and enriches each project card with public GitHub repo metadata at runtime.

## Local Development

```bash
npm install
npm run assets:generate
npm run sync:projects
npm run build
npm run preview
```

## Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Node version: `22`
- Production domain: `zaynjarvis.com`

The site does not require server-side credentials. Project data is generated into `public/data/projects.json` from the public GitHub API, README metadata front matter, root `/cover.png` checks, and curated fallbacks.

## Project Data

Run:

```bash
npm run sync:projects
```

The generated registry includes:

- display name
- GitHub repo
- public homepage URL when present
- summary and operating signal
- GitHub stats/update time
- `/cover.png` if present, otherwise GitHub Open Graph fallback
- generated `/covers/{repo}.svg` for repos pushed in the last month
- include/optional/hidden status

The repo metadata contract is documented in `docs/project-metadata.md`.

## PWA Assets

`npm run assets:generate` writes project cover SVGs plus `icon-192.png`, `icon-512.png`, `maskable-icon-512.png`, and `apple-touch-icon.png`.

## Design Review Pack

The selected visual direction is the editorial systems atlas style. The original five generated single-page directions remain stored under `public/design-mocks/` for reference:

- `01-editorial-systems-atlas.png`
- `02-live-operations-console.png`
- `03-public-lab-notebook.png`
- `04-visual-portfolio-index.png`
- `05-protocol-registry.png`

The production frontend no longer exposes the review grid; it uses the first direction as the base UI.
