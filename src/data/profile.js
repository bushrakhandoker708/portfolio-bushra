import { GITHUB_USER } from "./site";

// Identity shown across the site. Every statement here must be verifiable
// (see docs/CONTENT_VERIFICATION.md). Empty strings are hidden by the UI.
export const profile = {
  name: "Bushra Khandoker",
  role: "Computer Science Undergraduate",
  focus: "AI/ML Engineering & Independent Research",
  affiliation: "Swansea University",
  location: "Swansea, United Kingdom",
  summary:
    "Exploring reliable language models, reproducible machine learning and resource-efficient AI systems through implementation and experimentation.",
  email: "bushrakhandoker2@gmail.com",
  links: {
    github: `https://github.com/${GITHUB_USER}`,
    linkedin: "", // needs confirmation: add only if actively used
    scholar: "", // no publications yet; add when one exists
    // RELEASE REQUIREMENT: no current CV PDF exists. When one is added at
    // public/cv/Bushra-Khandoker-CV.pdf, set this to "/cv/Bushra-Khandoker-CV.pdf".
    cvPdf: "",
  },
};

// Research interests, in the order Bushra listed them. These are interests,
// not claims of expertise.
export const interests = [
  "Machine learning and deep learning",
  "Natural language processing and large language models",
  "Resource-efficient AI systems",
  "Parameter-efficient fine-tuning",
  "AI safety and reliability",
  "Reproducible experimentation",
  "Mathematics for machine learning",
  "Software engineering and secure computing",
];

// What the evidence shows Bushra is actively investigating right now.
export const currentInvestigations = [
  {
    title: "Prompting versus adaptation for small language models",
    detail:
      "Whether a carefully developed prompt changes supportive-dialogue quality on a pinned 1.5B-parameter model, before testing parameter-efficient adaptation under the same prompt.",
    href: "/research/relevia#experiment",
  },
  {
    title: "Evaluating safety routing honestly",
    detail:
      "Measuring rule-based risk detection on held-out cases frozen before the detector was written, including the misses.",
    href: "/research/relevia#safety",
  },
  {
    title: "What local inference actually costs",
    detail:
      "Separating time-to-first-token, decode rate and response length, and documenting host confounds such as system standby.",
    href: "/research/relevia#latency",
  },
];
