import { useState } from "react";
import { Link } from "react-router-dom";
import { mlLab } from "../data/mlLab";
import { allTags, experiments, experimentsUsing } from "../data/lab";
import { repoTree } from "../data/site";
import RepoActivity from "../components/RepoActivity";
import Scene3D from "../components/cosmos/Scene3D";
import { Callout, ExternalLink, PageHeader, Section, StatusBadge } from "../components/ui";
import { RevealGroup, RevealItem, Tilt } from "../components/motion";

const LEVEL = {
  notes: { state: "partial", label: "Notes" },
  started: { state: "planned", label: "Started" },
};
const ACCENTS = ["gold", "teal", "rose", "sky", "lavender"];
// A tag filter only helps once there is something to filter.
const FILTER_FROM = 3;

/** One experiment as a card: the question, two headline numbers, the method tags. */
function ExperimentCard({ e }) {
  return (
    <Tilt as="article" className="card card-hover group relative overflow-hidden p-6 sm:p-8" max={4}>
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-label text-xs font-semibold uppercase tracking-label text-accent">
            Experiment {String(e.number).padStart(2, "0")} · {e.kind}
          </p>
          <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">
            <Link to={`/ml-lab/${e.slug}`} className="text-ink no-underline after:absolute after:inset-0 after:z-20 hover:text-accent">
              {e.title}
            </Link>
          </h3>
          <p className="mt-3 font-sub text-lg italic text-champagne">{e.tagline}</p>
          <p className="mt-4 text-muted">{e.summary}</p>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Methods">
            {e.tags.map((t) => (
              <li key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-label text-xs text-muted">
                {t}
              </li>
            ))}
          </ul>
          <RepoActivity repo={e.repo} short className="mt-5" />
        </div>
        <div className="grid content-start gap-4">
          <dl className="grid gap-4">
            {e.headline.slice(0, 2).map((h) => (
              <div key={h.label} className="rounded-xl border border-white/10 bg-canvas/50 p-4">
                <dt className="sr-only">{h.label}</dt>
                <dd className="num text-3xl text-accent">{h.value}</dd>
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
    </Tilt>
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

/** A foundations topic, with the experiments that put it to use. */
function Topic({ t }) {
  const used = experimentsUsing(t.name);
  return (
    <li
      className={`flex h-full flex-col rounded-xl border p-4 ${used.length ? "border-accent/35 bg-accent/[0.05]" : "border-white/10 bg-white/[0.02]"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <ExternalLink href={repoTree("Ai-Machine-Learning", t.path)} className="font-medium">
          {t.name}
        </ExternalLink>
        <StatusBadge state={LEVEL[t.level].state}>{LEVEL[t.level].label}</StatusBadge>
      </div>
      <p className="mt-2 flex-1 text-sm text-muted">{t.covers}</p>
      <p className="mt-3 text-xs text-faint">
        <span className="num text-ink">{t.notes}</span> notes
        {t.progress ? ` · ${t.progress}` : ""}
      </p>
      {used.length > 0 && (
        <p className="mt-2 text-xs">
          <span className="text-faint">Used in </span>
          {used.map((e, i) => (
            <span key={e.slug}>
              {i > 0 && ", "}
              <Link to={`/ml-lab/${e.slug}`}>{e.short}</Link>
            </span>
          ))}
        </p>
      )}
    </li>
  );
}

export default function MlLab() {
  const topics = mlLab.groups.flatMap((g) => g.topics);
  const notes = topics.reduce((n, t) => n + t.notes, 0);
  const applied = topics.filter((t) => experimentsUsing(t.name).length > 0).length;
  const stats = [
    [experiments.length, experiments.length === 1 ? "published experiment" : "published experiments"],
    [notes.toLocaleString("en-GB"), "study notes"],
    [topics.length, "foundation topics"],
    [applied, "topics already used in an experiment"],
  ];

  return (
    <>
      <PageHeader
        eyebrow="ML Lab"
        title="Machine learning lab"
        accent="sky"
        visual={
          <Scene3D
            shape="margin"
            hint="Drag to turn · tap to bend the boundary"
            label="Interactive 3D model of two classes of points and a decision boundary"
            className="h-[20rem] sm:h-[24rem]"
          />
        }
      >
        <p className="lede">{mlLab.intro}</p>
        <p className="mt-4 max-w-prose text-muted">{mlLab.labIntro}</p>
        <dl className="mt-8 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          {stats.map(([v, label]) => (
            <div key={label} className="border-l border-accent/40 pl-3">
              <dt className="sr-only">{label}</dt>
              <dd className="num text-2xl text-ink">{v}</dd>
              <dd className="text-xs text-faint">{label}</dd>
            </div>
          ))}
        </dl>
      </PageHeader>

      <Section id="experiments" eyebrow="Experiments" title="Questions tested on real data" accent="sky">
        <p className="prose-body mb-8">
          Each experiment starts from one question and ends with what it can and cannot show. The page for each one walks through the data,
          the decisions, the results and the places where the analysis pushed back.
        </p>
        <Experiments />
      </Section>

      <Section id="method" eyebrow="Method" title="Rules I hold every experiment to" accent="gold">
        <RevealGroup as="ol" className="grid gap-5 md:grid-cols-2">
          {mlLab.method.map((m, i) => (
            <RevealItem as="li" key={m.title} className="card relative overflow-hidden p-6">
              <span aria-hidden="true" className="num absolute -right-2 -top-4 text-[5.5rem] leading-none text-accent/10">
                {i + 1}
              </span>
              <h3 className="relative text-xl font-semibold">{m.title}</h3>
              <p className="relative mt-3 text-muted">{m.text}</p>
              <p className="relative mt-4 text-sm">
                <span className="text-faint">See it in practice: </span>
                <Link to={`/ml-lab/${m.where.slug}#${m.where.anchor}`}>{m.where.label}</Link>
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section id="foundations" eyebrow="Foundations" title="The notes underneath" accent="teal">
        <p className="prose-body">
          {notes.toLocaleString("en-GB")} notes in my <ExternalLink href={mlLab.repo}>Ai-Machine-Learning vault</ExternalLink>, grouped by
          subject. Highlighted topics are already put to work in an experiment.
        </p>
        <div className="mt-6">
          <Callout title="What this section does and does not claim">{mlLab.evidenceNote}</Callout>
        </div>
        <div className="mt-10 grid gap-10">
          {mlLab.groups.map((g, gi) => (
            <div key={g.title} data-accent={ACCENTS[gi % ACCENTS.length]}>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 pb-2">
                <h3 className="text-xl font-semibold">{g.title}</h3>
                <p className="num text-sm text-faint">
                  {g.topics.reduce((n, t) => n + t.notes, 0)} notes · {g.topics.length} {g.topics.length === 1 ? "topic" : "topics"}
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
