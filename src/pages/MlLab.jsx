import { Link } from "react-router-dom";
import { mlLab } from "../data/mlLab";
import { repoTree } from "../data/site";
import { Callout, ExternalLink, PageHeader, ScrollRegion, Section, StatusBadge } from "../components/ui";

const LEVEL = {
  notes: { state: "partial", label: "Notes" },
  started: { state: "planned", label: "Started" },
};

export default function MlLab() {
  const total = mlLab.groups.flatMap((g) => g.topics).reduce((n, t) => n + t.notes, 0);
  return (
    <>
      <PageHeader eyebrow="ML Lab" title="Machine learning foundations">
        <p className="lede">{mlLab.intro}</p>
        <p className="mt-4 text-sm text-muted">
          {total} notes across the topics below ·{" "}
          <ExternalLink href={mlLab.repo}>Ai-Machine-Learning repository</ExternalLink>
        </p>
        <div className="mt-6">
          <Callout title="What this page does and does not claim">{mlLab.evidenceNote}</Callout>
        </div>
      </PageHeader>

      {mlLab.groups.map((g) => (
        <Section key={g.title} id={g.title.toLowerCase().replace(/\s+/g, "-")} title={g.title}>
          <ScrollRegion label={`${g.title} topics`}>
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <caption className="sr-only">{g.title} topics with evidence status</caption>
              <thead>
                <tr className="border-b border-rule text-faint">
                  <th scope="col" className="py-2 pr-4 font-normal">Topic</th>
                  <th scope="col" className="py-2 pr-4 font-normal">Covers</th>
                  <th scope="col" className="py-2 pr-4 font-normal">Notes</th>
                  <th scope="col" className="py-2 pr-4 font-normal">Evidence</th>
                  <th scope="col" className="py-2 font-normal">My status</th>
                </tr>
              </thead>
              <tbody>
                {g.topics.map((t) => (
                  <tr key={t.name} className="border-b border-rule/60 align-top">
                    <th scope="row" className="py-3 pr-4 font-medium text-ink">
                      <ExternalLink href={repoTree("Ai-Machine-Learning", t.path)}>{t.name}</ExternalLink>
                    </th>
                    <td className="py-3 pr-4 text-muted">{t.covers}</td>
                    <td className="num py-3 pr-4 text-ink">{t.notes}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge state={LEVEL[t.level].state}>{LEVEL[t.level].label}</StatusBadge>
                    </td>
                    <td className="py-3 text-muted">{t.progress ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollRegion>
        </Section>
      ))}

      <Section id="next" title="Next in the lab">
        <ul className="list-dash max-w-prose space-y-2 text-muted">
          {mlLab.next.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <p className="mt-6 max-w-prose text-muted">
          {mlLab.appliedElsewhere.text} <Link to={mlLab.appliedElsewhere.href}>See the Relevia case study</Link>.
        </p>
      </Section>
    </>
  );
}
