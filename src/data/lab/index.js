/*
 * ML Lab experiments. Each experiment is one file in ./experiments/ that
 * default-exports an object with the shape of wine-quality.js. Adding a new
 * notebook to the lab means adding one file there: the index page, the route,
 * the page metadata, the prerendered HTML and the foundations map pick it up.
 */
const modules = import.meta.glob("./experiments/*.js", { eager: true });

export const experiments = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => b.date.localeCompare(a.date) || b.number - a.number);

export const getExperiment = (slug) => experiments.find((e) => e.slug === slug);

/** Experiments that use a given foundations topic (by its name in mlLab.js). */
export const experimentsUsing = (topic) => experiments.filter((e) => e.topics.includes(topic));

/** Neighbours in the lab, for "previous / next" links. */
export function neighbours(slug) {
  const i = experiments.findIndex((e) => e.slug === slug);
  return {
    newer: experiments[i - 1] ?? null,
    older: experiments[i + 1] ?? null,
  };
}

/** Every tag used, most common first, for filtering. */
export function allTags() {
  const counts = new Map();
  for (const e of experiments) for (const t of e.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t);
}
