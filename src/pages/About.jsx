import { Link } from "react-router-dom";
import { profile, interests } from "../data/profile";
import { education } from "../data/education";
import { achievements } from "../data/achievements";
import { PageHeader, Section, StatusBadge } from "../components/ui";

export default function About() {
  return (
    <>
      <PageHeader eyebrow="About" title="Background and direction">
        <div className="prose-body text-lg">
          <p>
            I am a final-year Computer Science undergraduate at {profile.affiliation}, on the Cyber Security and Artificial Intelligence top-up
            degree, after completing a Level 5 diploma in cyber security. My route into computing ran through mathematics and physics Olympiads,
            and that habit of asking <em>why</em> something works is what I now bring to machine learning.
          </p>
          <p>
            My current work is on small language models. I want to know what a model that fits on a user&apos;s own device can do reliably, what it
            costs to run, and how to measure that honestly. In practice that has meant fixing data leakage before running comparisons, recording
            anomalies instead of deleting them, and reporting inconclusive results as inconclusive.
          </p>
          <p>I plan to continue into postgraduate study and contribute to AI research.</p>
        </div>
      </PageHeader>

      <Section id="education" title="Education">
        <ol className="grid gap-6">
          {education.map((e) => (
            <li key={e.award} className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge state={e.status} />
                {e.period && <span className="text-sm text-faint">{e.period}</span>}
              </div>
              <h3 className="mt-3 text-xl font-medium">{e.award}</h3>
              <p className="text-muted">
                {e.institution}
                {e.location ? ` · ${e.location}` : ""}
                {e.detail ? ` · ${e.detail}` : ""}
              </p>
              {e.modules && (
                <>
                  <p className="mt-4 text-sm text-faint">{e.modulesNote}</p>
                  <ul className="mt-2 grid gap-x-6 gap-y-1 text-sm text-muted sm:grid-cols-2">
                    {e.modules.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Section id="interests" title="Research interests">
        <ul className="grid max-w-3xl gap-x-8 gap-y-2 text-muted sm:grid-cols-2">
          {interests.map((i) => (
            <li key={i} className="border-b border-rule py-2">
              {i}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm">
          <Link to="/research">How these show up in my current research</Link>
        </p>
      </Section>

      <Section id="achievements" title="Selected earlier achievements">
        <ol className="max-w-3xl divide-y divide-rule border-y border-rule">
          {achievements.map((a) => (
            <li key={a.title} className="grid grid-cols-[3.5rem_1fr] gap-4 py-3">
              <span className="num text-faint">{a.year}</span>
              <div>
                <p className="text-ink">{a.title}</p>
                <p className="text-sm text-muted">{a.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="beyond" title="Beyond computing">
        <p className="prose-body">
          I have drawn and painted for most of my life, and I use Blender for 3D modelling. A small selection is in the{" "}
          <Link to="/archive">creative archive</Link>.
        </p>
      </Section>
    </>
  );
}
