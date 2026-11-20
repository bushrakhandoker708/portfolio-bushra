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
| `node scripts/screenshots.mjs` | Regenerate screenshots into the local, untracked `docs/screenshots/after/` (needs `npm run preview` running) |

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
```

Content is separate from layout. To change what the site says, edit `src/data/`. Research figures are pinned by tests, so update the data and the test together when new results arrive.

## Documentation

Working documents (audit, content verification list, design system, test report, release checklist) are kept locally in `docs/`, which is listed in `.gitignore` and not published with the repository.

## Deployment

Deployed on Vercel from `main`. `vercel.json` defines the build, clean URLs, redirects from the previous site's routes, and caching. See the release checklist for preview, production and rollback steps.

## Contact

[bushrakhandoker2@gmail.com](mailto:bushrakhandoker2@gmail.com) · [github.com/bushrakhandoker708](https://github.com/bushrakhandoker708)

## Adding an ML Lab experiment

Each experiment is one file in `src/data/lab/experiments/`, collected by `src/data/lab/index.js` (`import.meta.glob`). Adding a file is enough: the ML Lab index, the `/ml-lab/<slug>` route, page metadata, prerendered HTML, sitemap, the home-page "latest experiment" teaser and the foundations map all pick it up.

1. Copy `wine-quality.js` to `<slug>.js` and replace every field. Give it the next `number` and today's `date` (newest first).
2. Copy numbers from executed notebook outputs only, as fractions (`0.7746`, not `"77.46%"`). Retell reasons the notebook gives; leave out what it does not say.
3. `topics` must use names from `src/data/mlLab.js`; `src/tests/lab-data.test.js` checks this.
4. Add the repository to `REPOS` in `scripts/github-sync.mjs` so its commit activity shows.
5. If the work began as coursework, say so in `context` and link to it rather than copying it.
6. Add `/ml-lab/<slug>` to `ROUTES` in `e2e/site.spec.js`, then run `npm test` and `npm run test:e2e`.

The tag filter on the index appears once there are three experiments.

## GitHub activity sync

`npm run build` starts with `scripts/github-sync.mjs` (also `npm run sync:github`). It fetches the last commit date and commit count for an explicit list of public repositories and writes them to `src/data/github.json`, which is committed. The site shows them as "95 commits · last commit 4 June 2026", with an "Active" marker when the last commit is within 30 days of the sync.

- Only dates and counts are synced. The project stories, research numbers and all other text stay hand-written and verified.
- Only the repositories listed in the script are fetched; a repository that is private is skipped.
- If GitHub is unreachable or rate-limited, the last saved file is used and the build carries on.
- Public repositories need no token. Set `GITHUB_TOKEN` in the build environment only if the 60-requests-per-hour anonymous limit is reached.
- The numbers refresh whenever the site is rebuilt. To keep them current without pushing, add a Vercel Deploy Hook and call it on a schedule (for example a weekly GitHub Actions workflow).

