import { Link } from "react-router-dom";
import { profile } from "../data/profile";
import { relevia } from "../data/research";
import { projects } from "../data/projects";
import { experiments } from "../data/lab";
import { artHighlights, ART_PORTFOLIO } from "../data/archive";
import { Section, StatusBadge } from "../components/ui";
import { Reveal, RevealGroup, RevealItem } from "../components/motion";
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
          <h1
            id="intro-heading"
            className="text-cosmic rise mt-1 pb-2 text-5xl font-semibold sm:text-7xl"
            style={{ animationDelay: "120ms" }}
          >
            {profile.name}
          </h1>
          <p className="rise mt-3 font-sub text-xl italic text-lavender sm:text-2xl" style={{ animationDelay: "180ms" }}>
            <span className="block sm:inline">{profile.role}</span>
            <span aria-hidden="true" className="hidden sm:inline">
              {" "}
              |{" "}
            </span>
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

/** The opening hook: the question behind the research, told as three short beats. */
function AtAGlance() {
  const s2 = relevia.safety.detectors.find((d) => d.id === "S2");
  const rel = relevia.pilot.dimensions[0];
  const missed = relevia.safety.urgent - s2.tp;
  const beats = [
    {
      title: "Keep the words on the device",
      text: "So I run a small language model inside the browser. That is where the hard part starts: a model small enough to fit there is also small enough to get things wrong.",
    },
    {
      title: "Build the test before trusting it",
      text: "Before comparing anything, I froze the configurations, separated the data by conversation and checked it for leaks, so a result could not flatter itself.",
    },
    {
      title: "Say what came back",
      text: `The first prompting pilot was inconclusive (${fmt(rel.mean, 3)}, n = ${relevia.pilot.n}). The safety router caught ${s2.tp} of ${relevia.safety.urgent} urgent test messages, and I keep the ${missed} it missed on the record.`,
    },
  ];
  return (
    <section id="at-a-glance" aria-labelledby="hook-heading" className="wrap py-20 sm:py-28">
      <p className="eyebrow mb-5">Where my research starts</p>
      <h2 id="hook-heading" className="max-w-4xl font-serif text-3xl leading-tight text-ink sm:text-5xl">
        When someone types something painful into a chat, where do those words go?
      </h2>
      <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-12">
        {beats.map((b, i) => (
          <li key={b.title} className="relative pl-12">
            <span aria-hidden="true" className="num absolute left-0 top-0 text-3xl text-accent/70">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="text-lg font-medium text-ink">{b.title}</h3>
            <p className="mt-2 text-muted">{b.text}</p>
          </li>
        ))}
      </ol>
      <p className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
        <Link to="/research/relevia" className="btn btn-primary">
          Read the research story
        </Link>
        <Link to="/research/relevia#status" className="self-center">
          What is established, and what is not
        </Link>
      </p>
    </section>
  );
}

export default function Home() {
  const s2 = relevia.safety.detectors.find((d) => d.id === "S2");
  const s1 = relevia.safety.detectors.find((d) => d.id === "S1");
  const rel = relevia.pilot.dimensions[0];
  const relApp = projects.find((p) => p.slug === "relevia-app");
  const lab = experiments[0];

  return (
    <>
      <Hero />
      <AtAGlance />

      {/* Selected research */}
      <Section id="selected-research" eyebrow="Selected research" title="Relevia: what a small model can safely do" accent="teal">
        <article className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <StatusBadge state="partial">{relevia.status}</StatusBadge>
              <span className="text-sm text-faint">{relevia.period}</span>
            </div>
            <p className="text-muted">{relevia.summary}</p>
            <p className="mt-4 text-muted">
              Before comparing anything, I wanted the comparison itself to be trustworthy. So I built the controls first: conversation-level
              data partitions with leakage checks, frozen and hashed configurations, and paired analysis with uncertainty intervals. The
              first prompting pilot was <strong className="font-medium text-ink">inconclusive</strong>, and I report it that way.
            </p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="border-l-2 border-accent/50 py-1 pl-4">
                <dt className="text-sm text-faint">Safety routing recall, held-out urgent cases</dt>
                <dd className="num mt-1 text-3xl text-cosmic">
                  {s1.tp}/{relevia.safety.urgent} <span aria-hidden="true">→</span>
                  <span className="sr-only">improved to</span> {s2.tp}/{relevia.safety.urgent}
                </dd>
                <dd className="mt-1 text-sm text-muted">
                  S1 to S2 (text normalisation), no false positives on {relevia.safety.nonUrgent} ordinary messages. Synthetic,
                  agent-labelled set.
                </dd>
              </div>
              <div className="border-l-2 border-accent/50 py-1 pl-4">
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
          <figure>
            <div className="shot aspect-[16/10]">
              <img
                src={relApp.cover.src}
                alt={relApp.cover.alt}
                width={relApp.cover.w}
                height={relApp.cover.h}
                loading="lazy"
                decoding="async"
                className="object-top"
              />
            </div>
            <figcaption className="mt-2 text-sm text-faint">
              The Relevia app, where the safety-routing rules from this research now run.
            </figcaption>
          </figure>
        </article>
      </Section>

      {/* Latest from the ML Lab */}
      <Section id="ml-lab" eyebrow="From the ML Lab" title="Latest experiment" accent="sky">
        <article className="border-y border-rule/70 py-10">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-16">
            <div>
              <p className="font-label text-xs font-semibold uppercase tracking-label text-accent">
                Experiment {String(lab.number).padStart(2, "0")} · {lab.kind}
              </p>
              <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">{lab.title}</h3>
              <p className="mt-4 text-muted">{lab.question}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={`/ml-lab/${lab.slug}`} className="btn btn-primary">
                  Read the experiment
                </Link>
                <Link to="/ml-lab" className="btn btn-quiet">
                  Visit the ML Lab
                </Link>
              </div>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {lab.headline.slice(0, 2).map((h) => (
                <div key={h.label} className="border-l-2 border-accent/50 py-1 pl-4">
                  <dt className="text-sm text-faint">{h.label}</dt>
                  <dd className="num mt-1 text-3xl text-cosmic">{h.value}</dd>
                  <dd className="mt-1 text-sm text-muted">{h.of}</dd>
                </div>
              ))}
            </dl>
          </div>
        </article>
      </Section>

      {/* Project stories */}
      <Section id="featured-projects" eyebrow="Behind the build" title="How I approach a build" accent="gold">
        <p className="prose-body mb-8">
          I like to find the question underneath a project before I write code for it. Each of these is told as a story: where it started,
          the decisions I weighed, and where it pushed back.
        </p>
        <RevealGroup as="ol" className="border-b border-rule/70">
          {projects.map((p, i) => (
            <RevealItem
              as="li"
              key={p.slug}
              className="rule-top group relative grid items-center gap-5 py-7 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8 lg:grid-cols-[14rem_minmax(0,1fr)_auto]"
            >
              <div className="shot aspect-[16/10]">
                <img
                  src={p.cover.src}
                  alt=""
                  width={p.cover.w}
                  height={p.cover.h}
                  loading="lazy"
                  decoding="async"
                  className="object-top"
                />
              </div>
              <div>
                <p className="eyebrow">
                  <span className="num text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <span aria-hidden="true"> · </span>
                  {p.kind}
                </p>
                <h3 className="mt-2 text-2xl font-semibold">
                  <Link
                    to={`/projects/${p.slug}`}
                    className="text-ink no-underline transition-colors after:absolute after:inset-0 after:z-20 group-hover:text-teal"
                  >
                    {p.title}
                  </Link>
                </h3>
                <p className="poetic mt-1 text-lg">{p.tagline}</p>
                <p className="mt-2 max-w-prose text-sm text-muted">{p.summary}</p>
              </div>
              <span
                aria-hidden="true"
                className="hidden text-2xl text-accent transition-transform duration-300 group-hover:translate-x-1 lg:block"
              >
                →
              </span>
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
          Long before code, there was a sketchbook. Pencil, acrylic, watercolour, clay and Blender: every piece tells a story, and the
          patience it takes to look closely is the same patience I bring to a stubborn bug.
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
