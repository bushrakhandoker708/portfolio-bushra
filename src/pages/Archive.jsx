import { lazy, Suspense, useState } from "react";
import { artwork, renders } from "../data/archive";
import { PageHeader, Section } from "../components/ui";

const BubbleSketch = lazy(() => import("../components/archive/BubbleSketch"));

function Gallery({ items, label }) {
  return (
    <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3" aria-label={label}>
      {items.map((a) => (
        <li key={a.title} className="mb-5 break-inside-avoid">
          <figure>
            <img src={a.src} alt={`${a.title}, ${a.medium.toLowerCase()}`} width={a.w} height={a.h} loading="lazy" decoding="async" className="w-full rounded-md border border-rule bg-raised" />
            <figcaption className="mt-2 flex justify-between text-sm">
              <span className="text-ink">{a.title}</span>
              <span className="text-faint">{a.medium}</span>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

export default function Archive() {
  const [started, setStarted] = useState(false);
  return (
    <>
      <PageHeader eyebrow="Creative archive" title="Drawing, painting and 3D">
        <p className="lede">
          Separate from my academic work, and older than most of it. Observational drawing trained me to look carefully, and I still find that
          useful.
        </p>
      </PageHeader>

      <Section id="physics-sketch" title="Interactive physics sketch">
        <p className="prose-body mb-6">
          A rebuilt version of the bubble simulation from my first portfolio: rigid-body spheres in a cannon.js world, rendered with three.js.
          Click or tap to drop a sphere. It is capped at 40 spheres, reusing the oldest, and stops rendering when it is off-screen.
        </p>
        {started ? (
          <Suspense fallback={<div className="card grid h-[420px] place-items-center text-muted">Loading the 3D scene…</div>}>
            <BubbleSketch />
          </Suspense>
        ) : (
          <div className="card grid h-[420px] place-items-center p-6 text-center">
            <div>
              <p className="mb-4 text-muted">The sketch uses WebGL and downloads about 360 kB of compressed code, only after you start it.</p>
              <button type="button" className="btn btn-primary" onClick={() => setStarted(true)}>
                Start the physics sketch
              </button>
            </div>
          </div>
        )}
      </Section>

      <Section id="artwork" title="Artwork">
        <Gallery items={artwork} label="Artwork" />
      </Section>

      <Section id="renders" title="3D renders">
        <Gallery items={renders} label="Blender renders" />
      </Section>
    </>
  );
}
