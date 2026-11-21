import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { relevia } from "../../data/research";

/*
 * Small interactive 3D pieces for page headers, one per subject. Each is a
 * self-contained scene with no textures or physics, so it compiles quickly.
 * Loaded lazily by Scene3D only when it scrolls into view.
 *
 *   surface  z = sin x · cos y, coloured by the sign of its Gaussian curvature,
 *            with its critical points marked (maxima, minima, saddles)
 *   parcels  orders orbiting a database; confirming one is idempotent
 *   orb      a breathing sphere (Relevia's breathing tool)
 *   hex      six locker compartments that open and close
 *   crystals wireframe crystals; tap to energise, triple-tap to burst into bubbles
 *   routing  Relevia's safety routing: the 42 held-out messages through the
 *            S0, S1 or S2 detector, split exactly as each detector split them
 *   projects the four project stories as small objects; tap one to bring it forward
 *   forest   a random forest trained here on two half-moons; the grid is its vote
 *   margin   a linear soft-margin SVM trained here, in the browser, on two
 *            overlapping classes: decision plane, both margin planes, support
 *            vectors; tap to change C
 *
 * A scene can report one line of live text (onInfo), shown under it.
 */

export const COLOURS = {
  teal: "#98f5e1",
  gold: "#f4c46b",
  rose: "#ff8fab",
  sky: "#90dbf4",
  lavender: "#f1c0e8",
  mauve: "#cfbaf0",
  champagne: "#fde4cf",
};
const damp = THREE.MathUtils.damp;

// Shared with every scene: whether the visitor has interacted yet. Idle motion
// (spinning) only runs before that; reactions to a tap still play.
const Interaction = createContext(null);
const useIdle = () => {
  const drag = useContext(Interaction);
  const k = useRef(1);
  return (dt) => {
    k.current = drag?.current.touched ? damp(k.current, 0, 4, dt) : 1;
    return k.current;
  };
};

/**
 * Turns slowly by itself until the visitor first touches, clicks or drags it
 * (or moves one of its sliders). From then on it only moves when they drag it:
 * the slow spin eases to a stop and the tilt towards the pointer is dropped.
 */
function Turntable({ drag, spin = 0.2, children }) {
  const outer = useRef(null);
  const inner = useRef(null);
  const auto = useRef(1);
  useFrame((state, dt) => {
    const d = drag.current;
    if (!inner.current || !outer.current) return;
    auto.current = d.touched ? damp(auto.current, 0, 4, dt) : 1;
    inner.current.rotation.y += spin * dt * auto.current + d.vx;
    d.rx = THREE.MathUtils.clamp(d.rx + d.vy, -0.9, 0.9);
    inner.current.rotation.x = d.rx;
    // Short inertia after a drag, so it settles quickly.
    d.vx *= Math.pow(0.01, dt);
    d.vy *= Math.pow(0.01, dt);
    const px = d.touched ? 0 : state.pointer.x;
    const py = d.touched ? 0 : state.pointer.y;
    outer.current.rotation.x = damp(outer.current.rotation.x, -py * 0.18, 3, dt);
    outer.current.rotation.z = damp(outer.current.rotation.z, px * 0.1, 3, dt);
  });
  return (
    <group ref={outer}>
      <group ref={inner}>{children}</group>
    </group>
  );
}

function Edges({ geometry, colour, opacity = 0.9 }) {
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 12), [geometry]);
  useEffect(() => () => edges.dispose(), [edges]);
  return (
    <lineSegments geometry={edges}>
      <lineBasicMaterial color={colour} transparent opacity={opacity} />
    </lineSegments>
  );
}

/* ---------- surface: curvature of z = sin x · cos y ---------- */
const f = (x, y) => Math.sin(x) * Math.cos(y);
function curvature(x, y, h = 1e-4) {
  // Same finite differences and step size as the StudyBuddy engine.
  const fx = (f(x + h, y) - f(x - h, y)) / (2 * h);
  const fy = (f(x, y + h) - f(x, y - h)) / (2 * h);
  const fxx = (f(x + h, y) - 2 * f(x, y) + f(x - h, y)) / (h * h);
  const fyy = (f(x, y + h) - 2 * f(x, y) + f(x, y - h)) / (h * h);
  const fxy = (f(x + h, y + h) - f(x + h, y - h) - f(x - h, y + h) + f(x - h, y - h)) / (4 * h * h);
  return (fxx * fyy - fxy * fxy) / (1 + fx * fx + fy * fy) ** 2;
}
// Critical points of sin x · cos y inside the plotted square: extrema where
// x = π/2 + kπ and y = mπ, saddles where x = kπ and y = π/2 + mπ.
const SURFACE_R = Math.PI * 1.15;
const CRITICAL = (() => {
  const out = [];
  for (let k = -2; k <= 2; k += 1)
    for (let m = -2; m <= 2; m += 1) {
      const ex = Math.PI / 2 + k * Math.PI;
      const ey = m * Math.PI;
      if (Math.abs(ex) <= SURFACE_R && Math.abs(ey) <= SURFACE_R)
        out.push({ x: ex, y: ey, z: f(ex, ey), kind: f(ex, ey) > 0 ? "max" : "min" });
      const sx = k * Math.PI;
      const sy = Math.PI / 2 + m * Math.PI;
      if (Math.abs(sx) <= SURFACE_R && Math.abs(sy) <= SURFACE_R) out.push({ x: sx, y: sy, z: 0, kind: "saddle" });
    }
  return out;
})();
const CRIT_COLOUR = { max: COLOURS.gold, min: COLOURS.sky, saddle: COLOURS.champagne };

function Surface() {
  const N = 56;
  const R = SURFACE_R;
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(2 * R, 2 * R, N, N);
    const pos = g.attributes.position;
    const col = new Float32Array(pos.count * 3);
    const pos0 = new THREE.Color(COLOURS.teal);
    const neg = new THREE.Color(COLOURS.rose);
    const flat = new THREE.Color(COLOURS.champagne);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, f(x, y));
      const k = curvature(x, y);
      c.copy(flat).lerp(k > 0 ? pos0 : neg, Math.min(1, Math.abs(k) * 1.6));
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.userData.base = Float32Array.from(pos.array);
    g.computeVertexNormals();
    return g;
  }, [R]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const ripple = useRef({ t: 0, energy: 0 });

  useFrame((_, dt) => {
    const r = ripple.current;
    if (r.energy < 0.002) return;
    r.t += dt;
    r.energy *= Math.pow(0.15, dt);
    const pos = geometry.attributes.position;
    const base = geometry.userData.base;
    for (let i = 0; i < pos.count; i += 1) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      const d = Math.hypot(x, y);
      pos.setZ(i, base[i * 3 + 2] + Math.sin(d * 2.4 - r.t * 7) * 0.35 * r.energy * Math.exp(-d * 0.25));
    }
    pos.needsUpdate = true;
  });

  return (
    <group rotation={[-Math.PI / 2.6, 0, 0]} scale={0.55}>
      <mesh
        geometry={geometry}
        onClick={(e) => {
          e.stopPropagation();
          ripple.current = { t: 0, energy: 1 };
        }}
      >
        <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.45} metalness={0.15} transparent opacity={0.88} />
      </mesh>
      <mesh geometry={geometry}>
        <meshBasicMaterial wireframe color="#ffffff" transparent opacity={0.08} />
      </mesh>
      {CRITICAL.map((c) => (
        <mesh key={`${c.x},${c.y}`} position={[c.x, c.y, c.z + (c.kind === "min" ? -0.07 : 0.07)]}>
          <sphereGeometry args={[0.11, 16, 12]} />
          <meshBasicMaterial color={CRIT_COLOUR[c.kind]} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- parcels: orders around a database ---------- */
function Parcel({ angle, radius, y }) {
  const ref = useRef(null);
  const mat = useRef(null);
  const [confirmed, setConfirmed] = useState(false);
  const pulse = useRef(0);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime * 0.35 + angle;
    ref.current.position.set(Math.cos(t) * radius, y + Math.sin(t * 2) * 0.12, Math.sin(t) * radius);
    ref.current.rotation.y = -t;
    pulse.current = damp(pulse.current, 0, 4, dt);
    ref.current.scale.setScalar(1 + pulse.current * 0.35);
    mat.current.emissiveIntensity = 0.15 + pulse.current * 1.2;
  });
  return (
    <mesh
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        // Exactly once: a second tap on a confirmed order changes nothing.
        if (!confirmed) {
          setConfirmed(true);
          pulse.current = 1;
        }
      }}
    >
      <boxGeometry args={[0.42, 0.32, 0.42]} />
      <meshStandardMaterial
        ref={mat}
        color={confirmed ? COLOURS.teal : COLOURS.gold}
        emissive={confirmed ? COLOURS.teal : COLOURS.gold}
        emissiveIntensity={0.15}
        roughness={0.4}
      />
    </mesh>
  );
}
function Parcels() {
  const cyl = useMemo(() => new THREE.CylinderGeometry(0.7, 0.7, 1.5, 32, 3, true), []);
  useEffect(() => () => cyl.dispose(), [cyl]);
  const items = useMemo(
    () => Array.from({ length: 9 }, (_, i) => ({ angle: (i / 9) * Math.PI * 2, radius: 2.1 + (i % 3) * 0.25, y: ((i % 3) - 1) * 0.45 })),
    [],
  );
  return (
    <group>
      <mesh geometry={cyl}>
        <meshStandardMaterial color={COLOURS.sky} transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
      <Edges geometry={cyl} colour={COLOURS.sky} opacity={0.6} />
      {[-0.75, -0.25, 0.25, 0.75].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.7, 0.012, 6, 48]} />
          <meshBasicMaterial color={COLOURS.sky} />
        </mesh>
      ))}
      {items.map((p) => (
        <Parcel key={p.angle} {...p} />
      ))}
    </group>
  );
}

/* ---------- orb: breathing ---------- */
function Orb() {
  const ref = useRef(null);
  const mat = useRef(null);
  const ring = useRef(null);
  const palette = [COLOURS.lavender, COLOURS.teal, COLOURS.sky, COLOURS.champagne];
  const [i, setI] = useState(0);
  const target = useMemo(() => new THREE.Color(), []);
  useFrame((state, dt) => {
    // Four seconds in, four seconds out.
    const s = 0.5 - 0.5 * Math.cos((state.clock.elapsedTime / 8) * Math.PI * 2);
    ref.current.scale.setScalar(0.82 + s * 0.3);
    ring.current.scale.setScalar(1.25 + s * 0.45);
    ring.current.material.opacity = 0.5 - s * 0.35;
    target.set(palette[i]);
    mat.current.color.lerp(target, 1 - Math.pow(0.02, dt));
    mat.current.emissive.lerp(target, 1 - Math.pow(0.02, dt));
  });
  return (
    <group>
      <mesh
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          setI((n) => (n + 1) % palette.length);
        }}
      >
        <icosahedronGeometry args={[1.25, 6]} />
        <meshPhysicalMaterial
          ref={mat}
          color={palette[0]}
          emissive={palette[0]}
          emissiveIntensity={0.25}
          roughness={0.15}
          clearcoat={1}
          transparent
          opacity={0.92}
        />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.25, 0.015, 8, 96]} />
        <meshBasicMaterial color={COLOURS.champagne} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

/* ---------- hex: six locker compartments ---------- */
function Compartment({ position, index }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const geo = useMemo(() => new THREE.CylinderGeometry(0.5, 0.5, 0.9, 6), []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame((_, dt) => {
    ref.current.position.z = damp(ref.current.position.z, open ? 0.75 : 0, 6, dt);
  });
  const colour = open ? COLOURS.teal : index % 2 ? COLOURS.gold : COLOURS.champagne;
  return (
    <group position={position}>
      <group
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <mesh geometry={geo} rotation={[Math.PI / 2, 0, Math.PI / 6]}>
          <meshStandardMaterial color={colour} transparent opacity={open ? 0.55 : 0.22} roughness={0.3} metalness={0.3} />
        </mesh>
        <group rotation={[Math.PI / 2, 0, Math.PI / 6]}>
          <Edges geometry={geo} colour={colour} />
        </group>
      </group>
    </group>
  );
}
function Hex() {
  // A ring of six around a centre, like a honeycomb.
  const cells = useMemo(
    () => Array.from({ length: 6 }, (_, i) => [Math.cos((i * Math.PI) / 3) * 0.9, Math.sin((i * Math.PI) / 3) * 0.9, 0]),
    [],
  );
  return (
    <group rotation={[0.25, -0.4, 0]} scale={1.35}>
      {cells.map((p, i) => (
        <Compartment key={i} position={p} index={i} />
      ))}
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.32, 0.32, 0.5, 6]} />
        <meshStandardMaterial color={COLOURS.sky} emissive={COLOURS.sky} emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

/* ---------- crystals: energise, then burst into bubbles ---------- */
const CRYSTAL_GEOS = [
  new THREE.OctahedronGeometry(0.6, 0),
  new THREE.IcosahedronGeometry(0.55, 0),
  new THREE.DodecahedronGeometry(0.5, 0),
  new THREE.TetrahedronGeometry(0.62, 0),
];
const CRYSTAL_COLOURS = [COLOURS.lavender, COLOURS.gold, COLOURS.sky, COLOURS.teal, COLOURS.rose];

function Burst({ origin, colour, onDone }) {
  const group = useRef(null);
  const parts = useMemo(
    () =>
      Array.from({ length: 14 }, () => ({
        v: new THREE.Vector3((Math.random() - 0.5) * 2.4, Math.random() * 2 + 0.6, (Math.random() - 0.5) * 2.4),
        s: 0.06 + Math.random() * 0.12,
      })),
    [],
  );
  const age = useRef(0);
  useFrame((_, dt) => {
    age.current += dt;
    const g = group.current;
    if (!g) return;
    g.children.forEach((child, i) => {
      const p = parts[i];
      child.position.addScaledVector(p.v, dt);
      p.v.multiplyScalar(Math.pow(0.5, dt));
      p.v.y += 0.4 * dt;
      child.material.opacity = Math.max(0, 0.85 - age.current / 2.6);
    });
    if (age.current > 2.6) onDone();
  });
  return (
    <group ref={group} position={origin}>
      {parts.map((p, i) => (
        <mesh key={i} scale={p.s}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshPhysicalMaterial color={colour} roughness={0.05} clearcoat={1} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function Crystal({ position, geo, colour, onBurst }) {
  const ref = useRef(null);
  const mat = useRef(null);
  const energy = useRef(0);
  const taps = useRef([]);
  const [gone, setGone] = useState(false);
  const grow = useRef(1);
  useEffect(() => {
    if (!gone) return undefined;
    const id = window.setTimeout(() => {
      grow.current = 0;
      setGone(false);
    }, 3200);
    return () => window.clearTimeout(id);
  }, [gone]);
  const idle = useIdle();
  const bob = useRef(0);
  useFrame((state, dt) => {
    const m = ref.current;
    if (!m) return;
    const k = idle(dt);
    energy.current = damp(energy.current, 0, 1.6, dt);
    grow.current = damp(grow.current, 1, 3, dt);
    m.rotation.x += dt * (0.25 * k + energy.current * 7);
    m.rotation.y += dt * (0.35 * k + energy.current * 9);
    bob.current += dt * 0.8 * k;
    m.position.y = position[1] + Math.sin(bob.current + position[0]) * 0.15;
    m.scale.setScalar(grow.current * (1 + energy.current * 0.3));
    if (mat.current) mat.current.emissiveIntensity = 0.2 + energy.current * 2;
  });
  if (gone) return null;
  return (
    <group
      ref={ref}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        energy.current = 1;
        const now = performance.now();
        taps.current = [...taps.current.filter((t) => now - t < 900), now];
        if (taps.current.length >= 3) {
          taps.current = [];
          onBurst(ref.current.position.clone(), colour);
          setGone(true);
        }
      }}
    >
      <mesh geometry={geo}>
        <meshStandardMaterial
          ref={mat}
          color={colour}
          emissive={colour}
          emissiveIntensity={0.2}
          transparent
          opacity={0.28}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
      <Edges geometry={geo} colour={colour} />
    </group>
  );
}
function Crystals() {
  const [bursts, setBursts] = useState([]);
  const items = useMemo(
    () =>
      [
        [-2.2, 0.4, 0],
        [-0.8, -0.6, 0.6],
        [0.6, 0.7, -0.3],
        [2.0, -0.3, 0.2],
        [-0.1, 0.1, 1.2],
        [1.3, -1.0, 0.9],
        [-1.6, -1.2, -0.5],
      ].map((position, i) => ({
        position,
        geo: CRYSTAL_GEOS[i % CRYSTAL_GEOS.length],
        colour: CRYSTAL_COLOURS[i % CRYSTAL_COLOURS.length],
      })),
    [],
  );
  return (
    <group>
      {items.map((c, i) => (
        <Crystal key={i} {...c} onBurst={(origin, colour) => setBursts((b) => [...b, { id: performance.now(), origin, colour }])} />
      ))}
      {bursts.map((b) => (
        <Burst key={b.id} origin={b.origin} colour={b.colour} onDone={() => setBursts((list) => list.filter((x) => x.id !== b.id))} />
      ))}
    </group>
  );
}

/* ---------- knot: ideas tied together; tap to re-tie ---------- */
/* ---------- shared: deterministic randomness ---------- */
function seeded(seed) {
  // Scramble the seed so neighbouring seeds do not start with near-identical values.
  let s = ((Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b) >>> 0) % 2147483646) + 1;
  for (let k = 0; k < 3; k += 1) s = (s * 16807) % 2147483647;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
function gaussian(rnd) {
  const u = Math.max(rnd(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
}
const smooth = (t) => t * t * (3 - 2 * t);

/* ---------- routing: Relevia's safety detectors on the held-out set ---------- */
// Counts from relevia-research results/safety/s2-v1/evaluation.json
// (src/data/research.js): 24 urgent and 18 ordinary messages.
const ROUTE_PATH_IN = (i, t) => {
  // From a loose cloud on the left into the gate at the origin.
  const r = seeded(100 + i);
  const y0 = (r() - 0.5) * 2.2;
  const z0 = (r() - 0.5) * 1.6;
  const e = smooth(t);
  return [-2.8 + 2.8 * t, y0 * (1 - e), z0 * (1 - e)];
};
const LANE_END = { safety: [2.5, 1.15, 0], model: [2.5, -1.15, 0] };
const ROUTE_PATH_OUT = (lane, t) => {
  const [ex, ey] = LANE_END[lane];
  const e = smooth(t);
  return [ex * t, ey * e, 0];
};

function Routing({ onInfo }) {
  const detectors = relevia.safety.detectors;
  const { urgent, nonUrgent } = relevia.safety;
  const [di, setDi] = useState(0);
  const d = detectors[di];
  const det = useRef(d);
  det.current = d;
  const inst = useRef(null);
  const gate = useRef(null);
  const flash = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  // One particle per held-out message: urgent ones first, then ordinary ones.
  const particles = useMemo(
    () =>
      Array.from({ length: urgent + nonUrgent }, (_, i) => ({
        urgent: i < urgent,
        rank: i < urgent ? i : i - urgent,
        phase: seeded(7 + i)(),
        lane: "model",
      })),
    [urgent, nonUrgent],
  );
  const colours = useMemo(() => ({ urgent: new THREE.Color(COLOURS.rose), ordinary: new THREE.Color(COLOURS.teal) }), []);
  const lanes = useMemo(
    () =>
      ["safety", "model"].map((lane) => {
        const pts = Array.from({ length: 30 }, (_, k) => new THREE.Vector3(...ROUTE_PATH_OUT(lane, k / 29)));
        return new THREE.BufferGeometry().setFromPoints(pts);
      }),
    [],
  );
  useEffect(() => () => lanes.forEach((g) => g.dispose()), [lanes]);

  useEffect(() => {
    onInfo?.(
      `${d.id} (${d.label}): ${d.tp} of ${urgent} urgent messages routed to the safety response, ${d.fp} of ${nonUrgent} ordinary ones. Tap to switch detector.`,
    );
  }, [d, onInfo, urgent, nonUrgent]);

  useFrame((state, dt) => {
    const t0 = state.clock.elapsedTime * 0.11;
    const cur = det.current;
    flash.current = damp(flash.current, 0, 3, dt);
    if (gate.current) gate.current.scale.setScalar(1 + flash.current * 0.25);
    particles.forEach((p, i) => {
      const t = (t0 + p.phase) % 1;
      // The routing decision is taken as the message reaches the gate.
      if (t < 0.5) p.lane = (p.urgent ? p.rank < cur.tp : p.rank < cur.fp) ? "safety" : "model";
      const pos = t < 0.5 ? ROUTE_PATH_IN(i, t * 2) : ROUTE_PATH_OUT(p.lane, (t - 0.5) * 2);
      const fade = Math.min(1, t * 12, (1 - t) * 12);
      dummy.position.set(...pos);
      dummy.scale.setScalar(0.25 + 0.75 * fade);
      dummy.updateMatrix();
      inst.current.setMatrixAt(i, dummy.matrix);
      inst.current.setColorAt(i, p.urgent ? colours.urgent : colours.ordinary);
    });
    inst.current.instanceMatrix.needsUpdate = true;
    if (inst.current.instanceColor) inst.current.instanceColor.needsUpdate = true;
  });

  return (
    <group
      rotation={[0.15, -0.75, 0]}
      onClick={(e) => {
        e.stopPropagation();
        flash.current = 1;
        setDi((n) => (n + 1) % detectors.length);
      }}
    >
      <mesh ref={gate} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.42, 0.035, 12, 64]} />
        <meshBasicMaterial color={COLOURS.lavender} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.4, 48]} />
        <meshBasicMaterial color={COLOURS.mauve} transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      {lanes.map((g, k) => (
        <line key={k} geometry={g}>
          <lineBasicMaterial color={k === 0 ? COLOURS.rose : COLOURS.teal} transparent opacity={0.35} />
        </line>
      ))}
      <mesh position={LANE_END.safety}>
        <icosahedronGeometry args={[0.2, 2]} />
        <meshBasicMaterial color={COLOURS.rose} transparent opacity={0.85} />
      </mesh>
      <mesh position={LANE_END.model}>
        <icosahedronGeometry args={[0.2, 2]} />
        <meshBasicMaterial color={COLOURS.teal} transparent opacity={0.85} />
      </mesh>
      <instancedMesh ref={inst} args={[undefined, undefined, particles.length]}>
        <sphereGeometry args={[0.065, 12, 10]} />
        <meshBasicMaterial color="#ffffff" />
      </instancedMesh>
      {/* A large invisible target so a tap anywhere switches the detector. */}
      <mesh visible={false}>
        <boxGeometry args={[6, 3.4, 2]} />
      </mesh>
    </group>
  );
}

/* ---------- projects: the four project stories ---------- */
const PROJECTS = [
  { title: "StudyBuddy", note: "maths graphing in the browser", colour: COLOURS.teal },
  { title: "Bushal", note: "a shop that counts stock exactly once", colour: COLOURS.gold },
  { title: "Relevia", note: "a supportive chat that runs on the device", colour: COLOURS.lavender },
  { title: "HEXALOCK", note: "a six-compartment smart locker", colour: COLOURS.sky },
];
const RING_R = 1.85;
const TAU = Math.PI * 2;

// StudyBuddy: a small patch of z = sin x · cos y, shaded by its Gaussian
// curvature K (between −1 and 1 here): teal for bowls, rose for saddles,
// pale where the surface is nearly flat.
function MiniSurface() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.88, 0.88, 32, 32);
    const pos = g.attributes.position;
    const colour = new Float32Array(pos.count * 3);
    const bowl = new THREE.Color(COLOURS.teal);
    const saddle = new THREE.Color(COLOURS.rose);
    const flat = new THREE.Color(COLOURS.champagne);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i) * 5.4;
      const y = pos.getY(i) * 5.4;
      pos.setZ(i, f(x, y) * 0.14);
      const k = THREE.MathUtils.clamp(curvature(x, y), -1, 1);
      c.copy(flat).lerp(k > 0 ? bowl : saddle, Math.abs(k) ** 0.6);
      c.toArray(colour, i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colour, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <group rotation={[-0.85, 0, 0.3]}>
      <mesh geometry={geo}>
        <meshStandardMaterial vertexColors roughness={0.5} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geo}>
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.07} />
      </mesh>
    </group>
  );
}

// Bushal: three parcels, each with a band of tape.
const PARCELS = [
  { at: [0, -0.24, 0], size: [0.64, 0.34, 0.5], turn: 0.12, colour: COLOURS.gold },
  { at: [0.04, 0.09, 0.02], size: [0.5, 0.3, 0.42], turn: -0.22, colour: COLOURS.champagne },
  { at: [-0.02, 0.37, -0.01], size: [0.36, 0.25, 0.3], turn: 0.38, colour: COLOURS.gold },
];
function MiniParcels() {
  return PARCELS.map((b) => (
    <group key={b.at.join()} position={b.at} rotation={[0, b.turn, 0]}>
      <mesh>
        <boxGeometry args={b.size} />
        <meshStandardMaterial color={b.colour} roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh>
        <boxGeometry args={[b.size[0] * 1.01, b.size[1] * 1.01, b.size[2] * 0.2]} />
        <meshStandardMaterial color="#a9773a" roughness={0.45} />
      </mesh>
    </group>
  ));
}

// Relevia: the breathing orb, small. Its scale is set from the clock every
// frame (never multiplied onto the last frame's value), so it cannot drift.
function MiniOrb({ calm }) {
  const orb = useRef(null);
  const halo = useRef(null);
  useFrame((state) => {
    const k = calm.current;
    const s = (0.5 - 0.5 * Math.cos((state.clock.elapsedTime / 8) * TAU)) * k;
    orb.current.scale.setScalar(1 + s * 0.07);
    halo.current.scale.setScalar(1 + s * 0.3);
    halo.current.material.opacity = 0.55 - s * 0.35;
  });
  return (
    <group>
      <mesh ref={orb}>
        <icosahedronGeometry args={[0.34, 5]} />
        <meshPhysicalMaterial
          color={COLOURS.lavender}
          emissive={COLOURS.mauve}
          emissiveIntensity={0.18}
          roughness={0.22}
          clearcoat={1}
          clearcoatRoughness={0.25}
        />
      </mesh>
      <mesh ref={halo} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.008, 8, 96]} />
        <meshBasicMaterial color={COLOURS.champagne} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

// HEXALOCK: a honeycomb of seven cells, one compartment standing open.
const HEX_R = 0.15;
const HEX_CELLS = [
  [0, 0],
  ...Array.from({ length: 6 }, (_, k) => {
    const a = Math.PI / 6 + (k * Math.PI) / 3;
    const d = 2 * HEX_R * Math.cos(Math.PI / 6) + 0.012;
    return [Math.cos(a) * d, Math.sin(a) * d];
  }),
];
function MiniHex() {
  const geo = useMemo(() => new THREE.CylinderGeometry(HEX_R, HEX_R, 0.24, 6), []);
  useEffect(() => () => geo.dispose(), [geo]);
  return HEX_CELLS.map(([x, y], i) => {
    const open = i === 2;
    const colour = open ? COLOURS.teal : i === 0 ? COLOURS.champagne : COLOURS.sky;
    return (
      <group key={`${x}${y}`} position={[x, y, open ? 0.12 : 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh geometry={geo}>
          <meshStandardMaterial color={colour} roughness={0.35} metalness={0.25} />
        </mesh>
        <Edges geometry={geo} colour="#ffffff" opacity={0.35} />
      </group>
    );
  });
}

const MINI = [MiniSurface, MiniParcels, MiniOrb, MiniHex];

function ProjectNode({ p, index, focused, onFocus }) {
  const ref = useRef(null);
  const model = useRef(null);
  const halo = useRef(null);
  const spin = useRef(0);
  const calm = useRef(1);
  const idle = useIdle();
  const Mini = MINI[index];
  useFrame((state, dt) => {
    const k = idle(dt);
    calm.current = k;
    ref.current.scale.setScalar(damp(ref.current.scale.x, focused ? 1.12 : 0.82, 4, dt));
    // A slow turn while nobody has touched the scene; afterwards each model
    // eases back to face the visitor instead of stopping at a random angle.
    if (k > 0.02) spin.current += dt * 0.35 * k;
    else spin.current = damp(spin.current, Math.round(spin.current / TAU) * TAU, 3, dt);
    model.current.rotation.y = spin.current;
    model.current.position.y = Math.sin(state.clock.elapsedTime * 0.8 + index * 1.7) * 0.05 * k;
    halo.current.material.opacity = damp(halo.current.material.opacity, focused ? 0.7 : 0, 5, dt);
  });
  return (
    <group
      ref={ref}
      position={[RING_R, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onFocus(index);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      {/* An invisible sphere around each model, so the small ones are easy to tap. */}
      <mesh>
        <sphereGeometry args={[0.56, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* Face the camera when this project is at the front of the ring. */}
      <group rotation={[0, Math.PI / 2, 0]}>
        <group ref={model}>
          <Mini calm={calm} />
        </group>
      </group>
      <mesh ref={halo} position={[0, -0.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.46, 0.01, 8, 80]} />
        <meshBasicMaterial color={p.colour} transparent opacity={0} />
      </mesh>
    </group>
  );
}

// Fixed specks of dust around the ring, for depth. Seeded, so every visit is the same.
function Dust() {
  const geo = useMemo(() => {
    const rnd = seeded(4);
    const pts = new Float32Array(160 * 3);
    for (let i = 0; i < 160; i += 1) {
      const r = 2.6 + rnd() * 1.8;
      const t = rnd() * TAU;
      const u = rnd() * 2 - 1;
      const q = Math.sqrt(1 - u * u);
      pts.set([r * q * Math.cos(t), r * u * 0.6, r * q * Math.sin(t)], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pts, 3));
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <points geometry={geo}>
      <pointsMaterial color={COLOURS.champagne} size={0.03} sizeAttenuation transparent opacity={0.5} depthWrite={false} />
    </points>
  );
}

function OrbitDots() {
  const geo = useMemo(() => {
    const n = 72;
    const pts = new Float32Array(n * 3);
    for (let i = 0; i < n; i += 1) pts.set([Math.cos((i / n) * TAU) * RING_R, 0, Math.sin((i / n) * TAU) * RING_R], i * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pts, 3));
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <points geometry={geo}>
      <pointsMaterial color={COLOURS.champagne} size={0.035} sizeAttenuation transparent opacity={0.55} depthWrite={false} />
    </points>
  );
}

function Projects({ onInfo }) {
  const [focus, setFocus] = useState(0);
  useEffect(() => {
    const p = PROJECTS[focus];
    onInfo?.(`${p.title}: ${p.note}. Tap another to bring it forward.`);
  }, [focus, onInfo]);
  useEffect(
    () => () => {
      document.body.style.cursor = "";
    },
    [],
  );
  const ring = useRef(null);
  // Turn the ring so the focused project comes to the front.
  useFrame((_, dt) => {
    const target = -Math.PI / 2 - (focus * Math.PI) / 2;
    let diff = target - ring.current.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    ring.current.rotation.y += diff * Math.min(1, dt * 2.5);
  });
  return (
    <group rotation={[0.38, 0, 0]}>
      <hemisphereLight args={[COLOURS.champagne, "#1a1430", 0.7]} />
      {/* A small warm core lights each model from the inside of the ring. */}
      <pointLight position={[0, 0.2, 0]} intensity={5} distance={5} decay={1.6} color={COLOURS.champagne} />
      <mesh>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshBasicMaterial color={COLOURS.champagne} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshBasicMaterial color={COLOURS.champagne} transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <Dust />
      {/* Starts already turned to the first project, so it does not swing round on load. */}
      <group ref={ring} rotation={[0, -Math.PI / 2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[RING_R, 0.004, 6, 200]} />
          <meshBasicMaterial color={COLOURS.champagne} transparent opacity={0.22} />
        </mesh>
        <OrbitDots />
        {PROJECTS.map((p, i) => (
          <group key={p.title} rotation={[0, (i * Math.PI) / 2, 0]}>
            <ProjectNode p={p} index={i} focused={i === focus} onFocus={setFocus} />
          </group>
        ))}
      </group>
    </group>
  );
}

/* ---------- margin: a linear soft-margin SVM, trained here ---------- */
// Simplified SMO (Platt, 1998) with a linear kernel. Deterministic: the data
// and the choice of the second multiplier both come from seeded generators.
function trainSvm(X, y, C) {
  const n = X.length;
  const K = X.map((a) => X.map((b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const alpha = new Float64Array(n);
  let b = 0;
  const rnd = seeded(42);
  const out = (i) => {
    let s = b;
    for (let k = 0; k < n; k += 1) if (alpha[k] > 0) s += alpha[k] * y[k] * K[k][i];
    return s;
  };
  const tol = 1e-3;
  let passes = 0;
  for (let iter = 0; passes < 10 && iter < 400; iter += 1) {
    let changed = 0;
    for (let i = 0; i < n; i += 1) {
      const Ei = out(i) - y[i];
      if (!((y[i] * Ei < -tol && alpha[i] < C) || (y[i] * Ei > tol && alpha[i] > 0))) continue;
      let j = Math.floor(rnd() * (n - 1));
      if (j >= i) j += 1;
      const Ej = out(j) - y[j];
      const ai = alpha[i];
      const aj = alpha[j];
      const L = y[i] !== y[j] ? Math.max(0, aj - ai) : Math.max(0, ai + aj - C);
      const H = y[i] !== y[j] ? Math.min(C, C + aj - ai) : Math.min(C, ai + aj);
      if (L === H) continue;
      const eta = 2 * K[i][j] - K[i][i] - K[j][j];
      if (eta >= 0) continue;
      alpha[j] = Math.min(H, Math.max(L, aj - (y[j] * (Ei - Ej)) / eta));
      if (Math.abs(alpha[j] - aj) < 1e-6) continue;
      alpha[i] = ai + y[i] * y[j] * (aj - alpha[j]);
      const b1 = b - Ei - y[i] * (alpha[i] - ai) * K[i][i] - y[j] * (alpha[j] - aj) * K[i][j];
      const b2 = b - Ej - y[i] * (alpha[i] - ai) * K[i][j] - y[j] * (alpha[j] - aj) * K[j][j];
      b = alpha[i] > 0 && alpha[i] < C ? b1 : alpha[j] > 0 && alpha[j] < C ? b2 : (b1 + b2) / 2;
      changed += 1;
    }
    passes = changed === 0 ? passes + 1 : 0;
  }
  const w = [0, 0, 0];
  for (let i = 0; i < n; i += 1) for (let d = 0; d < 3; d += 1) w[d] += alpha[i] * y[i] * X[i][d];
  const f = (x) => w[0] * x[0] + w[1] * x[1] + w[2] * x[2] + b;
  const sv = Array.from(alpha, (a) => a > 1e-5);
  return {
    C,
    w,
    b,
    sv,
    nSv: sv.filter(Boolean).length,
    wrong: X.filter((x, i) => y[i] * f(x) < 0).length,
    width: 2 / Math.hypot(...w),
  };
}
const SVM_DATA = (() => {
  const rnd = seeded(2024);
  const X = [];
  const y = [];
  for (let i = 0; i < 64; i += 1) {
    const label = i < 34 ? 1 : -1;
    X.push([label * 0.7 + gaussian(rnd) * 0.5, label * 0.25 + gaussian(rnd) * 0.55, gaussian(rnd) * 0.55]);
    y.push(label);
  }
  return { X, y };
})();
const svmCache = new Map();
const svmFor = (C) => {
  if (!svmCache.has(C)) svmCache.set(C, trainSvm(SVM_DATA.X, SVM_DATA.y, C));
  return svmCache.get(C);
};

function Margin({ onInfo, params = {} }) {
  const model = useMemo(() => svmFor(params.c ?? 1), [params.c]);
  const target = useRef(model);
  target.current = model;
  const cur = useRef({ w: [...model.w], b: model.b });
  const planes = [useRef(null), useRef(null), useRef(null)];
  const points = useRef(null);
  const halos = useRef(null);
  const halo = useRef(new Float32Array(SVM_DATA.X.length));
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const zAxis = useMemo(() => new THREE.Vector3(0, 0, 1), []);
  const facing = useMemo(() => new THREE.Quaternion(), []);
  const nrm = useMemo(() => new THREE.Vector3(), []);
  const colours = useMemo(() => ({ good: new THREE.Color(COLOURS.teal), poor: new THREE.Color(COLOURS.rose) }), []);
  const square = useMemo(() => new THREE.PlaneGeometry(3.4, 3.4), []);
  const outline = useMemo(() => new THREE.EdgesGeometry(square), [square]);
  // A line from each support vector straight to the decision plane: its distance to the boundary.
  const gaps = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SVM_DATA.X.length * 6), 3));
    return g;
  }, []);
  useEffect(
    () => () => {
      square.dispose();
      outline.dispose();
      gaps.dispose();
    },
    [square, outline, gaps],
  );

  useEffect(() => {
    onInfo?.(
      `C = ${model.C} · ${model.nSv} of ${SVM_DATA.X.length} points are support vectors · margin width ${model.width.toFixed(2)} · ${model.wrong} training points misclassified`,
    );
  }, [model, onInfo]);

  useFrame((state, dt) => {
    const c = cur.current;
    const t = target.current;
    // Rings around support vectors turn to face the camera.
    halos.current.parent.getWorldQuaternion(facing).invert().multiply(state.camera.quaternion);
    for (let d = 0; d < 3; d += 1) c.w[d] = damp(c.w[d], t.w[d], 2.4, dt);
    c.b = damp(c.b, t.b, 2.4, dt);
    const norm = Math.hypot(...c.w);
    nrm.set(c.w[0] / norm, c.w[1] / norm, c.w[2] / norm);
    const gp = gaps.attributes.position;
    SVM_DATA.X.forEach((x, i) => {
      const fx = (c.w[0] * x[0] + c.w[1] * x[1] + c.w[2] * x[2] + c.b) / (norm * norm);
      const k = halo.current[i] > 0.5 ? 1 : 0;
      gp.setXYZ(i * 2, x[0], x[1], x[2]);
      gp.setXYZ(i * 2 + 1, x[0] - k * fx * c.w[0], x[1] - k * fx * c.w[1], x[2] - k * fx * c.w[2]);
    });
    gp.needsUpdate = true;
    // Planes w·x + b = k for k = 0 (decision) and ±1 (margins).
    [0, 1, -1].forEach((k, i) => {
      const g = planes[i].current;
      if (!g) return;
      g.quaternion.setFromUnitVectors(zAxis, nrm);
      g.position.copy(nrm).multiplyScalar((k - c.b) / norm);
    });
    SVM_DATA.X.forEach((x, i) => {
      halo.current[i] = damp(halo.current[i], t.sv[i] ? 1 : 0, 4, dt);
      dummy.position.set(x[0], x[1], x[2]);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      points.current.setMatrixAt(i, dummy.matrix);
      points.current.setColorAt(i, SVM_DATA.y[i] > 0 ? colours.good : colours.poor);
      dummy.scale.setScalar(Math.max(halo.current[i], 0.0001));
      dummy.quaternion.copy(facing);
      dummy.updateMatrix();
      dummy.quaternion.identity();
      halos.current.setMatrixAt(i, dummy.matrix);
    });
    points.current.instanceMatrix.needsUpdate = true;
    halos.current.instanceMatrix.needsUpdate = true;
    if (points.current.instanceColor) points.current.instanceColor.needsUpdate = true;
  });

  const plane = (i, colour, opacity) => (
    <group ref={planes[i]}>
      <mesh geometry={square}>
        <meshBasicMaterial color={colour} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <lineSegments geometry={outline}>
        <lineBasicMaterial color={colour} transparent opacity={0.55} />
      </lineSegments>
    </group>
  );

  return (
    <group rotation={[0.25, -0.9, 0]} scale={0.95}>
      {plane(0, COLOURS.lavender, 0.2)}
      <lineSegments geometry={gaps}>
        <lineBasicMaterial color={COLOURS.champagne} transparent opacity={0.7} />
      </lineSegments>
      {plane(1, COLOURS.teal, 0.06)}
      {plane(2, COLOURS.rose, 0.06)}
      <instancedMesh ref={points} args={[undefined, undefined, SVM_DATA.X.length]}>
        <sphereGeometry args={[0.065, 14, 10]} />
        <meshBasicMaterial color="#ffffff" />
      </instancedMesh>
      <instancedMesh ref={halos} args={[undefined, undefined, SVM_DATA.X.length]}>
        <torusGeometry args={[0.12, 0.008, 6, 28]} />
        <meshBasicMaterial color={COLOURS.champagne} transparent opacity={0.8} />
      </instancedMesh>
      <mesh visible={false}>
        <boxGeometry args={[4, 4, 4]} />
      </mesh>
    </group>
  );
}

/* ---------- forest: a random forest trained here ---------- */
// Two interleaved half-moons (synthetic): 160 training points, 80 held out.
const MOONS = (() => {
  const rnd = seeded(77);
  const pts = [];
  for (let i = 0; i < 240; i += 1) {
    const label = i % 2;
    const t = Math.PI * rnd();
    const x = (label ? 1 - Math.cos(t) : Math.cos(t)) + gaussian(rnd) * 0.2;
    const y = (label ? 0.5 - Math.sin(t) : Math.sin(t)) + gaussian(rnd) * 0.2;
    pts.push({ x: (x - 0.5) * 1.3, y: (y - 0.25) * 1.3, label, test: i >= 160 });
  }
  return pts;
})();
const MOON_TRAIN = MOONS.filter((p) => !p.test);
const MOON_TEST = MOONS.filter((p) => p.test);
const GRID = { nx: 34, ny: 22, x0: -2.3, x1: 2.3, y0: -1.5, y1: 1.5 };
const CELLS = (() => {
  const out = [];
  for (let j = 0; j < GRID.ny; j += 1)
    for (let i = 0; i < GRID.nx; i += 1)
      out.push({
        x: GRID.x0 + ((i + 0.5) / GRID.nx) * (GRID.x1 - GRID.x0),
        y: GRID.y0 + ((j + 0.5) / GRID.ny) * (GRID.y1 - GRID.y0),
      });
  return out;
})();

// CART with Gini impurity; each split looks at one randomly chosen feature
// (max_features = 1 of 2), and each tree sees a bootstrap sample.
function growTree(data, depth, maxDepth, rnd) {
  const n = data.length;
  const pos = data.reduce((s, d) => s + d.label, 0);
  const p = pos / n;
  if (depth >= maxDepth || pos === 0 || pos === n || n < 4) return { p };
  const feature = rnd() < 0.5 ? "x" : "y";
  const sorted = [...data].sort((a, b) => a[feature] - b[feature]);
  let best = null;
  let bestG = Infinity;
  let left = 0;
  for (let i = 0; i < n - 1; i += 1) {
    left += sorted[i].label;
    if (sorted[i][feature] === sorted[i + 1][feature]) continue;
    const nl = i + 1;
    const nr = n - nl;
    const pl = left / nl;
    const pr = (pos - left) / nr;
    const g = nl * pl * (1 - pl) + nr * pr * (1 - pr);
    if (g < bestG) {
      bestG = g;
      best = (sorted[i][feature] + sorted[i + 1][feature]) / 2;
    }
  }
  if (best === null) return { p };
  return {
    feature,
    t: best,
    l: growTree(
      sorted.filter((d) => d[feature] <= best),
      depth + 1,
      maxDepth,
      rnd,
    ),
    r: growTree(
      sorted.filter((d) => d[feature] > best),
      depth + 1,
      maxDepth,
      rnd,
    ),
  };
}
function predictTree(node, pt) {
  let n = node;
  while (n.l) n = pt[n.feature] <= n.t ? n.l : n.r;
  return n.p;
}
const MAX_TREES = 100;
const forestCache = new Map();
// Every tree's prediction for every grid cell and point, for one max depth.
function forestVotes(maxDepth) {
  if (forestCache.has(maxDepth)) return forestCache.get(maxDepth);
  const rnd = seeded(1000 + maxDepth);
  const trees = Array.from({ length: MAX_TREES }, () => {
    const sample = MOON_TRAIN.map(() => MOON_TRAIN[Math.floor(rnd() * MOON_TRAIN.length)]);
    return growTree(sample, 0, maxDepth, rnd);
  });
  const votes = (pts) => trees.map((t) => Float32Array.from(pts, (pt) => predictTree(t, pt)));
  const out = { cells: votes(CELLS), train: votes(MOON_TRAIN), test: votes(MOON_TEST) };
  forestCache.set(maxDepth, out);
  return out;
}
const average = (votes, nTrees) => {
  const m = votes[0].length;
  const avg = new Float32Array(m);
  for (let t = 0; t < nTrees; t += 1) for (let i = 0; i < m; i += 1) avg[i] += votes[t][i] / nTrees;
  return avg;
};
const accuracy = (probs, pts) => pts.filter((pt, i) => (probs[i] > 0.5 ? 1 : 0) === pt.label).length / pts.length;

function Forest({ onInfo, params = {} }) {
  const nTrees = params.trees ?? 1;
  const maxDepth = params.depth ?? 8;
  const state = useMemo(() => {
    const v = forestVotes(maxDepth);
    const train = average(v.train, nTrees);
    const test = average(v.test, nTrees);
    return { cells: average(v.cells, nTrees), test, trainAcc: accuracy(train, MOON_TRAIN), testAcc: accuracy(test, MOON_TEST) };
  }, [nTrees, maxDepth]);
  const target = useRef(state);
  target.current = state;
  const tiles = useRef(null);
  const trainPts = useRef(null);
  const testPts = useRef(null);
  const shown = useRef(new Float32Array(CELLS.length).fill(0.5));
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const palette = useMemo(
    () => ({
      rose: new THREE.Color(COLOURS.rose),
      teal: new THREE.Color(COLOURS.teal),
      mid: new THREE.Color("#3a4166"),
      gold: new THREE.Color(COLOURS.gold),
    }),
    [],
  );
  const cw = (GRID.x1 - GRID.x0) / GRID.nx;
  const ch = (GRID.y1 - GRID.y0) / GRID.ny;

  useEffect(() => {
    const pc = (v) => `${(v * 100).toFixed(1)}%`;
    onInfo?.(
      `${nTrees} ${nTrees === 1 ? "tree" : "trees"}, max depth ${maxDepth} · training accuracy ${pc(state.trainAcc)} · test accuracy ${pc(state.testAcc)} on ${MOON_TEST.length} held-out points`,
    );
  }, [state, nTrees, maxDepth, onInfo]);

  // The points never move, so they are placed once.
  useEffect(() => {
    MOON_TRAIN.forEach((pt, i) => {
      dummy.position.set(pt.x, 0.95, pt.y);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      trainPts.current.setMatrixAt(i, dummy.matrix);
      trainPts.current.setColorAt(i, pt.label ? palette.teal : palette.rose);
    });
    trainPts.current.instanceMatrix.needsUpdate = true;
    if (trainPts.current.instanceColor) trainPts.current.instanceColor.needsUpdate = true;
    MOON_TEST.forEach((pt, i) => {
      dummy.position.set(pt.x, 0.95, pt.y);
      dummy.updateMatrix();
      testPts.current.setMatrixAt(i, dummy.matrix);
    });
    testPts.current.instanceMatrix.needsUpdate = true;
  }, [dummy, palette]);

  useFrame((_, dt) => {
    const t = target.current;
    CELLS.forEach((c, i) => {
      shown.current[i] = damp(shown.current[i], t.cells[i], 5, dt);
      const p = shown.current[i];
      // Height is how strongly the trees agree; colour is which way they vote.
      const h = 0.03 + Math.abs(2 * p - 1) * 0.55;
      dummy.position.set(c.x, h / 2, c.y);
      dummy.scale.set(cw * 0.9, h, ch * 0.9);
      dummy.updateMatrix();
      tiles.current.setMatrixAt(i, dummy.matrix);
      if (p >= 0.5) col.copy(palette.mid).lerp(palette.teal, (p - 0.5) * 2);
      else col.copy(palette.mid).lerp(palette.rose, (0.5 - p) * 2);
      tiles.current.setColorAt(i, col);
    });
    tiles.current.instanceMatrix.needsUpdate = true;
    if (tiles.current.instanceColor) tiles.current.instanceColor.needsUpdate = true;
    MOON_TEST.forEach((pt, i) => {
      const right = (t.test[i] > 0.5 ? 1 : 0) === pt.label;
      testPts.current.setColorAt(i, right ? (pt.label ? palette.teal : palette.rose) : palette.gold);
    });
    if (testPts.current.instanceColor) testPts.current.instanceColor.needsUpdate = true;
  });

  return (
    <group rotation={[0.62, -0.35, 0]} position={[0, -0.5, 0]} scale={0.9}>
      <instancedMesh ref={tiles} args={[undefined, undefined, CELLS.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.55} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={trainPts} args={[undefined, undefined, MOON_TRAIN.length]}>
        <sphereGeometry args={[0.045, 10, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </instancedMesh>
      <instancedMesh ref={testPts} args={[undefined, undefined, MOON_TEST.length]}>
        <octahedronGeometry args={[0.085, 0]} />
        <meshBasicMaterial color="#ffffff" />
      </instancedMesh>
    </group>
  );
}

const SHAPES = {
  surface: Surface,
  parcels: Parcels,
  orb: Orb,
  hex: Hex,
  crystals: Crystals,
  routing: Routing,
  projects: Projects,
  margin: Margin,
  forest: Forest,
};
const CAMERA_Z = { surface: 6.2, parcels: 6.4, orb: 5.2, hex: 5.6, crystals: 6.2, routing: 6.4, projects: 6.8, margin: 6.2, forest: 7.4 };

const SPIN = { surface: 0.12, routing: 0.05, margin: 0.1, projects: 0, forest: 0.05 };

export default function Gem({ shape = "crystals", running = true, onInfo, params }) {
  const Shape = SHAPES[shape] ?? Crystals;
  const drag = useRef({ vx: 0, vy: 0, rx: 0, down: false, x: 0, y: 0, touched: false });
  // Moving a slider counts as interacting: hold still so the change can be seen.
  const paramsKey = JSON.stringify(params ?? {});
  const firstParams = useRef(paramsKey);
  useEffect(() => {
    if (paramsKey !== firstParams.current) drag.current.touched = true;
  }, [paramsKey]);
  const onDown = (e) => {
    drag.current.touched = true;
    drag.current.down = true;
    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d.down) return;
    d.vx = (e.clientX - d.x) * 0.008;
    d.vy = (e.clientY - d.y) * 0.006;
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const onUp = () => {
    drag.current.down = false;
  };
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, CAMERA_Z[shape] ?? 6], fov: 45 }}
      frameloop={running ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ touchAction: "pan-y" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <pointLight position={[-4, -2, 3]} intensity={18} color={COLOURS.lavender} />
      <Interaction.Provider value={drag}>
        <Turntable drag={drag} spin={SPIN[shape] ?? 0.2}>
          <Shape onInfo={onInfo} params={params} />
        </Turntable>
      </Interaction.Provider>
    </Canvas>
  );
}
