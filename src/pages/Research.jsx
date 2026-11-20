import { Link } from "react-router-dom";
import RepoActivity from "../components/RepoActivity";
import { researchIndex } from "../data/research";
import { interests, currentInvestigations } from "../data/profile";
import { PageHeader, Section, StatusBadge, TagList } from "../components/ui";
import { RevealGroup, RevealItem, Tilt } from "../components/motion";
import Scene3D from "../components/cosmos/Scene3D";

export default function Research() {
  return (
    <>
      <PageHeader
        eyebrow="Research"
        title="Independent research"
        accent="sky"
        visual={<Scene3D shape="orbits" label="Interactive 3D atom" hint="Where it started for me: physics. Tap the nucleus to speed the electrons up." className="h-[18rem] sm:h-[22rem]" />}
      >
        <p className="lede">
          I am an undergraduate, so this is early, independent work, not published research. What I care about is asking a question
          carefully and answering it honestly: what has actually been run, what is still planned, and where the evidence lives.
        </p>
      </PageHeader>

      <Section id="studies" eyebrow="Studies" title="What I have run so far" accent="teal">
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
              <RepoActivity repo={s.repo} className="mt-3" />
              <div className="mt-5">
                <TagList items={s.tags} label="Topics" />
              </div>
              <Link to={s.href} className="mt-6 inline-block">
                Read the research story
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="investigating" eyebrow="Now" title="What I am investigating" accent="gold">
        <RevealGroup as="ul" className="grid gap-5 md:grid-cols-3">
          {currentInvestigations.map((c, i) => (
            <RevealItem as="li" key={c.title}>
              <Tilt className="card card-hover h-full p-6">
                <p className="num text-sm text-accent">0{i + 1}</p>
                <h3 className="mt-2 text-xl font-semibold">
                  <Link to={c.href} className="text-ink no-underline after:absolute after:inset-0 after:z-20 hover:text-teal">
                    {c.title}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-muted">{c.detail}</p>
              </Tilt>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section id="interests" eyebrow="Direction" title="Research interests" accent="lavender">
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
