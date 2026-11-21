import { Link } from "react-router-dom";
import { profile, interests } from "../data/profile";
import { education } from "../data/education";
import { relevia } from "../data/research";
import { projects } from "../data/projects";
import { capabilities } from "../data/skills";
import { achievements } from "../data/achievements";
import { experiments } from "../data/lab";
import { SITE_URL, repoTree } from "../data/site";

// Repositories a reviewer is most likely to want, research first.
const REPOS = [
  ["relevia-research", "Relevia research: protocols, notebooks, results, tests"],
  ["relevia", "Relevia application: React and WebLLM"],
  ["wine-quality-classification", "Comparative classifier study"],
  ["HEXALOCK", "Team embedded-systems project (Stateflow)"],
  ["study-buddy", "Browser-based maths graphing and study tools"],
  ["bushal", "Full-stack e-commerce with an analytics service"],
];

function CvSection({ title, children }) {
  return (
    <section className="grid gap-3 border-t border-rule py-6 md:grid-cols-[12rem_1fr] md:gap-8">
      <h2 className="font-mono text-xs uppercase tracking-label text-faint md:pt-1">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

export default function Cv() {
  return (
    <div className="wrap max-w-4xl pb-10 pt-12 sm:pt-16">
      <header className="mb-8">
        <h1 className="text-4xl font-medium">{profile.name}</h1>
        <p className="mt-2 text-muted">
          {profile.role}, {profile.affiliation} · {profile.location}
        </p>
        <p className="mt-1 text-sm text-muted">
          <a href={`mailto:${profile.email}`}>{profile.email}</a> ·{" "}
          <a href={profile.links.github}>{profile.links.github.replace("https://", "")}</a>
        </p>
        <div className="no-print mt-6 flex flex-wrap gap-3">
          {profile.links.cvPdf ? (
            <a href={profile.links.cvPdf} className="btn btn-primary" download>
              Download PDF
            </a>
          ) : (
            <p className="text-sm text-muted">A PDF version is being prepared. This page prints cleanly in the meantime.</p>
          )}
        </div>
      </header>

      <CvSection title="Research interests">
        <p className="text-muted">{interests.join("; ")}.</p>
      </CvSection>

      <CvSection title="Education">
        <ul className="space-y-4">
          {education.map((e) => (
            <li key={e.award}>
              <p className="font-medium text-ink">{e.award}</p>
              <p className="text-sm text-muted">
                {e.institution}
                {e.detail ? ` · ${e.detail}` : ""} · {e.status === "current" ? e.period : "Completed"}
              </p>
              {e.modules && <p className="mt-1 text-sm text-faint">Modules: {e.modules.join(", ")}</p>}
            </li>
          ))}
        </ul>
      </CvSection>

      <CvSection title="Research">
        <p className="font-medium text-ink">
          <Link to="/research/relevia" className="text-ink">
            {relevia.title}
          </Link>
        </p>
        <p className="text-sm text-faint">Independent project · {relevia.period}</p>
        <ul className="list-dash mt-2 space-y-1 text-sm text-muted">
          <li>Controlled A/B prompting study on a pinned Qwen2.5-1.5B-Instruct model with frozen, hashed configurations.</li>
          <li>
            Pilot result reported as inconclusive: relevance difference +0.125 (95% interval −0.875 to +1.125, n = 8, unblinded agent
            ratings).
          </li>
          <li>
            Conversation-level partitioning with leakage checks. Quarantined a historical dataset after finding a mislabelled licence.
          </li>
          <li>
            Safety-routing evaluation on a held-out set frozen in advance: urgent-case recall rose from 9/24 to 18/24 with no false
            positives (synthetic, agent-labelled cases; not clinical validation).
          </li>
          <li>Latency analysis that identified a system-standby confound behind an apparent speed advantage.</li>
          <li>Not yet done: blinded human ratings, LoRA adaptation, in-browser benchmarks.</li>
        </ul>
      </CvSection>

      <CvSection title="ML experiments">
        <ul className="space-y-3">
          {experiments.map((e) => (
            <li key={e.slug}>
              <p className="font-medium text-ink">
                <Link to={`/ml-lab/${e.slug}`} className="text-ink">
                  {e.title}
                </Link>{" "}
                <span className="text-sm font-normal text-faint">· {e.period}</span>
              </p>
              <p className="text-sm text-muted">{e.summary}</p>
            </li>
          ))}
        </ul>
      </CvSection>

      <CvSection title="Projects">
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.slug}>
              <p className="font-medium text-ink">
                <Link to={`/projects/${p.slug}`} className="text-ink">
                  {p.title}
                </Link>{" "}
                <span className="text-sm font-normal text-faint">· {p.period}</span>
              </p>
              <p className="text-sm text-muted">{p.summary}</p>
            </li>
          ))}
        </ul>
      </CvSection>

      <CvSection title="Technical skills">
        <dl className="space-y-1 text-sm">
          {capabilities.map((c) => (
            <div key={c.area} className="grid gap-1 sm:grid-cols-[13rem_1fr]">
              <dt className="text-ink">{c.area}</dt>
              <dd className="text-muted">{c.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </CvSection>

      <CvSection title="Repositories">
        <ul className="space-y-1 text-sm text-muted">
          {REPOS.map(([repo, what]) => (
            <li key={repo}>
              <a href={repoTree(repo)} className="num">
                {repo}
              </a>{" "}
              · {what}
            </li>
          ))}
          <li>
            Portfolio: <a href={SITE_URL}>{SITE_URL.replace("https://", "")}</a>
          </li>
        </ul>
      </CvSection>

      <CvSection title="Earlier achievements">
        <ul className="space-y-1 text-sm text-muted">
          {achievements.map((a) => (
            <li key={a.title}>
              <span className="num text-faint">{a.year}</span> {a.title}: {a.detail}
            </li>
          ))}
        </ul>
      </CvSection>
    </div>
  );
}
