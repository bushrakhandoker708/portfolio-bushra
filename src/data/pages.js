import { SITE_URL } from "./site";
import { profile } from "./profile";
import { relevia } from "./research";
import { projects } from "./projects";
import { experiments } from "./lab";

const person = {
  "@type": "Person",
  name: profile.name,
  url: SITE_URL,
  jobTitle: "Computer Science Undergraduate",
  affiliation: { "@type": "CollegeOrUniversity", name: "Swansea University" },
  address: { "@type": "PostalAddress", addressLocality: "Swansea", addressCountry: "GB" },
  sameAs: [profile.links.github, profile.links.linkedin, profile.links.scholar].filter(Boolean),
  knowsAbout: ["Machine learning", "Natural language processing", "Small language models", "Reproducible experimentation", "Software engineering"],
};

/**
 * Route metadata used by both the prerenderer (static <head>) and the client
 * (document title updates on navigation). Every prerendered route must be here.
 */
export const pages = {
  "/": {
    title: "Bushra Khandoker · Computer Science, AI/ML engineering and research",
    description:
      "Computer Science undergraduate at Swansea University working on reliable small language models, reproducible machine learning and resource-efficient AI.",
    jsonLd: { "@context": "https://schema.org", ...person },
  },
  "/research": {
    title: "Research · Bushra Khandoker",
    description: "Independent research on small language models for supportive dialogue: prompting, safety routing and local inference cost.",
  },
  "/research/relevia": {
    title: "Relevia: supportive dialogue with small language models · Bushra Khandoker",
    description: relevia.summary,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: relevia.title,
      abstract: relevia.summary,
      author: { "@type": "Person", name: profile.name, url: SITE_URL },
      creativeWorkStatus: "Ongoing",
      url: `${SITE_URL}/research/relevia`,
      isBasedOn: relevia.repos.research,
    },
  },
  "/ml-lab": {
    title: "ML Lab: experiments and foundations · Bushra Khandoker",
    description:
      "Machine learning experiments on real data, each with its protocol, decisions, results and limitations, built on study notes in linear algebra, calculus, probability and classical machine learning.",
  },
  ...Object.fromEntries(
    experiments.map((e) => [
      `/ml-lab/${e.slug}`,
      {
        title: `${e.short}: ${e.kind.toLowerCase()} · ML Lab · Bushra Khandoker`,
        description: e.summary,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: e.title,
          abstract: e.question,
          about: e.tags,
          dateModified: e.date,
          author: { "@type": "Person", name: profile.name, url: SITE_URL },
          isBasedOn: e.links[0]?.href,
          url: `${SITE_URL}/ml-lab/${e.slug}`,
        },
      },
    ]),
  ),
  "/projects": {
    title: "Projects · Bushra Khandoker",
    description: "Project stories told from the question up: StudyBuddy, Bushal, the Relevia app and HEXALOCK, with the forks, the bugs and what is still open.",
  },
  ...Object.fromEntries(
    projects.map((p) => [
      `/projects/${p.slug}`,
      {
        title: `${p.title} · Bushra Khandoker`,
        description: p.summary,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "SoftwareSourceCode",
          name: p.title,
          description: p.summary,
          codeRepository: p.links[0]?.href,
          author: { "@type": "Person", name: profile.name, url: SITE_URL },
        },
      },
    ]),
  ),
  "/about": {
    title: "About · Bushra Khandoker",
    description: "Education at Swansea University, research interests and selected achievements.",
  },
  "/cv": {
    title: "Curriculum vitae · Bushra Khandoker",
    description: "Academic CV: education, research, projects and technical skills.",
  },
  "/archive": {
    title: "Art & making · Bushra Khandoker",
    description: "Acrylic and watercolour paintings, graphite drawings, architectural models, crafts and Blender renders by Bushra Khandoker.",
  },
};

export const NOT_FOUND = {
  title: "Page not found · Bushra Khandoker",
  description: "The page you were looking for does not exist.",
};

// Old routes from the previous site, permanently redirected.
export const redirects = {
  "/my-works": "/projects",
  "/my-story": "/about",
};

export const metaFor = (path) => pages[path] ?? NOT_FOUND;
