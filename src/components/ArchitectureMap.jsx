import { useEffect, useId, useMemo, useRef, useState } from "react";
import { repoFile, repoTree } from "../data/site";

/*
 * An interactive map of a project's real structure, drawn from its repository.
 *
 *   arch.layers  columns, left to right: [{ id, label }]
 *   arch.nodes   [{ id, layer, label, detail, files?, where?, state? }]
 *                files: repository paths (or { path, commit, label }) linked at
 *                arch.commit; where: places inside a file that has no paths of
 *                its own (a Simulink model, linked once as arch.modelFile);
 *                state: "placeholder" | "retired" | "external"
 *   arch.edges   [{ from, to, label }]
 *   arch.flows   [{ id, label, steps: [{ node, text }] }]
 *
 * Choosing a part lights up what it talks to and lists the files that hold it.
 * A flow walks one request through the system a step at a time. On narrow
 * screens the layers stack and the connections are listed instead of drawn.
 */

const COLS = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5" };
const STATE_LABEL = { placeholder: "Placeholder at this commit", retired: "Retired", external: "Outside the app" };
const STEP_MS = 3400;

function fileLink(repo, commit, f) {
  const item = typeof f === "string" ? { path: f } : f;
  const ref = item.commit ?? commit;
  // A path ending in "/" is a folder.
  const href = item.path.endsWith("/") ? repoTree(repo, item.path.slice(0, -1), ref) : repoFile(repo, item.path, ref);
  return { href, label: item.label ?? item.path };
}

export default function ArchitectureMap({ arch }) {
  const { layers, nodes, edges, flows = [], repo, commit } = arch;
  const uid = useId().replace(/:/g, "");
  const box = useRef(null);
  const refs = useRef({});
  const [paths, setPaths] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [flow, setFlow] = useState(null); // { id, step }
  const [playing, setPlaying] = useState(false);

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
        for (let j = i - 1; j >= 0 && !hit; j -= 1) hit = between(seen[j], seen[i]);
        if (hit) keys.add(edgeKey(hit));
        // The link just travelled carries a moving dash.
        if (i === seen.length - 1) live = hit ? edgeKey(hit) : null;
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

  // Draw the connections from the measured positions of the parts (wide screens only).
  useEffect(() => {
    const el = box.current;
    // Nothing to draw without layout (tests, very old browsers): the list view still works.
    if (!el || typeof window === "undefined" || !window.matchMedia) return undefined;
    const wide = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      if (!wide.matches) {
        setPaths([]);
        return;
      }
      const base = el.getBoundingClientRect();
      const out = [];
      for (const e of edges) {
        const a = refs.current[e.from]?.getBoundingClientRect();
        const b = refs.current[e.to]?.getBoundingClientRect();
        if (!a || !b) continue;
        const ca = layerOf[e.from];
        const cb = layerOf[e.to];
        const y1 = a.top + a.height / 2 - base.top;
        const y2 = b.top + b.height / 2 - base.top;
        let d;
        if (ca === cb) {
          // Same layer: loop out to the right.
          const x1 = a.right - base.left;
          const x2 = b.right - base.left;
          const bulge = 26 + Math.abs(y2 - y1) * 0.18;
          d = `M${x1},${y1} C${x1 + bulge},${y1} ${x2 + bulge},${y2} ${x2 + 4},${y2}`;
        } else {
          const forward = ca < cb;
          const x1 = (forward ? a.right : a.left) - base.left;
          const x2 = (forward ? b.left : b.right) - base.left;
          const m = (x2 - x1) / 2;
          d = `M${x1},${y1} C${x1 + m},${y1} ${x2 - m},${y2} ${x2 + (forward ? -4 : 4)},${y2}`;
        }
        out.push({ key: edgeKey(e), d });
      }
      setPaths(out);
    };
    measure();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    ro?.observe(el);
    wide.addEventListener?.("change", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      ro?.disconnect();
      wide.removeEventListener?.("change", measure);
    };
  }, [edges, layerOf]);

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

      <div ref={box} className="relative">
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block">
          <defs>
            {["dim", "lit"].map((k) => (
              <marker
                key={k}
                id={`${uid}-${k}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0,1 L9,5 L0,9 z" fill={k === "lit" ? "rgb(var(--accent))" : "rgb(var(--rule))"} />
              </marker>
            ))}
          </defs>
          {paths.map((p) => {
            const on = lit?.edges.has(p.key);
            return (
              <path
                key={p.key}
                d={p.d}
                fill="none"
                strokeWidth={on ? 1.6 : 1}
                stroke={on ? "rgb(var(--accent))" : "rgb(var(--rule))"}
                strokeOpacity={lit && !on ? 0.25 : on ? 0.95 : 0.7}
                markerEnd={`url(#${uid}-${on ? "lit" : "dim"})`}
                className={`transition-[stroke-opacity] duration-300 ${lit?.live === p.key ? "arch-live" : ""}`}
              />
            );
          })}
        </svg>

        <div className={`relative grid gap-8 lg:gap-x-20 ${COLS[layers.length] ?? "lg:grid-cols-4"}`}>
          {layers.map((layer) => (
            <div key={layer.id} className="flex flex-col">
              <p className="mb-3 font-label text-xs font-semibold uppercase tracking-label text-accent">{layer.label}</p>
              <ul className="flex flex-wrap gap-2 lg:flex-1 lg:flex-col lg:flex-nowrap lg:justify-center lg:gap-5">
                {nodes
                  .filter((n) => n.layer === layer.id)
                  .map((n) => {
                    const on = lit?.nodes.has(n.id);
                    const here = focus === n.id;
                    return (
                      <li key={n.id}>
                        <button
                          ref={(el) => {
                            refs.current[n.id] = el;
                          }}
                          type="button"
                          aria-pressed={selected === n.id}
                          onClick={() => choose(n.id)}
                          onMouseEnter={() => setHovered(n.id)}
                          onMouseLeave={() => setHovered(null)}
                          className={[
                            "w-full rounded-lg border px-3 py-2.5 text-left text-sm transition duration-300",
                            n.state ? "border-dashed" : "",
                            here
                              ? "border-accent bg-accent/15 text-ink shadow-[0_0_28px_-10px_rgb(var(--accent)/0.9)]"
                              : on
                                ? "border-accent/50 bg-raised text-ink"
                                : "border-white/10 bg-raised/90 text-muted hover:border-accent/40 hover:text-ink",
                            lit && !on ? "opacity-35" : "",
                          ].join(" ")}
                        >
                          <span className="block font-medium leading-snug">{n.label}</span>
                          {n.state && (
                            <span className="mt-1 block font-label text-[0.65rem] font-semibold uppercase tracking-label text-gold">
                              {STATE_LABEL[n.state]}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      </div>

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
              {current.state && <p className="mt-2 text-sm font-medium text-gold">{STATE_LABEL[current.state]}</p>}
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
