# zaynjarvis.com

Static homepage for the ZaynJarvis project network.

The site is a Vite + React app intended for Cloudflare Pages. It renders a curated set of product/project surfaces and enriches each project card with public GitHub repo metadata at runtime.

## Local Development

```bash
npm install
npm run build
npm run preview
```

## Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Node version: `22`
- Production domain: `zaynjarvis.com`

The site does not require server-side credentials. GitHub metadata is fetched client-side from the public GitHub API and falls back to curated copy if the request is rate-limited or unavailable.

## Project Data

Curated project data currently lives in `src/main.tsx`. Each project includes:

- display name
- GitHub repo slug
- public domain
- summary and operating signal
- GitHub Open Graph preview image

Next useful improvement: move project data into a small JSON file or GitHub-hosted registry so the homepage can be updated without touching the React component.
