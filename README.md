# Bushra Khandoker: portfolio

Source for my academic and research portfolio. I am a Computer Science undergraduate at Swansea University working on AI/ML engineering and independent research into reliable, resource-efficient language models.

The site is built for readers assessing research potential, so every result links to the file it comes from, uncertainty is shown, and unfinished work is labelled as unfinished.

## Stack

- React 18, React Router 7, Vite 6, Tailwind CSS 3 (with CSS-variable design tokens)
- Static prerendering: every route is rendered to HTML at build time (`scripts/prerender.mjs`) and hydrated in the browser
- framer-motion (`LazyMotion`) for reveals and page transitions
- three.js / react-three-fiber / cannon for the interactive bubble universe on the home page (still poster first, live scene when idle on desktop or at the first touch on phones), and small interactive 3D pieces on other pages (`src/components/cosmos/Gem.jsx`)
- Vitest + Testing Library (unit), Playwright + axe-core (end-to-end and accessibility)

## Getting started

Requires Node.js 20 or newer.

```bash
npm ci
npm run dev          # development server at http://localhost:5173
```

| Script | Purpose |
|---|---|
| `npm run build` | Client build, SSR build, then prerender all routes, 404, redirects, sitemap and robots into `dist/` |
| `npm run preview` | Serve `dist/` the way Vercel does (clean URLs, redirects, 404 status, compression) on port 4173 |
| `npm run lint` | ESLint |
| `npm test` | Unit tests |
| `npm run test:e2e` | Playwright tests against the built site (run `npm run build` first) |
| `npm run images` | Re-encode source images from `legacy-assets/` to WebP (Python + Pillow) |
| `node scripts/screenshots.mjs` | Regenerate `docs/screenshots/after/` (needs `npm run preview` running) |

## Structure

```
src/
  data/          all site content: profile, education, research, projects, mlLab, achievements, archive (art), moments, pages (route metadata)
  pages/         one component per route
  components/    layout, UI primitives, motion, research charts, cosmos (3D bubble universe)
  styles/        tokens, fonts, base styles
  tests/         unit tests
  entry-client.jsx / entry-server.jsx
e2e/             Playwright tests
scripts/         prerender, local server, screenshots, image optimisation
docs/            audit, content inventory, verification list, design system, test report, release checklist
```

Content is separate from layout. To change what the site says, edit `src/data/`. Research figures are pinned by tests, so update the data and the test together when new results arrive.

## Documentation

- [Portfolio audit](docs/PORTFOLIO_AUDIT.md): the baseline and why things changed
- [Content inventory](docs/CONTENT_INVENTORY.md): what was removed, kept and added
- [Content verification](docs/CONTENT_VERIFICATION.md): facts awaiting confirmation
- [Design system](docs/DESIGN_SYSTEM.md)
- [Test report](docs/TEST_REPORT.md): results, before/after metrics
- [Release checklist](docs/RELEASE_CHECKLIST.md): deployment, rollback, release notes

## Deployment

Deployed on Vercel from `main`. `vercel.json` defines the build, clean URLs, redirects from the previous site's routes, and caching. See the release checklist for preview, production and rollback steps.

## Contact

[bushrakhandoker2@gmail.com](mailto:bushrakhandoker2@gmail.com) · [github.com/bushrakhandoker708](https://github.com/bushrakhandoker708)
