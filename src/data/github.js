// Activity facts synced from GitHub at build time (scripts/github-sync.mjs).
// Only dates and counts; the written content of the site never comes from GitHub.
import data from "./github.json";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "2026-06-04" → "4 June 2026" (or "June 2026" when short). Deterministic, so prerender and hydration agree. */
export function formatDay(iso, short = false) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return short ? `${MONTHS[m - 1]} ${y}` : `${d} ${MONTHS[m - 1]} ${y}`;
}

export const SYNCED_AT = data.fetchedAt;

/** Activity for one repository, or null if it was never synced (or is private). */
export function activity(repo) {
  const a = data.repos?.[repo];
  if (!a || !a.lastCommit) return null;
  // "Active" is judged against the sync date, not the visitor's clock, so the HTML is stable.
  const days = SYNCED_AT ? Math.round((Date.parse(SYNCED_AT) - Date.parse(a.lastCommit)) / 86400000) : Infinity;
  return { ...a, active: days <= 30 };
}
