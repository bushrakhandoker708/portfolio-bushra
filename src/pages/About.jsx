import { Link } from "react-router-dom";
import { ART_PORTFOLIO } from "../data/archive";
import { profile } from "../data/profile";
import { education } from "../data/education";
import { achievements } from "../data/achievements";
import { moments } from "../data/moments";
import { RevealGroup, RevealItem } from "../components/motion";
import { PageHeader, Section, StatusBadge } from "../components/ui";

export default function About() {
  return (
    <>
      <PageHeader eyebrow="About" title="Hello, I'm Bushra" accent="rose">
        <div className="prose-body text-lg">
          <p>
            For me, imagination is never enough; I need to see it come alive. Late at night I will often have a sketch in one hand and a
            laptop in front of me, chasing an idea line by line until it finally moves, breathes or responds on the screen. What excites me
            most is watching creativity and logic collide.
          </p>
          <p>
            My route into computing ran through mathematics and physics Olympiads, and that habit of asking <em>why</em> something works
            never left. I am now a final-year Computer Science student at {profile.affiliation}, on the Cyber Security and Artificial
            Intelligence top-up degree, after a Level 5 diploma in cyber security.
          </p>
          <p>
            These days the question I keep returning to is about small language models: what can a model that fits on your own device do
            reliably, what does it cost, and how do you measure that honestly? In practice that has meant fixing data leakage before running
            comparisons, keeping anomalies on the record instead of deleting them, and calling an inconclusive result inconclusive.
          </p>
          <p>Challenges do not scare me; they energise me. Next, I want to take this into postgraduate study and research.</p>
        </div>
      </PageHeader>

      <Section id="education" title="Education" accent="gold">
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

      <Section id="achievements" title="Selected earlier achievements" accent="teal">
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

      <Section id="moments" title="Moments along the way" accent="rose">
        <RevealGroup className="grid gap-5 sm:grid-cols-3">
          {moments.map((mo) => (
            <RevealItem as="figure" key={mo.caption} className="group">
              <div className="shot aspect-[4/3]">
                <img src={mo.src} alt={mo.alt} width={mo.w} height={mo.h} loading="lazy" decoding="async" />
              </div>
              <figcaption className="mt-3 text-sm text-muted">{mo.caption}</figcaption>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section id="beyond" title="Beyond computing" accent="sky">
        <p className="prose-body">
          I have drawn and painted for most of my life: pencil, acrylic, watercolour, clay, and Blender for 3D. Every piece tells a story,
          and some of my favourites are in <Link to="/archive">Art &amp; making</Link>. The full collection lives on{" "}
          <a href={ART_PORTFOLIO} target="_blank" rel="noopener noreferrer">
            my art portfolio<span className="sr-only"> (opens in a new tab)</span> <span aria-hidden="true">↗</span>
          </a>
          . The research interests behind my current work are on the <Link to="/research#interests">Research</Link> page.
        </p>
      </Section>
    </>
  );
}
