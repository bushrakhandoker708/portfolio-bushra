// Technical capabilities, each tied to where it is used. No proficiency
// percentages: the evidence column is the claim.
export const capabilities = [
  {
    area: "Machine learning and evaluation",
    items: ["Python", "PyTorch / Hugging Face Transformers", "NumPy", "pandas", "scikit-learn", "Matplotlib"],
    evidence: "Relevia research harness and notebooks; k-means segmentation in Bushal; ML Lab notes",
    href: "/research/relevia",
  },
  {
    area: "Experimental method",
    items: ["Conversation-level data partitioning", "Leakage checks", "Paired bootstrap intervals", "Wilson intervals", "Run manifests and hashing"],
    evidence: "Relevia Experiment 01 and robustness analyses",
    href: "/research/relevia#reproducibility",
  },
  {
    area: "Software engineering",
    items: ["TypeScript / JavaScript", "React", "Next.js", "PostgreSQL / Supabase", "FastAPI", "Testing (Vitest, Playwright, Node test runner)"],
    evidence: "Bushal, Relevia application, this site",
    href: "/projects",
  },
  {
    area: "Systems and security",
    items: ["MATLAB / Simulink / Stateflow", "Finite-state control design", "Row-level security", "Privacy-aware storage design"],
    evidence: "HEXALOCK; Bushal migrations; Relevia storage redesign",
    href: "/projects/hexalock",
  },
  {
    area: "Algorithms",
    items: ["C++", "C", "Data structures and algorithms"],
    evidence: "Earlier competitive-programming practice; algorithm notes in the ML vault",
    href: "/ml-lab",
  },
];
