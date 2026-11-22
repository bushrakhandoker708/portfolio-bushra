import { describe, expect, it } from "vitest";
import { architectures } from "../data/architecture";
import { VARIANTS, layoutArch, wrapLabel } from "../components/archLayout";

describe("wrapLabel", () => {
  it("breaks at spaces and keeps every word", () => {
    expect(wrapLabel("Recommendations and analytics APIs", 18)).toEqual(["Recommendations", "and analytics APIs"]);
    expect(wrapLabel("Search API", 18)).toEqual(["Search API"]);
  });
});

for (const [slug, arch] of Object.entries(architectures)) {
  describe(`tree layout: ${slug}`, () => {
    for (const [name, v] of Object.entries(VARIANTS)) {
      const t = layoutArch(arch, v);

      it(`${name}: places every part inside the canvas and inside its own band`, () => {
        for (const n of arch.nodes) {
          const b = t.nodes[n.id];
          expect(b, n.id).toBeDefined();
          expect(b.x).toBeGreaterThanOrEqual(0);
          expect(b.y).toBeGreaterThanOrEqual(0);
          expect(b.x + b.w).toBeLessThanOrEqual(t.width);
          expect(b.y + b.h).toBeLessThanOrEqual(t.height);
          const band = t.bands.find((x) => x.id === n.layer && b.y >= x.y && b.y + b.h <= x.y + x.h);
          expect(band, `${n.id} sits in a ${n.layer} band`).toBeDefined();
        }
      });

      it(`${name}: no two parts overlap`, () => {
        const boxes = Object.entries(t.nodes);
        for (let i = 0; i < boxes.length; i += 1)
          for (let j = i + 1; j < boxes.length; j += 1) {
            const [a, p] = boxes[i];
            const [b, q] = boxes[j];
            const apart = p.x + p.w + v.gap - 0.5 <= q.x || q.x + q.w + v.gap - 0.5 <= p.x || p.y + p.h <= q.y || q.y + q.h <= p.y;
            expect(apart, `${a} and ${b}`).toBe(true);
          }
      });

      it(`${name}: draws every link once, with a finite path`, () => {
        expect(t.links.map((l) => l.key).sort()).toEqual(arch.edges.map((e) => `${e.from}>${e.to}`).sort());
        for (const l of t.links) {
          expect(l.d).toMatch(/^M[\d.-]+,[\d.-]+( [LQ][\d., -]+)+$/);
          expect(l.d).not.toMatch(/NaN|undefined|Infinity/);
          expect([l.from, l.to]).toContain(l.start);
          expect(Number.isFinite(l.mid.x) && Number.isFinite(l.mid.y)).toBe(true);
        }
      });

      it(`${name}: is the same every time, so the prerendered page matches the browser`, () => {
        expect(layoutArch(arch, v)).toEqual(t);
      });
    }

    it("keeps the bands in the order of the layers", () => {
      const t = layoutArch(arch, VARIANTS.wide);
      const order = arch.layers.map((l) => l.id).filter((id) => arch.nodes.some((n) => n.layer === id));
      expect(t.bands.map((b) => b.id)).toEqual(order);
    });
  });
}
