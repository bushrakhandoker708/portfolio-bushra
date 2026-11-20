import { useId, useState } from "react";
import { ChartFigure, DataTable } from "../research/charts";

/*
 * Interactive charts for ML Lab experiments. Each one is drawn from the
 * experiment's data file only, and each has a data table, so nothing depends
 * on seeing the graphic or using the controls.
 */

const f4 = (v) => v.toFixed(4);
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;

/** A row of toggle buttons that behaves as one choice. */
function Choice({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          aria-pressed={value === o.key}
          onClick={() => onChange(o.key)}
          className={`btn min-h-[38px] px-4 py-1 text-sm ${value === o.key ? "btn-primary" : "btn-quiet"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Switch the metric and watch the always-"good" baseline move: close to the
 * models on accuracy and F1, exposed on balanced accuracy and poor recall.
 */
export function MetricExplorer({ metrics, models }) {
  const [key, setKey] = useState("accuracy");
  const metric = metrics.find((m) => m.key === key);
  const base = models.find((m) => m.baseline);
  const top = Math.max(...models.filter((m) => !m.baseline).map((m) => m[key]));
  return (
    <ChartFigure
      title="One test set, six ways to score it"
      context="Held-out test set, 1,189 wines. Good quality is the positive class. Pick a metric."
      caption="The dashed line marks the always-'good' baseline. A metric that leaves it close to the real models is rewarding the class balance, not learning."
      table={
        <DataTable
          caption="Test-set metrics for each model"
          columns={["Model", ...metrics.map((m) => m.label)]}
          rows={models.map((m) => [m.label, ...metrics.map((x) => f4(m[x.key]))])}
        />
      }
    >
      <Choice label="Metric" options={metrics} value={key} onChange={setKey} />
      <div className="relative mt-6">
        <ul className="space-y-3" aria-label={`${metric.label} by model`}>
          {models.map((m) => {
            const v = m[key];
            const lead = !m.baseline && v === top;
            return (
              <li key={m.label} className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(9rem,12rem)_1fr_4.5rem] sm:items-center sm:gap-4">
                <span className={`text-sm ${m.baseline ? "text-faint" : "text-muted"}`}>{m.label}</span>
                <span className="relative block h-6 overflow-hidden rounded-md bg-white/[0.04]">
                  <span
                    className={`absolute inset-y-0 left-0 rounded-md motion-safe:transition-[width] motion-safe:duration-700 ${
                      m.baseline
                        ? "border border-dashed border-faint/60 bg-white/[0.06]"
                        : lead
                          ? "bg-gradient-to-r from-accent/70 to-accent"
                          : "bg-accent-2/45"
                    }`}
                    style={{ width: `${Math.max(v * 100, 0.6)}%` }}
                  />
                  {!m.baseline && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 w-px border-l border-dashed border-ink/50"
                      style={{ left: `${base[key] * 100}%` }}
                    />
                  )}
                </span>
                <span className={`num text-sm sm:text-right ${lead ? "text-accent" : "text-ink"}`}>{f4(v)}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-2 hidden grid-cols-[minmax(9rem,12rem)_1fr_4.5rem] gap-4 sm:grid" aria-hidden="true">
          <span />
          <span className="num flex justify-between text-[0.7rem] text-faint">
            <span>0</span>
            <span>0.5</span>
            <span>1</span>
          </span>
        </div>
      </div>
      <p className="mt-5 min-h-[3rem] text-sm text-muted" aria-live="polite">
        <span className="font-medium text-ink">{metric.label}.</span> {metric.explain}
      </p>
    </ChartFigure>
  );
}

/**
 * The quality scores, with the cut that turns them into two classes. The study
 * used 6; moving the slider only re-counts the same scores to show how the
 * class balance depends on where the line is drawn.
 */
export function LabelExplorer({ scores, cut: used }) {
  const id = useId();
  const [cut, setCut] = useState(used);
  const total = scores.reduce((n, s) => n + s.n, 0);
  const good = scores.filter((s) => s.score >= cut).reduce((n, s) => n + s.n, 0);
  const max = Math.max(...scores.map((s) => s.n));
  const min = scores[1].score;
  const maxCut = scores[scores.length - 1].score;
  return (
    <ChartFigure
      title="Where the line between good and poor is drawn"
      context={`Quality scores of all ${total.toLocaleString("en-GB")} white wines before cleaning. The study labels a wine good if it scored ${used} or more.`}
      caption="Most wines scored 5 or 6, so the cut falls through the densest part of the data. Moving it changes the balance a lot; the study kept 6."
      table={
        <DataTable
          caption="Wines per quality score"
          columns={["Score", "Wines"]}
          rows={scores.map((s) => [String(s.score), s.n.toLocaleString("en-GB")])}
        />
      }
    >
      <div className="flex h-44 items-end gap-2 sm:gap-3" aria-hidden="true">
        {scores.map((s) => {
          const isGood = s.score >= cut;
          return (
            <div key={s.score} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="num text-[0.7rem] text-faint">{s.n.toLocaleString("en-GB")}</span>
              <span
                className={`w-full rounded-t-md motion-safe:transition-colors motion-safe:duration-500 ${isGood ? "bg-teal/75" : "bg-rose/70"}`}
                style={{ height: `${Math.max((s.n / max) * 100, 1.5)}%` }}
              />
              <span className={`num text-sm ${s.score === cut ? "text-ink" : "text-faint"}`}>{s.score}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <label htmlFor={`${id}-cut`} className="text-sm text-muted">
            Good if the score is at least <span className="num text-ink">{cut}</span>
            {cut === used && <span className="text-faint"> (the study’s choice)</span>}
          </label>
          <input
            id={`${id}-cut`}
            type="range"
            min={min}
            max={maxCut}
            step={1}
            value={cut}
            onChange={(e) => setCut(Number(e.target.value))}
            className="mt-2 w-full accent-[rgb(var(--accent))]"
          />
        </div>
        <p className="num text-sm" aria-live="polite">
          <span className="text-teal">good {pc(good / total)}</span>
          <span className="text-faint"> · </span>
          <span className="text-rose">poor {pc(1 - good / total)}</span>
        </p>
      </div>
    </ChartFigure>
  );
}

/** Error rate for each original score, with the number of wines behind it. */
export function ErrorsByScore({ rows, cut, model }) {
  return (
    <ChartFigure
      title={`Where the ${model} goes wrong`}
      context="Test-set error rate grouped by each wine's original quality score. Bar width is the error rate; the count is how many test wines had that score."
      caption="Scores 5 and 6 sit either side of the cut and hold most of the wines. The extremes rest on very few wines (five 3s, two 9s), so their rates say little."
      table={
        <DataTable
          caption="Error rate by original quality score"
          columns={["Score", "Test wines", "Error rate"]}
          rows={rows.map((r) => [String(r.score), String(r.n), pc(r.error)])}
        />
      }
    >
      <ul className="space-y-2.5">
        {rows.map((r) => (
          <li key={r.score} className="grid grid-cols-[2.5rem_1fr_7.5rem] items-center gap-3">
            <span className={`num text-sm ${r.score >= cut ? "text-teal" : "text-rose"}`}>{r.score}</span>
            <span className="relative block h-5 rounded bg-white/[0.04]">
              <span
                className={`absolute inset-y-0 left-0 rounded ${r.n < 10 ? "border border-dashed border-gold/60 bg-gold/15" : "bg-gold/70"}`}
                style={{ width: `${Math.max(r.error * 100, 0.8)}%` }}
              />
              {r.score === cut && (
                <span aria-hidden="true" className="absolute -top-2 bottom-[-0.5rem] left-0 border-l border-dashed border-ink/50" />
              )}
            </span>
            <span className="num text-right text-sm text-ink">
              {pc(r.error)} <span className="text-faint">of {r.n}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-faint">
        <span className="text-rose">Poor</span> scores are below {cut}, <span className="text-teal">good</span> ones {cut} and above. Dashed
        bars rest on fewer than ten wines.
      </p>
    </ChartFigure>
  );
}

/** Diverging bars: how each feature correlates with the good-quality label. */
export function CorrelationBars({ rows }) {
  const scale = 0.45;
  const x = (v) => 50 + (v / scale) * 50;
  return (
    <ChartFigure
      title="What separates good from poor, one feature at a time"
      context="Point-biserial correlation with the good-quality label, after removing duplicates (all rows where that was the only value reported)."
      caption="Alcohol is the strongest single signal, density and volatile acidity the strongest against. None is close to separating the classes alone, so all 11 features were kept."
      table={
        <DataTable
          caption="Correlation with the good-quality label"
          columns={["Feature", "All 4,898 rows", "After removing duplicates"]}
          rows={rows.map((r) => [r.feature, r.all.toFixed(3), r.dedup == null ? "not reported" : r.dedup.toFixed(3)])}
        />
      }
    >
      <ul className="space-y-3">
        {rows.map((r) => {
          const v = r.dedup ?? r.all;
          return (
            <li key={r.feature} className="grid grid-cols-1 gap-1 sm:grid-cols-[10rem_1fr_4rem] sm:items-center sm:gap-4">
              <span className="text-sm text-muted">{r.feature}</span>
              <span className="relative block h-5">
                <span aria-hidden="true" className="absolute inset-y-0 left-1/2 border-l border-rule" />
                <span
                  className={`absolute inset-y-0.5 rounded ${v > 0 ? "bg-teal/70" : "bg-rose/70"}`}
                  style={v > 0 ? { left: "50%", width: `${x(v) - 50}%` } : { left: `${x(v)}%`, width: `${50 - x(v)}%` }}
                />
              </span>
              <span className="num text-sm text-ink sm:text-right">{v.toFixed(3).replace("-", "−")}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 hidden grid-cols-[10rem_1fr_4rem] gap-4 sm:grid" aria-hidden="true">
        <span />
        <span className="num flex justify-between text-[0.7rem] text-faint">
          <span>−0.45</span>
          <span>0</span>
          <span>+0.45</span>
        </span>
      </div>
    </ChartFigure>
  );
}
