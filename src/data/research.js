import { repoFile, repoTree } from "./site";

const R = "relevia-research";
const src = (path) => repoFile(R, path);

// ---------------------------------------------------------------------------
// Relevia research. Every number below is transcribed from files in
// github.com/bushrakhandoker708/relevia-research (state at 2026-11-08).
// `source` points to the file the value came from. Do not edit a value
// without updating it from the source file; src/tests/research-data.test.js
// pins these values.
// ---------------------------------------------------------------------------

export const relevia = {
  slug: "relevia",
  title: "Relevia: supportive dialogue with small language models",
  status: "Ongoing · preliminary results",
  period: "November 2026 – present",
  summary:
    "An independent investigation into whether adapting a small language model improves supportive dialogue beyond a carefully developed prompt, and what either approach costs in safety and inference performance.",
  repos: {
    research: repoTree(R),
    app: repoTree("relevia"),
    appLive: "https://bushrakhandoker708.github.io/relevia/",
  },
  disclosure:
    "Implementation and documentation in this project were developed with AI coding-assistant support and are subject to my review, as stated in the repository. Ratings described below are coding-agent assessments, not human judgements.",
  notClinical:
    "Relevia is an experimental research prototype. It has not been clinically evaluated and is not a substitute for professional mental-health care or emergency services.",

  motivation: [
    "Relevia began as a web application offering breathing and grounding tools alongside a supportive chat that runs a small language model locally in the browser with WebLLM. Running the model on the user's device reduces the need to send sensitive conversations to an inference provider, but it makes device capability, latency and safety behaviour engineering constraints rather than afterthoughts.",
    "Before comparing models, I had to fix problems that would have made any comparison meaningless: chat history shared between sessions, inconsistent expiry, privacy claims the code did not support, and validation conversations reused as prompting examples.",
  ],

  question:
    "For a fixed small model and device, how do prompting and later parameter-efficient adaptation change the joint distribution of grounded supportive quality, harmful-response outcomes, startup cost and generation latency?",

  hypotheses: [
    {
      id: "H1",
      text: "A developed prompt (B) improves rated relevance over a minimal safe prompt (A) on the same base model.",
      status: "Not supported by the pilot. The interval includes zero.",
    },
    {
      id: "H2",
      text: "An adapter trained on development data (C), evaluated with the same prompt as B, improves quality beyond B without increasing harmful outcomes.",
      status: "Planned. No fine-tuning run has been performed.",
    },
  ],

  conditions: [
    { id: "A", label: "Minimal safe prompt", state: "completed" },
    { id: "B", label: "Developed prompt (development data only)", state: "completed" },
    { id: "C", label: "LoRA adapter + prompt B", state: "planned" },
  ],

  setup: [
    ["Model", "Qwen2.5-1.5B-Instruct, pinned revision 989aa79 (Apache-2.0)"],
    ["Hardware", "CPU, float32, 8 threads (Python harness, not the browser runtime)"],
    ["Decoding", "Greedy; identical seed, tokenizer and inputs for A and B; 110-token budget"],
    ["Controlled variable", "System prompt only; configuration, rubric and runner frozen and hashed before test generation"],
    ["Data", "Synthetic scenarios with agent-authored labels; no real conversations used for generation"],
    ["Partitions", "Six conversation-level partitions; zero group overlap across all 15 partition pairs"],
  ],

  pipeline: [
    { step: "Build partitions", detail: "Conversation-level train / dev / few-shot / validation / test splits", state: "completed" },
    { step: "Leakage checks", detail: "Group and normalised-pair overlap; frozen test hashes", state: "completed" },
    { step: "Freeze configuration", detail: "Model revision, prompts, rubric and runner hashed", state: "completed" },
    { step: "Generate A/B", detail: "Paired outputs with timing and token counts recorded", state: "completed" },
    { step: "Rate outputs", detail: "Agent ratings done; blinded human review prepared, not yet run", state: "partial" },
    { step: "Adapt (LoRA)", detail: "Condition C on the same prompt as B", state: "planned" },
    { step: "Browser benchmark", detail: "WebLLM on real devices", state: "planned" },
  ],

  // Experiment 01 pilot: 8 held-out synthetic scenarios x 2 conditions = 16 responses.
  pilot: {
    n: 8,
    responses: 16,
    raters: "Unblinded coding-agent ratings (frozen draft rubric)",
    source: src("docs/milestone_3_report.md"),
    dimensions: [
      { name: "Relevance (primary)", mean: 0.125, lo: -0.875, hi: 1.125 },
      { name: "Emotional acknowledgement", mean: 0.125, lo: 0.0, hi: 0.375 },
      { name: "Clarity", mean: 0.875, lo: -0.125, hi: 1.875 },
      { name: "Practical helpfulness", mean: -0.125, lo: -0.5, hi: 0.25 },
      { name: "Autonomy", mean: -0.125, lo: -0.75, hi: 0.375 },
    ],
    note: "Mean paired difference B − A with 95% group-bootstrap interval.",
  },

  // Expanded-v1: 60 new synthetic scenarios, 120 responses, execution only (unrated).
  compliance: {
    n: 60,
    source: src("results/analysis/robustness-v1/robustness.json"),
    rows: [
      { condition: "A", hits: 30, n: 60, lo: 0.377, hi: 0.623, medianWords: 81 },
      { condition: "B", hits: 1, n: 60, lo: 0.003, hi: 0.089, medianWords: 57.5 },
    ],
    note: "Responses that exhausted the 110-token budget, with 95% Wilson intervals. Shorter output is not evidence of better quality.",
  },

  // Paired latency, B − A, expanded-v1.
  latency: {
    source: src("results/analysis/robustness-v1/robustness.json"),
    elapsed: [
      { label: "All 60 pairs", unit: "s", median: -3.652, lo: -5.570, hi: -0.384, mean: -18.870, meanLo: -51.706, meanHi: -1.278, n: 60 },
      { label: "Excluding 2 pairs in a Windows standby window", unit: "s", median: -3.347, lo: -5.556, hi: 0.534, mean: -3.243, meanLo: -5.944, meanHi: -0.464, n: 58 },
    ],
    components: [
      { label: "Time to first token", unit: "s", median: 2.415, lo: 2.329, hi: 2.464, n: 58 },
      { label: "Time per output token", unit: "s", median: 0.0504, lo: 0.0378, hi: 0.0588, n: 58 },
      { label: "Output tokens", unit: "tokens", median: -19, lo: -25, hi: -9, n: 58 },
    ],
    note: "Paired differences B − A with bootstrap 95% intervals. Negative elapsed time means B finished sooner.",
  },

  // Repeat-v1: five repeated generations per condition on the original outlier input.
  repeat: {
    source: src("results/performance/repeat-v1/execution_summary.json"),
    rows: [
      { condition: "A", elapsedMedian: 28.33, elapsedMin: 21.74, elapsedMax: 32.46, ttftMedian: 0.86, decodeMedian: 3.95, n: 5 },
      { condition: "B", elapsedMedian: 22.9, elapsedMin: 16.28, elapsedMax: 25.47, ttftMedian: 2.4, decodeMedian: 3.67, n: 5 },
    ],
  },

  // Safety routing on held-out set v3 (frozen before S2 was written).
  safety: {
    source: src("results/safety/s2-v1/evaluation.json"),
    urgent: 24,
    nonUrgent: 18,
    excluded: 3,
    labels: "Agent-authored synthetic labels; routing only; not clinical validation.",
    detectors: [
      { id: "S0", label: "Original rules", tp: 13, fn: 11, fp: 3, tn: 15, recall: 0.542, recallLo: 0.351, recallHi: 0.721, fpr: 0.167, fprLo: 0.058, fprHi: 0.392 },
      { id: "S1", label: "Revised rules", tp: 9, fn: 15, fp: 0, tn: 18, recall: 0.375, recallLo: 0.212, recallHi: 0.573, fpr: 0, fprLo: 0, fprHi: 0.176 },
      { id: "S2", label: "S1 + text normalisation", tp: 18, fn: 6, fp: 0, tn: 18, recall: 0.75, recallLo: 0.551, recallHi: 0.88, fpr: 0, fprLo: 0, fprHi: 0.176 },
    ],
    normalisation: ["shorthand", "typos", "stretched letters", "leetspeak", "invisible characters"],
    misses:
      "S2 still misses indirect statements and phrasings outside its rule set, such as \"killing myself\". A perturbation probe found that S1 missed \"I wanna die\".",
  },

  negativeResults: [
    "Both prompts kept an inadequate-escalation failure on the single immediate-risk pilot scenario.",
    "The developed prompt did not improve the primary relevance rating in the pilot; practical helpfulness and autonomy point estimates were slightly negative.",
    "One pilot generation took about 528 s. The cause is unexplained and the result was kept rather than removed.",
    "The apparent 18.9 s mean speed advantage for B largely disappears once two pairs that overlap a Windows Modern Standby interval are excluded.",
    "B starts more slowly (about 2.4 s longer to first token) and spends more time per token. It finishes sooner mainly because its replies are shorter.",
    "The original archive's instructions mislabelled a CC BY-NC 4.0 dataset as MIT. The 15,000-row archive was quarantined and excluded from all experiments.",
  ],

  reproducibility: [
    "Model revision, prompts, dataset versions, decoding settings and source hashes are recorded with every run.",
    "Partitions are rebuilt deterministically and checked for leakage, with test-file hashes preserved.",
    "Report notebooks are executed (through a documented sequential executor) and committed with their outputs.",
    "15 Python tests cover partitioning, leakage and analysis code (Milestone 3 report). The application reports 18 JavaScript tests.",
  ],

  limitations: [
    "All quality ratings are unblinded coding-agent assessments; no independent human ratings or inter-rater agreement exist yet.",
    "Scenarios are synthetic and small (8 rated, 60 unrated), so results describe these runs, not population rates.",
    "Timings come from a Python float32 CPU harness and are not WebLLM browser measurements.",
    "Safety labels are provisional and agent-authored. The rules are not a validated safety system and miss indirect and non-English risk language.",
    "No parameter-efficient fine-tuning has been run, so no claim about adaptation is made.",
  ],

  next: [
    "Independent blinded human review of an ordinary-context subset, with agreement measured.",
    "Condition C: LoRA adapter on the same base model and the same prompt as B, with unchanged test inputs and separate safety outcomes.",
    "Browser benchmark of WebLLM on real devices, including load and switching costs.",
    "Broader safety coverage (indirect and multilingual risk language) before any participant involvement.",
  ],

  evidence: [
    { label: "Milestone 3 report", href: src("docs/milestone_3_report.md") },
    { label: "Experiment 01 protocol", href: src("docs/experiment_01_protocol.md") },
    { label: "Dataset leakage report", href: src("docs/dataset_leakage_report.md") },
    { label: "Dataset provenance report", href: src("docs/dataset_provenance_report.md") },
    { label: "Safety failure analysis", href: src("docs/safety_failure_analysis.md") },
    { label: "Baseline evaluation notebook", href: src("notebooks/03_baseline_evaluation.ipynb") },
    { label: "Robustness checks notebook", href: src("notebooks/07_robustness_checks.ipynb") },
    { label: "S2 routing notebook", href: src("notebooks/08_s2_routing.ipynb") },
  ],
};

export const researchIndex = [
  {
    slug: "relevia",
    repo: "relevia-research",
    href: "/research/relevia",
    title: relevia.title,
    status: relevia.status,
    period: relevia.period,
    summary: relevia.summary,
    tags: ["Small language models", "Prompting", "Safety evaluation", "Local inference", "Reproducibility"],
  },
];
