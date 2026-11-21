import { Link, useParams } from "react-router-dom";
import RepoActivity from "../components/RepoActivity";
import { getProject } from "../data/projects";
import { PageHeader, Section, SmartLink, TagList } from "../components/ui";
import { Reveal, RevealGroup } from "../components/motion";
import { Fork, Pushback, StoryMedia } from "../components/story";
import Scene3D from "../components/cosmos/Scene3D";
import ArchitectureMap from "../components/ArchitectureMap";
import { architectures } from "../data/architecture";
import NotFound from "./NotFound";

function Bullets({ items }) {
  return (
    <ul className="list-dash max-w-prose space-y-2 text-muted">
      {items.map((i) => (
        <li key={i.slice(0, 40)}>{i}</li>
      ))}
    </ul>
  );
}

export default function ProjectCase() {
  const { slug } = useParams();
  const p = getProject(slug);
  if (!p) return <NotFound />;
  const team = !p.contribution;
  const arch = architectures[p.slug];

  return (
    <article>
      <PageHeader
        eyebrow={p.kind}
        title={p.title}
        accent="gold"
        visual={
          p.scene && (
            <Scene3D
              shape={p.scene.shape}
              hint={p.scene.hint}
              label={`Interactive 3D model for ${p.title}`}
              className="h-[22rem] sm:h-[26rem] 2xl:h-[32rem]"
            />
          )
        }
      >
        <p className="poetic text-2xl sm:text-3xl">{p.tagline}</p>
        <p className="lede mt-5">{p.summary}</p>
        <p className="mt-5 text-sm text-faint">
          {p.status} · {p.period}
        </p>
        <RepoActivity repo={p.repo} className="mt-1" />
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {p.links.map((l) => (
            <li key={l.href}>
              <SmartLink href={l.href}>{l.label}</SmartLink>
            </li>
          ))}
        </ul>
      </PageHeader>

      {p.cover && (
        <Reveal className="wrap">
          <div className="shot card aspect-[16/8] p-0 sm:aspect-[16/7]">
            <img src={p.cover.src} alt={p.cover.alt} width={p.cover.w} height={p.cover.h} decoding="async" className="object-top" />
          </div>
        </Reveal>
      )}

      <Section id="start" eyebrow="The spark" title="Where it started" accent="gold">
        {/* Each paragraph sits beside the picture that goes with it, alternating sides. */}
        <div className="space-y-14 lg:space-y-20">
          {p.spark.map((para, i) => {
            const media = p.sparkFigures?.[i];
            return (
              <Reveal
                key={para.slice(0, 30)}
                className={media ? "grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16" : ""}
              >
                <p className={`max-w-prose text-lg leading-relaxed text-muted ${media && i % 2 === 1 ? "lg:order-2" : ""}`}>{para}</p>
                {media && <StoryMedia media={media} />}
              </Reveal>
            );
          })}
        </div>
      </Section>

      {arch && (
        <Section id="architecture" eyebrow="Structure" title="How it fits together" accent="sky">
          <ArchitectureMap arch={arch} />
        </Section>
      )}

      <Section id="thinking" eyebrow="Brainstorm" title={team ? "How we thought it through" : "How I thought it through"} accent="teal">
        <p className="prose-body mb-8">
          Every project here came down to a handful of decisions. For each one: the options on the table, the one taken, and why.
        </p>
        <RevealGroup as="ol" className="border-b border-rule/70">
          {p.thinking.map((t, i) => (
            <Fork key={t.question} n={i + 1} {...t} />
          ))}
        </RevealGroup>
      </Section>

      <Section id="pushback" eyebrow="Debugging" title="Where it pushed back" accent="rose">
        <p className="prose-body mb-8">
          {team
            ? "The problems that taught us the most, each told from what we expected to what we changed."
            : "The problems that taught me the most, each told from what I expected to what I changed."}
        </p>
        <div className="border-b border-rule/70">
          {p.pushback.map((story, i) => (
            <Pushback key={story.title} story={story} open={i === 0} />
          ))}
        </div>
      </Section>

      <Section id="checked" eyebrow="Evidence" title={team ? "How we checked it" : "How I know it works"} accent="lavender">
        <p className="prose-body">{p.checked}</p>
        {p.implementedNotValidated && (
          <p className="mt-4 max-w-prose border-l-2 border-amber/60 pl-4 text-muted">{p.implementedNotValidated}</p>
        )}
        <p className="prose-body mt-6">{p.contribution ?? <span>{p.team}</span>}</p>
        <div className="mt-6">
          <TagList items={p.tech} label="Technologies" />
        </div>
      </Section>

      <Section id="open" eyebrow="Honestly" title="What is still open" accent="gold">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-medium">Limitations</h3>
            <Bullets items={p.limitations} />
          </div>
          <div>
            <h3 className="mb-3 text-lg font-medium">Next</h3>
            <Bullets items={p.future} />
          </div>
        </div>
        <p className="mt-10 text-sm">
          <Link to="/projects">All projects</Link>
        </p>
      </Section>
    </article>
  );
}
