// Static prerender: renders every route in src/data/pages.js to dist/<route>/index.html,
// with route-specific <head> tags, plus 404.html, redirect stubs, sitemap.xml and robots.txt.
import { readFile, readdir, writeFile, mkdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const ssr = await import(pathToFileURL(join(root, "dist-ssr", "entry-server.js")).href);
const { render, pages, NOT_FOUND, redirects, SITE_URL, LAST_UPDATED } = ssr;

const assets = await readdir(join(dist, "assets"));
// Preload the body font and the display serif (latin subsets). The serif uses
// font-display: optional, so it must arrive early to be used at all.
const fontPreloads = [/^ibm-plex-sans-latin-400-normal-.*\.woff2$/, /^playfair-display-latin-wght-normal-.*.woff2$/]
  .map((re) => assets.find((f) => re.test(f)))
  .filter(Boolean);
const preload = fontPreloads.map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`).join("\n    ");
const template = (await readFile(join(dist, "index.html"), "utf8")).replace("<!--app-head-->", `${preload}\n    <!--app-head-->`);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// JSON inside <script> must not be able to close the tag.
const safeJson = (o) => JSON.stringify(o ?? {}).replace(/</g, "\\u003c");

function head(path, meta, { noindex = false } = {}) {
  const url = `${SITE_URL}${path}`;
  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    noindex ? `<meta name="robots" content="noindex" />` : "",
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Bushra Khandoker" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:locale" content="en_GB" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<script type="application/ld+json" id="ld-json">${safeJson(meta.jsonLd)}</script>`,
  ]
    .filter(Boolean)
    .join("\n    ");
}

const fill = (headTags, html) => template.replace("<!--app-head-->", headTags).replace("<!--app-html-->", html);

async function emit(file, content) {
  const out = join(dist, file);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, content, "utf8");
}

const routes = Object.keys(pages);
for (const path of routes) {
  const html = await render(path);
  const file = path === "/" ? "index.html" : join(path.slice(1), "index.html");
  await emit(file, fill(head(path, pages[path]), html));
  console.log(`prerendered ${path}`);
}

// 404 page: served by the host for unknown URLs. The client renders the catch-all route.
await emit("404.html", fill(head("/404", NOT_FOUND, { noindex: true }), await render("/__not-found__")));

// Old routes: static fallbacks in case the host's redirect rules are not applied.
for (const [from, to] of Object.entries(redirects)) {
  const target = `${SITE_URL}${to}`;
  await emit(
    join(from.slice(1), "index.html"),
    `<!doctype html><html lang="en-GB"><head><meta charset="utf-8" /><title>Moved</title>` +
      `<meta name="robots" content="noindex" /><link rel="canonical" href="${target}" />` +
      `<meta http-equiv="refresh" content="0; url=${to}" /></head>` +
      `<body><p>This page has moved to <a href="${to}">${to}</a>.</p></body></html>`,
  );
}

const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes.map((p) => `  <url><loc>${SITE_URL}${p}</loc><lastmod>${LAST_UPDATED}</lastmod></url>`).join("\n") +
  `\n</urlset>\n`;
await emit("sitemap.xml", sitemap);
await emit("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

await rm(join(root, "dist-ssr"), { recursive: true, force: true });
console.log(`prerendered ${routes.length} routes, 404, ${Object.keys(redirects).length} redirects, sitemap`);
