import { repoFile, repoTree } from "./site";

const R = "relevia-research";
// Every evidence link points at this exact commit of relevia-research, so a
// number on the site always resolves to the file it was copied from, even
// after the repository moves on. Update it together with the values.
export const RESEARCH_COMMIT = "286bd420d3d5505be9fd20efef37937785e90d75";
const src = (path) => repoFile(R, path, RESEARCH_COMMIT);

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
  // A paragraph a prospective supervisor can read in under a minute.
  abstract:
    "Small language models can run on a user's own device, which keeps sensitive conversations away from inference servers but makes quality, safety and cost hard engineering constraints. I am testing whether a developed prompt, and later a LoRA adapter trained under the same prompt, changes supportive-dialogue quality on a pinned Qwen2.5-1.5B-Instruct model, and what each costs in harmful outcomes and latency. So far I have built the controls (conversation-level partitions with leakage checks, frozen and hashed configurations, paired bootstrap analysis) and run one pilot. On 8 held-out synthetic scenarios the developed prompt did not establish a relevance gain (+0.125, 95% interval −0.875 to +1.125, unblinded agent ratings). A rule-based safety router detected 18 of 24 held-out urgent messages with no false alarms on 18 ordinary ones, and still misses indirect phrasing. Blinded human ratings, the adapter condition and in-browser measurements have not been run.",
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
    [
      "Provenance",
      "A 15,000-row historical archive was quarantined after its licence was found mislabelled (CC BY-NC 4.0 recorded as MIT); no experiment uses it",
    ],
    ["Compute", "One laptop CPU; no GPU training run or memory budget measured yet, which is why LoRA is still a proposal"],
  ],

  // What the closest work already establishes, and where this study sits.
  // From research/notes/LITERATURE_REVIEW.md, which records an initial gap
  // analysis, not a systematic review.
  literature: {
    note: "An initial gap analysis, not a systematic review. Full-text extraction of the closest papers is still to do, so no novelty claim is made.",
    items: [
      {
        work: "Hu et al., LoRA (2021); Dettmers et al., QLoRA (2023)",
        href: "https://arxiv.org/abs/2106.09685v2",
        relation:
          "Make adaptation affordable. Neither shows that an adapter beats a well-developed prompt or makes support responses safer, which is why condition C keeps prompt B.",
      },
      {
        work: "Rashkin et al., EmpatheticDialogues (ACL 2019); Liu et al., ESConv (ACL 2021)",
        href: "https://aclanthology.org/P19-1534/",
        relation:
          "Motivate emotional acknowledgement and support strategies. Both are CC BY-NC 4.0 and neither establishes clinical safety, so the pilot uses new synthetic scenarios instead of pooling them.",
      },
      {
        work: "BN et al., The Pursuit of Empathy (EMNLP 2025)",
        href: "https://aclanthology.org/2025.emnlp-main.1573/",
        relation:
          "The closest study: small models for supportive dialogue, zero-shot against fine-tuned. Its abstract reports gains that vary by scenario. Relevia differs in its tuned-prompt control and its device-cost measurements, not in studying small empathetic models.",
      },
      {
        work: "Ibrahim, Hafner and Rocher (Nature, 2026)",
        href: "https://doi.org/10.1038/s41586-026-10410-0",
        relation:
          "Warmth training can increase sycophancy. Full text not yet verified; it is the reason harmful agreement is scored separately from warmth.",
      },
      {
        work: "Zheng et al., LLM-as-a-judge (2023); Röttger et al., XSTest (NAACL 2024)",
        href: "https://arxiv.org/abs/2306.05685v4",
        relation:
          "Automated judges show position and verbosity bias, and safety words occur in benign text. Hence agent ratings are treated as provisional, and the router is tested on benign controls as well as urgent cases.",
      },
    ],
  },

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
      { label: "All 60 pairs", unit: "s", median: -3.652, lo: -5.57, hi: -0.384, mean: -18.87, meanLo: -51.706, meanHi: -1.278, n: 60 },
      {
        label: "Excluding 2 pairs in a Windows standby window",
        unit: "s",
        median: -3.347,
        lo: -5.556,
        hi: 0.534,
        mean: -3.243,
        meanLo: -5.944,
        meanHi: -0.464,
        n: 58,
      },
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
      {
        id: "S0",
        label: "Original rules",
        tp: 13,
        fn: 11,
        fp: 3,
        tn: 15,
        recall: 0.542,
        recallLo: 0.351,
        recallHi: 0.721,
        fpr: 0.167,
        fprLo: 0.058,
        fprHi: 0.392,
      },
      {
        id: "S1",
        label: "Revised rules",
        tp: 9,
        fn: 15,
        fp: 0,
        tn: 18,
        recall: 0.375,
        recallLo: 0.212,
        recallHi: 0.573,
        fpr: 0,
        fprLo: 0,
        fprHi: 0.176,
      },
      {
        id: "S2",
        label: "S1 + text normalisation",
        tp: 18,
        fn: 6,
        fp: 0,
        tn: 18,
        recall: 0.75,
        recallLo: 0.551,
        recallHi: 0.88,
        fpr: 0,
        fprLo: 0,
        fprHi: 0.176,
      },
    ],
    normalisation: ["shorthand", "typos", "stretched letters", "leetspeak", "invisible characters"],
    misses:
      'S2 still misses indirect statements and phrasings outside its rule set, such as "killing myself". A perturbation probe found that S1 missed "I wanna die".',
  },

  // Every result on the page, with how far it can be trusted and where it came from.
  register: [
    {
      claim: "Conversation-level partitions with zero group overlap across all 15 partition pairs",
      status: "completed",
      source: src("results/milestone_3/leakage.json"),
    },
    {
      claim: "Instruction compliance: 30 of 60 (A) against 1 of 60 (B) responses used the whole token budget",
      status: "completed",
      source: src("results/analysis/robustness-v1/robustness.json"),
      note: "An execution measure, not a quality measure.",
    },
    {
      claim: "The developed prompt improves rated relevance (H1)",
      status: "inconclusive",
      source: src("results/experiment_01/test-v1/analysis.json"),
      note: "+0.125, interval −0.875 to +1.125; n = 8; unblinded agent ratings.",
    },
    {
      claim: "B finishes sooner than A on CPU",
      status: "preliminary",
      source: src("results/analysis/robustness-v1/robustness.json"),
      note: "Mostly because its replies are shorter; the median's interval includes zero once two standby-affected pairs are removed.",
    },
    {
      claim: "S2 routing detects 18 of 24 urgent and flags 0 of 18 ordinary messages",
      status: "preliminary",
      source: src("results/safety/s2-v1/evaluation.json"),
      note: "Synthetic, agent-authored labels; not clinical validation.",
    },
    {
      claim: "Blinded independent human ratings, with agreement",
      status: "planned",
      source: src("results/experiment_01/independent_review_v1/manifest.json"),
      note: "Rating sheets are prepared and still empty.",
    },
    {
      claim: "LoRA adapter under prompt B (H2, condition C)",
      status: "planned",
      source: src("docs/milestone_4_protocol.md"),
      note: "No adapter has been trained.",
    },
    {
      claim: "In-browser WebLLM latency and memory on real devices",
      status: "planned",
      source: src("docs/browser_benchmark_protocol.md"),
      note: "Harness prepared, not executed. The CPU timings are not browser results.",
    },
    {
      claim: "This study fills a gap in the literature",
      status: "unverified",
      source: src("research/notes/LITERATURE_REVIEW.md"),
      note: "Initial gap analysis only.",
    },
  ],

  // What would still be needed before this could be submitted for publication.
  toPublication: [
    {
      need: "Blinded human evaluation",
      detail:
        "At least two independent raters per response, condition labels hidden, inter-rater agreement reported, and agent ratings compared against them rather than used in their place.",
    },
    {
      need: "A larger, powered test set",
      detail:
        "Eight rated scenarios cannot detect a plausible effect; the next sample size should be set from the pilot's variance before the run.",
    },
    {
      need: "Controlled model adaptation",
      detail:
        "Condition C trained on audited, licence-checked data, with prompt, decoding and test inputs unchanged, and failed runs reported.",
    },
    {
      need: "Safety validation",
      detail:
        "Risk labels reviewed by people qualified to judge them, indirect and non-English risk language, and benign controls, before any participant involvement or ethics application.",
    },
    {
      need: "Browser performance benchmarking",
      detail:
        "WebLLM on several real devices: cold and warm load, time to first token, decode rate and memory, with cache and power state recorded.",
    },
    {
      need: "A completed literature review",
      detail: "Full-text extraction of the closest studies, so the contribution can be stated precisely.",
    },
  ],

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
