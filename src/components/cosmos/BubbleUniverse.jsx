import { memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, usePlane, useSphere } from "@react-three/cannon";
import * as THREE from "three";
import spaceEnv from "../../assets/img/space-env.webp";

/*
 * The bubble universe from the original portfolio, rebuilt to be light:
 * - same look: physical, transmissive, clear-coated bubbles reflecting a nebula,
 *   falling onto a floor and casting soft shadows;
 * - same play: tap empty space to create a bubble, tap a bubble to recolour it;
 * - one shadow-casting light instead of three, no SSAO / Bloom / depth of field;
 * - quality tier chosen from the GPU and lowered automatically if the frame
 *   rate drops; capped bubble count (oldest recycled); the render loop stops
 *   when off-screen, paused or the tab is hidden.
 */

const START_COLOURS = ["#E1C16C", "#88A6B7", "#B8B5B4", "#4A6B64", "#C6A78C", "#C2B9B0", "#6a4c93", "#c17bdb"];
const TAP_COLOURS = ["#1a1f33", "#3b4a72", "#6a4c93", "#a1b8d1", "#e3e1e1", "#f78c6c", "#ec4d6f", "#c17bdb", "#50516b", "#ffb3e1"];
const GROUND_Y = -3.5;
const pick = (list) => list[Math.floor(Math.random() * list.length)];

let nextId = 0;
const makeBubble = (position, colour = pick(START_COLOURS), radius = 0.5 + Math.random() * 1.2) => ({
  id: nextId++,
  position,
  colour,
  radius,
});

/*
 * Quality tiers. The tier is chosen from the GPU (not the CPU), then adjusted
 * while running: if the frame rate stays low, the scene steps down a tier.
 */
export const TIERS = {
  high: { transmission: 0.8, sheen: 1, seg: [48, 32], dpr: [1, 1.75], shadow: 2048, iterations: 12, max: 40, start: 17, stars: 900 },
  medium: { transmission: 0, sheen: 0, seg: [36, 24], dpr: [1, 1.25], shadow: 1024, iterations: 10, max: 28, start: 12, stars: 700 },
  low: { transmission: 0, sheen: 0, seg: [28, 18], dpr: [1, 1], shadow: 1024, iterations: 8, max: 18, start: 7, stars: 400 },
};
const ORDER = ["high", "medium", "low"];
const SOFTWARE_GPU = /swiftshader|llvmpipe|softpipe|software|basic render/i;
const INTEGRATED_GPU = /intel|uhd|iris|hd graphics|mali|adreno|powervr|videocore|vivante/i;

export function detectQuality(gpu = "") {
  if (typeof window === "undefined") return "low";
  // Manual override for testing on a given device: ?quality=low|medium|high.
  const forced = new URLSearchParams(window.location.search).get("quality");
  if (forced && forced in TIERS) return forced;
  const nav = window.navigator;
  const small = window.innerWidth < 768;
  const lowMemory = nav.deviceMemory !== undefined && nav.deviceMemory < 4;
  const fewCores = nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4;
  const saveData = nav.connection?.saveData === true;
  if (small || lowMemory || fewCores || saveData || SOFTWARE_GPU.test(gpu)) return "low";
  if (INTEGRATED_GPU.test(gpu)) return "medium";
  return "high";
}

/**
 * Watches the real frame rate. After a warm-up (shader compilation), if the
 * average over about 1.5 s is below 45 fps, asks the scene to step down a tier.
 */
function FrameRateGuard({ running, onSlow }) {
  const stats = useRef({ frames: 0, time: 0, warm: 0 });
  useEffect(() => {
    stats.current = { frames: 0, time: 0, warm: 0 };
  }, [running, onSlow]);
  useFrame((_, dt) => {
    if (!running) return;
    const st = stats.current;
    if (st.warm < 45) {
      st.warm += 1;
      return;
    }
    st.frames += 1;
    st.time += Math.min(dt, 0.5);
    if (st.time >= 1.5) {
      const fps = st.frames / st.time;
      stats.current = { frames: 0, time: 0, warm: 0 };
      if (fps < 45) onSlow();
    }
  });
  return null;
}

/** Resizes the shadow map when the tier changes (three.js reads the size only when it creates the map). */
function ShadowSize({ light, size }) {
  useEffect(() => {
    const l = light.current;
    if (!l || l.shadow.mapSize.x === size) return;
    l.shadow.mapSize.set(size, size);
    l.shadow.map?.dispose();
    l.shadow.map = null;
  }, [light, size]);
  return null;
}

/**
 * Nebula used as the reflection map. The blurred reflection maps (PMREM) are
 * built here, once, instead of inside the first frame.
 */
function SpaceEnvironment({ onLoaded }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    let disposed = false;
    let envTarget = null;
    const texture = new THREE.TextureLoader().load(spaceEnv, (t) => {
      if (disposed) return;
      t.mapping = THREE.EquirectangularReflectionMapping;
      t.colorSpace = THREE.SRGBColorSpace;
      const pmrem = new THREE.PMREMGenerator(gl);
      envTarget = pmrem.fromEquirectangular(t);
      pmrem.dispose();
      scene.environment = envTarget.texture;
      onLoaded();
    });
    return () => {
      disposed = true;
      scene.environment = null;
      envTarget?.dispose();
      texture.dispose();
    };
  }, [gl, scene, onLoaded]);
  return null;
}

/**
 * Compiles every shader before the first frame without blocking the page
 * (three.js compileAsync uses the browser's parallel shader compilation).
 * Without this, the first frame compiled them synchronously and froze the
 * page for one to three seconds on integrated GPUs.
 */
function WarmUp({ envReady, onWarm }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    if (!envReady) return undefined;
    let alive = true;
    const run = async () => {
      try {
        if (gl.compileAsync) await gl.compileAsync(scene, camera);
      } catch {
        // Fall back to compiling on the first frame.
      }
      if (alive) onWarm();
    };
    run();
    return () => {
      alive = false;
    };
  }, [envReady, gl, scene, camera, onWarm]);
  return null;
}

/**
 * Sky dome from the original scene: a gradient sphere around the camera, so the
 * nebula shows in the bubbles' reflections rather than as a stretched sky.
 * A sparse star field is added on top.
 */
function Sky({ stars: starCount }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { topColor: { value: new THREE.Color("#0b0a1f") }, bottomColor: { value: new THREE.Color("#2C3A47") } },
        vertexShader: "varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader:
          "varying vec3 vPos; uniform vec3 topColor; uniform vec3 bottomColor; void main(){ float t = clamp((vPos.y + 20.0) / 80.0, 0.0, 1.0); gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0); }",
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );
  const stars = useMemo(() => {
    const n = starCount;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      // Upper hemisphere only, on a shell just inside the dome.
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.92);
      const r = 90;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) - 4;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [starCount]);
  useEffect(() => () => {
    material.dispose();
    stars.dispose();
  }, [material, stars]);
  return (
    <group>
      <mesh material={material}>
        <sphereGeometry args={[100, 48, 24]} />
      </mesh>
      <points geometry={stars}>
        <pointsMaterial color="#fde4cf" size={0.35} sizeAttenuation transparent opacity={0.85} depthWrite={false} fog={false} />
      </points>
    </group>
  );
}

function Floor() {
  const [ref] = usePlane(() => ({
    position: [0, GROUND_Y, 0],
    rotation: [-Math.PI / 2, 0, 0],
    material: { friction: 0.3, restitution: 0.9 },
  }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#2C3E50" roughness={0.8} metalness={0.2} />
    </mesh>
  );
}

const Bubble = memo(function Bubble({ position, colour, radius, tier }) {
  const [ref] = useSphere(() => ({
    mass: 0.5,
    position,
    args: [radius],
    material: { friction: 0.5, restitution: 0.9 },
    linearDamping: 0.1,
    angularDamping: 0.1,
  }));
  const material = useRef();
  const grown = useRef(0);

  // "A bubble is created and expands": scale in over ~0.5 s.
  useFrame((_, dt) => {
    if (grown.current >= 1 || !ref.current) return;
    grown.current = Math.min(1, grown.current + dt * 2.2);
    const s = 1 - Math.pow(1 - grown.current, 3);
    ref.current.scale.setScalar(Math.max(0.001, s));
  });

  const recolour = useCallback((e) => {
    e.stopPropagation();
    material.current?.color.set(pick(TAP_COLOURS));
  }, []);

  const t = TIERS[tier];
  return (
    <mesh ref={ref} castShadow receiveShadow onClick={recolour}>
      <sphereGeometry args={[radius, t.seg[0], t.seg[1]]} />
      <meshPhysicalMaterial
        ref={material}
        color={colour}
        metalness={0.9}
        roughness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.15}
        envMapIntensity={t.transmission ? 0.55 : 0.9}
        transmission={t.transmission}
        ior={1.45}
        thickness={1.2}
        sheen={t.sheen}
        sheenColor="#ffffff"
      />
    </mesh>
  );
});

/** Gentle camera parallax that follows the pointer. */
function Parallax() {
  const { camera, pointer, size } = useThree();
  // Portrait screens: step back and look lower so the bubbles on the floor stay in frame.
  const portrait = size.width < size.height;
  const z = portrait ? 21 : 15;
  const lookY = portrait ? 0.5 : 4;
  useFrame(() => {
    camera.position.x += (pointer.x * 1.6 - camera.position.x) * 0.03;
    camera.position.y += (5 + pointer.y * 0.6 - camera.position.y) * 0.03;
    camera.position.z += (z - camera.position.z) * 0.08;
    camera.lookAt(0, lookY, 0);
  });
  return null;
}

/** Turns a tap position into a ray from the camera through the cursor. */
function CursorRay({ register }) {
  const { camera, gl } = useThree();
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    register((event) => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      // Works before the first frame too (taps queued during warm-up).
      camera.updateMatrixWorld();
      raycaster.setFromCamera(ndc, camera);
      return raycaster.ray.clone();
    });
  }, [camera, gl, register]);
  return null;
}

// A new bubble is born exactly under the cursor: on the plane through the
// middle of the scene, or on the floor when the floor is nearer.
const BIRTH_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const FLOOR_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), -GROUND_Y);
function birthPoint(ray, radius) {
  const onBirth = ray.intersectPlane(BIRTH_PLANE, new THREE.Vector3());
  const onFloor = ray.intersectPlane(FLOOR_PLANE, new THREE.Vector3());
  let point = onBirth;
  if (onFloor && (!point || onFloor.distanceTo(ray.origin) < point.distanceTo(ray.origin))) point = onFloor;
  if (!point) point = ray.at(15, new THREE.Vector3());
  point.y = Math.max(point.y, GROUND_Y + radius + 0.02);
  return [point.x, point.y, point.z];
}

const BubbleUniverse = forwardRef(function BubbleUniverse({ running = true, gpu = "", onReady, onCountChange, onTierChange }, apiRef) {
  const [initialTier] = useState(() => detectQuality(gpu));
  const [tier, setTier] = useState(initialTier);
  const t = TIERS[tier];
  const max = t.max;
  // Starts empty: once the scene is ready the first bubbles rain in, so the
  // still poster (an empty stage) never jumps to a different set of bubbles.
  const [bubbles, setBubbles] = useState([]);
  const [envReady, setEnvReady] = useState(false);
  const [warm, setWarm] = useState(false);
  const onEnvLoaded = useCallback(() => setEnvReady(true), []);
  const onWarm = useCallback(() => {
    setWarm(true);
    onReady?.();
  }, [onReady]);
  const live = running && warm;
  const light = useRef(null);
  const cursorRay = useRef(null);
  const registerRay = useCallback((fn) => {
    cursorRay.current = fn;
  }, []);
  const maxRef = useRef(max);
  maxRef.current = max;

  useEffect(() => onCountChange?.(bubbles.length, max), [bubbles.length, max, onCountChange]);
  useEffect(() => onTierChange?.(tier), [tier, onTierChange]);

  // Too slow on this device: step down a tier and keep only as many bubbles as the new cap allows.
  const stepDown = useCallback(() => {
    setTier((current) => ORDER[Math.min(ORDER.indexOf(current) + 1, ORDER.length - 1)]);
  }, []);
  useEffect(() => {
    setBubbles((list) => (list.length > max ? list.slice(-max) : list));
  }, [max]);

  const spawnAt = useCallback((event) => {
    const ray = cursorRay.current?.(event);
    if (!ray) return;
    const radius = 0.5 + Math.random() * 1.5;
    setBubbles((list) => [...list, makeBubble(birthPoint(ray, radius), pick(TAP_COLOURS), radius)].slice(-maxRef.current));
  }, []);

  // Entrance: the opening bubbles fall in one after another.
  const rained = useRef(false);
  useEffect(() => {
    if (!warm || rained.current) return undefined;
    rained.current = true;
    let added = 0;
    const total = TIERS[initialTier].start;
    const id = window.setInterval(() => {
      added += 1;
      if (added > total) {
        window.clearInterval(id);
        return;
      }
      const at = [(Math.random() - 0.5) * 20, 6 + Math.random() * 6, (Math.random() - 0.5) * 12];
      setBubbles((list) => [...list, makeBubble(at)].slice(-maxRef.current));
    }, 120);
    return () => window.clearInterval(id);
  }, [warm, initialTier]);

  // Taps made while the scene is still warming up (before its first frame, when
  // three.js events are not live yet) are remembered and turned into bubbles
  // as soon as it is ready, so an early tap is never lost.
  const queuedTaps = useRef([]);
  const warmRef = useRef(false);
  useEffect(() => {
    warmRef.current = warm;
    if (!warm) return;
    queuedTaps.current.splice(0).forEach(spawnAt);
  }, [warm, spawnAt]);
  const queueEarlyTap = useCallback((e) => {
    if (!warmRef.current) queuedTaps.current.push({ clientX: e.clientX, clientY: e.clientY });
  }, []);

  useImperativeHandle(apiRef, () => ({ clear: () => setBubbles([]), count: () => bubbles.length, tier: () => tier }), [bubbles.length, tier]);

  return (
    <Canvas
      shadows={{ type: THREE.PCFSoftShadowMap }}
      dpr={t.dpr}
      camera={{ position: [0, 5, 15], fov: 50, near: 0.1, far: 1000 }}
      frameloop={live ? "always" : "never"}
      gl={{ antialias: initialTier !== "low", powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
      onClickCapture={queueEarlyTap}
      onPointerMissed={spawnAt}
    >
      <SpaceEnvironment onLoaded={onEnvLoaded} />
      <WarmUp envReady={envReady} onWarm={onWarm} />
      <fog attach="fog" args={["#232c3c", 28, 95]} />
      <Sky stars={t.stars} />
      <ambientLight intensity={0.3} color="#404040" />
      <hemisphereLight args={["#87CEEB", "#2C3E50", 0.4]} />
      <directionalLight
        ref={light}
        position={[25, 30, 15]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[t.shadow, t.shadow]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={0.1}
        shadow-camera-far={100}
        shadow-bias={-0.0001}
        shadow-radius={4}
      />
      <pointLight position={[10, 8, 10]} intensity={0.6} />
      <pointLight position={[-10, 8, -10]} intensity={0.6} />
      <Physics gravity={[0, -9.8, 0]} iterations={t.iterations} allowSleep isPaused={!live}>
        <Floor />
        {bubbles.map((b) => (
          <Bubble key={b.id} {...b} tier={tier} />
        ))}
      </Physics>
      <Parallax />
      <CursorRay register={registerRay} />
      <ShadowSize light={light} size={t.shadow} />
      <FrameRateGuard running={live && tier !== "low"} onSlow={stepDown} />
    </Canvas>
  );
});

export default BubbleUniverse;
