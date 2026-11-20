import { Link } from "react-router-dom";
import { researchIndex } from "../data/research";
import { interests } from "../data/profile";
import { PageHeader, Section, StatusBadge, TagList } from "../components/ui";

export default function Research() {
  return (
    <>
      <PageHeader eyebrow="Research" title="Independent research">
        <p className="lede">
          I am an undergraduate, so this is early, independent work rather than published research. Each study states its research question,
          what has actually been run, what remains planned and where the evidence lives.
        </p>
      </PageHeader>

      <Section id="studies" title="Studies">
        <ul className="grid gap-6">
          {researchIndex.map((s) => (
            <li key={s.slug} className="card p-5 sm:p-8">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <StatusBadge state="partial">{s.status}</StatusBadge>
                <span className="text-sm text-faint">{s.period}</span>
              </div>
              <h3 className="text-2xl font-medium">
                <Link to={s.href} className="text-ink no-underline hover:text-teal">
                  {s.title}
                </Link>
              </h3>
              <p className="mt-3 max-w-prose text-muted">{s.summary}</p>
              <div className="mt-5">
                <TagList items={s.tags} label="Topics" />
              </div>
              <Link to={s.href} className="mt-6 inline-block">
                Read the case study
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="interests" title="Research interests">
        <p className="prose-body mb-6">These are the areas I want to work in. They describe direction, not expertise.</p>
        <ul className="grid max-w-3xl gap-x-8 gap-y-2 text-muted sm:grid-cols-2">
          {interests.map((i) => (
            <li key={i} className="border-b border-rule py-2">
              {i}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
