import { Link } from "react-router-dom";
import ArchitectureMap from "../components/ArchitectureMap";
import RepoActivity from "../components/RepoActivity";
import { architectures } from "../data/architecture";
import { StoryMedia } from "../components/story";
import { relevia as r, RESEARCH_COMMIT } from "../data/research";
import { Callout, ExternalLink, PageHeader, ScrollRegion, Section, StatusBadge } from "../components/ui";
import { ChartFigure, ConfusionMatrix, DataTable, IntervalPlot, Pipeline, ProportionPlot, fmt, pct } from "../components/research/charts";

const SHORT = RESEARCH_COMMIT.slice(0, 7);
const ACCENTS = ["sky", "gold", "lavender", "teal", "rose"];

// The record that follows the story, for readers who want every claim.
const RECORD = [
  ["machinery", "How the study fits together"],
  ["status", "What is established"],
  ["negative", "Negative results"],
  ["limitations", "Limitations"],
  ["question", "Question and method"],
  ["literature", "Related work"],
  ["reproducibility", "Reproducibility"],
  ["publication", "Before publication"],
];

// The last chapter is rendered on its own, after the eight told in prose.
const FINAL = { id: "now", title: "What I am deciding now" };
const CHAPTERS = [...r.chapters, FINAL];

/** The line at the end of a chapter that sends the reader on to the next one. */
function NextChapter({ n, id, teaser }) {
  return (
    <p className="rule-top mt-14 pt-6">
      <a href={`#${id}`} className="group inline-flex flex-col gap-1 no-underline sm:flex-row sm:items-baseline sm:gap-4">
        <span className="eyebrow">{n ? `Next · Chapter ${n}` : "Next"}</span>
        <span className="font-serif text-xl text-ink transition-colors group-hover:text-accent sm:text-2xl">
          {teaser} <span aria-hidden="true">→</span>
        </span>
      </a>
    </p>
  );
}

/** Two simple bars per row: the median as a solid bar, the 95th percentile as its pale extension. */
function WaitBars({ rows, max = 6 }) {
  return (
    <div
      className="space-y-5"
      role="img"
      aria-label={rows.map((x) => `${x.label}: median ${x.median} s, 95th percentile ${x.p95} s`).join("; ")}
    >
      {rows.map((x) => (
        <div key={x.label}>
          <p className="mb-1.5 flex justify-between gap-3 text-sm">
            <span className="text-ink">{x.label}</span>
            <span className="num text-muted">
              {x.median.toFixed(2)} s <span className="text-faint">· 95th pct {x.p95.toFixed(2)} s</span>
            </span>
          </p>
          <div className="relative h-3 rounded-full bg-white/5">
            <div className="absolute inset-y-0 left-0 rounded-full bg-accent/25" style={{ width: `${(x.p95 / max) * 100}%` }} />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-accent"
              style={{ width: `${Math.max((x.median / max) * 100, 1)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Stat({ value, label }) {
  return (
    // The label comes first in the markup, as a definition list requires, and is shown under the number.
    <div className="rule-top flex flex-col-reverse pt-3">
      <dt className="mt-1 text-sm text-muted">{label}</dt>
      <dd className="num text-3xl text-ink">{value}</dd>
    </div>
  );
}

function FairTest() {
  const keep = ["Partitions", "Controlled variable", "Provenance"];
  return (
    <dl className="divide-y divide-rule border-y border-rule text-sm lg:max-w-3xl">
      {r.setup
        .filter(([k]) => keep.includes(k))
        .map(([k, v]) => (
          <div key={k} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-3">
            <dt className="text-faint">{k}</dt>
            <dd className="text-muted">{v}</dd>
          </div>
        ))}
    </dl>
  );
}

function Shrug() {
  const [allMean, exclMean] = r.latency.elapsed;
  return (
    <div className="space-y-8">
      <ChartFigure
        title="Paired difference in rated quality, B − A"
        context={`n = ${r.pilot.n} scenarios · ${r.pilot.raters} · ${r.pilot.note}`}
        caption="Every interval except emotional acknowledgement crosses zero, and that one touches it. The pilot does not show that the developed prompt is better, or that it is equivalent."
        source={r.pilot.source}
        table={
          <DataTable
            caption="Pilot paired differences"
            columns={["Dimension", "Mean B − A", "95% interval"]}
            rows={r.pilot.dimensions.map((d) => [d.name, fmt(d.mean, 3), `${fmt(d.lo, 3)} to ${fmt(d.hi, 3)}`])}
          />
        }
      >
        <IntervalPlot
          ariaLabel="Interval plot of paired rating differences for five dimensions; most intervals cross zero."
          rows={r.pilot.dimensions.map((d) => ({ label: d.name, value: d.mean, lo: d.lo, hi: d.hi }))}
          domain={[-1.25, 2]}
          ticks={[-1, 0, 1, 2]}
          format={(v) => fmt(v, 2)}
        />
      </ChartFigure>

      <div className="grid gap-8 xl:grid-cols-2">
        <ChartFigure
          title="Replies that ran into the 110-token limit"
          context={`n = ${r.compliance.n} per condition · 95% Wilson intervals · not yet rated`}
          caption={`${r.compliance.note} Median reply length: A ${r.compliance.rows[0].medianWords} words, B ${r.compliance.rows[1].medianWords} words.`}
          source={r.compliance.source}
          table={
            <DataTable
              caption="Token-budget hits"
              columns={["Condition", "Hits", "Rate", "95% interval"]}
              rows={r.compliance.rows.map((c) => [c.condition, `${c.hits} / ${c.n}`, pct(c.hits / c.n), `${pct(c.lo)} – ${pct(c.hi)}`])}
            />
          }
        >
          <ProportionPlot
            ariaLabel="Condition A hit the token budget in 50 percent of responses, condition B in under 2 percent."
            rows={r.compliance.rows.map((c) => ({ label: `${c.condition}: ${c.hits} / ${c.n}`, value: c.hits / c.n, lo: c.lo, hi: c.hi }))}
          />
        </ChartFigure>

        <ChartFigure
          title="Elapsed time per reply, B − A"
          context="Paired differences with bootstrap 95% intervals · Python on a CPU, not the browser"
          caption="The huge interval on the first row comes from two pairs that ran while the laptop was in standby. Without them, the median's interval includes zero."
          source={r.latency.source}
          table={
            <DataTable
              caption="Elapsed time differences"
              columns={["Subset", "n", "Median (95% CI)", "Mean (95% CI)"]}
              rows={r.latency.elapsed.map((e) => [
                e.label,
                e.n,
                `${fmt(e.median)} s (${fmt(e.lo)} to ${fmt(e.hi)})`,
                `${fmt(e.mean)} s (${fmt(e.meanLo)} to ${fmt(e.meanHi)})`,
              ])}
            />
          }
        >
          <IntervalPlot
            ariaLabel="Mean and median elapsed-time differences with and without standby-affected pairs."
            unit="s"
            rows={[
              { label: `Mean, all ${allMean.n} pairs`, value: allMean.mean, lo: allMean.meanLo, hi: allMean.meanHi },
              { label: `Mean, ${exclMean.n} pairs`, value: exclMean.mean, lo: exclMean.meanLo, hi: exclMean.meanHi },
              { label: `Median, all ${allMean.n} pairs`, value: allMean.median, lo: allMean.lo, hi: allMean.hi },
              { label: `Median, ${exclMean.n} pairs`, value: exclMean.median, lo: exclMean.lo, hi: exclMean.hi },
            ]}
            domain={[-55, 5]}
            ticks={[-50, -40, -30, -20, -10, 0]}
            format={(v) => fmt(v, 1)}
          />
        </ChartFigure>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <ChartFigure
          title="Where the time goes, B − A"
          context="58 pairs, standby excluded · median with bootstrap 95% interval"
          source={r.latency.source}
        >
          <ScrollRegion label="Latency components table">
            <DataTable
              caption="Latency components"
              columns={["Component", "Median", "95% interval"]}
              rows={r.latency.components.map((c) => [
                c.label,
                `${fmt(c.median, c.unit === "tokens" ? 0 : 3)} ${c.unit}`,
                `${fmt(c.lo, c.unit === "tokens" ? 0 : 3)} to ${fmt(c.hi, c.unit === "tokens" ? 0 : 3)}`,
              ])}
            />
          </ScrollRegion>
        </ChartFigure>
        <ChartFigure
          title="Repeated generations on the slowest input"
          context="Five runs per condition · the original 528 s delay did not recur"
          source={r.repeat.source}
        >
          <ScrollRegion label="Repeated generation timings table">
            <DataTable
              caption="Repeated generation timings"
              columns={["Condition", "Elapsed median (range)", "First token", "Decode rate"]}
              rows={r.repeat.rows.map((x) => [
                x.condition,
                `${x.elapsedMedian.toFixed(1)} s (${x.elapsedMin.toFixed(1)}–${x.elapsedMax.toFixed(1)})`,
                `${x.ttftMedian.toFixed(2)} s`,
                `${x.decodeMedian.toFixed(2)} tok/s`,
              ])}
            />
          </ScrollRegion>
        </ChartFigure>
      </div>
    </div>
  );
}

function Routing() {
  const g = r.generative;
  return (
    <div className="space-y-8">
      <ChartFigure
        title="Urgent test messages each version of the rules caught (set v3)"
        context={`${r.safety.urgent} urgent and ${r.safety.nonUrgent} ordinary messages · 95% Wilson intervals · ${r.safety.labels}`}
        caption={r.safety.misses}
        source={r.safety.source}
        table={
          <DataTable
            caption="Routing detector performance"
            columns={["Detector", "Recall (95% CI)", "False-positive rate (95% CI)", "TP / FN / FP / TN"]}
            rows={r.safety.detectors.map((d) => [
              `${d.id}: ${d.label}`,
              `${pct(d.recall)} (${pct(d.recallLo)}–${pct(d.recallHi)})`,
              `${pct(d.fpr)} (${pct(d.fprLo)}–${pct(d.fprHi)})`,
              `${d.tp} / ${d.fn} / ${d.fp} / ${d.tn}`,
            ])}
          />
        }
      >
        <ProportionPlot
          ariaLabel="Recall: S0 54 percent, S1 38 percent, S2 75 percent; intervals overlap."
          rows={r.safety.detectors.map((d) => ({ label: `${d.id}: ${d.label}`, value: d.recall, lo: d.recallLo, hi: d.recallHi }))}
        />
      </ChartFigure>
      <div className="flex flex-wrap gap-8">
        {r.safety.detectors.map((d) => (
          <ConfusionMatrix key={d.id} label={`${d.id}: ${d.label}`} tp={d.tp} fn={d.fn} fp={d.fp} tn={d.tn} />
        ))}
      </div>
      <dl className="grid max-w-3xl gap-6 sm:grid-cols-3">
        <Stat value={`${g.missed}`} label="urgent messages the S2 rules let through to the model" />
        <Stat value={`${g.inadequate} of ${g.missed}`} label="replies that were inadequate or harmful, by an agent's reading" />
        <Stat value={`${g.flagged} of ${g.inadequate}`} label="of those caught by my automatic flags" />
      </dl>
      <p className="max-w-prose text-sm text-faint">
        Source: <ExternalLink href={g.source}>generative probe results</ExternalLink>. Six replies, read by a coding agent: an account of
        what happened, not a rate.
      </p>
    </div>
  );
}

function Emergency({ figure }) {
  const v = r.safetyV4;
  const s3 = v.detectors.find((d) => d.id === "S3");
  return (
    <div className="space-y-8">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ChartFigure
          title="Urgent test messages caught, on a new set frozen before S3 existed (v4)"
          context={`${v.urgent} urgent and ${v.nonUrgent} ordinary messages · first run · 95% Wilson intervals · ${v.labels}`}
          caption={`On the same urgent messages, S3 caught ${v.discordant.s3Only} that S2 missed and missed ${v.discordant.s2Only} that S2 caught (exact McNemar p ≈ ${v.mcnemarP.toExponential(1)}). The ${v.ambiguous} ambiguous messages are left out of these rates: S3 answered all ${v.ambiguousCheckIn.n} with its check-in question.`}
          source={v.source}
          table={
            <DataTable
              caption="Routing on the v4 set, first run"
              columns={["Rules", "Caught (95% CI)", "False alarms (95% CI)", "TP / FN / FP / TN"]}
              rows={v.detectors.map((d) => [
                `${d.id}: ${d.label}`,
                `${d.tp} / ${v.urgent} (${pct(d.recallLo)}–${pct(d.recallHi)})`,
                `${d.fp} / ${v.nonUrgent} (${pct(d.fprLo)}–${pct(d.fprHi)})`,
                `${d.tp} / ${d.fn} / ${d.fp} / ${d.tn}`,
              ])}
            />
          }
        >
          <ProportionPlot
            ariaLabel="Share of urgent v4 messages caught: S0 30 percent, S1 22 percent, S2 28 percent, S3 93 percent."
            rows={v.detectors.map((d) => ({
              label: `${d.id}: ${d.tp} / ${v.urgent}`,
              value: d.tp / v.urgent,
              lo: d.recallLo,
              hi: d.recallHi,
            }))}
          />
        </ChartFigure>
        <StoryMedia media={figure} />
      </div>
      <div className="flex flex-wrap items-start gap-10">
        <ConfusionMatrix label="S3 on the v4 set, first run" tp={s3.tp} fn={s3.fn} fp={s3.fp} tn={s3.tn} />
        <dl className="grid min-w-0 flex-1 gap-6 sm:grid-cols-3">
          {v.emergencyTier.map((e) => (
            <Stat
              key={e.id}
              value={`${e.k} of ${e.n}`}
              label={`emergencies ${e.id} sent to an emergency reply${e.k === 0 ? " (it has no emergency tier, and caught none as urgent)" : ""}`}
            />
          ))}
          <Stat
            value={`${v.humanText.falseUrgent} in ${v.humanText.n.toLocaleString("en-GB")}`}
            label="false alarms on human-written messages S3 had never seen"
          />
        </dl>
      </div>
      <p className="max-w-prose text-sm text-faint">
        The scan of human-written text is a check on over-routing only; it says nothing about how many urgent messages S3 would miss.{" "}
        <ExternalLink href={v.humanText.source}>Scan results</ExternalLink>
      </p>
    </div>
  );
}

function Release() {
  const [g2, g3] = r.guard.rows;
  return (
    <ChartFigure
      title="How long before the first words appear"
      context={`${r.guard.timedReplies} real replies, replayed word by word at the measured 5.6 tokens per second · simulated, not timed in a browser`}
      caption={`With G2, ${pct(g2.neverHeld)} of replies were never held back at all. With G3, every reply waits for its first finished sentence; the median longest pause inside a reply is ${g3.medianMaxHold.toFixed(2)} s.`}
      source={r.guard.source}
      table={
        <DataTable
          caption="Reply guard waiting times"
          columns={["Guard", "Median first text", "95th percentile", "Replies never held"]}
          rows={r.guard.rows.map((x) => [
            x.version,
            `${x.firstVisible.toFixed(2)} s`,
            `${x.p95FirstVisible.toFixed(2)} s`,
            pct(x.neverHeld),
          ])}
        />
      }
    >
      <WaitBars
        rows={[
          { label: "G2: shows the unfinished sentence", median: g2.firstVisible, p95: g2.p95FirstVisible },
          { label: "G3: shows only checked sentences", median: g3.firstVisible, p95: g3.p95FirstVisible },
        ]}
      />
    </ChartFigure>
  );
}

function Cost() {
  const b = r.browser;
  const [a, bb] = b.rows;
  return (
    <ChartFigure
      title="The first browser run"
      context={`${b.model} · ${b.runtime} · ${b.gpu} · ${b.repeats} repeats per prompt, 8 November 2026`}
      caption="Medians over three repeats on one machine. A measurement of this laptop, not a result about devices."
      source={b.source}
      table={
        <DataTable
          caption="Browser benchmark medians"
          columns={["Prompt", "First token", "Decode rate", "Whole reply"]}
          rows={b.rows.map((x) => [x.condition, `${x.ttft.toFixed(1)} s`, `${x.decode.toFixed(1)} tok/s`, `${x.endToEnd.toFixed(1)} s`])}
        />
      }
    >
      <dl className="grid gap-6 sm:grid-cols-3">
        <Stat value={`${b.startupCached.toFixed(1)} s`} label="to load the cached model" />
        <Stat value={`≈${a.decode.toFixed(1)}`} label="tokens a second, for both prompts" />
        <Stat
          value={`+${(bb.ttft - a.ttft).toFixed(1)} s`}
          label={`before B's first token (${a.ttft.toFixed(1)} s against ${bb.ttft.toFixed(1)} s)`}
        />
      </dl>
    </ChartFigure>
  );
}

function Already() {
  const near = r.literature.items.filter((l) => /EmoSApp|PlugGuard|MindGuard/.test(l.work));
  return (
    <dl className="grid gap-x-10 lg:grid-cols-3">
      {near.map((l) => (
        <div key={l.work} className="rule-top py-5">
          <dt className="font-medium text-ink">
            <ExternalLink href={l.href}>{l.work}</ExternalLink>
          </dt>
          <dd className="mt-2 text-sm text-muted">{l.relation}</dd>
        </div>
      ))}
    </dl>
  );
}

const EVIDENCE = {
  "fair-test": FairTest,
  shrug: Shrug,
  routing: Routing,
  emergency: Emergency,
  release: Release,
  cost: Cost,
  already: Already,
};

function Chapter({ chapter, n }) {
  const Evidence = EVIDENCE[chapter.id];
  const next = CHAPTERS[n];
  // The emergency chapter places its figure beside the chart; the others put it beside the prose.
  const figureInEvidence = chapter.id === "emergency";
  const sideFigure = chapter.figure && !figureInEvidence;
  return (
    <Section id={chapter.id} eyebrow={`Chapter ${n}`} title={chapter.title} accent={ACCENTS[(n - 1) % ACCENTS.length]}>
      <div className={sideFigure ? "grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]" : ""}>
        <div className="prose-body max-w-prose">
          {chapter.paragraphs.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
        {sideFigure && <StoryMedia media={chapter.figure} />}
      </div>
      {Evidence && (
        <div className="mt-10">
          <Evidence figure={chapter.figure} />
        </div>
      )}
      {next && <NextChapter n={n + 1} id={next.id} teaser={chapter.next} />}
    </Section>
  );
}

export default function ReleviaCase() {
  return (
    <article>
      <PageHeader eyebrow="Research story" title={r.title}>
        <p className="max-w-3xl font-serif text-2xl leading-snug text-ink sm:text-3xl">{r.hook.line}</p>
        <p className="lede mt-5 max-w-prose">{r.hook.intro}</p>
        <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <a href="#start" className="font-medium">
            Start at the beginning <span aria-hidden="true">↓</span>
          </a>
          <a href="#release" className="text-muted">
            Skip to the reply that had already been read
          </a>
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <StatusBadge state="partial">{r.status}</StatusBadge>
          <span className="text-sm text-faint">{r.period}</span>
        </div>
        <RepoActivity repo="relevia-research" className="mt-3" />
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <li>
            <ExternalLink href={r.repos.research}>Research repository</ExternalLink>
          </li>
          <li>
            <ExternalLink href={r.repos.app}>Application repository</ExternalLink>
          </li>
        </ul>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Callout tone="warning" title="Not a clinical tool">
            {r.notClinical}
          </Callout>
          <Callout title="How this work was produced">{r.disclosure}</Callout>
        </div>
      </PageHeader>

      <Section id="abstract" eyebrow="In under a minute" title="The short version" accent="sky">
        <p className="max-w-prose text-lg leading-relaxed text-ink/90">{r.abstract}</p>
      </Section>

      <nav aria-label="Chapters" className="wrap no-print pb-4">
        <p className="eyebrow mb-4">The story, in nine chapters</p>
        <ol className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTERS.map((c, i) => (
            <li key={c.id} className="rule-top py-3">
              <a href={`#${c.id}`} className="flex gap-3 no-underline">
                <span className="num text-faint">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-ink hover:text-accent">{c.title}</span>
              </a>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-muted">
          Afterwards, the full record:{" "}
          {RECORD.map(([id, label], i) => (
            <span key={id}>
              <a href={`#${id}`}>{label}</a>
              {i < RECORD.length - 1 && <span className="text-faint"> · </span>}
            </span>
          ))}
        </p>
      </nav>

      {r.chapters.map((c, i) => (
        <Chapter key={c.id} chapter={c} n={i + 1} />
      ))}

      <Section id={FINAL.id} eyebrow={`Chapter ${CHAPTERS.length}`} title={FINAL.title} accent="gold">
        <p className="max-w-prose text-lg text-muted">
          Two directions are written up. Neither has been run, and which one leads is still open.
        </p>
        <ol className="mt-8 grid gap-6 lg:grid-cols-2">
          {r.directions.map((d, i) => (
            <li key={d.title} className="card p-6">
              <p className="num text-sm text-accent">Direction {String.fromCharCode(97 + i)}</p>
              <h3 className="mt-1 text-xl font-semibold">{d.title}</h3>
              <p className="mt-3 text-muted">{d.text}</p>
              <p className="mt-4 text-sm">
                <StatusBadge state="planned" /> <span className="ml-1 text-muted">{d.status}</span>
              </p>
              <p className="mt-3 text-sm">
                <ExternalLink href={d.source}>{d.sourceLabel}</ExternalLink>
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-prose text-muted">{r.gates}</p>
        <p className="mt-6 text-sm">
          <Link to="/projects/relevia-app">How the app itself is built</Link>
        </p>
        <NextChapter
          id="machinery"
          teaser="Behind the story: the repository every number came from, and the path a result takes through it"
        />
      </Section>

      <Section id="machinery" eyebrow="The full record" title="How the study fits together" accent="teal">
        <p className="mb-8 max-w-prose text-muted">
          The research repository, part by part. Follow a path to watch a result travel from frozen inputs to the record, or choose any part
          to see what it does and open its files at commit <code className="num">{SHORT}</code>.
        </p>
        <ArchitectureMap arch={architectures["relevia-research"]} />
        <NextChapter id="status" teaser="The full record: every claim, and how far it can be trusted" />
      </Section>

      <Section id="status" eyebrow="The full record" title="What is established, and what is not" accent="sky">
        <p className="max-w-prose text-muted">
          Every result in the story, labelled by how far it can be trusted. Each source link opens the file at commit{" "}
          <code className="num">{SHORT}</code> of the research repository, so it shows exactly what the number was copied from.
        </p>
        <ul className="mt-8" aria-label="Evidence status of each result">
          {r.register.map((x) => (
            <li key={x.claim} className="rule-top grid gap-x-8 gap-y-2 py-4 md:grid-cols-[1fr_9rem_15rem] md:items-start">
              <p className="text-ink">
                {x.claim}
                {x.note && <span className="mt-1 block text-sm text-muted">{x.note}</span>}
              </p>
              <p>
                <StatusBadge state={x.status} />
              </p>
              <p className="min-w-0 break-words text-sm">
                <ExternalLink href={x.source}>{x.source.split("/").pop()}</ExternalLink>
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="negative" eyebrow="The full record" title="Negative results and anomalies, kept on the record" accent="rose">
        <ul className="list-dash max-w-prose space-y-3 text-muted">
          {r.negativeResults.map((n) => (
            <li key={n.slice(0, 30)}>{n}</li>
          ))}
        </ul>
      </Section>

      <Section id="limitations" eyebrow="The full record" title="Limitations" accent="lavender">
        <ul className="list-dash max-w-prose space-y-3 text-muted">
          {r.limitations.map((n) => (
            <li key={n.slice(0, 30)}>{n}</li>
          ))}
        </ul>
      </Section>

      <Section id="question" eyebrow="The full record" title="Research question and method" accent="teal">
        <blockquote className="max-w-prose border-l-2 border-lavender pl-5 font-serif text-xl text-ink">{r.question}</blockquote>
        <ul className="mt-8 grid max-w-4xl gap-4">
          {r.hypotheses.map((h) => (
            <li key={h.id} className="card p-5">
              <p className="text-ink">
                <span className="num mr-2 text-lavender">{h.id}</span>
                {h.text}
              </p>
              <p className="mt-2 text-sm text-muted">
                <span className="text-faint">Status: </span>
                {h.status}
              </p>
            </li>
          ))}
        </ul>
        <div id="method" className="mt-12 grid scroll-mt-24 gap-10 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-medium">Conditions</h3>
            <ul className="space-y-2">
              {r.conditions.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 border-b border-rule pb-2">
                  <span className="text-muted">
                    <span className="num mr-2 text-ink">{c.id}</span>
                    {c.label}
                  </span>
                  <StatusBadge state={c.state} />
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">
              Condition C reuses prompt B, so any difference can be attributed to the adapter rather than to changing the weights and the
              prompt at once.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-lg font-medium">Configuration</h3>
            <dl className="divide-y divide-rule border-y border-rule text-sm">
              {r.setup.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-3 py-2">
                  <dt className="text-faint">{k}</dt>
                  <dd className="text-muted">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <h3 className="mb-4 mt-12 text-lg font-medium">Where each part of the study stands</h3>
        <Pipeline steps={r.pipeline} />
      </Section>

      <Section id="literature" eyebrow="The full record" title="Where this sits in related work" accent="lavender">
        <p className="max-w-prose text-muted">{r.literature.note}</p>
        <dl className="mt-8 grid gap-x-10 lg:grid-cols-2">
          {r.literature.items.map((l) => (
            <div key={l.work} className="rule-top py-5">
              <dt className="font-medium text-ink">
                <ExternalLink href={l.href}>{l.work}</ExternalLink>
              </dt>
              <dd className="mt-2 text-sm text-muted">{l.relation}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="reproducibility" eyebrow="The full record" title="Reproducibility" accent="sky">
        <ul className="list-dash max-w-prose space-y-3 text-muted">
          {r.reproducibility.map((n) => (
            <li key={n.slice(0, 30)}>{n}</li>
          ))}
        </ul>
        <h3 className="mb-3 mt-8 text-lg font-medium">Evidence</h3>
        <p className="mb-3 text-sm text-faint">
          Links open commit <code className="num">{SHORT}</code>, not the moving main branch.
        </p>
        <ul className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          {r.evidence.map((e) => (
            <li key={e.href}>
              <ExternalLink href={e.href}>{e.label}</ExternalLink>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="publication" eyebrow="The full record" title="What publication would still need" accent="rose">
        <p className="max-w-prose text-muted">
          None of these has been done. They are listed so the distance between this work and a publishable study is visible.
        </p>
        <dl className="mt-8 grid gap-x-10 md:grid-cols-2 xl:grid-cols-3">
          {r.toPublication.map((t) => (
            <div key={t.need} className="rule-top py-5">
              <dt className="font-medium text-ink">{t.need}</dt>
              <dd className="mt-2 text-sm text-muted">{t.detail}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 text-sm">
          <a href="#start">Back to the beginning of the story</a>
        </p>
      </Section>
    </article>
  );
}
