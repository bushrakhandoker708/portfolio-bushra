// The Relevia numbers are transcribed by hand from the research repository.
// These tests (1) pin the published values to the source files and (2) recompute
// every derived quantity from the raw counts, so a typo in one place fails here.
import { relevia, RESEARCH_COMMIT } from "../data/research";

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

describe("safety routing on the v4 set (results/safety/s3-v1/evaluation.json)", () => {
  const v = relevia.safetyV4;
  const by = (id) => v.detectors.find((d) => d.id === id);

  it("pins the first-run confusion matrices", () => {
    expect(v.detectors.map((d) => [d.id, d.tp, d.fn, d.fp, d.tn])).toEqual([
      ["S0", 14, 32, 8, 17],
      ["S1", 10, 36, 2, 23],
      ["S2", 13, 33, 2, 23],
      ["S3", 43, 3, 0, 25],
    ]);
    expect([v.urgent, v.nonUrgent, v.ambiguous, v.emergencies]).toEqual([46, 25, 6, 13]);
  });

  it.each(v.detectors)("$id counts add up and its Wilson intervals match", (d) => {
    expect(d.tp + d.fn).toBe(v.urgent);
    expect(d.fp + d.tn).toBe(v.nonUrgent);
    const [rlo, rhi] = wilson(d.tp, v.urgent);
    expect(d.recallLo).toBeCloseTo(rlo, 3);
    expect(d.recallHi).toBeCloseTo(rhi, 3);
    const [flo, fhi] = wilson(d.fp, v.nonUrgent);
    expect(d.fprLo).toBeCloseTo(flo, 3);
    expect(d.fprHi).toBeCloseTo(fhi, 3);
  });

  it("pins the emergency tier and the paired comparison", () => {
    expect(v.emergencyTier).toEqual([
      { id: "S2", k: 0, n: 13 },
      { id: "S3", k: 11, n: 13 },
    ]);
    expect(v.ambiguousCheckIn).toEqual({ k: 6, n: 6 });
    // The discordant pairs must reconcile with the two detectors' totals.
    expect(by("S2").tp - v.discordant.s2Only + v.discordant.s3Only).toBe(by("S3").tp);
    expect(v.humanText).toMatchObject({ n: 2873, falseUrgent: 1, falseEmergency: 0 });
  });

  it("the probe of S2's misses matches the six it missed on v3", () => {
    const s2v3 = relevia.safety.detectors.find((d) => d.id === "S2");
    expect(relevia.generative.missed).toBe(s2v3.fn);
    expect(relevia.generative).toMatchObject({ inadequate: 4, flagged: 0 });
  });
});

describe("reply guard and browser run", () => {
  it("pins the G2 against G3 waiting times (audit_g3, safety failure taxonomy)", () => {
    const [g2, g3] = relevia.guard.rows;
    expect([g2.version, g2.firstVisible, g2.neverHeld]).toEqual(["G2", 0.23, 0.75]);
    expect([g3.version, g3.firstVisible, g3.p95FirstVisible, g3.medianMaxHold, g3.neverHeld]).toEqual(["G3", 2.55, 5.11, 4.18, 0]);
    for (const r of relevia.guard.rows) expect(r.p95FirstVisible).toBeGreaterThanOrEqual(r.firstVisible);
  });

  it("pins the browser medians (browser-v1-intel/report.json)", () => {
    const [a, b] = relevia.browser.rows;
    expect([a.ttft, a.endToEnd, b.ttft, b.endToEnd]).toEqual([1.0, 7.4, 2.4, 8.8]);
    expect(relevia.browser.startupCached).toBe(4.6);
    expect(relevia.browser.gpu).toMatch(/integrated/);
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

  it("calls same-author safety results development evidence, never validation", () => {
    expect(relevia.safetyV4.labels).toMatch(/same coding agent/);
    expect(relevia.safetyV4.labels).toMatch(/not independent validation/);
    const s3 = relevia.register.find((x) => /^S3 routes/.test(x.claim));
    expect(s3.status).toBe("preliminary");
    expect(s3.note).toMatch(/development only/);
    // The post-hoc 46 of 46 is never presented as a result.
    expect(JSON.stringify(relevia.chapters)).not.toMatch(/46 of 46[^.]*\bis (a )?(result|validated)/);
  });

  it("every source link points at one pinned commit of the public research repository", () => {
    const links = [
      relevia.pilot.source,
      relevia.compliance.source,
      relevia.latency.source,
      relevia.repeat.source,
      relevia.safety.source,
      relevia.safetyV4.source,
      relevia.safetyV4.humanText.source,
      relevia.generative.source,
      relevia.guard.source,
      relevia.browser.source,
      relevia.lora.source,
      ...relevia.directions.map((d) => d.source),
      ...relevia.evidence.map((e) => e.href),
      ...relevia.register.map((x) => x.source),
    ];
    expect(RESEARCH_COMMIT).toMatch(/^[0-9a-f]{40}$/);
    for (const l of links)
      expect(l.startsWith(`https://github.com/bushrakhandoker708/relevia-research/blob/${RESEARCH_COMMIT}/`)).toBe(true);
  });

  it("labels every register entry with a known evidence status, and keeps planned work planned", () => {
    const known = ["completed", "preliminary", "inconclusive", "planned", "unverified"];
    for (const x of relevia.register) expect(known).toContain(x.status);
    const status = (re) => relevia.register.find((x) => re.test(x.claim)).status;
    expect(status(/LoRA/)).toBe("planned");
    expect(status(/human ratings/)).toBe("planned");
    expect(status(/One browser benchmark/)).toBe("preliminary");
    expect(status(/across devices/)).toBe("planned");
    expect(status(/Release-policy study/)).toBe("planned");
    expect(status(/written by someone other/)).toBe("planned");
    expect(status(/relevance/)).toBe("inconclusive");
  });
});

describe("the story", () => {
  it("has uniquely named chapters, each with prose and a line leading on", () => {
    const ids = relevia.chapters.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of relevia.chapters) {
      expect(c.title.length, c.id).toBeGreaterThan(10);
      expect(c.paragraphs.length, c.id).toBeGreaterThan(0);
      expect(c.next, c.id).toBeTruthy();
    }
  });

  it("states that neither next direction has been run", () => {
    for (const d of relevia.directions) expect(d.status).toMatch(/no results|nothing has been run/i);
  });
});
