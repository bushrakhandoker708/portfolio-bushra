import { Link, useParams } from "react-router-dom";
import RepoActivity from "../components/RepoActivity";
import { getExperiment, neighbours } from "../data/lab";
import { mlLab } from "../data/mlLab";
import { repoTree } from "../data/site";
import { Callout, ExternalLink, Figure, PageHeader, ScrollRegion, Section, SmartLink, TagList } from "../components/ui";
import { Reveal, RevealGroup, RevealItem, Tilt } from "../components/motion";
import { Fork, Pushback } from "../components/story";
import { ChartFigure, ConfusionMatrix, DataTable, IntervalPlot, Pipeline } from "../components/research/charts";
import { CorrelationBars, ErrorsByScore, LabelExplorer, MetricExplorer } from "../components/lab/LabCharts";
import Scene3D from "../components/cosmos/Scene3D";
import NotFound from "./NotFound";

const f4 = (v) => v.toFixed(4);
const pc = (v) => `${(v * 100).toFixed(2)}%`;
const n = (v) => v.toLocaleString("en-GB");

function Bullets({ items }) {
  return (
    <ul className="list-dash max-w-prose space-y-2 text-muted">
      {items.map((i) => (
        <li key={i.slice(0, 40)}>{i}</li>
      ))}
    </ul>
  );
}

/** The few numbers a reader should leave with. */
function Headline({ items }) {
  return (
    <RevealGroup as="ul" className="grid gap-4 md:grid-cols-3">
      {items.map((h) => (
        <RevealItem as="li" key={h.label} className="card relative overflow-hidden p-6">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent"
          />
          <p className="num text-4xl text-accent sm:text-5xl">{h.value}</p>
          <p className="mt-2 font-medium text-ink">{h.label}</p>
          <p className="mt-2 text-sm text-faint">{h.of}</p>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

/** Rows, columns and the class balance of the dataset at a glance. */
function DataCard({ d }) {
  const facts = [
    [n(d.rows), "wines in the source data"],
    [String(d.features), "physicochemical features"],
    [n(d.duplicates), "exact duplicates removed"],
    [n(d.kept), "wines used for modelling"],
    [`${n(d.split.train)} / ${n(d.split.test)}`, "training / test wines"],
    [String(d.conflicts), "identical rows with different labels"],
  ];
  return (
    <div className="card p-6 sm:p-7">
      <p className="font-medium text-ink">
        <ExternalLink href={d.href}>{d.name}</ExternalLink>
      </p>
      <p className="mt-1 text-sm text-faint">
        {d.citation} · {d.licence} · no missing values
      </p>
      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5">
        {facts.map(([v, label]) => (
          <div key={label}>
            <dt className="sr-only">{label}</dt>
            <dd className="num text-2xl text-ink">{v}</dd>
            <dd className="text-sm text-faint">{label}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-sm text-muted">Features: {d.featureNames.join(", ")}.</p>
    </div>
  );
}

/** One classifier explained: the family, the idea, the rule, the cost. */
function TheoryCard({ t, i }) {
  return (
    <RevealItem as="li" className="h-full">
      <Tilt className="card relative h-full overflow-hidden p-6 sm:p-7" max={5}>
        <p className="font-label text-xs font-semibold uppercase tracking-label text-accent">
          {String(i + 1).padStart(2, "0")} · {t.family}
        </p>
        <h3 className="mt-2 text-2xl font-semibold">{t.name}</h3>
        <p className="mt-3 text-muted">{t.idea}</p>
        <p
          className="mt-5 overflow-x-auto rounded-lg border border-white/10 bg-canvas/60 px-4 py-3 font-mono text-sm text-champagne"
          aria-label={`Rule: ${t.formula}`}
        >
          {t.formula}
        </p>
        <dl className="mt-5 space-y-2 text-sm">
          <div>
            <dt className="inline text-faint">Boundary: </dt>
            <dd className="inline text-muted">{t.boundary}</dd>
          </div>
          <div>
            <dt className="inline text-faint">Cost: </dt>
            <dd className="inline text-muted">{t.cost}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-faint">{t.reference}</p>
      </Tilt>
    </RevealItem>
  );
}

export default function LabExperiment() {
  const { slug } = useParams();
  const e = getExperiment(slug);
  if (!e) return <NotFound />;
  const { newer, older } = neighbours(slug);
  const topicPaths = Object.fromEntries(mlLab.groups.flatMap((g) => g.topics).map((t) => [t.name, t.path]));
  const cvLo = Math.floor((Math.min(...e.cv.map((r) => r.mean - r.sd)) - 0.002) * 100) / 100;
  const cvHi = Math.ceil((Math.max(...e.cv.map((r) => r.mean + r.sd)) + 0.002) * 100) / 100;

  return (
    <article>
      <PageHeader
        eyebrow={`ML Lab · Experiment ${String(e.number).padStart(2, "0")} · ${e.kind}`}
        title={e.title}
        accent="sky"
        visual={
          <Scene3D
            shape={e.scene.shape}
            hint={e.scene.hint}
            label={`Interactive 3D model of two classes and a decision boundary, for ${e.short}`}
            className="h-[20rem] sm:h-[24rem]"
          />
        }
      >
        <p className="poetic text-2xl sm:text-3xl">{e.tagline}</p>
        <p className="lede mt-5">{e.summary}</p>
        <p className="mt-5 text-sm text-faint">
          {e.period} · {e.context.text}
        </p>
        <RepoActivity repo={e.repo} className="mt-1" />
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {e.links.map((l) => (
            <li key={l.href}>
              <SmartLink href={l.href}>{l.label}</SmartLink>
            </li>
          ))}
        </ul>
      </PageHeader>

      <Section id="result" eyebrow="In three numbers" title="What came out of it" accent="sky">
        <Headline items={e.headline} />
      </Section>

      <Section id="question" eyebrow="The question" title="What I set out to compare" accent="gold">
        <Reveal>
          <blockquote className="card relative max-w-4xl overflow-hidden p-6 sm:p-8">
            <span aria-hidden="true" className="absolute -left-2 -top-6 font-serif text-[7rem] leading-none text-accent/25">
              “
            </span>
            <p className="relative font-sub text-xl italic text-ink sm:text-2xl">{e.question}</p>
          </blockquote>
        </Reveal>
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_1.15fr]">
          <DataCard d={e.dataset} />
          <LabelExplorer scores={e.dataset.scores} cut={e.dataset.cut} />
        </div>
        <div className="mt-6">
          <CorrelationBars rows={e.dataset.correlations} />
        </div>
      </Section>

      <Section id="models" eyebrow="The contenders" title="Three ways to draw a boundary" accent="lavender">
        <p className="prose-body mb-8">
          The three models come from three different ideas of what it means for two wines to be alike: how close they are, which side of a
          margin they fall on, or how likely each class is to have produced them.
        </p>
        <RevealGroup as="ol" className="grid gap-5 lg:grid-cols-3">
          {e.theory.map((t, i) => (
            <TheoryCard key={t.name} t={t} i={i} />
          ))}
        </RevealGroup>
      </Section>

      <Section id="protocol" eyebrow="Protocol" title="The same rules for every model" accent="teal">
        <p className="prose-body mb-8">
          A comparison is only fair if every model sees the same data in the same way. Each step below was applied identically to all three.
        </p>
        <Pipeline steps={e.protocol} />
      </Section>

      <Section id="thinking" eyebrow="Decisions" title="How I thought it through" accent="gold">
        <p className="prose-body mb-8">
          The choices that shaped the result, with the options on the table and the reason for the one taken.
        </p>
        <RevealGroup as="ol" className="grid gap-6 lg:grid-cols-2">
          {e.thinking.map((t, i) => (
            <Fork key={t.question} n={i + 1} {...t} />
          ))}
        </RevealGroup>
      </Section>

      <Section id="results" eyebrow="Results" title="What the test set said" accent="sky">
        <div className="grid gap-6">
          <MetricExplorer metrics={e.metrics} models={e.models} />

          <ChartFigure
            title="Cross-validation: tuning on the training wines only"
            context="Mean F1 (good class) across five stratified folds, ± one fold standard deviation. The bars show spread between folds; they are not confidence intervals."
            caption={`The RBF kernel scored highest, but its lead over k-NN (${e.cvGap}) is smaller than the spread between folds.`}
            table={
              <DataTable
                caption="Cross-validation F1 by model"
                columns={["Model", "Selected parameters", "Mean F1", "Fold SD"]}
                rows={e.cv.map((r) => [r.label, r.params, f4(r.mean), f4(r.sd)])}
              />
            }
          >
            <IntervalPlot
              rows={e.cv.map((r) => ({
                label: `${r.label} (${r.params})`,
                value: r.mean,
                lo: r.mean - r.sd,
                hi: r.mean + r.sd,
              }))}
              domain={[cvLo, cvHi]}
              ticks={[cvLo, (cvLo + cvHi) / 2, cvHi].map((t) => Math.round(t * 1000) / 1000)}
              reference={-1}
              format={(v) => v.toFixed(3)}
              ariaLabel="Mean cross-validation F1 with one fold standard deviation for each model"
            />
          </ChartFigure>

          <ChartFigure
            title="Confusion matrices on the test set"
            context="Rows are the true class, columns the model's decision. Green cells are correct; red cells are mistakes."
            caption="Every model finds good wines far more reliably than poor ones. The RBF SVM catches the most poor wines (235 of 405) and LDA the fewest (202)."
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {e.confusion.map((c) => (
                <ConfusionMatrix
                  key={c.label}
                  label={c.label}
                  tp={c.goodGood}
                  fn={c.goodPoor}
                  fp={c.poorGood}
                  tn={c.poorPoor}
                  rows={["Good", "Poor"]}
                  cols={["Said good", "Said poor"]}
                />
              ))}
            </div>
          </ChartFigure>

          <div className="grid items-start gap-6 lg:grid-cols-2">
            <ErrorsByScore rows={e.errorsByScore} cut={e.dataset.cut} model={e.bestName} />
            <div className="card p-4 sm:p-6">
              <Figure {...e.figures[0]} width={e.figures[0].w} height={e.figures[0].h} />
              <p className="mt-4 text-sm text-muted">
                ROC AUC:{" "}
                {Object.entries(e.curves.auc)
                  .map(([k, v]) => `${k} ${v.toFixed(2)}`)
                  .join(", ")}
                . Average precision:{" "}
                {Object.entries(e.curves.ap)
                  .map(([k, v]) => `${k} ${v.toFixed(2)}`)
                  .join(", ")}
                .
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section id="pushback" eyebrow="Debugging the analysis" title="Where it pushed back" accent="rose">
        <p className="prose-body mb-8">The results that did not mean what they first seemed to, from the plan to what changed.</p>
        <div className="grid gap-5">
          {e.pushback.map((story, i) => (
            <Pushback key={story.title} story={story} open={i === 0} />
          ))}
        </div>
      </Section>

      <Section id="cost" eyebrow="Fit and cost" title="Overfitting and speed" accent="lavender">
        <div className="grid items-start gap-8 lg:grid-cols-[1.2fr_1fr]">
          <ChartFigure
            title="Training versus test accuracy, and time"
            context="One run on one machine. The order of the timings matters more than the values."
          >
            <ScrollRegion label="Train and test accuracy, gap and timing">
              <DataTable
                caption="Train and test accuracy, gap and timing per model"
                columns={["Model", "Train", "Test", "Gap", "Fit (ms)", "Predict (ms)"]}
                rows={e.costs.map((c) => [
                  c.label,
                  pc(c.train),
                  pc(c.test),
                  `${((c.train - c.test) * 100).toFixed(2)} pts`,
                  c.fitMs.toFixed(2),
                  c.predictMs.toFixed(2),
                ])}
              />
            </ScrollRegion>
          </ChartFigure>
          <div className="prose-body">
            <p>
              LDA barely moves between training and test (a gap of 0.2 points): a straight boundary with few parameters has little room to
              memorise. k-NN and the RBF SVM fit the training wines more closely, with gaps of 4.2 and 3.5 points, which is modest on this
              split, though one comparison cannot rule out overfitting.
            </p>
            <p>
              The costs follow from how each one works. LDA predicts with one linear function per wine. k-NN has nothing to fit but measures
              the distance to all {n(e.dataset.split.train)} training wines for every prediction. The SVM solves an optimisation problem,
              and {n(e.supportVectors.n)} of the {n(e.supportVectors.of)} training wines (
              {Math.round((e.supportVectors.n / e.supportVectors.of) * 100)}%) ended up as support vectors, a sign of how much the two
              classes overlap.
            </p>
          </div>
        </div>
      </Section>

      <Section id="open" eyebrow="Honestly" title="What this does not show, and what comes next" accent="gold">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-medium">Limitations</h3>
            <Bullets items={e.limitations} />
          </div>
          <div>
            <h3 className="mb-3 text-lg font-medium">Next</h3>
            <Bullets items={e.future} />
          </div>
        </div>
      </Section>

      <Section id="foundations" eyebrow="Foundations" title="The notes underneath" accent="teal">
        <p className="prose-body mb-6">The study notes in my vault that this experiment draws on.</p>
        <ul className="flex flex-wrap gap-3">
          {e.topics.map((t) => (
            <li key={t}>
              <a
                href={repoTree("Ai-Machine-Learning", topicPaths[t])}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-quiet min-h-[38px] px-4 py-1 text-sm"
              >
                {t}
                <span className="sr-only"> (opens in a new tab)</span> <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <TagList items={e.stack} label="Tools" />
        </div>
        <div className="mt-8">
          <Callout title="About this work">
            {e.context.text} {e.context.note}
          </Callout>
        </div>
        <details className="mt-8 max-w-prose text-sm">
          <summary className="cursor-pointer text-teal">References</summary>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted">
            {e.references.map((r) => (
              <li key={r.slice(0, 30)}>{r}</li>
            ))}
          </ol>
        </details>
        <nav
          aria-label="More experiments"
          className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm"
        >
          <Link to="/ml-lab">← Back to the ML Lab</Link>
          <span className="flex gap-6">
            {newer && <Link to={`/ml-lab/${newer.slug}`}>Newer: {newer.short}</Link>}
            {older && <Link to={`/ml-lab/${older.slug}`}>Older: {older.short}</Link>}
          </span>
        </nav>
      </Section>
    </article>
  );
}
