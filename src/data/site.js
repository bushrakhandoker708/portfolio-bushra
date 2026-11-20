// Global site settings. SITE_URL must match the production domain (see docs/CONTENT_VERIFICATION.md).
export const SITE_URL = "https://portfolio-bushra-khandoker.vercel.app";
export const LAST_UPDATED = "2026-11-20";
export const GITHUB_USER = "bushrakhandoker708";

/** Link to a file in one of Bushra's public repositories. */
export const repoFile = (repo, path, branch = "main") =>
  `https://github.com/${GITHUB_USER}/${repo}/blob/${branch}/${path.split("/").map(encodeURIComponent).join("/")}`;

/** Link to a folder in one of Bushra's public repositories. */
export const repoTree = (repo, path = "", branch = "main") =>
  path
    ? `https://github.com/${GITHUB_USER}/${repo}/tree/${branch}/${path.split("/").map(encodeURIComponent).join("/")}`
    : `https://github.com/${GITHUB_USER}/${repo}`;

// Bushra's separate art portfolio.
export const ART_PORTFOLIO = "https://art-portfolio-rust.vercel.app/";
