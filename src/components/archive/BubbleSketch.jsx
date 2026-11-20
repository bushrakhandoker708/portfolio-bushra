import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics, usePlane, useSphere } from "@react-three/cannon";

const MAX_SPHERES = 40;
const PALETTE = ["#7cc6bb", "#baaae4", "#e6c07a", "#a8b4c6", "#5e8fb8"];

function Floor() {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, -2, 0] }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#101c30" roughness={0.9} />
    </mesh>
  );
}

function Sphere({ position, radius, color }) {
  const [ref] = useSphere(() => ({ mass: 1, position, args: [radius], material: { restitution: 0.6 } }));
  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[radius, 32, 16]} />
      <meshStandardMaterial color={color} metalness={0.2} roughness={0.25} />
    </mesh>
  );
}

let nextId = 0;
const makeSphere = (x = (Math.random() - 0.5) * 6, z = (Math.random() - 0.5) * 3) => ({
  id: nextId++,
  position: [x, 6 + Math.random() * 3, z],
  radius: 0.35 + Math.random() * 0.55,
  color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
});

/**
 * Lightweight rebuild of the original portfolio's bubble scene.
 * - one shadow-casting light, no post-processing, no transmission
 * - capped sphere count (oldest recycled)
 * - stops the render loop when scrolled out of view or the tab is hidden
 * - honours prefers-reduced-motion by starting paused
 */
export default function BubbleSketch() {
  const wrapper = useRef(null);
  const reduced = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(reduced);
  const [spheres, setSpheres] = useState(() => Array.from({ length: 8 }, () => makeSphere()));

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    if (wrapper.current) io.observe(wrapper.current);
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const drop = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    setSpheres((s) => [...s, makeSphere(x, (Math.random() - 0.5) * 2)].slice(-MAX_SPHERES));
  };

  const running = visible && !paused;

  return (
    <div ref={wrapper} className="card overflow-hidden">
      <div className="h-[420px] cursor-crosshair" onClick={drop} role="presentation">
        <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 3, 11], fov: 50 }} frameloop={running ? "always" : "never"}>
          <color attach="background" args={["#0b1424"]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[6, 12, 6]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
          <Physics gravity={[0, -9.8, 0]} allowSleep isPaused={!running}>
            <Floor />
            {spheres.map((s) => (
              <Sphere key={s.id} {...s} />
            ))}
          </Physics>
        </Canvas>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule px-4 py-3 text-sm text-muted">
        <span aria-live="polite">
          {spheres.length} / {MAX_SPHERES} spheres{reduced && paused ? " · paused because reduced motion is on" : ""}
        </span>
        <span className="flex gap-2">
          <button type="button" className="btn btn-quiet min-h-[36px] px-3 py-1" onClick={() => setPaused((p) => !p)}>
            {paused ? "Play" : "Pause"}
          </button>
          <button type="button" className="btn btn-quiet min-h-[36px] px-3 py-1" onClick={() => setSpheres([])}>
            Clear
          </button>
        </span>
      </div>
    </div>
  );
}
