import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { m } from "framer-motion";

const Gem = lazy(() => import("./Gem"));

/*
 * Sliders for the scenes that are models rather than pictures. Each slider
 * steps through fixed values, so every position is a model that was really
 * trained in the browser.
 */
const CONTROLS = {
  margin: [
    {
      key: "c",
      label: "Regularisation C",
      values: [0.01, 0.03, 0.1, 0.3, 1, 3, 10, 30, 100],
      initial: 4,
      note: "Small C tolerates mistakes and keeps a wide margin; large C fits the training points and narrows it.",
    },
  ],
  forest: [
    {
      key: "trees",
      label: "Number of trees",
      values: [1, 2, 3, 5, 10, 20, 50, 100],
      initial: 0,
      note: "One tree memorises its sample. Averaging many trees, each grown on a different bootstrap sample, smooths the vote.",
    },
    {
      key: "depth",
      label: "Maximum depth",
      values: [1, 2, 3, 4, 6, 8, 12],
      initial: 5,
      note: "Shallow trees underfit; very deep ones fit the noise in the training points.",
    },
  ],
};

function Slider({ id, control, index, onChange }) {
  const value = control.values[index];
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-label text-xs font-semibold uppercase tracking-label text-accent">
          {control.label}
        </label>
        <span className="num text-sm text-ink">{value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={control.values.length - 1}
        step={1}
        value={index}
        aria-valuetext={`${control.label} ${value}`}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-6 w-full cursor-pointer accent-[rgb(var(--accent))]"
      />
      <p className="mt-1 text-xs text-faint">{control.note}</p>
    </div>
  );
}

/**
 * Mounts an interactive 3D piece (Gem.jsx) once it is near the viewport and the
 * browser is idle (on a phone: at the first touch or scroll, so the page loads
 * fast), and stops its render loop while it is off-screen. Nothing
 * is rendered without WebGL or when the visitor prefers reduced motion; the
 * piece is decorative, and the hint text is only shown when it is there.
 */
export default function Scene3D({ shape, label, hint, className = "" }) {
  const box = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [info, setInfo] = useState("");
  const controls = CONTROLS[shape] ?? [];
  const [steps, setSteps] = useState(() => Object.fromEntries(controls.map((c) => [c.key, c.initial])));
  const params = Object.fromEntries(controls.map((c) => [c.key, c.values[steps[c.key]]]));

  useEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    if (!("WebGLRenderingContext" in window)) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    let idle;
    let near = false;
    const EVENTS = ["pointerdown", "touchstart", "scroll", "wheel", "keydown"];
    const phone = window.innerWidth < 768 || window.matchMedia?.("(pointer: coarse)").matches;
    let interacted = !phone;
    const go = () => {
      setMounted(true);
      // Give the canvas a moment to compile before fading it in.
      window.setTimeout(() => setReady(true), 250);
    };
    const tryStart = () => {
      if (!near || !interacted || idle !== undefined) return;
      idle = "requestIdleCallback" in window ? window.requestIdleCallback(go, { timeout: 1500 }) : window.setTimeout(go, 300);
    };
    const onInteract = () => {
      interacted = true;
      EVENTS.forEach((e) => window.removeEventListener(e, onInteract));
      tryStart();
    };
    if (phone) EVENTS.forEach((e) => window.addEventListener(e, onInteract, { passive: true }));
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting && !document.hidden);
        if (e.isIntersecting) {
          near = true;
          tryStart();
        }
      },
      { rootMargin: "150px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      EVENTS.forEach((e) => window.removeEventListener(e, onInteract));
      if (idle !== undefined) ("cancelIdleCallback" in window ? window.cancelIdleCallback : window.clearTimeout)(idle);
    };
  }, []);

  return (
    <figure ref={box} className="relative" data-scene={shape}>
      {/* Edges fade into the page, so the piece sits in the sky rather than in a frame. */}
      <div className={`relative ${className}`}>
        <m.div
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_80%)]"
          role="img"
          aria-label={label}
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 1.1 }}
        >
          {mounted && (
            <Suspense fallback={null}>
              <Gem shape={shape} running={visible} onInfo={setInfo} params={params} />
            </Suspense>
          )}
        </m.div>
      </div>
      {mounted && (hint || info || controls.length > 0) && (
        <figcaption className="mx-auto mt-2 max-w-xl px-1">
          {info && (
            <p className="text-center text-sm text-ink/90" aria-live="polite">
              {info}
            </p>
          )}
          {controls.length > 0 && (
            <div className={`mt-4 grid gap-4 ${controls.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {controls.map((c) => (
                <Slider
                  key={c.key}
                  id={`${shape}-${c.key}`}
                  control={c}
                  index={steps[c.key]}
                  onChange={(i) => setSteps((s) => ({ ...s, [c.key]: i }))}
                />
              ))}
            </div>
          )}
          {hint && <p className="mt-3 text-center font-sub text-sm italic text-champagne/75">{hint}</p>}
        </figcaption>
      )}
    </figure>
  );
}
