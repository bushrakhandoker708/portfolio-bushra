import { describe, expect, it } from "vitest";
import { architectures } from "../data/architecture";
import { projects } from "../data/projects";

describe("architecture maps", () => {
  it("exist for every project story", () => {
    for (const p of projects) expect(architectures[p.slug], p.slug).toBeDefined();
  });

  for (const [slug, a] of Object.entries(architectures)) {
    describe(slug, () => {
      const ids = new Set(a.nodes.map((n) => n.id));
      const layers = new Set(a.layers.map((l) => l.id));

      it("pins a full commit hash", () => {
        expect(a.commit).toMatch(/^[0-9a-f]{40}$/);
      });

      it("has unique parts, each in a known layer, each with a description", () => {
        expect(ids.size).toBe(a.nodes.length);
        for (const n of a.nodes) {
          expect(layers.has(n.layer), `${n.id} layer`).toBe(true);
          expect(n.detail.length, `${n.id} detail`).toBeGreaterThan(20);
        }
      });

      it("only links parts that exist, once each", () => {
        const seen = new Set();
        for (const e of a.edges) {
          expect(ids.has(e.from), `${e.from}`).toBe(true);
          expect(ids.has(e.to), `${e.to}`).toBe(true);
          expect(e.label).toBeTruthy();
          const key = `${e.from}>${e.to}`;
          expect(seen.has(key), key).toBe(false);
          seen.add(key);
        }
      });

      it("walks paths through parts that exist", () => {
        for (const f of a.flows ?? []) {
          expect(f.steps.length).toBeGreaterThan(1);
          for (const s of f.steps) {
            expect(ids.has(s.node), `${f.id}: ${s.node}`).toBe(true);
            expect(s.text).toBeTruthy();
          }
        }
      });

      it("links files at the pinned commit, never a moving branch", () => {
        for (const n of a.nodes)
          for (const f of n.files ?? []) {
            const path = typeof f === "string" ? f : f.path;
            expect(path.startsWith("/")).toBe(false);
            if (typeof f !== "string" && f.commit) expect(f.commit).toMatch(/^[0-9a-f]{40}$/);
          }
      });
    });
  }
});
