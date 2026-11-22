/*
 * Lays an architecture map out as a top-down tree, the way Mermaid's `graph TD`
 * does: each layer is a band (a subgraph), parts that feed each other inside a
 * band sit on successive rows, and every link runs downwards through the gaps
 * between rows, never through a part. Pure and deterministic, so the
 * prerendered page and the browser draw exactly the same picture.
 *
 * The method is the classic layered one (Sugiyama): give every part a row,
 * break long links into invisible waypoints, one per row they cross, reorder
 * each row to cut crossings, then slide everything sideways so each part sits
 * as close as it can to the parts it is linked to. Links are drawn with right
 * angles only: straight down, one turn in a gap, straight down again.
 */

// One set of sizes per screen width; the component draws whichever fits.
export const VARIANTS = {
  xwide: { maxPerRow: 6, nodeW: 184, gap: 28, dummyGap: 15, rowGap: 56, bandTop: 42, bandBottom: 22, bandGap: 18, pad: 22, font: 13.5 },
  wide: { maxPerRow: 5, nodeW: 172, gap: 24, dummyGap: 13, rowGap: 54, bandTop: 42, bandBottom: 22, bandGap: 18, pad: 20, font: 13.5 },
  medium: { maxPerRow: 4, nodeW: 158, gap: 18, dummyGap: 10, rowGap: 52, bandTop: 40, bandBottom: 20, bandGap: 16, pad: 14, font: 13 },
  narrow: { maxPerRow: 2, nodeW: 150, gap: 14, dummyGap: 8, rowGap: 46, bandTop: 38, bandBottom: 18, bandGap: 14, pad: 8, font: 13 },
};

const LINE = 1.3; // label line height, in ems
const CHAR = 0.56; // a generous average glyph width for IBM Plex Sans, in ems
const PAD_X = 12; // space inside a box, left and right
const PAD_Y = 10; // and above and below the text
export const STATE_SIZE = 9.5; // the small capitals naming a part's state

/** Breaks a label into lines of at most `max` characters, at spaces. */
export function wrapLabel(text, max) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (!line) line = word;
    else if (line.length + 1 + word.length <= max) line += ` ${word}`;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// A link passing between two parts takes dummyGap on each side, so keep dummyGap at least half of gap.
const isWaypoint = (id) => id.startsWith("~");

/**
 * Rows inside each layer: a part sits one row below every part in the same
 * layer that links to it. Links that would close a loop are left out of this
 * count (they are still drawn).
 */
function rowsWithinLayers(layers, nodes, edges) {
  const depth = {};
  for (const layer of layers) {
    const ids = nodes.filter((n) => n.layer === layer.id).map((n) => n.id);
    const inLayer = new Set(ids);
    const next = Object.fromEntries(ids.map((id) => [id, edges.filter((e) => e.from === id && inLayer.has(e.to)).map((e) => e.to)]));
    const seen = {}; // 1 while on the current path, 2 when finished
    const keep = [];
    const visit = (u) => {
      seen[u] = 1;
      for (const w of next[u]) {
        if (seen[w] === 1) continue; // a loop
        keep.push([u, w]);
        if (!seen[w]) visit(w);
      }
      seen[u] = 2;
    };
    ids.forEach((id) => {
      depth[id] = 0;
      if (!seen[id]) visit(id);
    });
    for (let k = 0; k < ids.length; k += 1) for (const [a, b] of keep) depth[b] = Math.max(depth[b], depth[a] + 1);
  }
  return depth;
}

/** Turns rows of parts into rows that also hold one waypoint per row a link crosses. */
function withWaypoints(realRows, edges) {
  const rowOf = {};
  realRows.forEach((row, r) => row.forEach((id) => (rowOf[id] = r)));
  const rows = realRows.map((row) => [...row]);
  const chains = [];
  for (const e of edges) {
    const a = rowOf[e.from];
    const b = rowOf[e.to];
    const key = `${e.from}>${e.to}`;
    if (a === b) {
      chains.push({ key, from: e.from, to: e.to, items: [e.from, e.to], flat: true, reversed: false });
      continue;
    }
    const reversed = a > b;
    const top = reversed ? e.to : e.from;
    const bottom = reversed ? e.from : e.to;
    const items = [top];
    for (let r = Math.min(a, b) + 1; r < Math.max(a, b); r += 1) {
      const id = `~${key}~${r}`;
      rows[r].push(id);
      items.push(id);
    }
    items.push(bottom);
    chains.push({ key, from: e.from, to: e.to, items, flat: false, reversed });
  }
  const up = {};
  const down = {};
  for (const c of chains) {
    if (c.flat) continue;
    for (let i = 1; i < c.items.length; i += 1) {
      (down[c.items[i - 1]] ??= []).push(c.items[i]);
      (up[c.items[i]] ??= []).push(c.items[i - 1]);
    }
  }
  return { rows, chains, up, down };
}

/** Reorders every row to reduce crossings: barycentre sweeps, keeping the best result. */
function reduceCrossings(rows, up, down) {
  const frac = {};
  const index = () =>
    rows.forEach((row) =>
      row.forEach((id, i) => {
        frac[id] = (i + 0.5) / row.length;
      }),
    );
  const crossings = () => {
    let total = 0;
    const pos = {};
    rows.forEach((row) => row.forEach((id, i) => (pos[id] = i)));
    for (let r = 0; r < rows.length - 1; r += 1) {
      const links = [];
      for (const a of rows[r]) for (const b of down[a] ?? []) links.push([pos[a], pos[b]]);
      for (let i = 0; i < links.length; i += 1)
        for (let j = i + 1; j < links.length; j += 1) {
          const [a1, b1] = links[i];
          const [a2, b2] = links[j];
          if ((a1 - a2) * (b1 - b2) < 0) total += 1;
        }
    }
    return total;
  };
  const sortRow = (r, nb) => {
    const keyed = rows[r].map((id, i) => {
      const list = nb[id] ?? [];
      const k = list.length ? list.reduce((s, x) => s + frac[x], 0) / list.length : frac[id];
      return { id, k, i };
    });
    keyed.sort((p, q) => p.k - q.k || p.i - q.i);
    rows[r] = keyed.map((x) => x.id);
    rows[r].forEach((id, i) => (frac[id] = (i + 0.5) / rows[r].length));
  };
  index();
  let best = rows.map((row) => [...row]);
  let bestScore = crossings();
  for (let pass = 0; pass < 12 && bestScore > 0; pass += 1) {
    if (pass % 2 === 0) for (let r = 1; r < rows.length; r += 1) sortRow(r, up);
    else for (let r = rows.length - 2; r >= 0; r -= 1) sortRow(r, down);
    const score = crossings();
    if (score < bestScore) {
      bestScore = score;
      best = rows.map((row) => [...row]);
    }
  }
  best.forEach((row, r) => (rows[r] = row));
  return bestScore;
}

/**
 * Lays out `arch` with the sizes in `v` (one of VARIANTS). Returns the canvas
 * size, the bands, each part's box and each link's path, all in SVG units.
 */
export function layoutArch(arch, v) {
  const { layers, nodes, edges } = arch;
  const maxChars = Math.floor((v.nodeW - 2 * PAD_X) / (v.font * CHAR));
  const box = {};
  for (const n of nodes) {
    const lines = wrapLabel(n.label, maxChars);
    const h = 2 * PAD_Y + lines.length * v.font * LINE + (n.state ? STATE_SIZE * 1.7 : 0);
    box[n.id] = { lines, w: v.nodeW, h: Math.round(h) };
  }

  // 1. Rows: layer by layer, and within a layer by how parts feed each other.
  const depth = rowsWithinLayers(layers, nodes, edges);
  const groups = []; // { layer, ids }
  for (const layer of layers) {
    const ids = nodes.filter((n) => n.layer === layer.id).map((n) => n.id);
    if (!ids.length) continue;
    const deepest = Math.max(...ids.map((id) => depth[id]));
    for (let d = 0; d <= deepest; d += 1) {
      const row = ids.filter((id) => depth[id] === d);
      if (row.length) groups.push({ layer: layer.id, ids: row });
    }
  }

  // 2. Order the unwrapped rows, then wrap any row too wide for the screen,
  //    keeping that order, and order again with the final rows.
  const first = withWaypoints(
    groups.map((g) => g.ids),
    edges,
  );
  reduceCrossings(first.rows, first.up, first.down);
  const ordered = first.rows.map((row) => row.filter((id) => !isWaypoint(id)));
  const finalRows = [];
  const rowLayer = [];
  ordered.forEach((row, i) => {
    const parts = Math.ceil(row.length / v.maxPerRow);
    const size = Math.ceil(row.length / parts);
    for (let p = 0; p < parts; p += 1) {
      finalRows.push(row.slice(p * size, (p + 1) * size));
      rowLayer.push(groups[i].layer);
    }
  });
  const { rows, chains, up, down } = withWaypoints(finalRows, edges);
  const crossings = reduceCrossings(rows, up, down);

  // 3. Across: pack each row, then pull every item towards the items it links
  //    to, keeping order and spacing (an isotonic regression per row).
  const width = (id) => (isWaypoint(id) ? 0 : v.nodeW);
  const sep = (a, b) => (width(a) + width(b)) / 2 + (isWaypoint(a) || isWaypoint(b) ? v.dummyGap : v.gap);
  const x = {};
  rows.forEach((row) => {
    let at = 0;
    row.forEach((id, i) => {
      if (i) at += sep(row[i - 1], id);
      x[id] = at;
    });
    row.forEach((id) => (x[id] -= at / 2));
  });
  const place = (row, ideal) => {
    const offset = [0];
    for (let i = 1; i < row.length; i += 1) offset[i] = offset[i - 1] + sep(row[i - 1], row[i]);
    const blocks = [];
    row.forEach((id, i) => {
      blocks.push({ value: ideal(id) - offset[i], weight: isWaypoint(id) ? 4 : 1, start: i, end: i });
      while (blocks.length > 1 && blocks[blocks.length - 2].value > blocks[blocks.length - 1].value) {
        const b = blocks.pop();
        const a = blocks[blocks.length - 1];
        a.value = (a.value * a.weight + b.value * b.weight) / (a.weight + b.weight);
        a.weight += b.weight;
        a.end = b.end;
      }
    });
    for (const b of blocks) for (let i = b.start; i <= b.end; i += 1) x[row[i]] = b.value + offset[i];
  };
  const mean = (list, fallback) => (list?.length ? list.reduce((s, id) => s + x[id], 0) / list.length : fallback);
  for (let pass = 0; pass < 8; pass += 1) {
    if (pass % 2 === 0) for (let r = 1; r < rows.length; r += 1) place(rows[r], (id) => mean(up[id], x[id]));
    else for (let r = rows.length - 2; r >= 0; r -= 1) place(rows[r], (id) => mean(down[id], x[id]));
  }
  for (let r = 0; r < rows.length; r += 1) place(rows[r], (id) => mean([...(up[id] ?? []), ...(down[id] ?? [])], x[id]));
  // Straighten long links: move a link's waypoints into one column wherever
  // the rows have room, preferring the column of either end, so a long link
  // runs straight down instead of stepping aside at every row.
  const at = {};
  rows.forEach((row, r) => row.forEach((id, i) => (at[id] = { r, i })));
  const fits = (id, cx) => {
    const row = rows[at[id].r];
    const i = at[id].i;
    if (i > 0 && cx - x[row[i - 1]] < sep(row[i - 1], id) - 0.01) return false;
    if (i < row.length - 1 && x[row[i + 1]] - cx < sep(id, row[i + 1]) - 0.01) return false;
    return true;
  };
  for (let round = 0; round < 2; round += 1)
    for (const c of chains) {
      const ways = c.items.slice(1, -1);
      if (!ways.length) continue;
      const sorted = ways.map((id) => x[id]).sort((a, b) => a - b);
      const candidates = [x[c.items[0]], x[c.items[c.items.length - 1]], sorted[Math.floor(sorted.length / 2)], ...sorted];
      let best = null;
      for (const cand of candidates) {
        const ok = ways.filter((id) => Math.abs(x[id] - cand) < 0.01 || fits(id, cand)).length;
        if (!best || ok > best.ok) best = { cand, ok };
      }
      for (const id of ways) if (fits(id, best.cand)) x[id] = best.cand;
    }
  let minX = Infinity;
  let maxX = -Infinity;
  rows.flat().forEach((id) => {
    minX = Math.min(minX, x[id] - width(id) / 2);
    maxX = Math.max(maxX, x[id] + width(id) / 2);
  });
  const shift = v.pad + 6 - minX;
  rows.flat().forEach((id) => (x[id] += shift));
  const canvasW = Math.round(maxX - minX + 2 * (v.pad + 6));

  // 4. Down: bands hold their rows; a row is as tall as its tallest part.
  const rowTop = [];
  const rowH = [];
  const bands = [];
  let y = 0;
  rows.forEach((row, r) => {
    const startsBand = r === 0 || rowLayer[r] !== rowLayer[r - 1];
    const endsBand = r === rows.length - 1 || rowLayer[r + 1] !== rowLayer[r];
    if (startsBand) {
      if (r) y += v.bandGap;
      const layer = layers.find((l) => l.id === rowLayer[r]);
      bands.push({ id: layer.id, label: layer.label, x: v.pad / 2, y, w: canvasW - v.pad, h: 0 });
      y += v.bandTop;
    }
    rowTop[r] = y;
    rowH[r] = Math.max(...row.filter((id) => !isWaypoint(id)).map((id) => box[id].h));
    y += rowH[r];
    if (endsBand) {
      y += v.bandBottom;
      const band = bands[bands.length - 1];
      band.h = y - band.y;
    } else y += v.rowGap;
  });
  const canvasH = Math.round(y);

  const placed = {};
  const rowOf = {};
  rows.forEach((row, r) =>
    row.forEach((id) => {
      rowOf[id] = r;
      if (isWaypoint(id)) return;
      const b = box[id];
      placed[id] = { x: x[id] - b.w / 2, y: rowTop[r] + (rowH[r] - b.h) / 2, w: b.w, h: b.h, cx: x[id], lines: b.lines };
    }),
  );

  // 5. Ports: like an org chart, every link leaving a part starts from the
  //    middle of its bottom edge and the links branch off one shared stem.
  //    Links arriving at a part are spread along its top edge in the order of
  //    where they come from, so they never cross there; then any link that can
  //    drop straight down does.
  const ports = {};
  const used = {}; // port positions taken on each side of each part
  const spread = (id, side, list) => {
    const n = list.length;
    const step = Math.min(24, (placed[id].w - 28) / Math.max(n - 1, 1));
    list
      .sort((p, q) => p.toward - q.toward)
      .forEach((p, i) => {
        ports[`${p.key}|${side}`] = placed[id].cx + (i - (n - 1) / 2) * step;
      });
    used[`${id}|${side}`] = list.map((p) => ports[`${p.key}|${side}`]);
  };
  const leaving = {};
  const arriving = {};
  for (const c of chains) {
    if (c.flat) continue;
    const [top, after] = c.items;
    const bottom = c.items[c.items.length - 1];
    const before = c.items[c.items.length - 2];
    (leaving[top] ??= []).push({ key: c.key, toward: x[after] });
    (arriving[bottom] ??= []).push({ key: c.key, toward: x[before] });
  }
  // A link that runs upward into a part arrives at that part's bottom edge:
  // it gets its own point beside the stem, so it is not mistaken for a branch.
  const upward = new Set(chains.filter((c) => c.reversed).map((c) => c.key));
  Object.entries(leaving).forEach(([id, list]) => {
    const ups = list.filter((l) => upward.has(l.key)).sort((p, q) => p.toward - q.toward);
    list.filter((l) => !upward.has(l.key)).forEach((l) => (ports[`${l.key}|out`] = placed[id].cx));
    ups.forEach((l, i) => (ports[`${l.key}|out`] = placed[id].cx + (l.toward < placed[id].cx ? -1 : 1) * (28 + 14 * i)));
  });
  Object.entries(arriving).forEach(([id, list]) => spread(id, "in", list));
  // Move one end of a link to line up with the other, if that point is on the
  // part and not already taken by another link: the link becomes one straight line.
  const align = (id, side, key, want) => {
    const b = placed[id];
    const portKey = `${key}|${side}`;
    const others = used[`${id}|${side}`].filter((px) => px !== ports[portKey]);
    if (want < b.x + 14 || want > b.x + b.w - 14 || others.some((px) => Math.abs(px - want) < 14)) return false;
    used[`${id}|${side}`] = [...others, want];
    ports[portKey] = want;
    return true;
  };
  for (const c of chains) {
    if (c.flat) continue;
    const bottom = c.items[c.items.length - 1];
    const out = ports[`${c.key}|out`];
    const inn = ports[`${c.key}|in`];
    if (c.items.length === 2) {
      if (Math.abs(out - inn) > 0.5) align(bottom, "in", c.key, out);
    } else align(bottom, "in", c.key, x[c.items[c.items.length - 2]]);
  }

  // 6. Paths: straight down, one right-angle turn in the gap between two rows
  //    (with a small rounded corner), straight down again. Each turn in a gap
  //    gets its own height, so two links never share a horizontal stretch.
  const bandStart = {};
  bands.forEach((b) => (bandStart[b.id] = b.y));
  const gapRange = (r) => {
    const lo = rowTop[r] + rowH[r] + 8;
    const nextStartsBand = rowLayer[r + 1] !== rowLayer[r];
    // Between bands, stay above the next band's title.
    const hi = nextStartsBand ? bandStart[rowLayer[r + 1]] + 4 : rowTop[r + 1] - 8;
    return [lo, hi];
  };
  const routes = chains.map((c) => {
    if (c.flat) return null;
    const top = c.items[0];
    const bottom = c.items[c.items.length - 1];
    const pts = [{ x: ports[`${c.key}|out`], y: placed[top].y + placed[top].h, row: rowOf[top] }];
    for (const id of c.items.slice(1, -1)) {
      const r = rowOf[id];
      pts.push({ x: x[id], y: rowTop[r], row: r });
      pts.push({ x: x[id], y: rowTop[r] + rowH[r], row: r, through: true });
    }
    pts.push({ x: ports[`${c.key}|in`], y: placed[bottom].y, row: rowOf[bottom] });
    return { c, pts, turns: {} };
  });
  const jogs = {};
  routes.forEach((route) => {
    if (!route) return;
    route.pts.forEach((q, i) => {
      if (!i || q.through) return;
      const p = route.pts[i - 1];
      if (Math.abs(p.x - q.x) < 0.5) return;
      // The first turn of every link from one part shares that part's branch.
      const group = i === 1 && !route.c.reversed ? `stem:${route.c.items[0]}` : `${route.c.key}:${i}`;
      (jogs[p.row] ??= []).push({ route, i, x1: p.x, x2: q.x, group });
    });
  });
  Object.entries(jogs).forEach(([r, list]) => {
    const [lo, hi] = gapRange(Number(r));
    // One height per branch. Branches that only go left come first, from
    // left to right, then the rest from right to left, so branches that do
    // not overlap do not cross.
    const groups = {};
    for (const j of list) (groups[j.group] ??= []).push(j);
    const keyed = Object.values(groups).map((g) => {
      const from = g[0].x1;
      const left = g.every((j) => j.x2 < j.x1);
      return { g, k: left ? from - 1e6 : -from };
    });
    keyed.sort((a, b) => a.k - b.k);
    const step = Math.min(8, (hi - lo) / Math.max(keyed.length, 1));
    const mid = (lo + hi) / 2;
    keyed.forEach(({ g }, k) => g.forEach((j) => (j.route.turns[j.i] = mid + (k - (keyed.length - 1) / 2) * step)));
  });

  const r1 = (n) => Math.round(n * 10) / 10;
  const roundedPath = (raw) => {
    const pts = [];
    for (const p of raw) {
      const last = pts[pts.length - 1];
      if (!last || Math.abs(last.x - p.x) > 0.01 || Math.abs(last.y - p.y) > 0.01) pts.push(p);
    }
    const keep = pts.filter((p, i) => {
      if (i === 0 || i === pts.length - 1) return true;
      const a = pts[i - 1];
      const b = pts[i + 1];
      const vertical = Math.abs(a.x - p.x) < 0.01 && Math.abs(p.x - b.x) < 0.01;
      const horizontal = Math.abs(a.y - p.y) < 0.01 && Math.abs(p.y - b.y) < 0.01;
      return !vertical && !horizontal;
    });
    let d = `M${r1(keep[0].x)},${r1(keep[0].y)}`;
    for (let i = 1; i < keep.length; i += 1) {
      const b = keep[i];
      if (i === keep.length - 1) {
        d += ` L${r1(b.x)},${r1(b.y)}`;
        break;
      }
      const a = keep[i - 1];
      const c = keep[i + 1];
      const lenA = Math.hypot(b.x - a.x, b.y - a.y);
      const lenC = Math.hypot(c.x - b.x, c.y - b.y);
      const rad = Math.min(8, lenA / 2, lenC / 2);
      const p1 = { x: b.x + ((a.x - b.x) / lenA) * rad, y: b.y + ((a.y - b.y) / lenA) * rad };
      const p2 = { x: b.x + ((c.x - b.x) / lenC) * rad, y: b.y + ((c.y - b.y) / lenC) * rad };
      d += ` L${r1(p1.x)},${r1(p1.y)} Q${r1(b.x)},${r1(b.y)} ${r1(p2.x)},${r1(p2.y)}`;
    }
    return d;
  };

  const links = chains.map((c, n) => {
    if (c.flat) {
      // Two parts on one row: across, between their sides.
      const [a, b] = [placed[c.from], placed[c.to]];
      const ltr = a.cx < b.cx;
      const x1 = ltr ? a.x + a.w : a.x;
      const x2 = ltr ? b.x : b.x + b.w;
      const y1 = a.y + a.h / 2;
      const y2 = b.y + b.h / 2;
      const xm = (x1 + x2) / 2;
      return {
        key: c.key,
        from: c.from,
        to: c.to,
        start: c.from,
        d: roundedPath([
          { x: x1, y: y1 },
          { x: xm, y: y1 },
          { x: xm, y: y2 },
          { x: x2, y: y2 },
        ]),
        mid: { x: xm, y: (y1 + y2) / 2 - 14 },
      };
    }
    const { pts, turns } = routes[n];
    const raw = [pts[0]];
    const spans = []; // per gap crossed: where a label sits nearest each end
    for (let i = 1; i < pts.length; i += 1) {
      const p = pts[i - 1];
      const q = pts[i];
      if (!q.through && turns[i] !== undefined) {
        raw.push({ x: p.x, y: turns[i] }, { x: q.x, y: turns[i] });
        spans.push({ nearTop: { x: p.x, y: (p.y + turns[i]) / 2 }, nearBottom: { x: q.x, y: (turns[i] + q.y) / 2 } });
      } else if (!q.through) {
        const m = { x: p.x, y: (p.y + q.y) / 2 };
        spans.push({ nearTop: m, nearBottom: m });
      }
      raw.push(q);
    }
    // The label sits by the arrow: above the part a link reaches, or below it when the link runs upward.
    const mid = c.reversed ? spans[0].nearTop : spans[spans.length - 1].nearBottom;
    return { key: c.key, from: c.from, to: c.to, start: c.items[0], d: roundedPath(raw), mid };
  });

  return { width: canvasW, height: canvasH, bands, nodes: placed, links, crossings };
}
