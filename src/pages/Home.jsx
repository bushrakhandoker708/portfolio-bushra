import { Link } from "react-router-dom";
import RepoActivity from "../components/RepoActivity";
import { profile } from "../data/profile";
import { relevia } from "../data/research";
import { projects } from "../data/projects";
import { artHighlights, ART_PORTFOLIO } from "../data/archive";
import { Section, StatusBadge, TagList } from "../components/ui";
import { Reveal, RevealGroup, RevealItem, Tilt } from "../components/motion";
import { fmt } from "../components/research/charts";
import HeroUniverse from "../components/cosmos/HeroUniverse";
import { ContactCard } from "../components/Contact";
import portrait from "../assets/img/portrait.webp";

function Hero() {
  return (
    <HeroUniverse labelledBy="intro-heading">
      <div className="wrap grid items-center gap-10 pb-36 pt-16 md:grid-cols-[1fr_auto] md:pb-28">
        <div className="max-w-2xl [text-shadow:0_2px_18px_rgba(10,12,24,0.9)]">
          <p className="eyebrow rise mb-4" style={{ animationDelay: "0ms" }}>
            {profile.affiliation} · {profile.location.replace("Swansea, ", "")}
          </p>
          <p className="poetic rise text-xl sm:text-2xl" style={{ animationDelay: "60ms" }}>
            Reality is programmable beauty.
          </p>
          <h1 id="intro-heading" className="text-cosmic rise mt-1 pb-2 text-5xl font-semibold sm:text-7xl" style={{ animationDelay: "120ms" }}>
            {profile.name}
          </h1>
          <p className="rise mt-3 font-sub text-xl italic text-lavender sm:text-2xl" style={{ animationDelay: "180ms" }}>
            <span className="block sm:inline">{profile.role}</span>
            <span aria-hidden="true" className="hidden sm:inline"> | </span>
            <span className="sr-only">,</span> <span className="block sm:inline">{profile.focus}</span>
          </p>
          <p className="lede rise mt-5 text-ink/90" style={{ animationDelay: "200ms" }}>
            {profile.summary}
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "320ms" }}>
            <Link to="/research" className="btn btn-primary">
              Explore research
            </Link>
            <Link to="/projects" className="btn btn-quiet">
              View projects
            </Link>
            {profile.links.cvPdf ? (
              <a href={profile.links.cvPdf} className="btn btn-quiet" download>
                Download CV (PDF)
              </a>
            ) : (
              <Link to="/cv" className="btn btn-quiet">
                CV
              </Link>
            )}
            <a href={profile.links.github} className="btn btn-quiet" target="_blank" rel="noopener noreferrer">
              GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
        <img
          src={portrait}
          alt="Portrait of Bushra Khandoker"
          width="280"
          height="280"
          className="orbit-in portrait-glow hidden h-60 w-60 rounded-full border-4 border-champagne/30 object-cover md:block lg:h-72 lg:w-72"
          style={{ animationDelay: "250ms" }}
        />
      </div>
    </HeroUniverse>
  );
}

export default function Home() {
  const s2 = relevia.safety.detectors.find((d) => d.id === "S2");
  const s1 = relevia.safety.detectors.find((d) => d.id === "S1");
  const rel = relevia.pilot.dimensions[0];
  const relApp = projects.find((p) => p.slug === "relevia-app");

  return (
    <>
      <Hero />

      {/* Selected research */}
      <Section id="selected-research" eyebrow="Selected research" title="Relevia: what a small model can safely do" accent="teal">
        <article className="card overflow-hidden lg:grid lg:grid-cols-[1.25fr_1fr]">
          <div className="p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <StatusBadge state="partial">{relevia.status}</StatusBadge>
              <span className="text-sm text-faint">{relevia.period}</span>
            </div>
            <p className="text-muted">{relevia.summary}</p>
            <p className="mt-4 text-muted">
              Before comparing anything, I wanted the comparison itself to be trustworthy. So I built the controls first:
              conversation-level data partitions with leakage checks, frozen and hashed configurations, and paired analysis with
              uncertainty intervals. The first prompting pilot was <strong className="font-medium text-ink">inconclusive</strong>,
              and I report it that way.
            </p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <dt className="text-sm text-faint">Safety routing recall, held-out urgent cases</dt>
                <dd className="num mt-1 text-3xl text-cosmic">
                  {s1.tp}/{relevia.safety.urgent} <span aria-hidden="true">→</span>
                  <span className="sr-only">improved to</span> {s2.tp}/{relevia.safety.urgent}
                </dd>
                <dd className="mt-1 text-sm text-muted">
                  S1 to S2 (text normalisation), no false positives on {relevia.safety.nonUrgent} ordinary messages. Synthetic, agent-labelled set.
                </dd>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <dt className="text-sm text-faint">Pilot relevance, developed vs minimal prompt</dt>
                <dd className="num mt-1 text-3xl text-cosmic">{fmt(rel.mean, 3)}</dd>
                <dd className="mt-1 text-sm text-muted">
                  95% interval {fmt(rel.lo, 3)} to {fmt(rel.hi, 3)} (n = {relevia.pilot.n}). No improvement established.
                </dd>
              </div>
            </dl>
            <Link to="/research/relevia" className="btn btn-primary mt-6">
              Read the research story
            </Link>
          </div>
          <figure className="group relative min-h-[16rem] border-t border-white/10 lg:border-l lg:border-t-0">
            <div className="shot absolute inset-0 rounded-none border-0">
              <img src={relApp.cover.src} alt={relApp.cover.alt} width={relApp.cover.w} height={relApp.cover.h} loading="lazy" decoding="async" />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-canvas/95 to-transparent p-4 pt-12 text-sm text-muted">
              The Relevia app, where the safety-routing rules from this research now run.
            </figcaption>
          </figure>
        </article>
      </Section>

      {/* Project stories */}
      <Section id="featured-projects" eyebrow="Behind the build" title="How I approach a build" accent="gold">
        <p className="prose-body mb-8">
          I like to find the question underneath a project before I write code for it. Each of these is told as a story: where it
          started, the forks I weighed, and where it pushed back.
        </p>
        <RevealGroup as="ul" className="grid gap-6 md:grid-cols-2">
          {projects.map((p) => (
            <RevealItem as="li" key={p.slug}>
              <Tilt className="card card-hover group flex h-full flex-col overflow-hidden">
                <div className="shot aspect-[16/9] rounded-none border-0 border-b border-white/10">
                  <img src={p.cover.src} alt={p.cover.alt} width={p.cover.w} height={p.cover.h} loading="lazy" decoding="async" className="object-top" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="eyebrow">{p.kind}</p>
                  <h3 className="mt-2 text-2xl font-semibold">
                    <Link to={`/projects/${p.slug}`} className="text-ink no-underline after:absolute after:inset-0 after:z-20 hover:text-teal">
                      {p.title}
                    </Link>
                  </h3>
                  <p className="poetic mt-1 text-lg">{p.tagline}</p>
                  <p className="mt-3 flex-1 text-sm text-muted">{p.summary}</p>
                  <RepoActivity repo={p.repo} short className="mt-3" />
                  <div className="mt-4">
                    <TagList items={p.tech.slice(0, 4)} label={`${p.title} technologies`} />
                  </div>
                </div>
              </Tilt>
            </RevealItem>
          ))}
        </RevealGroup>
        <p className="mt-8">
          <Link to="/projects" className="btn btn-quiet">
            All projects
          </Link>
        </p>
      </Section>

      {/* Art */}
      <Section id="art" eyebrow="Beyond code" title="Art and making" accent="rose">
        <p className="prose-body mb-8">
          Long before code, there was a sketchbook. Pencil, acrylic, watercolour, clay and Blender: every piece tells a story, and
          the patience it takes to look closely is the same patience I bring to a stubborn bug.
        </p>
        <RevealGroup as="ul" className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {artHighlights.map((a) => (
            <RevealItem as="li" key={a.title} className="group">
              <Link to="/archive" className="block no-underline">
                <div className="shot aspect-square">
                  <img src={a.src} alt={`${a.title}, ${a.medium.toLowerCase()}`} width={a.w} height={a.h} loading="lazy" decoding="async" />
                </div>
                <p className="mt-2 flex justify-between gap-2 text-sm">
                  <span className="text-ink">{a.title}</span>
                  <span className="text-faint">{a.medium}</span>
                </p>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
        <p className="mt-8 flex flex-wrap gap-3">
          <Link to="/archive" className="btn btn-quiet">
            See the full collection
          </Link>
          <a href={ART_PORTFOLIO} className="btn btn-quiet" target="_blank" rel="noopener noreferrer">
            Visit my art portfolio<span className="sr-only"> (opens in a new tab)</span> <span aria-hidden="true">↗</span>
          </a>
        </p>
      </Section>

      {/* Contact */}
      <Section id="contact" eyebrow="Contact" title="Get in touch" accent="sky">
        <Reveal>
          <ContactCard />
        </Reveal>
      </Section>
    </>
  );
}
