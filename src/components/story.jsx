import { RevealItem } from "./motion";

/* Shared storytelling blocks for project stories and ML Lab experiments. */

/**
 * A picture or a short excerpt of real code, placed inside the story at the
 * point it illustrates. `media` is either { src, alt, width, height, caption }
 * or { code, lang, caption, source, sourceLabel }.
 */
export function StoryMedia({ media, className = "" }) {
  if (!media) return null;
  if (media.code) {
    return (
      <figure className={className}>
        <pre
          className="overflow-x-auto rounded-xl border border-white/10 bg-[rgb(8_10_20/0.85)] p-4 font-code text-[0.8rem] leading-relaxed text-ink/90"
          tabIndex={0}
          aria-label={media.caption}
        >
          <code>{media.code}</code>
        </pre>
        <figcaption className="mt-2 text-sm text-faint">
          {media.caption}
          {media.source && (
            <>
              {" "}
              <a href={media.source} target="_blank" rel="noopener noreferrer">
                {media.sourceLabel ?? "Source"}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </>
          )}
        </figcaption>
      </figure>
    );
  }
  // Portrait screenshots (a phone-shaped panel) would tower over the text at
  // full width, so they keep their own proportions at a capped height.
  const portrait = media.height > media.width;
  return (
    <figure className={`${portrait ? "flex flex-col items-center" : ""} ${className}`}>
      <img
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        loading="lazy"
        decoding="async"
        className={`${portrait ? "max-h-[30rem] w-auto" : "w-full"} rounded-xl border border-white/10 bg-raised shadow-[0_20px_60px_-30px_rgb(0_0_0/0.8)]`}
      />
      {media.caption && <figcaption className="mt-2 text-sm text-faint">{media.caption}</figcaption>}
    </figure>
  );
}

/** One design decision: the question, the options weighed, the one taken and why. */
export function Fork({ n, question, options, chose, why, figure }) {
  // A row in a decision log, not a card: the question and the options on the
  // left, the reasoning on the right, separated from the next by a hairline.
  return (
    <RevealItem as="li" className="rule-top grid grid-cols-1 gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
      <div className="flex gap-5">
        <span aria-hidden="true" className="num pt-1 text-3xl leading-none text-accent/60">
          {String(n).padStart(2, "0")}
        </span>
        <div>
          <p className="sr-only">Decision {n}</p>
          <h3 className="text-xl font-semibold leading-snug sm:text-2xl">{question}</h3>
          <ul className="mt-4 space-y-1.5" aria-label="Options considered">
            {options.map((o, i) => {
              const taken = i === chose;
              return (
                <li key={o} className={`flex items-start gap-2.5 text-sm ${taken ? "text-ink" : "text-faint"}`}>
                  <span aria-hidden="true" className={`mt-px font-label font-semibold ${taken ? "text-accent" : "text-faint"}`}>
                    {taken ? "→" : "·"}
                  </span>
                  <span className={taken ? "font-medium" : "line-through decoration-white/25"}>{o}</span>
                  <span className="sr-only">{taken ? " (chosen)" : " (not chosen)"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="lg:pt-1">
        <p className="text-muted lg:text-lg lg:leading-relaxed">{why}</p>
        <StoryMedia media={figure} className="mt-6" />
      </div>
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
  // A row that opens, not a card: a hairline above, the steps side by side
  // and divided by thin rules, then the picture or code that goes with it.
  return (
    <details className="rule-top group/story" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 [&::-webkit-details-marker]:hidden">
        <h3 className="text-xl font-semibold sm:text-2xl">{story.title}</h3>
        <span aria-hidden="true" className="text-2xl text-accent transition-transform duration-300 group-open/story:rotate-45">
          +
        </span>
      </summary>
      <ol className="grid gap-6 pb-8 md:grid-cols-4 md:gap-0">
        {STEPS.map(([key, label], i) => (
          <li key={key} className="border-l border-rule/70 pl-4 md:pr-5">
            <p className="num text-xs uppercase tracking-label text-accent">
              {i + 1} · {label}
            </p>
            <p className="mt-2 text-sm text-muted">{story[key]}</p>
          </li>
        ))}
      </ol>
      {story.figure && <StoryMedia media={story.figure} className="mb-10 max-w-4xl" />}
    </details>
  );
}
