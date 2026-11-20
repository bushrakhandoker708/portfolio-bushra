import { LazyMotion, MotionConfig, domAnimation, m, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/**
 * framer-motion with the lightweight feature bundle. reducedMotion="user"
 * turns transform animations off for visitors who ask for reduced motion.
 */
export function MotionProvider({ children }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

/**
 * Fades and lifts its content into view once, when scrolled to.
 * Static HTML renders it hidden; index.html has a <noscript> rule that shows
 * [data-reveal] content when JavaScript is off. Never wrap a page's h1/lede
 * in Reveal (it would delay the largest paint).
 */
export function Reveal({ as = "div", delay = 0, y = 28, className, children, ...rest }) {
  const Tag = m[as];
  return (
    <Tag
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.75, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Staggered children: wrap items in <RevealItem>. */
export function RevealGroup({ as = "div", className, children, stagger = 0.08 }) {
  const Tag = m[as];
  return (
    <Tag
      data-reveal=""
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({ as = "div", className, children, ...rest }) {
  const Tag = m[as];
  return (
    <Tag
      data-reveal=""
      className={className}
      variants={{ hidden: { opacity: 0, y: 26 }, shown: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } } }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Card that tilts in 3D towards the mouse, with a soft highlight following the
 * pointer. Mouse only (touch scrolling stays untouched); reduced motion turns
 * the transform off through MotionConfig.
 */
export function Tilt({ as = "div", className = "", children, max = 7, ...rest }) {
  const Tag = m[as];
  const rx = useSpring(0, { stiffness: 180, damping: 18 });
  const ry = useSpring(0, { stiffness: 180, damping: 18 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, rgb(var(--accent) / 0.16), transparent 45%)`;
  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 2 * max);
    rx.set(-(py - 0.5) * 2 * max);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };
  return (
    <Tag
      className={`relative [transform-style:preserve-3d] ${className}`}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      {children}
      <m.span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]" style={{ background: glare }} />
    </Tag>
  );
}

export { m };
