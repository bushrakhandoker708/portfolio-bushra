// Minimal static server for dist/ that mirrors the production host (vercel.json):
// clean URLs (/about -> about/index.html), permanent redirects, 404.html with a 404 status.
// `vite preview` falls back to the root index.html for every path, which hides
// prerender and hydration problems, so tests and local previews use this instead.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const port = Number(process.env.PORT ?? 4173);
const { redirects = [] } = JSON.parse(await readFile(join(root, "vercel.json"), "utf8"));

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json",
};

// Compressed bodies are cached in memory; dist/ does not change while serving.
const cache = new Map();
const compress = (file, body, enc) => {
  const key = `${enc}:${file}`;
  if (!cache.has(key)) {
    cache.set(key, enc === "br" ? brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 9 } }) : gzipSync(body, { level: 9 }));
  }
  return cache.get(key);
};

const isFile = async (p) => (await stat(p).catch(() => null))?.isFile() ?? false;

async function resolveFile(pathname) {
  const safe = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, "");
  const base = join(dist, safe);
  if (!base.startsWith(dist)) return null;
  for (const candidate of [base, `${base}.html`, join(base, "index.html")]) {
    if (await isFile(candidate)) return candidate;
  }
  return null;
}

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  let { pathname } = url;

  const redirect = redirects.find((r) => r.source === pathname);
  if (redirect) {
    res.writeHead(redirect.permanent ? 308 : 307, { Location: redirect.destination });
    return res.end();
  }
  // trailingSlash: false
  if (pathname.length > 1 && pathname.endsWith("/")) {
    res.writeHead(308, { Location: pathname.slice(0, -1) + url.search });
    return res.end();
  }

  const file = await resolveFile(pathname);
  const status = file ? 200 : 404;
  const target = file ?? join(dist, "404.html");
  let body = await readFile(target);
  const type = TYPES[extname(target)] ?? "application/octet-stream";
  const headers = { "Content-Type": type, Vary: "Accept-Encoding" };
  // Compress text like the production CDN does, so local Lighthouse runs are comparable.
  if (/text|javascript|json|xml|svg/.test(type)) {
    const accept = req.headers["accept-encoding"] ?? "";
    const enc = accept.includes("br") ? "br" : accept.includes("gzip") ? "gzip" : null;
    if (enc) [body, headers["Content-Encoding"]] = [compress(target, body, enc), enc];
  }
  if (target.includes(`${join("dist", "assets")}`)) headers["Cache-Control"] = "public, max-age=31536000, immutable";
  res.writeHead(status, headers);
  res.end(body);
}).listen(port, () => console.log(`serving dist on http://localhost:${port}`));
