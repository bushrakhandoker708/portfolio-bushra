import { Link, useParams } from "react-router-dom";
import { getProject } from "../data/projects";
import { Figure, PageHeader, Section, SmartLink, TagList } from "../components/ui";
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

/** Component/data-flow diagram rendered as an accessible list of connections. */
function Architecture({ nodes, note }) {
  return (
    <figure className="card p-5 sm:p-6">
      <ul className="space-y-2">
        {nodes.map(([from, to]) => (
          <li key={from + to} className="grid items-center gap-2 text-sm sm:grid-cols-[1fr_auto_1fr]">
            <span className="rounded-sm border border-rule bg-raised px-3 py-2 text-ink">{from}</span>
            <span aria-hidden="true" className="text-center text-teal">
              →
            </span>
            <span className="sr-only">connects to</span>
            <span className="rounded-sm border border-rule px-3 py-2 text-muted">{to}</span>
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

  return (
    <article>
      <PageHeader eyebrow={p.kind} title={p.title}>
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className="inline text-faint">Status: </dt>
            <dd className="inline text-muted">{p.status}</dd>
          </div>
          <div>
            <dt className="inline text-faint">When: </dt>
            <dd className="inline text-muted">{p.period}</dd>
          </div>
        </dl>
        <p className="lede mt-5">{p.summary}</p>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {p.links.map((l) => (
            <li key={l.href}>
              <SmartLink href={l.href}>{l.label}</SmartLink>
            </li>
          ))}
        </ul>
      </PageHeader>

      <Section id="problem" title="Problem and motivation">
        <div className="prose-body">
          <p>{p.problem}</p>
          <p>{p.motivation}</p>
        </div>
        <h3 className="mb-3 mt-8 text-lg font-medium">Objectives</h3>
        <Bullets items={p.objectives} />
      </Section>

      {(p.architecture || p.images) && (
        <Section id="architecture" title="Architecture">
          {p.architecture && <Architecture {...p.architecture} />}
          {p.images && (
            <div className="mt-6 grid gap-6">
              {p.images.map((img) => (
                <Figure key={img.alt} {...img} />
              ))}
            </div>
          )}
        </Section>
      )}

      <Section id="decisions" title="Implementation decisions">
        <Bullets items={p.decisions} />
      </Section>

      <Section id="contribution" title="My contribution">
        <p className="prose-body">
          {p.contribution ?? (
            <>
              {p.team} <span className="text-amber">My individual contribution is being confirmed with the team before it is described here.</span>
            </>
          )}
        </p>
        <div className="mt-6">
          <TagList items={p.tech} label="Technologies" />
        </div>
      </Section>

      <Section id="evaluation" title="Evaluation and results">
        <p className="prose-body">{p.evaluation}</p>
        {p.results.length > 0 && (
          <div className="mt-6">
            <Bullets items={p.results} />
          </div>
        )}
      </Section>

      <Section id="limitations" title="Challenges, limitations and future work">
        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <h3 className="mb-3 text-lg font-medium">Challenges</h3>
            <Bullets items={p.challenges} />
          </div>
          <div>
            <h3 className="mb-3 text-lg font-medium">Limitations</h3>
            <Bullets items={p.limitations} />
          </div>
          <div>
            <h3 className="mb-3 text-lg font-medium">Future work</h3>
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
