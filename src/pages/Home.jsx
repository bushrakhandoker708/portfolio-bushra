import { Link } from "react-router-dom";
import { profile, currentInvestigations } from "../data/profile";
import { relevia } from "../data/research";
import { projects } from "../data/projects";
import { capabilities } from "../data/skills";
import { achievements } from "../data/achievements";
import { Section, StatusBadge, TagList, ExternalLink } from "../components/ui";
import { fmt } from "../components/research/charts";
import portrait from "../assets/img/portrait.webp";

export default function Home() {
  const s2 = relevia.safety.detectors.find((d) => d.id === "S2");
  const s1 = relevia.safety.detectors.find((d) => d.id === "S1");
  const rel = relevia.pilot.dimensions[0];
  return (
    <>
      {/* Introduction */}
      <section aria-labelledby="intro-heading" className="wrap grid items-center gap-10 pb-12 pt-12 sm:pt-20 md:grid-cols-[1fr_auto] md:pb-16">
        <div>
          <p className="eyebrow mb-5">
            {profile.affiliation} · {profile.location.replace("Swansea, ", "")}
          </p>
          <h1 id="intro-heading" className="text-5xl font-medium sm:text-6xl">
            {profile.name}
          </h1>
          <p className="mt-4 font-serif text-xl text-lavender sm:text-2xl">
            <span className="block sm:inline">{profile.role}</span>
            <span aria-hidden="true" className="hidden sm:inline"> | </span>
            <span className="sr-only">,</span> <span className="block sm:inline">{profile.focus}</span>
          </p>
          <p className="lede mt-6">{profile.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
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
          fetchpriority="high"
          className="hidden h-56 w-56 rounded-full border border-rule object-cover md:block lg:h-64 lg:w-64"
        />
      </section>

      {/* Selected research */}
      <Section id="selected-research" eyebrow="Selected research" title="Relevia: what a small model can safely do">
        <article className="card grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <StatusBadge state="partial">{relevia.status}</StatusBadge>
              <span className="text-sm text-faint">{relevia.period}</span>
            </div>
            <p className="text-muted">{relevia.summary}</p>
            <p className="mt-4 text-muted">
              So far I have built the controls that make a comparison meaningful: conversation-level data partitions with
              leakage checks, frozen and hashed configurations, and paired analysis with uncertainty intervals. The first
              prompting pilot was <strong className="font-medium text-ink">inconclusive</strong>, and I report it that way.
            </p>
            <Link to="/research/relevia" className="mt-6 inline-block">
              Read the case study
            </Link>
          </div>
          <dl className="grid content-start gap-4 border-t border-rule pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div>
              <dt className="text-sm text-faint">Safety routing recall, held-out urgent cases</dt>
              <dd className="num mt-1 text-2xl text-ink">
                {s1.tp}/{relevia.safety.urgent} <span aria-hidden="true">→</span>
                <span className="sr-only">improved to</span> {s2.tp}/{relevia.safety.urgent}
              </dd>
              <dd className="text-sm text-muted">S1 to S2 (text normalisation), no false positives on {relevia.safety.nonUrgent} ordinary messages. Synthetic, agent-labelled set.</dd>
            </div>
            <div>
              <dt className="text-sm text-faint">Pilot relevance, developed vs minimal prompt</dt>
              <dd className="num mt-1 text-2xl text-ink">{fmt(rel.mean, 3)}</dd>
              <dd className="text-sm text-muted">
                95% interval {fmt(rel.lo, 3)} to {fmt(rel.hi, 3)} (n = {relevia.pilot.n}). No improvement established.
              </dd>
            </div>
          </dl>
        </article>
      </Section>

      {/* Current investigations */}
      <Section id="investigating" eyebrow="Now" title="What I am investigating">
        <ul className="grid gap-4 md:grid-cols-3">
          {currentInvestigations.map((c) => (
            <li key={c.title} className="card p-5">
              <h3 className="text-lg font-medium">
                <Link to={c.href} className="text-ink no-underline hover:text-teal">
                  {c.title}
                </Link>
              </h3>
              <p className="mt-2 text-sm text-muted">{c.detail}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Featured projects */}
      <Section id="featured-projects" eyebrow="Engineering" title="Featured projects">
        <ul className="grid gap-4 md:grid-cols-3">
          {projects.map((p) => (
            <li key={p.slug} className="card flex flex-col p-5">
              <p className="eyebrow">{p.kind}</p>
              <h3 className="mt-2 text-xl font-medium">
                <Link to={`/projects/${p.slug}`} className="text-ink no-underline hover:text-teal">
                  {p.title}
                </Link>
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted">{p.summary}</p>
              <div className="mt-4">
                <TagList items={p.tech.slice(0, 4)} label={`${p.title} technologies`} />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6">
          <Link to="/projects">All projects</Link>
        </p>
      </Section>

      {/* Capabilities */}
      <Section id="capabilities" eyebrow="Capabilities" title="Technical capability, with where it is used">
        <dl className="divide-y divide-rule border-y border-rule">
          {capabilities.map((c) => (
            <div key={c.area} className="grid gap-2 py-4 md:grid-cols-[14rem_1fr_1fr] md:gap-6">
              <dt className="font-medium text-ink">{c.area}</dt>
              <dd className="text-sm text-muted">{c.items.join(" · ")}</dd>
              <dd className="text-sm text-faint">
                <Link to={c.href}>{c.evidence}</Link>
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Achievements */}
      <Section id="achievements" eyebrow="Background" title="Selected earlier achievements">
        <ul className="grid gap-x-10 gap-y-3 md:grid-cols-2">
          {achievements
            .filter((a) => !a.title.startsWith("Secondary"))
            .map((a) => (
              <li key={a.title} className="grid grid-cols-[3.5rem_1fr] gap-3 text-sm">
                <span className="num text-faint">{a.year}</span>
                <span className="text-muted">
                  <span className="text-ink">{a.title}</span>: {a.detail}
                </span>
              </li>
            ))}
        </ul>
      </Section>

      {/* Contact */}
      <Section id="contact" eyebrow="Contact" title="Get in touch">
        <p className="prose-body">
          I am happy to discuss research, postgraduate study or engineering roles. Email is the best way to reach me:{" "}
          <a href={`mailto:${profile.email}`}>{profile.email}</a>. Code is on{" "}
          <ExternalLink href={profile.links.github}>GitHub</ExternalLink>.
        </p>
      </Section>
    </>
  );
}
