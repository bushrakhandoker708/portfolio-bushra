import { useState } from "react";
import { Link } from "react-router-dom";
import { mlLab } from "../data/mlLab";
import { allTags, experiments, experimentsUsing } from "../data/lab";
import { repoTree } from "../data/site";
import RepoActivity from "../components/RepoActivity";
import Scene3D from "../components/cosmos/Scene3D";
import { Callout, ExternalLink, PageHeader, Section, StatusBadge } from "../components/ui";
import { RevealGroup, RevealItem } from "../components/motion";

const ACCENTS = ["gold", "teal", "rose", "sky", "lavender"];
// A tag filter only helps once there is something to filter.
const FILTER_FROM = 3;

/** One experiment: the question, two headline numbers, the method tags. */
function ExperimentCard({ e }) {
  return (
    <article className="card card-hover group relative overflow-hidden p-6 sm:p-8 xl:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] xl:gap-14">
        <div>
          <p className="font-label text-xs font-semibold uppercase tracking-label text-accent">
            Experiment {String(e.number).padStart(2, "0")} · {e.kind} · {e.period}
          </p>
          <h3 className="mt-3 text-2xl font-semibold sm:text-3xl 2xl:text-4xl">
            <Link to={`/ml-lab/${e.slug}`} className="text-ink no-underline after:absolute after:inset-0 after:z-20 hover:text-accent">
              {e.title}
            </Link>
          </h3>
          <p className="mt-4 font-sub text-lg italic text-champagne sm:text-xl">{e.question}</p>
          <p className="mt-4 max-w-prose text-muted">{e.summary}</p>
          <p className="mt-5 font-label text-xs text-faint">{e.tags.join(" · ")}</p>
          <RepoActivity repo={e.repo} short className="mt-3" />
        </div>
        <div className="flex flex-col justify-between gap-8">
          <dl className="grid gap-6">
            {e.headline.slice(0, 2).map((h) => (
              <div key={h.label} className="border-l-2 border-accent/50 pl-4">
                <dt className="sr-only">{h.label}</dt>
                <dd className="num text-3xl text-ink">{h.value}</dd>
                <dd aria-hidden="true" className="mt-1 text-sm text-faint">
                  {h.label}
                </dd>
              </div>
            ))}
          </dl>
          <p aria-hidden="true" className="font-label text-sm font-semibold text-accent transition-transform group-hover:translate-x-1">
            Read the experiment →
          </p>
        </div>
      </div>
    </article>
  );
}

function Experiments() {
  const tags = allTags();
  const [tag, setTag] = useState(null);
  const shown = tag ? experiments.filter((e) => e.tags.includes(tag)) : experiments;
  return (
    <>
      {experiments.length >= FILTER_FROM && (
        <div role="group" aria-label="Filter experiments by method" className="mb-6 flex flex-wrap gap-2">
          {[null, ...tags].map((t) => (
            <button
              key={t ?? "all"}
              type="button"
              aria-pressed={tag === t}
              onClick={() => setTag(t)}
              className={`btn min-h-[36px] px-4 py-1 text-sm ${tag === t ? "btn-primary" : "btn-quiet"}`}
            >
              {t ?? "All"}
            </button>
          ))}
        </div>
      )}
      <RevealGroup as="ul" className="grid gap-6">
        {shown.map((e) => (
          <RevealItem as="li" key={e.slug}>
            <ExperimentCard e={e} />
          </RevealItem>
        ))}
      </RevealGroup>
    </>
  );
}

/** A foundations topic as a row, with the experiments that put it to use. */
function Topic({ t }) {
  const used = experimentsUsing(t.name);
  return (
    <li className="rule-top flex flex-col py-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {used.length > 0 && <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 translate-y-[-0.15rem] rounded-full bg-accent" />}
        <ExternalLink href={repoTree("Ai-Machine-Learning", t.path)} className="font-medium">
          {t.name}
        </ExternalLink>
        <span className="num text-xs text-faint">{t.notes} notes</span>
        {t.level === "started" && <StatusBadge state="planned">Started</StatusBadge>}
      </div>
      <p className="mt-1.5 text-sm text-muted">{t.covers}</p>
      {(t.progress || used.length > 0) && (
        <p className="mt-1.5 text-xs text-faint">
          {t.progress}
          {t.progress && used.length > 0 && " · "}
          {used.length > 0 && (
            <>
              used in{" "}
              {used.map((e, i) => (
                <span key={e.slug}>
                  {i > 0 && ", "}
                  <Link to={`/ml-lab/${e.slug}`}>{e.short}</Link>
                </span>
              ))}
            </>
          )}
        </p>
      )}
    </li>
  );
}

export default function MlLab() {
  const topics = mlLab.groups.flatMap((g) => g.topics);
  const notes = topics.reduce((n, t) => n + t.notes, 0);
  const stats = [
    [experiments.length, experiments.length === 1 ? "published experiment" : "published experiments"],
    [notes.toLocaleString("en-GB"), "study notes"],
    [topics.length, "foundation topics"],
  ];

  return (
    <>
      <PageHeader
        eyebrow="ML Lab"
        title="Machine learning lab"
        accent="sky"
        visual={
          <Scene3D
            shape="forest"
            hint="A random forest trained in your browser on synthetic data: two interleaved half-moons. Tile colour is the forest’s vote and tile height how strongly its trees agree. Spheres are training points; diamonds are held-out test points, gold when misclassified."
            label="Interactive 3D random forest: a grid of tiles showing its vote over two classes of points, with sliders for the number of trees and their depth"
            className="h-[22rem] sm:h-[26rem] 2xl:h-[32rem]"
          />
        }
      >
        <p className="lede">{mlLab.intro}</p>
        <p className="mt-4 max-w-prose text-muted">{mlLab.labIntro}</p>
        <dl className="mt-8 grid max-w-xl grid-cols-3 gap-x-6 gap-y-4">
          {stats.map(([v, label]) => (
            <div key={label} className="border-l border-accent/40 pl-3">
              <dt className="sr-only">{label}</dt>
              <dd className="num text-2xl text-ink">{v}</dd>
              <dd className="text-xs text-faint">{label}</dd>
            </div>
          ))}
        </dl>
      </PageHeader>

      <Section id="experiments" eyebrow="On real data" title="Experiments" accent="sky">
        <p className="prose-body mb-8">
          Each experiment starts from one question and ends with what it can and cannot show. The page for each one walks through the data,
          the decisions, the results and the places where the analysis pushed back.
        </p>
        <Experiments />
      </Section>

      <Section id="method" eyebrow="Method" title="How I run an experiment" accent="gold">
        <RevealGroup as="ol" className="grid gap-x-12 md:grid-cols-2">
          {mlLab.method.map((m, i) => (
            <RevealItem as="li" key={m.title} className="rule-top grid grid-cols-[3rem_1fr] gap-x-2 py-6">
              <span aria-hidden="true" className="num text-3xl leading-none text-accent/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-semibold">{m.title}</h3>
                <p className="mt-2 text-muted">{m.text}</p>
                <p className="mt-3 text-sm">
                  <span className="text-faint">In practice: </span>
                  <Link to={`/ml-lab/${m.where.slug}#${m.where.anchor}`}>{m.where.label}</Link>
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section id="foundations" eyebrow="Foundations" title="The notes underneath" accent="teal">
        <p className="prose-body">
          {notes.toLocaleString("en-GB")} notes in my <ExternalLink href={mlLab.repo}>Ai-Machine-Learning vault</ExternalLink>, grouped by
          subject. A dot marks a topic an experiment already uses.
        </p>
        <div className="mt-6">
          <Callout title="What this section does and does not claim">{mlLab.evidenceNote}</Callout>
        </div>
        <div className="mt-12 grid gap-12">
          {mlLab.groups.map((g, gi) => (
            <div key={g.title} data-accent={ACCENTS[gi % ACCENTS.length]} className="grid gap-x-12 gap-y-3 lg:grid-cols-[15rem_1fr]">
              <div>
                <h3 className="text-xl font-semibold">{g.title}</h3>
                <p className="num mt-1 text-sm text-faint">
                  {g.topics.reduce((n, t) => n + t.notes, 0)} notes · {g.topics.length} {g.topics.length === 1 ? "topic" : "topics"}
                </p>
              </div>
              <ul className="grid gap-x-10 sm:grid-cols-2 2xl:grid-cols-3">
                {g.topics.map((t) => (
                  <Topic key={t.name} t={t} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="next" title="Next in the lab" accent="rose">
        <ul className="list-dash max-w-prose space-y-2 text-muted">
          {mlLab.next.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <p className="mt-6 max-w-prose text-muted">
          {mlLab.appliedElsewhere.text} <Link to={mlLab.appliedElsewhere.href}>See the Relevia research</Link>.
        </p>
      </Section>
    </>
  );
}
