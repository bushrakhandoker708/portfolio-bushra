import { RevealItem } from "./motion";

/* Shared storytelling blocks for project stories and ML Lab experiments. */

/** One fork in the road: the question, the options weighed, the one taken and why. */
export function Fork({ n, question, options, chose, why }) {
  return (
    <RevealItem as="li" className="card relative overflow-hidden p-6 sm:p-7">
      <p className="num text-sm text-accent">Fork {n}</p>
      <h3 className="mt-1 text-xl font-semibold sm:text-2xl">{question}</h3>
      <ul className="mt-5 grid gap-2" aria-label="Options considered">
        {options.map((o, i) => {
          const taken = i === chose;
          return (
            <li
              key={o}
              className={`flex items-start gap-3 rounded-xl border px-4 py-2.5 text-sm ${
                taken ? "border-accent/60 bg-accent/10 text-ink" : "border-white/10 text-faint"
              }`}
            >
              <span aria-hidden="true" className={`mt-0.5 font-label font-semibold ${taken ? "text-accent" : "text-faint"}`}>
                {taken ? "✓" : "·"}
              </span>
              <span className={taken ? "" : "line-through decoration-white/25"}>{o}</span>
              <span className="sr-only">{taken ? " (chosen)" : " (not chosen)"}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 text-muted">{why}</p>
    </RevealItem>
  );
}

const STEPS = [
  ["expected", "The plan"],
  ["observed", "What happened"],
  ["found", "The cause"],
  ["changed", "The fix"],
];

/** A debugging story told in four steps, from expectation to fix. */
export function Pushback({ story, open }) {
  return (
    <details className="card group/story overflow-hidden" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6 [&::-webkit-details-marker]:hidden">
        <h3 className="text-xl font-semibold sm:text-2xl">{story.title}</h3>
        <span aria-hidden="true" className="text-2xl text-accent transition-transform duration-300 group-open/story:rotate-45">
          +
        </span>
      </summary>
      <ol className="grid gap-px border-t border-white/10 bg-white/10 md:grid-cols-4">
        {STEPS.map(([key, label], i) => (
          <li key={key} className="bg-surface p-5">
            <p className="num text-xs uppercase tracking-label text-accent">
              {i + 1} · {label}
            </p>
            <p className="mt-2 text-sm text-muted">{story[key]}</p>
          </li>
        ))}
      </ol>
    </details>
  );
}
