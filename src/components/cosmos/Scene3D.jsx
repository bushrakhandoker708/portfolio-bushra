import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { m } from "framer-motion";

const Gem = lazy(() => import("./Gem"));

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
    <figure ref={box} className={`relative ${className}`} data-scene={shape}>
      <m.div className="absolute inset-0" role="img" aria-label={label} initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 1.1 }}>
        {mounted && (
          <Suspense fallback={null}>
            <Gem shape={shape} running={visible} />
          </Suspense>
        )}
      </m.div>
      {hint && mounted && (
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 px-2 text-center font-sub text-sm italic text-champagne/85 [text-shadow:0_1px_10px_rgba(0,0,0,0.9)]">
          {hint}
        </figcaption>
      )}
    </figure>
  );
}
