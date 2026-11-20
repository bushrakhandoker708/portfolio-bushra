import { Link } from "react-router-dom";
import { projects, otherProjects } from "../data/projects";
import { PageHeader, Section, SmartLink, TagList } from "../components/ui";

export default function Projects() {
  return (
    <>
      <PageHeader eyebrow="Projects" title="Selected engineering work">
        <p className="lede">
          Case studies cover the problem, the design decisions, how the work was evaluated and what is still missing. Where a project has no
          tests or measured results, the page says so.
        </p>
      </PageHeader>

      <Section id="case-studies" title="Case studies">
        <ul className="grid gap-6">
          {projects.map((p) => (
            <li key={p.slug} className="card grid gap-4 p-5 sm:p-8 md:grid-cols-[1fr_16rem]">
              <div>
                <p className="eyebrow">{p.kind}</p>
                <h3 className="mt-2 text-2xl font-medium">
                  <Link to={`/projects/${p.slug}`} className="text-ink no-underline hover:text-teal">
                    {p.title}
                  </Link>
                </h3>
                <p className="mt-3 max-w-prose text-muted">{p.summary}</p>
                <Link to={`/projects/${p.slug}`} className="mt-5 inline-block">
                  Read the case study
                </Link>
              </div>
              <dl className="space-y-3 text-sm md:border-l md:border-rule md:pl-6">
                <div>
                  <dt className="text-faint">Status</dt>
                  <dd className="text-muted">{p.status}</dd>
                </div>
                <div>
                  <dt className="text-faint">When</dt>
                  <dd className="text-muted">{p.period}</dd>
                </div>
                <div>
                  <dt className="sr-only">Technologies</dt>
                  <dd>
                    <TagList items={p.tech.slice(0, 5)} label={`${p.title} technologies`} />
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="earlier" title="Earlier projects">
        <ul className="grid gap-4 md:grid-cols-3">
          {otherProjects.map((p) => (
            <li key={p.title} className="card flex flex-col p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-medium">{p.title}</h3>
                <span className="num text-xs text-faint">{p.year}</span>
              </div>
              <p className="mt-2 flex-1 text-sm text-muted">{p.summary}</p>
              <div className="mt-4">
                <TagList items={p.tech} label={`${p.title} technologies`} />
              </div>
              <ul className="mt-4 flex gap-4 text-sm">
                {p.links.map((l) => (
                  <li key={l.href}>
                    <SmartLink href={l.href}>{l.label}</SmartLink>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
