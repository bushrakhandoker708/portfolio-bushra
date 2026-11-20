#!/usr/bin/env node
/*
 * Build-time GitHub sync. Fetches activity facts (last commit date, commit
 * count) for an explicit list of public repositories and writes them to
 * src/data/github.json, which is committed. The written stories on the site are
 * never pulled from GitHub; only these facts are.
 *
 * - Only the repositories listed in REPOS are fetched, never "every repo".
 * - A repository that turns out to be private is skipped and never written.
 * - If GitHub cannot be reached, or a repository fails, the last saved values
 *   are kept and the build carries on.
 * - Language percentages are deliberately not used: GitHub counts committed
 *   dependencies and styles, which misrepresents several of these projects.
 * - Set GITHUB_TOKEN to lift the 60-requests-per-hour anonymous limit; public
 *   repositories need no token.
 *
 * Usage: node scripts/github-sync.mjs   (also runs at the start of npm run build)
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../src/data/github.json", import.meta.url));
const OWNER = "bushrakhandoker708";
// [owner/repo as GitHub knows it, key used by the site]
const REPOS = [
  ["study-buddy", "study-buddy"],
  ["bushal", "bushal"],
  ["relevia", "relevia"],
  ["relevia-research", "relevia-research"],
  ["HEXALOCK", "HEXALOCK"],
  ["PhyCode", "PhyCode"],
  ["periodic_table_visualizer", "periodic_table_visualizer"],
];

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "portfolio-build",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function get(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers, signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res;
}

async function syncRepo(repo) {
  const meta = await (await get(`/repos/${OWNER}/${repo}`)).json();
  if (meta.private) return null;
  const branch = meta.default_branch;
  const commitsRes = await get(`/repos/${OWNER}/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=1`);
  const [latest] = await commitsRes.json();
  // With per_page=1 the "last" page number is the number of commits on the branch.
  const last = /<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/.exec(commitsRes.headers.get("link") ?? "");
  const commits = last ? Number(last[1]) : latest ? 1 : 0;
  return {
    url: meta.html_url,
    branch,
    lastCommit: latest?.commit?.committer?.date?.slice(0, 10) ?? null,
    commits,
    archived: Boolean(meta.archived),
  };
}

let saved = { fetchedAt: null, repos: {} };
try {
  saved = JSON.parse(await readFile(OUT, "utf8"));
} catch {
  // First run: nothing saved yet.
}

const repos = { ...saved.repos };
let ok = 0;
for (const [repo, key] of REPOS) {
  try {
    const data = await syncRepo(repo);
    if (data === null) {
      delete repos[key];
      console.warn(`github-sync: ${repo} is private, left out`);
      continue;
    }
    repos[key] = data;
    ok += 1;
  } catch (e) {
    console.warn(`github-sync: ${repo} kept from last sync (${e.message})`);
  }
}

if (ok === 0) {
  console.warn("github-sync: GitHub unreachable or rate-limited; using the saved file unchanged");
  process.exit(0);
}
const out = { fetchedAt: new Date().toISOString().slice(0, 10), repos };
await writeFile(OUT, `${JSON.stringify(out, null, 2)}\n`);
console.log(`github-sync: ${ok}/${REPOS.length} repositories updated`);
