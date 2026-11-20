import { useId } from "react";
import { ExternalLink, ScrollRegion, StatusBadge } from "../ui";

// All charts here are static SVG generated from verified data, and every one
// is wrapped in <ChartFigure>, which supplies a caption, sample size, source
// link and a data table, so the information is available without the graphic.

const fmt = (v, digits = 2) => {
  const s = Math.abs(v) < 1e-9 ? "0" : v.toFixed(digits);
  return v > 0 ? `+${s}` : s.replace("-", "−");
};
const pct = (v) => `${(v * 100).toFixed(1)}%`;

/** Figure shell: title, context line, the graphic, caption, source and data table. */
export function ChartFigure({ title, context, children, caption, source, table }) {
  const id = useId();
  return (
    <figure className="card min-w-0 max-w-full p-4 sm:p-6" aria-labelledby={`${id}-t`}>
      <p id={`${id}-t`} className="font-medium text-ink">
        {title}
      </p>
      {context && <p className="mt-1 text-sm text-faint">{context}</p>}
      <div className="mt-5">{children}</div>
      <figcaption className="mt-5 space-y-2 text-sm text-muted">
        {caption && <p>{caption}</p>}
        {source && (
          <p>
            Source: <ExternalLink href={source}>recorded results file</ExternalLink>
          </p>
        )}
      </figcaption>
      {table && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-teal">Show data table</summary>
          <ScrollRegion label={`${title}: data table`} className="mt-3">
            {table}
          </ScrollRegion>
        </details>
      )}
    </figure>
  );
}

/** Generic accessible data table. */
export function DataTable({ caption, columns, rows }) {
  return (
    <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead>
        <tr className="border-b border-rule">
          {columns.map((c) => (
            <th key={c} scope="col" className="py-2 pr-4 font-medium text-ink">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-rule/60">
            {r.map((cell, j) =>
              j === 0 ? (
                <th key={j} scope="row" className="py-2 pr-4 font-normal text-muted">
                  {cell}
                </th>
              ) : (
                <td key={j} className="num py-2 pr-4 text-ink">
                  {cell}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Point estimate with interval for each row, on a shared axis with a
 * reference line (zero for paired differences). Rows are HTML so labels wrap
 * on small screens; each track is a small SVG.
 */
export function IntervalPlot({ rows, domain, ticks, unit = "", reference = 0, format = (v) => fmt(v), ariaLabel }) {
  const [min, max] = domain;
  const x = (v) => ((v - min) / (max - min)) * 100;
  return (
    <div role="img" aria-label={ariaLabel}>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(10rem,14rem)_1fr_6.5rem] sm:items-center sm:gap-4">
            <span className="text-sm text-muted">{r.label}</span>
            <svg viewBox="0 0 100 12" preserveAspectRatio="none" className="h-5 w-full overflow-visible" aria-hidden="true">
              <line x1={x(reference)} x2={x(reference)} y1="0" y2="12" className="stroke-faint" strokeWidth="0.4" strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />
              <line x1={x(r.lo)} x2={x(r.hi)} y1="6" y2="6" className="stroke-lavender" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              <line x1={x(r.lo)} x2={x(r.lo)} y1="3" y2="9" className="stroke-lavender" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <line x1={x(r.hi)} x2={x(r.hi)} y1="3" y2="9" className="stroke-lavender" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <rect x={x(r.value) - 0.9} y="3.5" width="1.8" height="5" className="fill-teal" />
            </svg>
            <span className="num text-sm text-ink sm:text-right">
              {format(r.value)}
              {unit && <span className="text-faint"> {unit}</span>}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-[minmax(10rem,14rem)_1fr_6.5rem] sm:gap-4" aria-hidden="true">
        <span className="hidden sm:block" />
        <div className="relative h-5">
          {ticks.map((t) => (
            <span key={t} className="num absolute -translate-x-1/2 text-[0.7rem] text-faint" style={{ left: `${x(t)}%` }}>
              {format(t)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Proportions with Wilson intervals on a 0–100% axis. */
export function ProportionPlot({ rows, ariaLabel }) {
  return (
    <IntervalPlot
      rows={rows}
      domain={[0, 1]}
      ticks={[0, 0.25, 0.5, 0.75, 1]}
      reference={-1}
      format={(v) => `${Math.round(v * 100)}%`}
      ariaLabel={ariaLabel}
    />
  );
}

/** 2×2 confusion matrix. Rows are the true class, columns the decision. */
export function ConfusionMatrix({ label, tp, fn, fp, tn, rows = ["Urgent", "Not urgent"], cols = ["Flagged", "Not flagged"] }) {
  const cell = (v, kind) => (
    <td className={`num border border-rule px-3 py-2 text-center text-base ${kind === "ok" ? "text-teal" : v > 0 ? "text-danger" : "text-faint"}`}>{v}</td>
  );
  return (
    <table className="border-collapse text-sm">
      <caption className="mb-2 text-left font-medium text-ink">{label}</caption>
      <thead>
        <tr>
          <td />
          <th scope="col" className="px-3 pb-1 text-xs font-normal text-faint">
            {cols[0]}
          </th>
          <th scope="col" className="px-3 pb-1 text-xs font-normal text-faint">
            {cols[1]}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row" className="pr-3 text-right text-xs font-normal text-faint">
            {rows[0]}
          </th>
          {cell(tp, "ok")}
          {cell(fn, "bad")}
        </tr>
        <tr>
          <th scope="row" className="pr-3 text-right text-xs font-normal text-faint">
            {rows[1]}
          </th>
          {cell(fp, "bad")}
          {cell(tn, "ok")}
        </tr>
      </tbody>
    </table>
  );
}

/** Experimental pipeline with explicit completion state for every stage. */
export function Pipeline({ steps }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.step} className={`card p-4 ${s.state === "planned" ? "border-dashed" : ""}`}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="num text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
            <StatusBadge state={s.state} />
          </div>
          <p className="font-medium text-ink">{s.step}</p>
          <p className="mt-1 text-sm text-muted">{s.detail}</p>
        </li>
      ))}
    </ol>
  );
}

export { fmt, pct };
