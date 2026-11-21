import { Link } from "react-router-dom";
import RepoActivity from "../components/RepoActivity";
import { projects, otherProjects } from "../data/projects";
import { PageHeader, Section, SmartLink, TagList } from "../components/ui";
import { Reveal, RevealGroup, RevealItem } from "../components/motion";
import Scene3D from "../components/cosmos/Scene3D";

export default function Projects() {
  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Things I built, and how I thought about them"
        accent="teal"
        visual={<Scene3D shape="projects" label="Interactive 3D ring of the four project stories" hint="Drag to turn the ring." className="h-[22rem] sm:h-[26rem] 2xl:h-[32rem]" />}
      >
        <p className="lede">
          I rarely start with the code. I start with the question underneath it: what has to be true for this to work, and what could quietly
          break it? Each project below is told that way: where it started, the decisions I weighed, where it pushed back, and what is still open.
        </p>
      </PageHeader>

      <Section id="stories" eyebrow="Behind the build" title="Project stories" accent="gold">
        {/* Open rows, not cards: a hairline between stories and the picture
            alternating sides, the same rhythm the story pages use. */}
        <ol className="border-b border-rule/70">
          {projects.map((p, i) => (
            <Reveal
              as="li"
              key={p.slug}
              className="rule-top group relative grid items-center gap-8 py-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16 lg:py-16"
            >
              <div className={i % 2 ? "lg:order-2" : ""}>
                <div className="shot aspect-[16/10]">
                  <img src={p.cover.src} alt={p.cover.alt} width={p.cover.w} height={p.cover.h} loading="lazy" decoding="async" />
                </div>
              </div>
              <div>
                <p className="eyebrow">
                  <span className="num text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <span aria-hidden="true"> · </span>
                  {p.kind}
                </p>
                <h3 className="mt-3 text-3xl font-semibold">
                  <Link
                    to={`/projects/${p.slug}`}
                    className="text-ink no-underline transition-colors after:absolute after:inset-0 after:z-20 group-hover:text-teal"
                  >
                    {p.title}
                  </Link>
                </h3>
                <p className="poetic mt-2 text-xl">{p.tagline}</p>
                <p className="mt-3 max-w-prose text-muted">{p.summary}</p>
                <p className="mt-4 text-sm text-faint">{p.period}</p>
                <RepoActivity repo={p.repo} short />
                <div className="mt-5">
                  <TagList items={p.tech.slice(0, 6)} label={`${p.title} technologies`} />
                </div>
                <p className="mt-6 font-label text-sm font-semibold text-accent">
                  {p.thinking.length} design {p.thinking.length === 1 ? "decision" : "decisions"} · {p.pushback.length} debugging{" "}
                  {p.pushback.length === 1 ? "story" : "stories"}{" "}
                  <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section id="smaller" eyebrow="Also" title="Smaller projects" accent="sky">
        <RevealGroup as="ul" className="grid gap-x-16 md:grid-cols-2">
          {otherProjects.map((p) => (
            <RevealItem as="li" key={p.title} className="rule-top flex flex-col py-8">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-xl font-semibold">{p.title}</h3>
                <span className="num text-xs text-faint">{p.year}</span>
              </div>
              <p className="mt-2 flex-1 text-sm text-muted">{p.summary}</p>
              <RepoActivity repo={p.repo} short className="mt-3" />
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
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
    </>
  );
}
