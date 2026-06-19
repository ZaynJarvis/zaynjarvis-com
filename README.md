# zaynjarvis.com

Static homepage for ZaynJarvis and his project network, with OpenViking presented as the current official project.

The site is a Vite + React app intended for Cloudflare Pages. It presents OpenViking first, then recent work, live project surfaces, archive context, and social links, with project data generated from public GitHub metadata.

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

The site does not require server-side credentials. Project data is generated into `public/data/projects.json` from the public GitHub API, README metadata front matter, and curated fallbacks.

## Project Data

Run:

```bash
npm run sync:projects
```

The generated registry includes:

- display name
- GitHub repo
- public homepage URL when present
- GitHub stats/update time
- site-owned imagegen cover fallback
- imagegen `/covers/{repo}.png` when a site-owned cover exists
- rolling 60-day recent-work status from GitHub pushed-at time
- include/optional/hidden status

The repo metadata contract is documented in `docs/project-metadata.md`.

## PWA Assets

`npm run assets:generate` verifies the checked-in imagegen PNG covers, registry fallback, favicon, and PWA icons.

## Design Review Pack

The selected visual direction is the editorial systems atlas style. The original five generated single-page directions remain stored under `public/design-mocks/` for reference:

- `01-editorial-systems-atlas.png`
- `02-live-operations-console.png`
- `03-public-lab-notebook.png`
- `04-visual-portfolio-index.png`
- `05-protocol-registry.png`

The production frontend no longer exposes the review grid; it uses the first direction as the base UI.
