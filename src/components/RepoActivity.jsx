import { activity, formatDay, SYNCED_AT } from "../data/github";

/**
 * "95 commits · last commit 4 June 2026", from the build-time GitHub sync.
 * Renders nothing for a repository that has not been synced.
 */
export default function RepoActivity({ repo, short = false, className = "" }) {
  const a = activity(repo);
  if (!a) return null;
  return (
    <p className={`flex flex-wrap items-center gap-x-2 text-sm text-faint ${className}`}>
      {a.active && (
        <span className="inline-flex items-center gap-1.5 font-label text-xs font-semibold uppercase tracking-label text-teal">
          <span aria-hidden="true" className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
          </span>
          Active
        </span>
      )}
      <span>
        {a.commits} commits · last commit{" "}
        <time dateTime={a.lastCommit}>{formatDay(a.lastCommit, short)}</time>
        {!short && SYNCED_AT && (
          <span className="text-faint/80">
            {" "}
            (GitHub, checked <time dateTime={SYNCED_AT}>{formatDay(SYNCED_AT)}</time>)
          </span>
        )}
      </span>
    </p>
  );
}
