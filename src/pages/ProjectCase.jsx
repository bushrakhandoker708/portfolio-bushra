import { Link, useParams } from "react-router-dom";
import { getProject } from "../data/projects";
import { Figure, PageHeader, Section, SmartLink, TagList } from "../components/ui";
import { Reveal, RevealGroup, RevealItem } from "../components/motion";
import Scene3D from "../components/cosmos/Scene3D";
import NotFound from "./NotFound";

function Bullets({ items }) {
  return (
    <ul className="list-dash max-w-prose space-y-2 text-muted">
      {items.map((i) => (
        <li key={i.slice(0, 40)}>{i}</li>
      ))}
    </ul>
  );
}

/** One fork in the road: the question, the options weighed, the one taken and why. */
function Fork({ n, question, options, chose, why }) {
  return (
    <RevealItem as="li" className="card relative overflow-hidden p-6 sm:p-7">
      <p className="num text-sm text-accent">Fork {n}</p>
      <h3 className="mt-1 text-xl font-semibold sm:text-2xl">{question}</h3>
      <ul className="mt-5 grid gap-2" aria-label="Options considered">
        {options.map((o, i) => {
          const taken = i === chose;
          return (
            <li
              key={o}
              className={`flex items-start gap-3 rounded-xl border px-4 py-2.5 text-sm ${
                taken ? "border-accent/60 bg-accent/10 text-ink" : "border-white/10 text-faint"
              }`}
            >
              <span aria-hidden="true" className={`mt-0.5 font-label font-semibold ${taken ? "text-accent" : "text-faint"}`}>
                {taken ? "✓" : "·"}
              </span>
              <span className={taken ? "" : "line-through decoration-white/25"}>{o}</span>
              <span className="sr-only">{taken ? " (chosen)" : " (not chosen)"}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 text-muted">{why}</p>
    </RevealItem>
  );
}

const STEPS = [
  ["expected", "The plan"],
  ["observed", "What happened"],
  ["found", "The cause"],
  ["changed", "The fix"],
];

/** A debugging story told in four steps, from expectation to fix. */
function Pushback({ story, open }) {
  return (
    <details className="card group/story overflow-hidden" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6 [&::-webkit-details-marker]:hidden">
        <h3 className="text-xl font-semibold sm:text-2xl">{story.title}</h3>
        <span aria-hidden="true" className="text-2xl text-accent transition-transform duration-300 group-open/story:rotate-45">
          +
        </span>
      </summary>
      <ol className="grid gap-px border-t border-white/10 bg-white/10 md:grid-cols-4">
        {STEPS.map(([key, label], i) => (
          <li key={key} className="bg-surface p-5">
            <p className="num text-xs uppercase tracking-label text-accent">
              {i + 1} · {label}
            </p>
            <p className="mt-2 text-sm text-muted">{story[key]}</p>
          </li>
        ))}
      </ol>
    </details>
  );
}

/** Component/data-flow diagram rendered as an accessible list of connections. */
function Architecture({ nodes, note }) {
  return (
    <figure className="card p-5 sm:p-6">
      <ul className="space-y-2">
        {nodes.map(([from, to]) => (
          <li key={from + to} className="grid items-center gap-2 text-sm sm:grid-cols-[1fr_auto_1fr]">
            <span className="rounded-lg border border-accent/30 bg-raised/80 px-3 py-2 text-ink">{from}</span>
            <span aria-hidden="true" className="text-center text-accent">
              →
            </span>
            <span className="sr-only">connects to</span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-muted">{to}</span>
          </li>
        ))}
      </ul>
      {note && <figcaption className="mt-4 text-sm text-faint">{note}</figcaption>}
    </figure>
  );
}

export default function ProjectCase() {
  const { slug } = useParams();
  const p = getProject(slug);
  if (!p) return <NotFound />;
  const gallery = (p.images ?? []).filter((img) => img.src !== p.cover?.src);
  const team = !p.contribution;

  return (
    <article>
      <PageHeader
        eyebrow={p.kind}
        title={p.title}
        accent="gold"
        visual={p.scene && <Scene3D shape={p.scene.shape} hint={p.scene.hint} label={`Interactive 3D model for ${p.title}`} className="h-[20rem] sm:h-[24rem]" />}
      >
        <p className="poetic text-2xl sm:text-3xl">{p.tagline}</p>
        <p className="lede mt-5">{p.summary}</p>
        <p className="mt-5 text-sm text-faint">
          {p.status} · {p.period}
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {p.links.map((l) => (
            <li key={l.href}>
              <SmartLink href={l.href}>{l.label}</SmartLink>
            </li>
          ))}
        </ul>
      </PageHeader>

      {p.cover && (
        <Reveal className="wrap">
          <div className="shot card aspect-[16/8] p-0 sm:aspect-[16/7]">
            <img src={p.cover.src} alt={p.cover.alt} width={p.cover.w} height={p.cover.h} decoding="async" className="object-top" />
          </div>
        </Reveal>
      )}

      <Section id="start" eyebrow="The spark" title="Where it started" accent="gold">
        <div className="prose-body text-lg">
          {p.spark.map((para) => (
            <p key={para.slice(0, 30)}>{para}</p>
          ))}
        </div>
      </Section>

      <Section id="thinking" eyebrow="Brainstorm" title={team ? "How we thought it through" : "How I thought it through"} accent="teal">
        <p className="prose-body mb-8">
          Every project here came down to a handful of forks in the road. For each one: the options on the table, the one taken, and
          why.
        </p>
        <RevealGroup as="ol" className="grid gap-6 lg:grid-cols-2">
          {p.thinking.map((t, i) => (
            <Fork key={t.question} n={i + 1} {...t} />
          ))}
        </RevealGroup>
      </Section>

      <Section id="pushback" eyebrow="Debugging" title="Where it pushed back" accent="rose">
        <p className="prose-body mb-8">
          {team
            ? "The problems that taught us the most, each told from what we expected to what we changed."
            : "The problems that taught me the most, each told from what I expected to what I changed."}
        </p>
        <div className="grid gap-5">
          {p.pushback.map((story, i) => (
            <Pushback key={story.title} story={story} open={i === 0} />
          ))}
        </div>
      </Section>

      {(p.architecture || gallery.length > 0) && (
        <Section id="architecture" eyebrow="Structure" title="How it fits together" accent="sky">
          {p.architecture && <Architecture {...p.architecture} />}
          {gallery.length > 0 && (
            <div className="mt-8 grid items-start gap-6 md:grid-cols-2">
              {gallery.map((img, i) => (
                <Figure key={img.alt} {...img} className={i === 0 && gallery.length > 2 ? "md:col-span-2" : ""} />
              ))}
            </div>
          )}
        </Section>
      )}

      <Section id="checked" eyebrow="Evidence" title={team ? "How we checked it" : "How I know it works"} accent="lavender">
        <p className="prose-body">{p.checked}</p>
        <p className="prose-body mt-6">
          {p.contribution ?? <span>{p.team}</span>}
        </p>
        <div className="mt-6">
          <TagList items={p.tech} label="Technologies" />
        </div>
      </Section>

      <Section id="open" eyebrow="Honestly" title="What is still open" accent="gold">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-medium">Limitations</h3>
            <Bullets items={p.limitations} />
          </div>
          <div>
            <h3 className="mb-3 text-lg font-medium">Next</h3>
            <Bullets items={p.future} />
          </div>
        </div>
        <p className="mt-10 text-sm">
          <Link to="/projects">All projects</Link>
        </p>
      </Section>
    </article>
  );
}
