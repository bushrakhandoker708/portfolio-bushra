// The Relevia numbers are transcribed by hand from the research repository.
// These tests (1) pin the published values to the source files and (2) recompute
// every derived quantity from the raw counts, so a typo in one place fails here.
import { relevia } from "../data/research";

// Wilson score interval, z = 1.96 (the method used in the source analysis).
function wilson(k, n, z = 1.959964) {
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}

describe("safety routing (results/safety/s2-v1/evaluation.json)", () => {
  const { detectors, urgent, nonUrgent } = relevia.safety;

  it("pins the confusion matrices", () => {
    expect(detectors.map((d) => [d.id, d.tp, d.fn, d.fp, d.tn])).toEqual([
      ["S0", 13, 11, 3, 15],
      ["S1", 9, 15, 0, 18],
      ["S2", 18, 6, 0, 18],
    ]);
  });

  it.each(detectors)("$id counts add up to the evaluation set", (d) => {
    expect(d.tp + d.fn).toBe(urgent);
    expect(d.fp + d.tn).toBe(nonUrgent);
  });

  it.each(detectors)("$id recall, FPR and Wilson intervals match the counts", (d) => {
    expect(d.recall).toBeCloseTo(d.tp / urgent, 3);
    expect(d.fpr).toBeCloseTo(d.fp / nonUrgent, 3);
    const [rlo, rhi] = wilson(d.tp, urgent);
    expect(d.recallLo).toBeCloseTo(rlo, 3);
    expect(d.recallHi).toBeCloseTo(rhi, 3);
    const [flo, fhi] = wilson(d.fp, nonUrgent);
    expect(d.fprLo).toBeCloseTo(flo, 3);
    expect(d.fprHi).toBeCloseTo(fhi, 3);
  });
});

describe("token-budget compliance (robustness-v1)", () => {
  it.each(relevia.compliance.rows)("condition $condition interval matches $hits/$n", (r) => {
    const [lo, hi] = wilson(r.hits, r.n);
    expect(r.lo).toBeCloseTo(lo, 3);
    expect(r.hi).toBeCloseTo(hi, 3);
  });
});

describe("pilot (docs/milestone_3_report.md)", () => {
  it("pins sample size and primary outcome", () => {
    expect(relevia.pilot.n).toBe(8);
    expect(relevia.pilot.responses).toBe(16);
    expect(relevia.pilot.dimensions[0]).toMatchObject({ mean: 0.125, lo: -0.875, hi: 1.125 });
  });

  it("H1 is reported as not supported, because the primary interval includes zero", () => {
    const primary = relevia.pilot.dimensions[0];
    expect(primary.lo).toBeLessThan(0);
    expect(primary.hi).toBeGreaterThan(0);
    expect(relevia.hypotheses[0].status).toMatch(/not supported/i);
  });

  it.each(relevia.pilot.dimensions)("$name: interval contains the estimate", (d) => {
    expect(d.lo).toBeLessThanOrEqual(d.mean);
    expect(d.hi).toBeGreaterThanOrEqual(d.mean);
  });
});

describe("latency (robustness-v1, repeat-v1)", () => {
  it("pins the standby-confound comparison", () => {
    const [all, excl] = relevia.latency.elapsed;
    expect([all.n, all.mean, all.median]).toEqual([60, -18.87, -3.652]);
    expect([excl.n, excl.mean, excl.median]).toEqual([58, -3.243, -3.347]);
    // The headline negative result: excluding standby removes most of the mean advantage.
    expect(Math.abs(excl.mean)).toBeLessThan(Math.abs(all.mean) / 4);
  });

  it("repeat runs keep min ≤ median ≤ max", () => {
    for (const r of relevia.repeat.rows) {
      expect(r.elapsedMin).toBeLessThanOrEqual(r.elapsedMedian);
      expect(r.elapsedMedian).toBeLessThanOrEqual(r.elapsedMax);
    }
  });
});

describe("honesty constraints", () => {
  it("discloses AI assistance, agent ratings and non-clinical status", () => {
    expect(relevia.disclosure).toMatch(/AI coding-assistant/);
    expect(relevia.disclosure).toMatch(/not human judgements/);
    expect(relevia.notClinical).toMatch(/not been clinically evaluated/);
  });

  it("does not claim fine-tuning results", () => {
    expect(relevia.conditions.find((c) => c.id === "C").state).toBe("planned");
    expect(relevia.hypotheses[1].status).toMatch(/no fine-tuning run/i);
  });

  it("every source link points at the public research repository", () => {
    const links = [relevia.pilot.source, relevia.compliance.source, relevia.latency.source, relevia.safety.source, ...relevia.evidence.map((e) => e.href)];
    for (const l of links) expect(l).toMatch(/^https:\/\/github\.com\/bushrakhandoker708\/relevia-research\/blob\/main\//);
  });
});
