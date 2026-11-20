import { experiments, getExperiment, experimentsUsing, neighbours } from "../data/lab";
import { mlLab } from "../data/mlLab";
import { pages } from "../data/pages";

const topicNames = new Set(mlLab.groups.flatMap((g) => g.topics.map((t) => t.name)));
const close = (a, b, tol = 0.00051) => Math.abs(a - b) <= tol;

describe("ML Lab experiments", () => {
  it("has at least one experiment, each with a unique slug, number and route", () => {
    expect(experiments.length).toBeGreaterThan(0);
    expect(new Set(experiments.map((e) => e.slug)).size).toBe(experiments.length);
    expect(new Set(experiments.map((e) => e.number)).size).toBe(experiments.length);
    for (const e of experiments) {
      expect(pages[`/ml-lab/${e.slug}`], e.slug).toBeDefined();
      expect(getExperiment(e.slug)).toBe(e);
    }
  });

  it("states its question, evidence links, limitations and future work", () => {
    for (const e of experiments) {
      expect(e.question.endsWith("?"), e.slug).toBe(true);
      expect(e.links.length, e.slug).toBeGreaterThan(0);
      expect(e.limitations.length, e.slug).toBeGreaterThan(0);
      expect(e.future.length, e.slug).toBeGreaterThan(0);
      expect(e.context.text, e.slug).toBeTruthy();
    }
  });

  it("links only to foundations topics that exist", () => {
    for (const e of experiments) for (const t of e.topics) expect(topicNames.has(t), `${e.slug}: ${t}`).toBe(true);
    expect(experimentsUsing("Model evaluation").length).toBeGreaterThan(0);
  });

  it("orders experiments newest first and links neighbours", () => {
    for (let i = 1; i < experiments.length; i += 1) expect(experiments[i - 1].date >= experiments[i].date).toBe(true);
    const { newer } = neighbours(experiments[0].slug);
    expect(newer).toBeNull();
  });

  it("every fork names a chosen option that exists", () => {
    for (const e of experiments)
      for (const t of e.thinking) {
        expect(t.chose, t.question).toBeGreaterThanOrEqual(0);
        expect(t.chose, t.question).toBeLessThan(t.options.length);
      }
  });
});

describe("wine quality numbers agree with each other", () => {
  const e = getExperiment("wine-quality");
  const d = e.dataset;

  it("dataset counts add up", () => {
    expect(d.scores.reduce((n, s) => n + s.n, 0)).toBe(d.rows);
    expect(d.rows - d.duplicates).toBe(d.kept);
    expect(d.split.train + d.split.test).toBe(d.kept);
  });

  it("confusion counts reproduce the reported test metrics", () => {
    for (const c of e.confusion) {
      const m = e.models.find((x) => x.label.startsWith(c.label));
      const total = c.goodGood + c.goodPoor + c.poorGood + c.poorPoor;
      expect(total, c.label).toBe(d.split.test);
      const recall = c.goodGood / (c.goodGood + c.goodPoor);
      const poorRecall = c.poorPoor / (c.poorPoor + c.poorGood);
      const precision = c.goodGood / (c.goodGood + c.poorGood);
      expect(close((c.goodGood + c.poorPoor) / total, m.accuracy), `${c.label} accuracy`).toBe(true);
      expect(close(recall, m.recall), `${c.label} recall`).toBe(true);
      expect(close(poorRecall, m.poorRecall), `${c.label} poor recall`).toBe(true);
      expect(close(precision, m.precision), `${c.label} precision`).toBe(true);
      expect(close((recall + poorRecall) / 2, m.balanced), `${c.label} balanced accuracy`).toBe(true);
    }
  });

  it("the baseline is the class balance of the test set", () => {
    const base = e.models.find((m) => m.baseline);
    expect(close(base.accuracy, 1 - d.split.poorTest, 0.001)).toBe(true);
    expect(base.poorRecall).toBe(0);
    expect(base.balanced).toBe(0.5);
  });

  it("errors by score cover the whole test set", () => {
    expect(e.errorsByScore.reduce((n, r) => n + r.n, 0)).toBe(d.split.test);
    const svm = e.confusion.find((c) => c.label === "SVM, RBF");
    const wrong = e.errorsByScore.reduce((n, r) => n + Math.round(r.n * r.error), 0);
    expect(wrong).toBe(svm.goodPoor + svm.poorGood);
  });

  it("the headline CV gap matches the CV table to rounding", () => {
    const knn = e.cv.find((r) => r.label === "k-NN");
    const rbf = e.cv.find((r) => r.label === "SVM, RBF");
    expect(Math.abs(rbf.mean - knn.mean - Number(e.cvGap))).toBeLessThanOrEqual(0.0001);
  });
});
