import { useEffect, useId, useMemo, useRef, useState } from "react";
import { repoFile, repoTree } from "../data/site";
import { STATE_SIZE, VARIANTS, layoutArch } from "./archLayout";
import { ScrollRegion } from "./ui";

/*
 * An interactive map of a project's real structure, drawn from its repository
 * as a top-down tree, like a Mermaid `graph TD`: each layer is a subgraph band,
 * and arrows run down from a part to the parts it feeds (archLayout.js).
 *
 *   arch.layers  bands, top to bottom: [{ id, label }]
 *   arch.nodes   [{ id, layer, label, detail, files?, where?, state? }]
 *                files: repository paths (or { path, commit, label }) linked at
 *                arch.commit; where: places inside a file that has no paths of
 *                its own (a Simulink model or a notebook, linked once as
 *                arch.modelFile); state: "placeholder" | "retired" | "external" |
 *                "planned" (arch.stateLabels may rename them for one map)
 *   arch.edges   [{ from, to, label }]
 *   arch.flows   [{ id, label, steps: [{ node, text }] }]
 *
 * Choosing a part lights up what it talks to, names each link and lists the
 * files that hold it. A flow walks one request through the tree a step at a
 * time, with a dot travelling along each link it takes. Four sizes of the
 * same tree are drawn and CSS shows the one that fits the screen, so it reads
 * on a phone without JavaScript deciding anything.
 */

// A map can rename these (arch.stateLabels), e.g. when "outside" means outside a research repository.
const STATE_LABEL = { placeholder: "Placeholder at this commit", retired: "Retired", external: "Outside the app", planned: "Not run yet" };
const stateLabel = (arch, state) => arch.stateLabels?.[state] ?? STATE_LABEL[state];
// Inside a box there is room for a short tag only; the detail panel gives the full wording.
const STATE_TAG = { placeholder: "Placeholder" };
const stateTag = (arch, state) => arch.stateLabels?.[state] ?? STATE_TAG[state] ?? STATE_LABEL[state];
const STEP_MS = 3400;
const SIZES = [
  ["narrow", "block sm:hidden"],
  ["medium", "hidden sm:block lg:hidden"],
  ["wide", "hidden lg:block xl:hidden"],
  ["xwide", "hidden xl:block"],
];

function fileLink(repo, commit, f) {
  const item = typeof f === "string" ? { path: f } : f;
  const ref = item.commit ?? commit;
  // A path ending in "/" is a folder.
  const href = item.path.endsWith("/") ? repoTree(repo, item.path.slice(0, -1), ref) : repoFile(repo, item.path, ref);
  return { href, label: item.label ?? item.path };
}

/** Edge labels for the lit links, nudged down until they stop overlapping. */
function labelBoxes(t, keys, edgeByKey) {
  // Band titles and the parts themselves count as taken space, so a label never covers one.
  const taken = [
    ...t.bands.map((b) => ({ x: b.x + 10 + (b.label.length * 7.4 + 24) / 2, y: b.y + 19, w: b.label.length * 7.4 + 24, h: 22 })),
    ...Object.values(t.nodes).map((b) => ({ x: b.cx, y: b.y + b.h / 2, w: b.w, h: b.h })),
  ];
  const placed = [];
  for (const key of keys) {
    const link = t.links.find((l) => l.key === key);
    const text = edgeByKey[key]?.label;
    if (!link || !text) continue;
    const w = text.length * 6.1 + 14;
    const x = Math.min(Math.max(link.mid.x, w / 2 + 2), t.width - w / 2 - 2);
    const clash = (y) => [...taken, ...placed].some((p) => Math.abs(p.x - x) < (p.w + w) / 2 + 4 && Math.abs(p.y - y) < (p.h + 20) / 2 + 1);
    // Try where the link is, then a little above, then below, further each time.
    const tries = [0, -21, 21, -42, 42, -63, 63].map((d) => link.mid.y + d);
    const y = tries.find((ty) => !clash(ty)) ?? link.mid.y;
    placed.push({ key, text, x, y, w, h: 20 });
  }
  return placed;
}

function Tree({ arch, t, size, uid, lit, focus, selected, live, onChoose, onHover, natural = false }) {
  const edgeByKey = useMemo(() => Object.fromEntries(arch.edges.map((e) => [`${e.from}>${e.to}`, e])), [arch.edges]);
  const id = `${uid}-${size}`;
  const font = VARIANTS[size].font;
  // Labels: every link of the chosen part, or the one a path has just travelled.
  const labelled = live ? [live.key] : lit ? [...lit.edges] : [];
  const labels = labelBoxes(t, labelled, edgeByKey);
  const liveLink = live ? t.links.find((l) => l.key === live.key) : null;

  return (
    <svg
      viewBox={`0 0 ${t.width} ${t.height}`}
      width={natural ? t.width : "100%"}
      style={natural ? undefined : { maxWidth: t.width }}
      className={`block h-auto overflow-visible ${natural ? "" : "mx-auto"}`}
      role="group"
      aria-label="Architecture tree. Each part is a button."
    >
      <defs>
        {["dim", "lit"].map((k) => (
          <marker
            key={k}
            id={`${id}-${k}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            markerUnits="userSpaceOnUse"
            orient="auto-start-reverse"
          >
            <path d="M0,1 L10,5 L0,9 z" className={k === "lit" ? "fill-accent" : "fill-rule"} />
          </marker>
        ))}
      </defs>

      {/* Subgraph bands, one per layer. */}
      {t.bands.map((b) => (
        <rect key={b.id} x={b.x} y={b.y} width={b.w} height={b.h} rx="14" className="arch-band" />
      ))}

      {/* Links, drawn downwards; an arrow marks the part each one reaches. */}
      <g aria-hidden="true">
        {[...t.links.filter((l) => !lit?.edges.has(l.key)), ...t.links.filter((l) => lit?.edges.has(l.key))].map((l) => {
          const on = lit?.edges.has(l.key);
          const reversed = l.start === l.to;
          const marker = `url(#${id}-${on ? "lit" : "dim"})`;
          const isLive = live?.key === l.key;
          return (
            <path
              key={l.key}
              d={l.d}
              markerEnd={reversed ? undefined : marker}
              markerStart={reversed ? marker : undefined}
              className={[
                "arch-edge",
                on ? "is-lit" : lit ? "is-dim" : "",
                isLive ? (live.forward ? "arch-live" : "arch-live arch-live-rev") : "",
              ].join(" ")}
            />
          );
        })}
        {liveLink && (
          <g className="arch-motion" key={`${live.key}-${live.step}`}>
            <circle r="4.5" className="arch-dot">
              <animateMotion
                dur="1.5s"
                repeatCount="indefinite"
                path={liveLink.d}
                keyPoints={live.forward ? "0;1" : "1;0"}
                keyTimes="0;1"
                calcMode="linear"
              />
            </circle>
          </g>
        )}
      </g>

      {/* Band titles sit over the links, on a patch of the band's own colour. */}
      <g aria-hidden="true">
        {t.bands.map((b) => {
          const w = b.label.length * 7.4 + 24;
          return (
            <g key={b.id}>
              <rect x={b.x + 10} y={b.y + 8} width={w} height="22" rx="6" className="arch-band-tag" />
              <text x={b.x + 22} y={b.y + 23} className="arch-band-title font-label">
                {b.label}
              </text>
            </g>
          );
        })}
      </g>

      {/* Parts: real buttons, so they work with a keyboard and a screen reader. */}
      {arch.nodes.map((n) => {
        const b = t.nodes[n.id];
        const on = lit?.nodes.has(n.id);
        const here = focus === n.id;
        const state = n.state ? stateTag(arch, n.state) : null;
        const choose = () => onChoose(n.id);
        return (
          <g
            key={n.id}
            role="button"
            tabIndex={0}
            aria-pressed={selected === n.id}
            transform={`translate(${b.x},${b.y})`}
            className={["arch-node", here ? "is-here" : on ? "is-lit" : lit ? "is-dim" : ""].join(" ")}
            data-state={n.state || undefined}
            onClick={choose}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                choose();
              }
            }}
            onMouseEnter={() => onHover(n.id)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(n.id)}
            onBlur={() => onHover(null)}
          >
            {here && live && <rect width={b.w} height={b.h} rx="10" className="arch-pulse" />}
            <rect width={b.w} height={b.h} rx="10" className="arch-box" />
            <rect x="-4" y="-4" width={b.w + 8} height={b.h + 8} rx="13" className="arch-ring" />
            {/* The visible text is the button's name. The spaces between lines (which
                SVG does not draw) keep wrapped words apart when it is read out. */}
            <text className="arch-text font-sans" textAnchor="middle" fontSize={font}>
              {b.lines.map((line, i) => (
                <tspan key={line} x={b.w / 2} y={10 + font * 0.95 + i * font * 1.3}>
                  {i < b.lines.length - 1 || state ? `${line} ` : line}
                </tspan>
              ))}
            </text>
            {state && (
              <text
                x={b.w / 2}
                y={10 + font * 0.95 + b.lines.length * font * 1.3 + STATE_SIZE * 0.6}
                textAnchor="middle"
                fontSize={STATE_SIZE}
                className="arch-state font-label"
              >
                {state}
              </text>
            )}
          </g>
        );
      })}

      {/* Link labels go on top of everything. */}
      <g aria-hidden="true">
        {labels.map((l) => (
          <g key={l.key}>
            <rect x={l.x - l.w / 2} y={l.y - 10} width={l.w} height="20" rx="10" className="arch-label-bg" />
            <text x={l.x} y={l.y + 4} textAnchor="middle" className="arch-label font-sans">
              {l.text}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function ArchitectureMap({ arch }) {
  const { layers, nodes, edges, flows = [], repo, commit } = arch;
  const uid = useId().replace(/:/g, "");
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [flow, setFlow] = useState(null); // { id, step }
  const [playing, setPlaying] = useState(false);
  const trees = useMemo(() => Object.fromEntries(SIZES.map(([size]) => [size, layoutArch(arch, VARIANTS[size])])), [arch]);
  const phone = useRef(null);
  // The prerendered page carries all four sizes and CSS shows the one that
  // fits. Once the page is running, only that one is kept in the document.
  const [only, setOnly] = useState(null);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const queries = [
      ["xwide", "(min-width: 1280px)"],
      ["wide", "(min-width: 1024px)"],
      ["medium", "(min-width: 640px)"],
    ].map(([size, q]) => [size, window.matchMedia(q)]);
    const pick = () => setOnly(queries.find(([, m]) => m.matches)?.[0] ?? "narrow");
    pick();
    queries.forEach(([, m]) => m.addEventListener?.("change", pick));
    return () => queries.forEach(([, m]) => m.removeEventListener?.("change", pick));
  }, []);

  // On a phone, open the sideways-scrolling tree at its middle, where the top of the tree usually is.
  useEffect(() => {
    const el = phone.current?.querySelector('[role="region"]');
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);

  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);
  const layerOf = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, layers.findIndex((l) => l.id === n.layer)])), [nodes, layers]);
  const edgeKey = (e) => `${e.from}>${e.to}`;

  const activeFlow = flow ? flows.find((f) => f.id === flow.id) : null;
  const step = activeFlow ? activeFlow.steps[flow.step] : null;
  const focus = step ? step.node : (selected ?? hovered);

  // What is lit: during a flow, every part visited so far and the links
  // between consecutive steps; otherwise the chosen part and its neighbours.
  const lit = useMemo(() => {
    if (activeFlow) {
      const seen = activeFlow.steps.slice(0, flow.step + 1).map((s) => s.node);
      const keys = new Set();
      let live = null;
      const between = (a, b) => edges.find((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a));
      for (let i = 1; i < seen.length; i += 1) {
        // Prefer the link from the previous step; if there is none (a step that
        // only checks, like middleware), use the nearest earlier step that links here.
        let hit = null;
        let came = null;
        for (let j = i - 1; j >= 0 && !hit; j -= 1) {
          hit = between(seen[j], seen[i]);
          came = seen[j];
        }
        if (hit) keys.add(edgeKey(hit));
        // The link just travelled carries a moving dash and a dot, heading for this step.
        if (i === seen.length - 1 && hit) live = { key: edgeKey(hit), from: came, step: flow.step };
      }
      return { nodes: new Set(seen), edges: keys, live };
    }
    if (!focus) return null;
    const ns = new Set([focus]);
    const keys = new Set();
    edges.forEach((e) => {
      if (e.from === focus || e.to === focus) {
        ns.add(e.from);
        ns.add(e.to);
        keys.add(edgeKey(e));
      }
    });
    return { nodes: ns, edges: keys, live: null };
  }, [activeFlow, flow, focus, edges]);

  // Walk a flow on its own unless the visitor prefers reduced motion or takes the controls.
  useEffect(() => {
    if (!playing || !activeFlow) return undefined;
    if (flow.step >= activeFlow.steps.length - 1) {
      setPlaying(false);
      return undefined;
    }
    const t = window.setTimeout(() => setFlow((f) => (f ? { ...f, step: f.step + 1 } : f)), STEP_MS);
    return () => window.clearTimeout(t);
  }, [playing, flow, activeFlow]);

  const startFlow = (id) => {
    if (flow?.id === id) {
      setFlow(null);
      setPlaying(false);
      return;
    }
    setSelected(null);
    setFlow({ id, step: 0 });
    setPlaying(!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  };
  const goStep = (delta) => {
    setPlaying(false);
    setFlow((f) => (f ? { ...f, step: Math.min(Math.max(f.step + delta, 0), activeFlow.steps.length - 1) } : f));
  };
  const choose = (id) => {
    setFlow(null);
    setPlaying(false);
    setSelected((s) => (s === id ? null : id));
  };

  const current = focus ? byId[focus] : null;
  const outgoing = current ? edges.filter((e) => e.from === current.id) : [];
  const incoming = current ? edges.filter((e) => e.to === current.id) : [];

  return (
    <div>
      {flows.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="mr-1 font-label text-xs font-semibold uppercase tracking-label text-faint">Follow a path</span>
          {flows.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={flow?.id === f.id}
              onClick={() => startFlow(f.id)}
              className={`btn min-h-[36px] px-4 py-1 text-sm ${flow?.id === f.id ? "btn-primary" : "btn-quiet"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {SIZES.filter(([size]) => !only || size === only).map(([size, show]) => {
        const t = trees[size];
        // Which way the dot travels: along the drawn path when the step it heads for is at the path's end.
        const live = lit?.live ? { ...lit.live, forward: t.links.find((l) => l.key === lit.live.key)?.start === lit.live.from } : null;
        const tree = (
          <Tree
            arch={arch}
            t={t}
            size={size}
            uid={uid}
            lit={lit}
            focus={focus}
            selected={selected}
            live={live}
            onChoose={choose}
            onHover={setHovered}
            natural={size === "narrow"}
          />
        );
        // On a phone the tree keeps readable text and scrolls sideways inside its own box.
        return size === "narrow" ? (
          <div key={size} ref={phone} className={show}>
            <ScrollRegion label="Architecture tree, scrolls sideways" className="-mx-1 px-1 pb-2">
              {tree}
            </ScrollRegion>
            {t.width > 340 && <p className="mt-2 text-xs text-faint">Swipe sideways to see the whole tree.</p>}
          </div>
        ) : (
          <div key={size} className={show}>
            {tree}
          </div>
        );
      })}

      {/* Connections as text, for screen readers and for anyone who prefers a list. */}
      <ul className="sr-only">
        {edges.map((e) => (
          <li key={edgeKey(e)}>
            {byId[e.from].label} to {byId[e.to].label}: {e.label}
          </li>
        ))}
      </ul>

      <div className="mt-10 min-h-[12rem] border-t border-rule/70 pt-8">
        {activeFlow ? (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
            <div>
              <p className="font-label text-xs font-semibold uppercase tracking-label text-accent" aria-live="polite">
                {activeFlow.label} · step {flow.step + 1} of {activeFlow.steps.length}: {byId[step.node].label}
              </p>
              <p className="mt-3 max-w-prose text-lg leading-relaxed text-ink/90">{step.text}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-quiet min-h-[36px] px-4 py-1 text-sm"
                  onClick={() => goStep(-1)}
                  disabled={flow.step === 0}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-quiet min-h-[36px] px-4 py-1 text-sm"
                  onClick={() => goStep(1)}
                  disabled={flow.step === activeFlow.steps.length - 1}
                >
                  Next
                </button>
                {flow.step < activeFlow.steps.length - 1 && (
                  <button type="button" className="btn btn-quiet min-h-[36px] px-4 py-1 text-sm" onClick={() => setPlaying((p) => !p)}>
                    {playing ? "Pause" : "Play"}
                  </button>
                )}
                <button type="button" className="btn btn-quiet min-h-[36px] px-4 py-1 text-sm" onClick={() => startFlow(activeFlow.id)}>
                  Close the path
                </button>
              </div>
            </div>
            <ol className="space-y-1.5 text-sm">
              {activeFlow.steps.map((s, i) => (
                <li key={`${s.node}${i}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setPlaying(false);
                      setFlow({ id: activeFlow.id, step: i });
                    }}
                    className={`flex gap-3 text-left ${i === flow.step ? "text-ink" : i < flow.step ? "text-muted" : "text-faint"}`}
                  >
                    <span className="num w-5 shrink-0 text-accent/80">{i + 1}</span>
                    {byId[s.node].label}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        ) : current ? (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
            <div>
              <p className="font-label text-xs font-semibold uppercase tracking-label text-accent" aria-live="polite">
                {layers[layerOf[current.id]].label} · {current.label}
              </p>
              {current.state && <p className="mt-2 text-sm font-medium text-gold">{stateLabel(arch, current.state)}</p>}
              <p className="mt-3 max-w-prose leading-relaxed text-ink/90">{current.detail}</p>
              {(current.files?.length > 0 || current.where?.length > 0) && (
                <ul className="mt-5 space-y-1 text-sm">
                  {current.files?.map((f) => {
                    const l = fileLink(repo, commit, f);
                    return (
                      <li key={l.href}>
                        <a href={l.href} target="_blank" rel="noopener noreferrer" className="font-code text-[0.8rem]">
                          {l.label}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    );
                  })}
                  {current.where?.map((w) => (
                    <li key={w} className="font-code text-[0.8rem] text-muted">
                      {w}
                    </li>
                  ))}
                  {current.where?.length > 0 && arch.modelFile && (
                    <li className="pt-1">
                      <a href={fileLink(repo, commit, arch.modelFile).href} target="_blank" rel="noopener noreferrer">
                        Open {arch.modelFile}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  )}
                </ul>
              )}
            </div>
            <div className="space-y-5 text-sm">
              {[
                ["Sends to", outgoing, "to"],
                ["Receives from", incoming, "from"],
              ].map(
                ([title, list, end]) =>
                  list.length > 0 && (
                    <div key={title}>
                      <p className="font-label text-xs font-semibold uppercase tracking-label text-faint">{title}</p>
                      <ul className="mt-2 space-y-2">
                        {list.map((e) => (
                          <li key={edgeKey(e)}>
                            <button
                              type="button"
                              onClick={() => choose(e[end])}
                              className="text-left text-ink underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                            >
                              {byId[e[end]].label}
                            </button>
                            <span className="block text-muted">{e.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
              )}
              {outgoing.length === 0 && incoming.length === 0 && (
                <p className="text-muted">Nothing else in the app depends on this part.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="max-w-prose text-muted">
            Choose any part to see what it does, which files hold it and what it talks to
            {flows.length > 0 ? ", or follow a path to watch one request travel through the system" : ""}. Every part and link is taken from
            the repository at commit <span className="num text-ink">{commit.slice(0, 7)}</span>.
          </p>
        )}
      </div>
      {arch.note && <p className="mt-6 max-w-prose text-sm text-faint">{arch.note}</p>}
    </div>
  );
}
