import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { m } from "framer-motion";
import posterLg from "../../assets/img/hero-poster.webp";
import posterSm from "../../assets/img/hero-poster-sm.webp";

const BubbleUniverse = lazy(() => import("./BubbleUniverse"));

/** Returns the GPU's renderer string ("" if the browser hides it), or null when WebGL is unavailable. */
const probeGPU = () => {
  try {
    const gl = document.createElement("canvas").getContext("webgl2") || document.createElement("canvas").getContext("webgl");
    if (!gl) return null;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return renderer;
  } catch {
    return null;
  }
};

/**
 * Full-screen home hero. A still of the bubble universe paints immediately;
 * the live WebGL scene loads on the first interaction and fades in over it.
 * Visitors who prefer reduced motion get the still and a Play button.
 */
export default function HeroUniverse({ children, labelledBy }) {
  const wrap = useRef(null);
  const api = useRef(null);
  const [mode, setMode] = useState("poster"); // poster | live | unsupported
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [count, setCount] = useState({ n: 0, max: 0 });
  const [gpu, setGpu] = useState("");
  const [tier, setTier] = useState(null);
  const goLive = useCallback(() => {
    const renderer = probeGPU();
    if (renderer === null) {
      setMode("unsupported");
      return;
    }
    setGpu(renderer);
    setMode("live");
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    setReduced(prefersReduced);
    // Only a cheap feature test here: creating a real WebGL context can block
    // the main thread for a second on a phone, so that check waits for start().
    if (!("WebGLRenderingContext" in window)) {
      setMode("unsupported");
      return undefined;
    }
    if (prefersReduced) return undefined;

    // On a desktop it starts once the page has loaded and the browser is idle,
    // or at the first interaction if that comes sooner. On a phone it waits for
    // the first touch or scroll, so loading the page stays fast. The poster is
    // the empty stage either way, and the bubbles rain in when the scene is ready.
    const EVENTS = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"];
    let started = false;
    let idle;
    const start = () => {
      if (started) return;
      started = true;
      EVENTS.forEach((e) => window.removeEventListener(e, start));
      goLive();
    };
    const schedule = () => {
      idle = "requestIdleCallback" in window ? window.requestIdleCallback(start, { timeout: 2500 }) : window.setTimeout(start, 1200);
    };
    EVENTS.forEach((e) => window.addEventListener(e, start, { once: true, passive: true }));
    const phone = window.innerWidth < 768 || window.matchMedia?.("(pointer: coarse)").matches;
    if (!phone) {
      if (document.readyState === "complete") schedule();
      else window.addEventListener("load", schedule, { once: true });
    }
    return () => {
      started = true;
      EVENTS.forEach((e) => window.removeEventListener(e, start));
      window.removeEventListener("load", schedule);
      if (idle !== undefined) ("cancelIdleCallback" in window ? window.cancelIdleCallback : window.clearTimeout)(idle);
    };
  }, [goLive]);

  useEffect(() => {
    const el = wrap.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting && !document.hidden), { threshold: 0.02 });
    io.observe(el);
    const onVis = () => setVisible(!document.hidden && el.getBoundingClientRect().bottom > 0);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const onReady = useCallback(() => setReady(true), []);
  const onCount = useCallback((n, max) => setCount({ n, max }), []);
  const live = mode === "live";

  return (
    <section ref={wrap} aria-labelledby={labelledBy} className="relative isolate flex min-h-[100svh] items-center overflow-hidden" data-hero data-tier={tier ?? undefined}>
      {/* Layer 1: still image of the scene (also the no-WebGL / reduced-motion view) */}
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        <picture>
          <source media="(max-width: 767px)" srcSet={posterSm} />
          <img src={posterLg} alt="" width="1600" height="900" fetchpriority="high" decoding="async" className="h-full w-full object-cover" />
        </picture>
      </div>

      {/* Layer 2: the live bubble universe */}
      {live && (
        <Suspense fallback={null}>
          <m.div
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            role="img"
            aria-label="Interactive 3D scene: glass bubbles in a nebula. Tap empty space to create a bubble; tap a bubble to change its colour."
          >
            <BubbleUniverse ref={api} gpu={gpu} running={visible && !paused} onReady={onReady} onCountChange={onCount} onTierChange={setTier} />
          </m.div>
        </Suspense>
      )}

      {/* Scrim so text stays readable over the scene */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[5] bg-[radial-gradient(ellipse_at_25%_45%,rgba(10,12,24,0.82)_0%,rgba(10,12,24,0.55)_38%,rgba(10,12,24,0)_70%)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-[5] h-40 bg-gradient-to-b from-transparent to-canvas" />

      {/* Content: pointer events pass through to the scene except on interactive elements */}
      <div className="pointer-events-none relative w-full [&_a]:pointer-events-auto [&_button]:pointer-events-auto">{children}</div>

      {/* Scene controls */}
      <div className="no-print absolute inset-x-0 bottom-5 z-10">
        <div className="wrap flex flex-wrap items-end justify-between gap-3">
          <p className="max-w-md font-sub text-base italic text-champagne/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.8)]">
            {live ? (
              <>Our universe is like a bubble, and it is expanding like one. Tap anywhere to create a bubble and watch it grow; tap a bubble to recolour it.</>
            ) : mode === "unsupported" ? (
              <>A still of my bubble universe (this browser has no WebGL).</>
            ) : reduced ? (
              <>Motion is reduced on your device, so the bubble universe is paused.</>
            ) : null}
          </p>
          <div className="flex items-center gap-2">
            {live && (
              <span className="rounded-full border border-white/10 bg-canvas/75 px-3 py-1.5 font-label text-xs font-semibold text-muted" aria-live="polite">
                {count.n} / {count.max} bubbles
              </span>
            )}
            {live ? (
              <>
                <button type="button" className="btn btn-quiet min-h-[36px] px-4 py-1 text-sm" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
                  {paused ? "Play" : "Pause"}
                </button>
                <button type="button" className="btn btn-quiet min-h-[36px] px-4 py-1 text-sm" onClick={() => api.current?.clear()}>
                  Clear
                </button>
              </>
            ) : (
              mode === "poster" &&
              reduced && (
                <button type="button" className="btn btn-quiet min-h-[36px] px-4 py-1 text-sm" onClick={goLive}>
                  Play the bubble universe
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
