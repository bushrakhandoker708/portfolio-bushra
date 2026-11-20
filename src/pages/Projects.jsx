import { Link } from "react-router-dom";
import RepoActivity from "../components/RepoActivity";
import { projects, otherProjects } from "../data/projects";
import { PageHeader, Section, SmartLink, TagList } from "../components/ui";
import { Reveal, RevealGroup, RevealItem, Tilt } from "../components/motion";
import Scene3D from "../components/cosmos/Scene3D";

export default function Projects() {
  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Things I built, and how I thought about them"
        accent="teal"
        visual={<Scene3D shape="knot" label="Interactive 3D torus knot" hint="One idea, tied four different ways. Tap to re-tie it; drag to turn it." className="h-[18rem] sm:h-[22rem]" />}
      >
        <p className="lede">
          I rarely start with the code. I start with the question underneath it: what has to be true for this to work, and what could quietly
          break it? Each project below is told that way: where it started, the forks I weighed, where it pushed back, and what is still open.
        </p>
      </PageHeader>

      <Section id="stories" eyebrow="Behind the build" title="Project stories" accent="gold">
        <ul className="grid gap-10">
          {projects.map((p, i) => (
            <Reveal as="li" key={p.slug}>
              <Tilt className="card card-hover group grid overflow-hidden lg:grid-cols-2" max={4}>
                <div className={`p-4 sm:p-6 ${i % 2 ? "lg:order-2" : ""}`}>
                  <div className="shot aspect-[16/10]">
                    <img src={p.cover.src} alt={p.cover.alt} width={p.cover.w} height={p.cover.h} loading="lazy" decoding="async" />
                  </div>
                </div>
                <div className="flex flex-col p-6 sm:p-8">
                  <p className="eyebrow">{p.kind}</p>
                  <h3 className="mt-3 text-3xl font-semibold">
                    <Link to={`/projects/${p.slug}`} className="text-ink no-underline after:absolute after:inset-0 after:z-20 hover:text-teal">
                      {p.title}
                    </Link>
                  </h3>
                  <p className="poetic mt-2 text-xl">{p.tagline}</p>
                  <p className="mt-3 text-muted">{p.summary}</p>
                  <p className="mt-4 text-sm text-faint">{p.period}</p>
                  <RepoActivity repo={p.repo} short />
                  <div className="mt-5">
                    <TagList items={p.tech.slice(0, 6)} label={`${p.title} technologies`} />
                  </div>
                  <p className="mt-6 font-label text-sm font-semibold text-accent">
                    {p.thinking.length} {p.thinking.length === 1 ? "fork" : "forks"} · {p.pushback.length} {p.pushback.length === 1 ? "problem" : "problems"} solved{" "}
                    <span aria-hidden="true">→</span>
                  </p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section id="smaller" eyebrow="Also" title="Smaller projects" accent="sky">
        <RevealGroup as="ul" className="grid gap-6 md:grid-cols-2">
          {otherProjects.map((p) => (
            <RevealItem as="li" key={p.title}>
              <Tilt className="card card-hover flex h-full flex-col p-6" max={5}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-xl font-semibold">{p.title}</h3>
                  <span className="num text-xs text-faint">{p.year}</span>
                </div>
                <p className="mt-2 flex-1 text-sm text-muted">{p.summary}</p>
                <RepoActivity repo={p.repo} short className="mt-3" />
                <div className="mt-4">
                  <TagList items={p.tech} label={`${p.title} technologies`} />
                </div>
                <ul className="relative z-20 mt-4 flex gap-4 text-sm">
                  {p.links.map((l) => (
                    <li key={l.href}>
                      <SmartLink href={l.href}>{l.label}</SmartLink>
                    </li>
                  ))}
                </ul>
              </Tilt>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
    </>
  );
}
