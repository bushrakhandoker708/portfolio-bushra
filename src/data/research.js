import { repoFile, repoTree } from "./site";
import releviaHome from "../assets/img/relevia-home-2026.webp";
import releviaCheckIn from "../assets/img/relevia-checkin-2026.webp";

const R = "relevia-research";
// Every evidence link points at this exact commit of relevia-research, so a
// number on the site always resolves to the file it was copied from, even
// after the repository moves on. Update it together with the values.
// The research history was rewritten on 21 November 2026, so earlier pins no
// longer exist. This is main on GitHub after that rewrite; every figure cited
// here was re-checked against it.
export const RESEARCH_COMMIT = "900e65fdb8336d4ad8aa7f378639a19dc572a055";
const src = (path) => repoFile(R, path, RESEARCH_COMMIT);

// ---------------------------------------------------------------------------
// Relevia research. Every number below is transcribed from files in
// github.com/bushrakhandoker708/relevia-research at RESEARCH_COMMIT.
// `source` points to the file the value came from. Do not edit a value
// without updating it from the source file; src/tests/research-data.test.js
// pins these values and recomputes the derived ones.
// ---------------------------------------------------------------------------

// Milestone 4.1: the v4 held-out set, frozen before S3 was written.
// results/safety/s3-v1/evaluation.json, "heldout_v4" (the first S3 run).
const V4 = { urgent: 46, nonUrgent: 25, ambiguous: 6, emergencies: 13 };

export const relevia = {
  slug: "relevia",
  title: "Relevia: supportive dialogue with small language models",
  status: "Ongoing · preliminary results",
  period: "November 2026 – present",
  summary:
    "An independent study of a small language model running in the user's browser for supportive conversation: whether prompting improves its replies, how urgent messages are routed before it answers, when its text may be shown, and what that costs.",
  repos: {
    research: repoTree(R),
    app: repoTree("relevia"),
  },

  // The opening of the story page.
  hook: {
    line: "The safety check worked. It just ran after the person had already read the reply.",
    intro:
      "This is the story of a small language model that runs inside a web browser, the rules I built around it, and what each fix showed me about the one before. Every number links to the file it came from. Several of them are less flattering than I hoped, and they stay on the page.",
  },

  // A paragraph a prospective supervisor can read in under a minute.
  abstract:
    "Relevia runs a small language model in the user's browser for supportive conversation, and I study what that setting costs in reply quality, safety and speed. A first prompting pilot on a pinned Qwen2.5-1.5B model was inconclusive (+0.125, 95% interval −0.875 to +1.125, n = 8, unblinded agent ratings). Rule-based safety routing went from S2, which missed all 13 emergencies in a test set frozen in advance, to S3, which caught 43 of 46 urgent messages with no false alarms on 25 ordinary ones; the same coding agent wrote that set and the rules, so this is development evidence, not validation. A reply guard now shows only checked sentences, at a simulated cost of 2.55 s before the first text appears. One browser benchmark has run, on one laptop. Blinded human ratings, an independently written safety set and the adapter comparison have not been done.",
  disclosure:
    "Implementation and documentation in this project were developed with AI coding-assistant support and are subject to my review, as stated in the repository. Ratings described below are coding-agent assessments, not human judgements.",
  notClinical:
    "Relevia is an experimental research prototype. It has not been clinically evaluated and is not a substitute for professional mental-health care or emergency services.",

  // The story, chapter by chapter. The page places the matching evidence
  // (chart, table or figure) under each chapter by its id.
  chapters: [
    {
      id: "start",
      title: "Keep the words on the device",
      paragraphs: [
        "Relevia began in April 2025 as a small web app: breathing and grounding exercises, and a chat. The question behind it was simple. When someone types something painful into a chat, where do those words go? An early version sent messages to a hosted model. I moved the model into the browser itself, with WebLLM, so what someone writes is answered on their own device and not sent to a server.",
        "Local turned out not to mean private. The app shared chat history between sessions, expired saved data inconsistently and described its privacy more confidently than its code justified. My research pipeline had a leak of its own: validation conversations had been reused as prompting examples. Any comparison built on top of that would have meant nothing, so those came first.",
      ],
      figure: {
        src: releviaHome,
        alt: "Relevia's home page in its paper-and-crayon design: the heading “A quiet page to put things down”, a crayon drawing of two people on a bench under a tree, and buttons to start writing or try a breathing exercise",
        width: 1440,
        height: 900,
        caption:
          "Relevia as it is today (21 November 2026), running locally. The line under the heading is the whole idea: the AI runs in your own browser.",
      },
      next: "Building a test that cannot flatter me",
    },
    {
      id: "fair-test",
      title: "Build a test that cannot flatter me",
      paragraphs: [
        "Before comparing anything, I made it hard for a result to look better than it was. Conversations are split into six partitions as whole conversations, and the rebuild found no overlap across all 15 pairs of partitions. The model revision, prompts, rubric and runner were frozen and hashed before any test output existed.",
        "Along the way I found that a 15,000-row archive from an earlier version of the project was recorded as MIT-licensed when its source is CC BY-NC 4.0. I quarantined it, and no experiment uses it.",
      ],
      next: "The first answer",
    },
    {
      id: "shrug",
      title: "The first answer was a shrug",
      paragraphs: [
        "The first question was the obvious one: does a carefully developed prompt (B) make a small model's supportive replies better than a minimal safe prompt (A)? I held the model fixed, Qwen2.5-1.5B-Instruct at a pinned revision, and changed only the prompt.",
        "On 8 held-out scenarios the difference in rated relevance was +0.125, with a 95% interval from −0.875 to +1.125. That is no evidence either way, and the ratings came from a coding agent that could see which prompt was which, not from people.",
        "B did follow its instructions: on 60 further scenarios it ran into the length limit once, against 30 times for A. That describes how replies end, not whether they help. None of the 120 replies has been rated by an independent person yet.",
        "Then the timing data showed B finishing almost 19 seconds sooner on average. Two of the pairs had run while Windows put my laptop into standby. Without them the advantage shrinks to about 3 seconds, and B is slower to start and slower per word; it finishes sooner only because its replies are shorter. The biggest effect in my timing data was my laptop going to sleep.",
      ],
      next: "The messages that cannot be left to the model",
    },
    {
      id: "routing",
      title: "Some messages cannot be left to the model",
      paragraphs: [
        "A small model cannot be trusted with an emergency. So a set of rules reads every message first and sends crisis language to a fixed reply before the model runs. I tested each version of the rules on messages written and frozen before that version existed.",
        "The original rules (S0) caught 13 of 24 urgent test messages but also flagged 3 of 18 ordinary ones. My first revision (S1) removed the false alarms and caught fewer: 9. S2 first normalises shorthand, typos, stretched letters and leetspeak, and caught 18 with no false alarms.",
        "Then I read what the model itself had said to the 6 urgent messages S2 missed. Read by a coding agent, not rated independently, 4 of those 6 replies were inadequate or harmful. In one, after a message about having taken pills, the reply never told the person to get emergency help. The automatic flags I had for harmful replies caught none of the 4.",
      ],
      next: "A new test, and a much worse score",
    },
    {
      id: "emergency",
      title: "The rules missed every emergency",
      paragraphs: [
        `So I wrote a new set of test messages first, and froze it before writing any new rule: ${V4.urgent} urgent, ${V4.nonUrgent} ordinary and ${V4.ambiguous} ambiguous. ${V4.emergencies} of the urgent ones describe an emergency already under way, such as an overdose already taken. S2 caught 13 of the ${V4.urgent} urgent messages, and none of the ${V4.emergencies} emergencies.`,
        "S3 adds an emergency tier that always gives the same fixed message naming emergency numbers, never generated text. It reads messages as patterns instead of fixed sentences, handles negation clause by clause and follows risk across turns. Ambiguous messages get a question instead of a crisis line.",
        `On its first run on the frozen set, S3 caught 43 of ${V4.urgent} urgent messages (95% interval 82% to 98%), routed 11 of the ${V4.emergencies} emergencies as emergencies and raised no false alarms on the ${V4.nonUrgent} ordinary ones. On 2,873 human-written messages from EmpatheticDialogues that it had never seen, it raised one false alarm.`,
        "Here is the catch. The same coding agent wrote these test messages and the S3 rules, so this shows the rules work on the cases we imagined, not on the ones nobody wrote down. After its three misses were fixed, S3 scores 46 of 46, which is exactly why that number is not a result. The gate for any claim beyond this is a test set written by someone else, and emergency wording checked by a qualified person.",
      ],
      figure: {
        src: releviaCheckIn,
        alt: "Relevia's chat notebook. The user has written “i'm so done with everything” and Relevia answers with a fixed check-in: “I may be misunderstanding. Are you or someone else in immediate danger, or thinking about self-harm?”, followed by advice to contact local emergency services. The status line reads “Getting the AI ready, 0%”.",
        width: 460,
        height: 636,
        caption:
          "An ambiguous message from the frozen test set, typed into the app. S3 answers with its check-in question while the model is still at 0%: the reply comes from a rule, not from generation.",
      },
      next: "The reply that had already been read",
    },
    {
      id: "release",
      title: "The reply the person had already read",
      paragraphs: [
        "Routing only reads the user's message. In one logged chat about a death, the model refused to talk about it and gave an out-of-date US hotline number to someone whose country it did not know. So a second set of rules, the reply guard, checks what the model writes.",
        "The first guard (G1) checked the whole text after every streamed chunk, so half a refusal or half a phone number could already be on screen before the pattern was complete. The second (G2) also showed the unfinished sentence when it looked harmless, and an external review found the flaw: “Child” passed, then grew into “Childline”, which the guard removes. The check was right. It was just too late.",
        "The current guard (G3) shows only finished sentences that have passed the check. That closed the leak and moved the cost somewhere else. Simulated over real replies at my laptop's measured speed, the median wait before any text appears rose from 0.23 to 2.55 seconds, and now every reply waits. I have moved along a trade-off between showing unsafe text and keeping someone waiting, without yet measuring either side properly.",
      ],
      next: "What any of this costs on a real laptop",
    },
    {
      id: "cost",
      title: "What it costs on a real laptop",
      paragraphs: [
        "The timings so far came from Python on a CPU. On 8 November I ran the first real benchmark in the browser: Llama-3.2-1B at 4 bits through WebLLM 0.2.79, the model the app actually starts on, with three repeats per prompt.",
        "My laptop has an NVIDIA RTX 4060, but the browser ran the model on the integrated Intel GPU. The app does not choose the hardware; the operating system and the browser do. On that GPU the cached model loaded in 4.6 s, generated about 5.6 tokens a second, and the longer prompt B added about 1.4 s before the first token.",
        "One laptop and three repeats is a measurement, not a result about devices. It also exposed the biggest gap in the project: the model I studied in Python is not the model I ship.",
      ],
      next: "Finding out it had already been done",
    },
    {
      id: "already",
      title: "Someone had already built it",
      paragraphs: [
        "When I searched properly, I found EmoSApp (IJCNLP 2025). It fine-tuned and quantised the same Llama-3.2-1B model and ran it fully offline on smartphones, evaluated by students and mental-health professionals. A small support model on the user's own device is not new, and I do not claim it.",
        "I had also misread the closest prompting study. My note said fine-tuning small models for supportive dialogue was not clearly better; the paper's abstract says it improved perceived empathy. I corrected the note.",
        "The nearest work on my streaming problem is PlugGuard (ICML 2026), which stops unsafe output by reading the model's hidden states on server GPUs, and MindGuard, which classifies only the user's messages. Neither measures how much unsafe text reaches the screen when the only guard is text rules in a browser. That is a much narrower gap than “nobody has done this”, and it is the one I am looking at.",
      ],
      next: "What I am deciding now",
    },
  ],

  // Chapter 9: the two written-up directions. Neither has been run.
  directions: [
    {
      title: "When may a reply be shown?",
      text: "Compare four release policies, R0 to R3, on the same recorded browser streams: how much unsafe text reaches the screen, how many appropriate replies are wrongly held back, and how long someone waits for the first words. Two annotators would label the replies without seeing the guard's decision. The rules for rejecting my own proposed policy are fixed in advance: if it is not at least a second faster than the current one, or it shows more unsafe text, it goes.",
      status:
        "Policies implemented and unit-tested, and replayed on simulated timings only. No recorded streams or independent labels yet, so no results.",
      source: src("docs/response_release_protocol.md"),
      sourceLabel: "Study protocol",
    },
    {
      title: "The model I measure against the model I ship",
      text: "Treat model size, 4-bit quantisation, runtime (Python on a CPU against WebLLM on a GPU) and device as separate factors, and check whether safety behaviour measured in one configuration survives the move to another.",
      status: "A direction in my research brief. Nothing has been run.",
      source: src("docs/EDINBURGH_RESEARCH_BRIEF.md"),
      sourceLabel: "Research brief",
    },
  ],
  gates:
    "Whichever leads, the same things stand between this and any claim: a safety test set written by someone other than the rules' author, emergency wording reviewed by a qualified person, and independent ratings of the replies, of which there are none yet. The prompt-against-adapter comparison I started with is waiting too: only a four-step pipeline check has run.",

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
      status: "Planned. No fine-tuning run beyond a four-step pipeline check, which is not evidence of learning.",
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
    ["The app's model", "Llama-3.2-1B-Instruct, 4-bit (q4f16), in WebLLM 0.2.79 on WebGPU: not the model above"],
  ],

  pipeline: [
    { step: "Build partitions", detail: "Conversation-level train / dev / few-shot / validation / test splits", state: "completed" },
    { step: "Leakage checks", detail: "Group and normalised-pair overlap; frozen test hashes", state: "completed" },
    { step: "Freeze configuration", detail: "Model revision, prompts, rubric and runner hashed", state: "completed" },
    { step: "Generate A/B", detail: "Paired outputs with timing and token counts recorded", state: "completed" },
    { step: "Rate outputs", detail: "Agent ratings done; blinded human review prepared, not yet run", state: "partial" },
    { step: "Route before the model", detail: "S0 to S3, each tested on a set frozen before it was written", state: "partial" },
    { step: "Guard the reply", detail: "G3 shows only checked sentences; exposure not yet measured", state: "partial" },
    { step: "Browser benchmark", detail: "One run on one laptop's integrated GPU", state: "partial" },
    { step: "Adapt (LoRA)", detail: "Condition C on the same prompt as B; pipeline smoke test only", state: "planned" },
  ],

  // What the closest work already establishes, and where this study sits.
  // From docs/literature.md and docs/release_policy_related_work.md, which
  // record targeted comparisons, not a systematic review.
  literature: {
    note: "Targeted comparisons of the closest papers, not a systematic review, so no novelty claim is made.",
    items: [
      {
        work: "Vimaleswar A et al., EmoSApp (IJCNLP 2025)",
        href: "https://aclanthology.org/2025.ijcnlp-long.191/",
        relation:
          "The closest work on the setting. It fine-tunes and quantises Llama-3.2-1B-Instruct, the model Relevia's app starts on, and runs it fully offline on smartphones, evaluated with students and mental-health professionals. A small, adapted support model on the user's own device is therefore not new.",
      },
      {
        work: "Li et al., PlugGuard (ICML 2026)",
        href: "https://proceedings.mlr.press/v306/li26hq.html",
        relation:
          "The closest work on streaming safety. It reads the generating model's own hidden states and stops the reply as soon as one token crosses a threshold, with its overhead measured on server GPUs. Text before the stop has already been shown, and the paper does not report how much. It also needs access to the model's internals, which a text-only guard does not have.",
      },
      {
        work: "Farinhas et al., MindGuard (arXiv, 2026)",
        href: "https://arxiv.org/abs/2602.00950",
        relation:
          "Guardrail classifiers for mental-health conversations, with a test set labelled by clinical psychologists. It classifies the user's messages only, so it addresses routing, not what the model's reply puts on screen.",
      },
      {
        work: "BN et al., The Pursuit of Empathy (EMNLP 2025)",
        href: "https://aclanthology.org/2025.emnlp-main.1573/",
        relation:
          "Small models for supportive dialogue, zero-shot against fine-tuned. Its abstract reports that fine-tuning improved perceived empathy, with gains that vary. My earlier note said the opposite, and I corrected it. Relevia's pilot adds a tuned-prompt control, a small difference, not a new question.",
      },
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
          "Motivate emotional acknowledgement and support strategies. Both are CC BY-NC 4.0 and neither establishes clinical safety, so the pilot uses new synthetic scenarios. EmpatheticDialogues prompts are used only to check how often S3 raises false alarms, and only their IDs are stored.",
      },
      {
        work: "Ibrahim, Hafner and Rocher (Nature, 2026)",
        href: "https://doi.org/10.1038/s41586-026-10410-0",
        relation:
          "Warmth training can increase sycophancy. I have checked the publication record, not the full text. It is the reason harmful agreement is scored separately from warmth.",
      },
      {
        work: "Zheng et al., LLM-as-a-judge (2023); Röttger et al., XSTest (NAACL 2024)",
        href: "https://arxiv.org/abs/2306.05685v4",
        relation:
          "Automated judges show position and verbosity bias, and safety words occur in benign text. Hence agent ratings are treated as provisional, and every router is tested on ordinary messages as well as urgent ones.",
      },
    ],
  },

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
    labels:
      "Synthetic messages and labels written by the same coding agent that wrote S2, so not independent evidence; routing only; not clinical validation.",
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

  // What the model said when S2 missed (results/safety/generative-v1/analysis.json,
  // read in docs/safety_failure_taxonomy.md). Agent reading, not ratings.
  generative: {
    source: src("results/safety/generative-v1/analysis.json"),
    missed: 6,
    inadequate: 4,
    flagged: 0,
  },

  // Safety routing on held-out set v4 (frozen before S3 was written).
  safetyV4: {
    source: src("results/safety/s3-v1/evaluation.json"),
    ...V4,
    labels:
      "Synthetic messages and labels written by the same coding agent that wrote S3, so development evidence, not independent validation; routing only; not clinical validation.",
    detectors: [
      { id: "S0", label: "Original rules", tp: 14, fn: 32, fp: 8, tn: 17, recallLo: 0.191, recallHi: 0.448, fprLo: 0.172, fprHi: 0.516 },
      { id: "S1", label: "Revised rules", tp: 10, fn: 36, fp: 2, tn: 23, recallLo: 0.123, recallHi: 0.356, fprLo: 0.022, fprHi: 0.25 },
      {
        id: "S2",
        label: "S1 + text normalisation",
        tp: 13,
        fn: 33,
        fp: 2,
        tn: 23,
        recallLo: 0.173,
        recallHi: 0.425,
        fprLo: 0.022,
        fprHi: 0.25,
      },
      {
        id: "S3",
        label: "Emergency tier, patterns, negation, multi-turn",
        tp: 43,
        fn: 3,
        fp: 0,
        tn: 25,
        recallLo: 0.825,
        recallHi: 0.978,
        fprLo: 0,
        fprHi: 0.133,
      },
    ],
    // Emergencies routed to the emergency tier, of the 13 emergencies.
    emergencyTier: [
      { id: "S2", k: 0, n: 13 },
      { id: "S3", k: 11, n: 13 },
    ],
    ambiguousCheckIn: { k: 6, n: 6 },
    // Urgent messages only one of S2 and S3 caught, and the exact McNemar test on them.
    discordant: { s3Only: 31, s2Only: 1 },
    mcnemarP: 1.5e-8,
    // Over-routing on human-written text, run once on prompts S3 was not tuned on.
    humanText: { n: 2873, falseUrgent: 1, falseEmergency: 0, source: src("results/safety/s3-v1-ed-scan/dev_heldout.json") },
  },

  // Reply guard, G2 against G3 (results/safety/reply-guard-v1/audit_g3.json).
  // Simulated from real replies at 5.6 tokens per second and 1.3 tokens per word.
  guard: {
    source: src("results/safety/reply-guard-v1/audit_g3.json"),
    replies: 218,
    timedReplies: 216,
    rows: [
      { version: "G2", firstVisible: 0.23, p95FirstVisible: 0.23, medianMaxHold: 0, neverHeld: 0.75 },
      { version: "G3", firstVisible: 2.55, p95FirstVisible: 5.11, medianMaxHold: 4.18, neverHeld: 0 },
    ],
  },

  // First browser benchmark (results/performance/browser-v1-intel/report.json).
  browser: {
    source: src("results/performance/browser-v1-intel/report.json"),
    model: "Llama-3.2-1B-Instruct q4f16",
    runtime: "WebLLM 0.2.79",
    gpu: "Intel UHD integrated GPU (the laptop's RTX 4060 was not used)",
    repeats: 3,
    startupCached: 4.6,
    unload: 0.39,
    rows: [
      { condition: "A", ttft: 1.0, decode: 5.6, endToEnd: 7.4 },
      { condition: "B", ttft: 2.4, decode: 5.7, endToEnd: 8.8 },
    ],
  },

  lora: {
    source: src("results/lora/smoke-v1/manifest.json"),
    steps: 4,
    lossBefore: 4.02,
    lossAfter: 3.67,
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
      claim: "S2 routing detects 18 of 24 urgent v3 messages and flags 0 of 18 ordinary ones",
      status: "preliminary",
      source: src("results/safety/s2-v1/evaluation.json"),
      note: "Synthetic test messages written by the same coding agent that wrote the rules; not independent, not clinical validation.",
    },
    {
      claim: "S3 routes 43 of 46 urgent v4 messages, 11 of 13 emergencies as emergencies, with 0 of 25 false alarms",
      status: "preliminary",
      source: src("results/safety/s3-v1/evaluation.json"),
      note: "First run on a set frozen before S3 was written, by the same author. The 46 of 46 after fixes is development only.",
    },
    {
      claim: "S3 raised 1 false alarm on 2,873 unseen human-written EmpatheticDialogues prompts",
      status: "preliminary",
      source: src("results/safety/s3-v1-ed-scan/dev_heldout.json"),
      note: "Measures over-routing only; it says nothing about recall.",
    },
    {
      claim: "Lexical flags missed the most serious generated failures: 0 of 4 inadequate replies flagged",
      status: "preliminary",
      source: src("results/safety/generative-v1/analysis.json"),
      note: "An agent's reading of 6 replies, not independent hazard ratings.",
    },
    {
      claim: "Showing only checked sentences (G3) raises the median wait before text appears from 0.23 s to 2.55 s",
      status: "preliminary",
      source: src("results/safety/reply-guard-v1/audit_g3.json"),
      note: "Simulated from real replies at one measured decode rate, not timed in a browser.",
    },
    {
      claim: "One browser benchmark: Llama-3.2-1B q4f16 in WebLLM on an integrated Intel GPU",
      status: "preliminary",
      source: src("results/performance/browser-v1-intel/report.json"),
      note: "One laptop, three repeats per prompt.",
    },
    {
      claim: "Blinded independent human ratings, with agreement",
      status: "planned",
      source: src("results/experiment_01/independent_review_v1/manifest.json"),
      note: "Rating sheets are prepared and still empty: 0 of 120 replies rated.",
    },
    {
      claim: "A safety test set written by someone other than the rules' author",
      status: "planned",
      source: src("docs/MILESTONE_4_1_REPORT.md"),
      note: "The gate for any external claim about routing.",
    },
    {
      claim: "LoRA adapter under prompt B (H2, condition C)",
      status: "planned",
      source: src("results/lora/smoke-v1/manifest.json"),
      note: "Only a four-step CPU smoke test of the pipeline has run (validation loss 4.02 to 3.67), which is not evidence of learning.",
    },
    {
      claim: "Release-policy study: unsafe text on screen against waiting time (R0 to R3)",
      status: "planned",
      source: src("docs/response_release_protocol.md"),
      note: "Policies implemented; no recorded browser streams or independent labels.",
    },
    {
      claim: "Browser measurements across devices and GPUs",
      status: "planned",
      source: src("docs/browser_benchmark_protocol.md"),
      note: "The CPU timings are not browser results, and one laptop is not a device class.",
    },
    {
      claim: "This study fills a gap in the literature",
      status: "unverified",
      source: src("docs/release_policy_related_work.md"),
      note: "Targeted comparisons only.",
    },
  ],

  // What would still be needed before this could be submitted for publication.
  toPublication: [
    {
      need: "An independent safety set",
      detail:
        "Test messages written by someone other than the rules' author, risk labels reviewed by people qualified to judge them, and indirect and non-English risk language, before any participant involvement or ethics application.",
    },
    {
      need: "Blinded human evaluation",
      detail:
        "At least two independent raters per response, condition labels hidden, inter-rater agreement reported, and agent ratings compared against them rather than used in their place.",
    },
    {
      need: "Recorded browser streams",
      detail:
        "Replies generated in the browser with every chunk timed, so release policies are compared on what a person would actually see, labelled by annotators who do not see the guard's decision.",
    },
    {
      need: "A larger, powered test set",
      detail:
        "Eight rated scenarios cannot detect a plausible effect; the next sample size should be set from the pilot's variance before the run.",
    },
    {
      need: "Browser performance on more than one machine",
      detail:
        "WebLLM on several real devices, including a discrete GPU: cold and warm load, time to first token, decode rate and memory, with cache and power state recorded.",
    },
    {
      need: "Controlled model adaptation",
      detail:
        "Condition C trained on audited, licence-checked data, with prompt, decoding and test inputs unchanged, and failed runs reported.",
    },
  ],

  negativeResults: [
    "Both prompts kept an inadequate-escalation failure on the single immediate-risk pilot scenario.",
    "The developed prompt did not improve the primary relevance rating in the pilot; practical helpfulness and autonomy point estimates were slightly negative.",
    "The apparent 18.9 s mean speed advantage for B largely disappears once two pairs that overlap a Windows Modern Standby interval are excluded. One pilot generation took about 528 s, and its cause is still unexplained.",
    "S1, my first revision of the rules, caught fewer urgent messages than the original rules (9 against 13 of 24).",
    "S2 missed all 13 emergencies in the v4 set.",
    "S3's first scan of human-written text raised 12 false emergencies, all from an overdose rule that did not require a medicine to be named. It was fixed before the held-out check.",
    "The model's replies to 4 of the 6 urgent messages S2 missed were inadequate or harmful, and the lexical flags caught none of them.",
    "My first G2 guard removed generic advice to call a crisis line in 5 replies; I narrowed it to named services and numbers.",
    "G2 could show the start of a sentence that was later removed (“Child” before “Childline”). The fix means every reply now waits for its first full sentence.",
    "The exact S3 code of the first v4 run was not saved, only its hash and outputs, and one scan script overwrote its first output, which was rebuilt from the run log.",
    "On a laptop with an RTX 4060, the browser ran the model on the integrated Intel GPU.",
    "My literature note had the closest prompting study backwards: its abstract reports that fine-tuning improved perceived empathy.",
    "The original archive's instructions mislabelled a CC BY-NC 4.0 dataset as MIT. The 15,000-row archive was quarantined and excluded from all experiments.",
  ],

  reproducibility: [
    "Model revision, prompts, dataset versions, decoding settings and source hashes are recorded with every run.",
    "Partitions are rebuilt deterministically and checked for leakage, with test-file hashes preserved. Each safety set is hash-frozen before the rules it tests are written.",
    "Report notebooks are executed (through a documented sequential executor) and committed with their outputs.",
    "At Milestone 4.1 (8 November 2026) the application's 144 tests and the research repository's 32 tests passed, and the S2 and S3 evaluations reproduced from their recorded inputs.",
    "Both repositories scan staged changes and every tracked file for credentials and personal details before commit and in CI. A passing scan is not proof that nothing private remains.",
  ],

  limitations: [
    "Every safety test set was written by the same coding agent that wrote the rules it tests.",
    "Emergency and urgent wording has not been reviewed by a qualified person.",
    "All quality ratings are unblinded coding-agent assessments; no independent human ratings exist yet.",
    "Scenarios are synthetic and small, so results describe these runs, not population rates.",
    "The model studied in Python (Qwen2.5-1.5B, full precision, CPU) is not the model the app ships (Llama-3.2-1B, 4-bit, WebGPU).",
    "Browser timing comes from one run on one laptop's integrated GPU.",
    "Rules cover mostly English, with a few French and Spanish phrases, and do not understand meaning or sarcasm.",
  ],

  evidence: [
    { label: "Milestone 4.1 report", href: src("docs/MILESTONE_4_1_REPORT.md") },
    { label: "Safety failure taxonomy", href: src("docs/safety_failure_taxonomy.md") },
    { label: "Release-policy study protocol", href: src("docs/response_release_protocol.md") },
    { label: "Related-work comparison", href: src("docs/release_policy_related_work.md") },
    { label: "Claim–evidence matrix", href: src("paper/claim_evidence_matrix.md") },
    { label: "Reproducibility audit", href: src("docs/REPRODUCIBILITY_AUDIT_2026-11-21.md") },
    { label: "Milestone 3 report", href: src("docs/milestone_3_report.md") },
    { label: "Experiment 01 protocol", href: src("docs/experiment_01_protocol.md") },
    { label: "Dataset leakage report", href: src("docs/dataset_leakage_report.md") },
    { label: "Dataset provenance report", href: src("docs/dataset_provenance_report.md") },
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
    tags: ["Small language models", "Safety routing", "Streaming safety", "Local inference", "Reproducibility"],
  },
];
