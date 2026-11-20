// Single source of truth for the identity shown in the hero, About and footer.
// Update this file before each application deadline — no component edits needed.
// Fields left as "" are hidden on the site.

const base = import.meta.env.BASE_URL;

export const profile = {
  name: "Bushra Khandoker",

  // TODO: replace with your university, e.g. "CS undergraduate at <University>"
  headline: "Computer Science undergraduate · Machine Learning",

  // TODO: name your 1–2 concrete research areas, e.g. "efficient vision models and ML for healthcare"
  researchInterests:
    "I am interested in machine learning — building models that learn from data and understanding why they work.",

  // TODO: set the cycle you are applying for, or "" to hide
  status: "Prospective MS/PhD student in AI/ML",

  tagline: "Computer Science · Machine Learning",
  location: "Dhaka, Bangladesh",
  email: "bushrakhandoker2@gmail.com",

  links: {
    cv: "", // RELEASE REQUIREMENT: add a current CV PDF at public/cv.pdf, then set `${base}cv.pdf`
    github: "https://github.com/Bushraabir/",
    medium: "https://medium.com/@bb3708627/",
    scholar: "", // TODO: Google Scholar profile URL
    linkedin: "", // TODO: LinkedIn profile URL
  },

  // About Me paragraphs. TODO: rewrite as: question you care about → what you have done → what you want to do next.
  about: [
    "I'm Bushra, a Computer Science student focused on machine learning. My path into computing came through physics and mathematics — national Physics and Math Olympiads taught me to enjoy hard, open-ended problems, and machine learning is where I now spend that curiosity.",
    "I build in Python, C and C++, and I care about turning models into things people can actually use. Relevia, an app I built to help people manage anxiety and panic attacks, is an example of the kind of human-centred problem I want my research to serve.",
    "Outside the lab I founded and served as Vice President of EmpowerEd, a non-profit expanding educational access in Bangladesh. I am now looking for MS/PhD opportunities where I can work on machine learning research full-time.",
  ],
};
