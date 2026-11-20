import { Link } from "react-router-dom";
import { relevia as r } from "../data/research";
import { Callout, ExternalLink, PageHeader, ScrollRegion, Section, StatusBadge } from "../components/ui";
import { ChartFigure, ConfusionMatrix, DataTable, IntervalPlot, Pipeline, ProportionPlot, fmt, pct } from "../components/research/charts";

const TOC = [
  ["motivation", "Motivation"],
  ["question", "Research question"],
  ["method", "Method"],
  ["experiment", "Prompting pilot"],
  ["compliance", "Instruction compliance"],
  ["latency", "Inference cost"],
  ["safety", "Safety routing"],
  ["negative", "Negative results"],
  ["reproducibility", "Reproducibility"],
  ["limitations", "Limitations"],
  ["next", "Next steps"],
];

export default function ReleviaCase() {
  const allMean = r.latency.elapsed[0];
  const exclMean = r.latency.elapsed[1];
  return (
    <article>
      <PageHeader eyebrow="Research · case study" title={r.title}>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge state="partial">{r.status}</StatusBadge>
          <span className="text-sm text-faint">{r.period}</span>
        </div>
        <p className="lede mt-5">{r.summary}</p>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <li>
            <ExternalLink href={r.repos.research}>Research repository</ExternalLink>
          </li>
          <li>
            <ExternalLink href={r.repos.app}>Application repository</ExternalLink>
          </li>
          <li>
            <ExternalLink href={r.repos.appLive}>Live prototype</ExternalLink>
          </li>
        </ul>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Callout tone="warning" title="Not a clinical tool">
            {r.notClinical}
          </Callout>
          <Callout title="How this work was produced">{r.disclosure}</Callout>
        </div>
      </PageHeader>

      <nav aria-label="On this page" className="wrap no-print">
        <p className="eyebrow mb-2">On this page</p>
        <ol className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {TOC.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`}>{label}</a>
            </li>
          ))}
        </ol>
      </nav>

      <Section id="motivation" title="Motivation">
        <div className="prose-body">
          {r.motivation.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </Section>

      <Section id="question" title="Research question and hypotheses">
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
      </Section>

      <Section id="method" title="Method">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
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
              prompt at once. The current harness rejects C until adaptation is integrated into the controlled runner.
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
        <h3 className="mb-4 mt-12 text-lg font-medium">Experimental pipeline</h3>
        <Pipeline steps={r.pipeline} />
      </Section>

      <Section id="experiment" title="Prompting pilot: developed vs minimal prompt">
        <div className="prose-body mb-8">
          <p>
            {r.pilot.responses} responses were generated for {r.pilot.n} held-out synthetic scenarios, with no runtime failures. The prompt was
            developed on separate development data across two rounds, then frozen before test generation.
          </p>
        </div>
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
      </Section>

      <Section id="compliance" title="Instruction compliance at a larger scale">
        <div className="prose-body mb-8">
          <p>
            An extension generated all {r.compliance.n * 2} responses for {r.compliance.n} new synthetic scenarios. These outputs are{" "}
            <strong>not yet rated</strong>, so this section describes execution behaviour only.
          </p>
        </div>
        <ChartFigure
          title="Responses that hit the 110-token budget"
          context={`n = ${r.compliance.n} per condition · 95% Wilson intervals`}
          caption={`${r.compliance.note} Median reply length: A ${r.compliance.rows[0].medianWords} words, B ${r.compliance.rows[1].medianWords} words. B still exceeded its own 65-word instruction 24 times.`}
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
      </Section>

      <Section id="latency" title="Inference cost, and a confound I found">
        <div className="prose-body mb-8">
          <p>
            At first, B seemed to finish {Math.abs(allMean.mean).toFixed(1)} s sooner on average. Two pairs overlapped a Windows Modern Standby
            interval recorded in the system log. With those two excluded, the mean difference shrinks to {Math.abs(exclMean.mean).toFixed(1)} s and
            the median&apos;s interval includes zero. B is not faster per token. It starts more slowly and finishes sooner because its replies are
            shorter.
          </p>
        </div>
        <ChartFigure
          title="Elapsed time per response, B − A"
          context="Paired differences with bootstrap 95% intervals · Python float32 CPU harness, not browser inference"
          caption="The wide interval on the first row comes from two standby-affected pairs. Excluding them changes the conclusion about the median."
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

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
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
            title="Repeated generations on the outlier input"
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
      </Section>

      <Section id="safety" title="Safety routing: measured on cases frozen in advance">
        <div className="prose-body mb-8">
          <p>
            Before inference, a deterministic rule set decides whether a message needs an urgent-support response. S2 applies the S1 rules after
            normalising {r.safety.normalisation.join(", ")}. The held-out set was frozen before S2 was written: {r.safety.urgent} urgent and{" "}
            {r.safety.nonUrgent} ordinary messages, with {r.safety.excluded} ambiguous cases excluded.
          </p>
        </div>
        <ChartFigure
          title="Recall on urgent messages"
          context={`${r.safety.urgent} urgent cases · 95% Wilson intervals · ${r.safety.labels}`}
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
        <div className="mt-6 flex flex-wrap gap-8">
          {r.safety.detectors.map((d) => (
            <ConfusionMatrix key={d.id} label={`${d.id}: ${d.label}`} tp={d.tp} fn={d.fn} fp={d.fp} tn={d.tn} />
          ))}
        </div>
        <p className="mt-6 max-w-prose text-sm text-muted">
          S0 catches more than S1 but raises {r.safety.detectors[0].fp} false alarms. S2 recovers most of what S1 missed without adding false
          alarms on this set. With only {r.safety.urgent} urgent cases, the intervals are wide and overlap.
        </p>
      </Section>

      <Section id="negative" title="Negative results and anomalies, kept on the record">
        <ul className="list-dash max-w-prose space-y-3 text-muted">
          {r.negativeResults.map((n) => (
            <li key={n.slice(0, 30)}>{n}</li>
          ))}
        </ul>
      </Section>

      <Section id="reproducibility" title="Reproducibility">
        <ul className="list-dash max-w-prose space-y-3 text-muted">
          {r.reproducibility.map((n) => (
            <li key={n.slice(0, 30)}>{n}</li>
          ))}
        </ul>
        <h3 className="mb-3 mt-8 text-lg font-medium">Evidence</h3>
        <ul className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          {r.evidence.map((e) => (
            <li key={e.href}>
              <ExternalLink href={e.href}>{e.label}</ExternalLink>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="limitations" title="Limitations">
        <ul className="list-dash max-w-prose space-y-3 text-muted">
          {r.limitations.map((n) => (
            <li key={n.slice(0, 30)}>{n}</li>
          ))}
        </ul>
      </Section>

      <Section id="next" title="Next steps">
        <ol className="max-w-prose list-decimal space-y-3 pl-5 text-muted marker:text-faint">
          {r.next.map((n) => (
            <li key={n.slice(0, 30)}>{n}</li>
          ))}
        </ol>
        <p className="mt-8 text-sm">
          <Link to="/projects/relevia-app">Engineering details of the application</Link>
        </p>
      </Section>
    </article>
  );
}
