import { Link } from "react-router-dom";

/** External link that always opens safely and announces that it leaves the site. */
export function ExternalLink({ href, children, className = "" }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span aria-hidden="true"> ↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** Internal links use the router; anything else becomes an ExternalLink. */
export function SmartLink({ href, children, className = "" }) {
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <ExternalLink href={href} className={className}>
      {children}
    </ExternalLink>
  );
}

const STATUS_STYLES = {
  completed: "border-teal/50 text-teal",
  current: "border-teal/50 text-teal",
  partial: "border-amber/60 text-amber",
  planned: "border-rule text-faint",
  upcoming: "border-rule text-faint",
};
const STATUS_LABELS = {
  completed: "Completed",
  current: "Current",
  partial: "In progress",
  planned: "Planned",
  upcoming: "Upcoming",
};

/** Small status pill. Text always carries the meaning; colour is secondary. */
export function StatusBadge({ state, children }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[0.72rem] uppercase tracking-label ${STATUS_STYLES[state] ?? STATUS_STYLES.planned}`}
    >
      {children ?? STATUS_LABELS[state] ?? state}
    </span>
  );
}

export function Tag({ children }) {
  return <li className="rounded-sm bg-raised px-2 py-0.5 font-mono text-xs text-muted">{children}</li>;
}

export function TagList({ items, label }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={label}>
      {items.map((t) => (
        <Tag key={t}>{t}</Tag>
      ))}
    </ul>
  );
}

/** Page heading block used at the top of every page. */
export function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="wrap pb-10 pt-12 sm:pb-14 sm:pt-20">
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h1 className="max-w-4xl text-4xl font-medium sm:text-5xl">{title}</h1>
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}

/** Section with an id so it can be linked to, and a visible heading. */
export function Section({ id, eyebrow, title, children, className = "" }) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={`wrap scroll-mt-24 py-10 sm:py-14 ${className}`}>
      <div className="mb-6 border-t border-rule pt-6">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 id={headingId} className="text-2xl font-medium sm:text-3xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

/** Image figure with intrinsic dimensions (prevents layout shift). */
export function Figure({ src, alt, caption, width, height, eager = false, className = "" }) {
  return (
    <figure className={className}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="w-full rounded-md border border-rule bg-raised"
      />
      {caption && <figcaption className="mt-2 text-sm text-faint">{caption}</figcaption>}
    </figure>
  );
}

export function Callout({ tone = "note", title, children }) {
  const tones = {
    note: "border-l-lavender",
    warning: "border-l-amber",
  };
  return (
    <aside className={`card max-w-prose border-l-4 p-4 sm:p-5 ${tones[tone]}`} role="note">
      {title && <p className="mb-1 font-medium text-ink">{title}</p>}
      <div className="text-sm text-muted">{children}</div>
    </aside>
  );
}

/**
 * Horizontally scrollable container for wide tables. It is focusable and
 * labelled so keyboard users can scroll it (WCAG 2.1.1).
 */
export function ScrollRegion({ label, children, className = "" }) {
  return (
    <div role="region" aria-label={label} tabIndex={0} className={`overflow-x-auto rounded-sm ${className}`}>
      {children}
    </div>
  );
}
