import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, m } from "framer-motion";
import { artwork, ART_CATEGORIES, ART_PORTFOLIO } from "../data/archive";
import { PageHeader, Section } from "../components/ui";
import { Tilt } from "../components/motion";
import Scene3D from "../components/cosmos/Scene3D";

/** Full-size viewer built on <dialog> (focus trap, Escape and backdrop handled natively). */
function Lightbox({ item, onClose, onStep }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (item && d && !d.open) d.showModal?.();
    if (!item && d?.open) d.close();
  }, [item]);
  useEffect(() => {
    if (!item) return undefined;
    const onKey = (e) => {
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onStep]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={item ? `${item.title}, ${item.medium}` : "Artwork viewer"}
      className="m-auto max-h-[92vh] w-[min(92vw,70rem)] rounded-2xl border border-white/10 bg-canvas/95 p-0 text-ink backdrop:bg-canvas/80 backdrop:backdrop-blur-sm"
    >
      {item && (
        <figure className="flex flex-col">
          <img src={item.src} alt={`${item.title}, ${item.medium.toLowerCase()}`} width={item.w} height={item.h} className="max-h-[78vh] w-full object-contain" />
          <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-3">
            <span className="max-w-xl">
              <span className="font-serif text-lg">{item.title}</span>{" "}
              <span className="text-sm text-faint">
                · {item.medium}
                {item.year ? `, ${item.year}` : ""}
              </span>
              {item.note && <span className="mt-1 block font-sub text-base italic text-champagne/90">{item.note}</span>}
            </span>
            <span className="flex gap-2">
              <button type="button" className="btn btn-quiet min-h-[36px] px-3 py-1 text-sm" onClick={() => onStep(-1)}>
                ← Previous
              </button>
              <button type="button" className="btn btn-quiet min-h-[36px] px-3 py-1 text-sm" onClick={() => onStep(1)}>
                Next →
              </button>
              <button type="button" className="btn btn-primary min-h-[36px] px-3 py-1 text-sm" onClick={onClose} autoFocus>
                Close
              </button>
            </span>
          </figcaption>
        </figure>
      )}
    </dialog>
  );
}

export default function Archive() {
  const [filter, setFilter] = useState("All");
  const [openIndex, setOpenIndex] = useState(null);
  const shown = filter === "All" ? artwork : artwork.filter((a) => a.medium === filter);
  const step = (d) => setOpenIndex((i) => (i === null ? i : (i + d + shown.length) % shown.length));

  return (
    <>
      <PageHeader
        eyebrow="Art & making"
        title="Painting, drawing, models and 3D"
        accent="rose"
        visual={<Scene3D shape="crystals" label="Interactive 3D crystals" hint="Tap a crystal to energise it. Tap one three times, quickly, to turn it into bubbles." className="h-[18rem] sm:h-[22rem]" />}
      >
        <p className="lede">
          Through pencil, acrylic, watercolour, clay and Blender, I make my own small worlds. Every piece narrates a story. Drawing taught
          me to look closely and to be patient with something that is not working yet, and I still use both every day in code. The bubble
          universe on the <Link to="/">home page</Link> began here, as play with physics.
        </p>
        <p className="mt-5">
          <a href={ART_PORTFOLIO} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
            Visit my art portfolio<span className="sr-only"> (opens in a new tab)</span> <span aria-hidden="true">↗</span>
          </a>
        </p>
      </PageHeader>

      <Section id="collection" eyebrow="A selection" title="Collection" accent="gold">
        <div role="group" aria-label="Filter by medium" className="mb-8 flex flex-wrap gap-2">
          {["All", ...ART_CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
              className={`btn min-h-[38px] px-4 py-1 text-sm ${filter === c ? "btn-primary" : "btn-quiet"}`}
            >
              {c}
              <span className="sr-only"> ({c === "All" ? artwork.length : artwork.filter((a) => a.medium === c).length} pieces)</span>
            </button>
          ))}
        </div>

        <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3" aria-label={`${filter === "All" ? "All" : filter} artwork`}>
          <AnimatePresence initial={false}>
            {shown.map((a, i) => (
              <m.li
                key={a.title}
                className="mb-5 break-inside-avoid"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Tilt as="button" type="button" onClick={() => setOpenIndex(i)} className="group block w-full rounded-xl text-left" max={6}>
                  <span className="shot block">
                    <img src={a.src} alt="" width={a.w} height={a.h} loading="lazy" decoding="async" fetchpriority="low" />
                  </span>
                  <span className="mt-2 flex justify-between gap-2 text-sm">
                    <span className="text-ink">{a.title}</span>
                    <span className="text-faint">
                      {a.medium}
                      {a.year ? ` · ${a.year}` : ""}
                    </span>
                  </span>
                  <span className="sr-only">, view larger</span>
                </Tilt>
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      </Section>

      <Lightbox item={openIndex === null ? null : shown[openIndex]} onClose={() => setOpenIndex(null)} onStep={step} />
    </>
  );
}
