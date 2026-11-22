import { GITHUB_USER } from "./site";

// Identity shown across the site. Every statement here must be verifiable
// (see docs/CONTENT_VERIFICATION.md). Empty strings are hidden by the UI.
export const profile = {
  name: "Bushra Khandoker",
  role: "Computer Science Undergraduate",
  focus: "Reliable ML · Resource-Efficient AI · Research Engineering",
  affiliation: "Swansea University",
  location: "Swansea, United Kingdom",
  // Bushra's own words (from the earlier About text), then the current work.
  summary:
    "Imagination is never enough for me; I need to see it come alive. Right now that means small language models: what one that fits on your own device can do reliably, what it costs to run, and how to measure that honestly.",
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
  "Machine learning reliability",
  "Probability and uncertainty estimation",
  "Small language models",
  "Parameter-efficient fine-tuning",
  "AI safety and robustness",
  "Efficient inference",
  "Reproducible experimentation",
  "Mathematical foundations of AI",
];

// What the evidence shows Bushra is actively investigating right now.
export const currentInvestigations = [
  {
    title: "When a streamed reply may be shown",
    detail:
      "Checking only finished sentences stopped unsafe text reaching the screen and made every reply wait. A study design compares four release policies for both; it has not been run.",
    href: "/research/relevia#release",
  },
  {
    title: "Evaluating safety routing honestly",
    detail:
      "Measuring rule-based risk detection on test messages frozen before each version was written, including the emergencies an earlier version missed entirely.",
    href: "/research/relevia#emergency",
  },
  {
    title: "What local inference actually costs",
    detail:
      "Separating time to first token, decode rate and reply length, from Python on a CPU to one browser run, and documenting confounds such as system standby and the GPU the browser picks.",
    href: "/research/relevia#cost",
  },
];
