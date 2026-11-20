import { pages, redirects, metaFor, NOT_FOUND } from "../data/pages";
import { projects, otherProjects } from "../data/projects";
import { mlLab } from "../data/mlLab";
import { profile } from "../data/profile";
import { education } from "../data/education";
import { capabilities } from "../data/skills";

describe("route metadata", () => {
  const entries = Object.entries(pages);

  it("every page has a title and a description of sensible length", () => {
    for (const [path, m] of entries) {
      expect(m.title, path).toBeTruthy();
      expect(m.title.length, path).toBeLessThanOrEqual(80);
      expect(m.description.length, path).toBeGreaterThan(50);
      expect(m.description.length, path).toBeLessThanOrEqual(260);
    }
  });

  it("titles and descriptions are unique", () => {
    const titles = entries.map(([, m]) => m.title);
    const descriptions = entries.map(([, m]) => m.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("every project story has a route", () => {
    for (const p of projects) expect(pages[`/projects/${p.slug}`]).toBeDefined();
  });

  it("old routes redirect to pages that exist", () => {
    for (const to of Object.values(redirects)) expect(pages[to]).toBeDefined();
  });

  it("unknown paths fall back to the not-found metadata", () => {
    expect(metaFor("/does-not-exist")).toBe(NOT_FOUND);
  });

  it("does not create the optional routes that have no verified content", () => {
    expect(pages["/writing"]).toBeUndefined();
    expect(pages["/research/diabetes-classification"]).toBeUndefined();
  });
});

describe("profile and education", () => {
  it("uses the current affiliation and location", () => {
    expect(profile.affiliation).toBe("Swansea University");
    expect(profile.location).toBe("Swansea, United Kingdom");
    expect(education[0].period).toBe("Expected graduation June 2027");
  });

  it("uses a working mailto address", () => {
    expect(profile.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]+$/);
  });
});

describe("evidence-based skill claims", () => {
  it("ML Lab topics never claim implementation without code", () => {
    const levels = mlLab.groups.flatMap((g) => g.topics.map((t) => t.level));
    expect(levels.every((l) => ["notes", "started"].includes(l))).toBe(true);
  });

  it("no percentage or star-style mastery ratings anywhere in skills data", () => {
    const text = JSON.stringify({ capabilities, mlLab });
    expect(text).not.toMatch(/\d+\s?%|mastery|expert/i);
  });

  it("every project story links to evidence and states limitations", () => {
    for (const p of [...projects]) {
      expect(p.links.length, p.slug).toBeGreaterThan(0);
      expect(p.limitations.length, p.slug).toBeGreaterThan(0);
    }
    for (const p of otherProjects) expect(p.links.length, p.title).toBeGreaterThan(0);
  });
});
