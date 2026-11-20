import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Small interactive 3D pieces for page headers, one per subject. Each is a
 * self-contained scene with no textures or physics, so it compiles quickly.
 * Loaded lazily by Scene3D only when it scrolls into view.
 *
 *   surface  z = sin x · cos y, coloured by the sign of its Gaussian curvature
 *   parcels  orders orbiting a database; confirming one is idempotent
 *   orb      a breathing sphere (Relevia's breathing tool)
 *   hex      six locker compartments that open and close
 *   crystals wireframe crystals; tap to energise, triple-tap to burst into bubbles
 *   orbits   an atom: physics, where it all started
 *   knot     ideas tied together; tap to re-tie it differently
 *   margin   two classes and a decision boundary; tap to bend it from linear to curved
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

/** Drag to turn, with inertia; tilts gently towards the pointer when idle. */
function Turntable({ drag, spin = 0.2, children }) {
  const outer = useRef(null);
  const inner = useRef(null);
  useFrame((state, dt) => {
    const d = drag.current;
    if (!inner.current || !outer.current) return;
    inner.current.rotation.y += spin * dt + d.vx;
    d.rx = THREE.MathUtils.clamp(d.rx + d.vy, -0.9, 0.9);
    inner.current.rotation.x = d.rx;
    d.vx *= Math.pow(0.04, dt);
    d.vy *= Math.pow(0.04, dt);
    outer.current.rotation.x = damp(outer.current.rotation.x, -state.pointer.y * 0.18, 3, dt);
    outer.current.rotation.z = damp(outer.current.rotation.z, state.pointer.x * 0.1, 3, dt);
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
function Surface() {
  const N = 56;
  const R = Math.PI * 1.15;
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
    r.energy *= Math.pow(0.35, dt);
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
    <group rotation={[-Math.PI / 2.6, 0, 0]} scale={0.62}>
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
  const items = useMemo(() => Array.from({ length: 9 }, (_, i) => ({ angle: (i / 9) * Math.PI * 2, radius: 2.1 + (i % 3) * 0.25, y: ((i % 3) - 1) * 0.45 })), []);
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
        <meshPhysicalMaterial ref={mat} color={palette[0]} emissive={palette[0]} emissiveIntensity={0.25} roughness={0.15} clearcoat={1} transparent opacity={0.92} />
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
  const cells = useMemo(() => Array.from({ length: 6 }, (_, i) => [Math.cos((i * Math.PI) / 3) * 0.9, Math.sin((i * Math.PI) / 3) * 0.9, 0]), []);
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
const CRYSTAL_GEOS = [new THREE.OctahedronGeometry(0.6, 0), new THREE.IcosahedronGeometry(0.55, 0), new THREE.DodecahedronGeometry(0.5, 0), new THREE.TetrahedronGeometry(0.62, 0)];
const CRYSTAL_COLOURS = [COLOURS.lavender, COLOURS.gold, COLOURS.sky, COLOURS.teal, COLOURS.rose];

function Burst({ origin, colour, onDone }) {
  const group = useRef(null);
  const parts = useMemo(
    () => Array.from({ length: 14 }, () => ({ v: new THREE.Vector3((Math.random() - 0.5) * 2.4, Math.random() * 2 + 0.6, (Math.random() - 0.5) * 2.4), s: 0.06 + Math.random() * 0.12 })),
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
  useFrame((state, dt) => {
    const m = ref.current;
    if (!m) return;
    energy.current = damp(energy.current, 0, 1.6, dt);
    grow.current = damp(grow.current, 1, 3, dt);
    m.rotation.x += dt * (0.25 + energy.current * 7);
    m.rotation.y += dt * (0.35 + energy.current * 9);
    m.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.15;
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
        <meshStandardMaterial ref={mat} color={colour} emissive={colour} emissiveIntensity={0.2} transparent opacity={0.28} roughness={0.2} metalness={0.4} />
      </mesh>
      <Edges geometry={geo} colour={colour} />
    </group>
  );
}
function Crystals() {
  const [bursts, setBursts] = useState([]);
  const items = useMemo(
    () => [
      [-2.2, 0.4, 0],
      [-0.8, -0.6, 0.6],
      [0.6, 0.7, -0.3],
      [2.0, -0.3, 0.2],
      [-0.1, 0.1, 1.2],
      [1.3, -1.0, 0.9],
      [-1.6, -1.2, -0.5],
    ].map((position, i) => ({ position, geo: CRYSTAL_GEOS[i % CRYSTAL_GEOS.length], colour: CRYSTAL_COLOURS[i % CRYSTAL_COLOURS.length] })),
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
const TIES = [
  [2, 3],
  [3, 5],
  [2, 5],
  [3, 4],
];
function Knot() {
  const [i, setI] = useState(0);
  const [p, q] = TIES[i];
  const geo = useMemo(() => new THREE.TorusKnotGeometry(1.15, 0.28, 180, 14, p, q), [p, q]);
  useEffect(() => () => geo.dispose(), [geo]);
  const ref = useRef(null);
  const pop = useRef(0);
  useFrame((_, dt) => {
    pop.current = damp(pop.current, 1, 4, dt);
    ref.current.scale.setScalar(0.6 + pop.current * 0.4);
  });
  return (
    <group
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        pop.current = 0;
        setI((n) => (n + 1) % TIES.length);
      }}
    >
      <mesh geometry={geo}>
        <meshPhysicalMaterial color={COLOURS.teal} emissive={COLOURS.sky} emissiveIntensity={0.15} roughness={0.2} clearcoat={1} transparent opacity={0.55} />
      </mesh>
      <mesh geometry={geo}>
        <meshBasicMaterial wireframe color={COLOURS.gold} transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

/* ---------- orbits: an atom ---------- */
function Electron({ radius, speed, phase, colour, boost }) {
  const ref = useRef(null);
  const t = useRef(phase);
  useFrame((_, dt) => {
    t.current += dt * speed * (1 + boost.current * 4);
    ref.current.position.set(Math.cos(t.current) * radius, Math.sin(t.current) * radius, 0);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.09, 16, 12]} />
      <meshBasicMaterial color={colour} />
    </mesh>
  );
}
function Orbits() {
  const boost = useRef(0);
  const nucleus = useRef(null);
  useFrame((_, dt) => {
    boost.current = damp(boost.current, 0, 1.2, dt);
    nucleus.current.scale.setScalar(1 + boost.current * 0.25);
  });
  const rings = [
    { tilt: [0, 0, 0], colour: COLOURS.teal, speed: 1.1, r: 1.7 },
    { tilt: [Math.PI / 3, 0.3, 0], colour: COLOURS.gold, speed: 0.8, r: 1.9 },
    { tilt: [-Math.PI / 3, -0.3, 0], colour: COLOURS.rose, speed: 1.4, r: 1.6 },
  ];
  return (
    <group>
      <mesh
        ref={nucleus}
        onClick={(e) => {
          e.stopPropagation();
          boost.current = 1;
        }}
      >
        <icosahedronGeometry args={[0.45, 3]} />
        <meshPhysicalMaterial color={COLOURS.lavender} emissive={COLOURS.mauve} emissiveIntensity={0.5} roughness={0.2} clearcoat={1} />
      </mesh>
      {rings.map((ring) => (
        <group key={ring.colour} rotation={ring.tilt}>
          <mesh>
            <torusGeometry args={[ring.r, 0.01, 6, 120]} />
            <meshBasicMaterial color={ring.colour} transparent opacity={0.55} />
          </mesh>
          <Electron radius={ring.r} speed={ring.speed} phase={ring.r} colour={ring.colour} boost={boost} />
        </group>
      ))}
    </group>
  );
}

/* ---------- margin: two classes and a boundary that bends ---------- */
// A deterministic generator so the point cloud is the same on every visit.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const wave = (y, z, bend) => bend * 0.6 * Math.sin(y * 1.8) * Math.cos(z * 0.7);
const MARGIN_POINTS = (() => {
  const r = seeded(11);
  const pts = [];
  for (let i = 0; i < 120; i += 1) {
    const y = (r() * 2 - 1) * 1.2;
    const z = (r() * 2 - 1) * 0.95;
    const good = r() < 0.6;
    // Classes follow a curved boundary, with enough noise that they overlap.
    const x = wave(y, z, 1) + (good ? 1 : -1) * (0.08 + r() * 0.95) + (r() - 0.5) * 0.45;
    pts.push({ x, y, z, good });
  }
  return pts;
})();
const MARGIN = 0.22;

function Margin() {
  const target = useRef(0);
  const bend = useRef(-1);
  const points = useRef(null);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(2.6, 2.1, 30, 22);
    g.userData.uv = Float32Array.from(g.attributes.position.array);
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colours = useMemo(
    () => ({ good: new THREE.Color(COLOURS.teal), poor: new THREE.Color(COLOURS.rose), wrong: new THREE.Color(COLOURS.gold) }),
    [],
  );

  useFrame((_, dt) => {
    const prev = bend.current;
    const b = prev < 0 ? 0 : damp(prev, target.current, 2.6, dt);
    if (prev >= 0 && Math.abs(b - prev) < 1e-4) return;
    bend.current = b;
    // Boundary: the plane's (u, v) becomes (y, z) and x follows the wave.
    const pos = geo.attributes.position;
    const uv = geo.userData.uv;
    for (let i = 0; i < pos.count; i += 1) {
      const u = uv[i * 3];
      const v = uv[i * 3 + 1];
      pos.setXYZ(i, wave(u, v, b), u, v);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    // Points: wrong side of the boundary turns gold; inside the margin grows (a support vector).
    const inst = points.current;
    MARGIN_POINTS.forEach((p, i) => {
      const d = p.x - wave(p.y, p.z, b);
      const right = (d > 0) === p.good;
      const inside = Math.abs(d) < MARGIN;
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(!right || inside ? 1.55 : 1);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
      inst.setColorAt(i, right ? (p.good ? colours.good : colours.poor) : colours.wrong);
    });
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  });

  return (
    <group
      rotation={[0.2, -1.1, 0]}
      onClick={(e) => {
        e.stopPropagation();
        target.current = target.current > 0.5 ? 0 : 1;
      }}
    >
      <mesh geometry={geo}>
        <meshStandardMaterial color={COLOURS.lavender} emissive={COLOURS.mauve} emissiveIntensity={0.25} side={THREE.DoubleSide} transparent opacity={0.3} depthWrite={false} roughness={0.4} />
      </mesh>
      <mesh geometry={geo}>
        <meshBasicMaterial wireframe color={COLOURS.champagne} transparent opacity={0.16} />
      </mesh>
      <instancedMesh ref={points} args={[undefined, undefined, MARGIN_POINTS.length]}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <meshBasicMaterial color="#ffffff" />
      </instancedMesh>
    </group>
  );
}

const SHAPES = { surface: Surface, parcels: Parcels, orb: Orb, hex: Hex, crystals: Crystals, orbits: Orbits, knot: Knot, margin: Margin };
const CAMERA_Z = { surface: 6.2, parcels: 6.4, orb: 5.2, hex: 5.6, crystals: 6.2, orbits: 5.6, knot: 6, margin: 5.4 };

export default function Gem({ shape = "crystals", running = true }) {
  const Shape = SHAPES[shape] ?? Crystals;
  const drag = useRef({ vx: 0, vy: 0, rx: 0, down: false, x: 0, y: 0 });
  const onDown = (e) => {
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
      <Turntable drag={drag} spin={shape === "surface" ? 0.12 : 0.2}>
        <Shape />
      </Turntable>
    </Canvas>
  );
}
