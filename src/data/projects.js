import { repoTree, repoFile } from "./site";
import hexDashboard from "../assets/img/hexalock-dashboard.webp";
import hexStorage from "../assets/img/hexalock-storage-stateflow.webp";
import hexBarcode from "../assets/img/hexalock-barcode.webp";
import releviaApp from "../assets/img/relevia-app.webp";
import hexLocker from "../assets/img/hexalock-locker.webp";
import bushalStore from "../assets/img/bushal-store.webp";
import studyBuddy from "../assets/img/studybuddy-home.webp";

/*
 * Every project page tells the story of the build, in Bushra's voice:
 *   spark      where it started: the question, in a few paragraphs
 *   thinking   forks in the road: { question, options[], chose, why }
 *   pushback   where it fought back: { title, expected, observed, found, changed }
 *   checked    how I know it works (and where I don't yet)
 *   limitations, future   what is still open
 *   repo       GitHub repository key for the synced activity line (data/github.json)
 *   scene      the interactive 3D piece shown in the header (components/cosmos/Gem.jsx)
 *
 * Only what the repository, its commits or its design notes show. Where a
 * reason is not recorded, the page gives the decision without inventing one.
 */

export const projects = [
  {
    slug: "studybuddy",
    repo: "study-buddy",
    title: "StudyBuddy",
    tagline: "A graphing engine that refuses to lie to students",
    cover: { src: studyBuddy, alt: "StudyBuddy landing page: Study smarter, glow harder", w: 1200, h: 750 },
    kind: "Maths visualisation · individual project",
    status: "Live; graphing engine documented in the repository",
    period: "January 2025 – June 2026",
    summary:
      "A React study suite whose graphing engine runs a full computer algebra system in the browser: numeric plots appear at once, then SymPy (through Pyodide) upgrades them with asymptotes, critical points and curvature.",
    scene: { shape: "surface", hint: "z = sin x · cos y, coloured by the sign of its Gaussian curvature: teal where it curves like a bowl, rose where it curves like a saddle. Drag to turn it; tap to send a ripple through it." },
    spark: [
      "It started with tan(x). Most graphing tools draw it as one continuous line, with tall vertical strokes joining the branches where the function actually goes off to infinity. A student looking at that sees something that is not true.",
      "The tools that do get it right, such as Mathematica, MATLAB and Maple, need a licence, an installation or a server. The free browser tools are fast, but they have no symbolic asymptote detection, no curvature and no offline mode. I wanted the honesty of the first group with the reach of the second, and that set the constraints before I wrote any code: no server, interactive in under three seconds, usable offline after the first visit, and no visual artefacts that could mislead someone learning.",
    ],
    thinking: [
      {
        question: "Where should the symbolic maths run?",
        options: ["A hosted API such as Wolfram Alpha", "My own CAS server", "SymPy in the browser, through Pyodide (WebAssembly)"],
        chose: 2,
        why: "Only the browser option meets all four constraints: nothing to host, it works offline, and the expressions never leave the device. The price is a download of about 20 MB, so it is cached after the first visit.",
      },
      {
        question: "How do I stay fast while a 20 MB engine loads?",
        options: ["Show a spinner until SymPy is ready", "Plot numerically at once, then upgrade the same plot when SymPy answers"],
        chose: 1,
        why: "I called it fast-first. The numeric trace from mathjs appears almost immediately; SymPy runs in a Web Worker in the background and its results are swapped into the plot: asymptote gaps, critical points, reference lines. The analysis is then cached in IndexedDB, keyed by the expression.",
      },
      {
        question: "Three.js or Plotly for the 3D plots?",
        options: ["Three.js, which I know well", "Plotly.js"],
        chose: 1,
        why: "Three.js is what I usually reach for, but here it would have meant writing my own expression parser, numerical derivatives, marching cubes and asymptote clipping. Plotly works directly with the maths engine, has accessibility support and exports to PNG and SVG. So Plotly was the better fit for this job.",
      },
      {
        question: "What step size for the curvature derivatives?",
        options: ["h = 10⁻⁶, near the theoretical optimum", "h = 10⁻⁴, a hundred times larger"],
        chose: 1,
        why: "The mixed partial derivative needs four function evaluations, and at 10⁻⁶ the rounding error in that numerator can swamp the signal. I only need the sign of the curvature (bowl, saddle or flat), so I traded a little precision for a sign that stays reliable.",
      },
    ],
    pushback: [
      {
        title: "The spikes that would not go away",
        expected: "A clean plot of rational functions and tan(x), with a visible break at each asymptote.",
        observed: "Vertical spikes. The plotting library connects samples with straight lines, so two samples on either side of a singularity get joined.",
        found: "Sampling more densely only moves the spike; any finite sampling can straddle a singularity. The fix had to know where the singularities are.",
        changed:
          "Two phases. A quick numeric pass flags large sign-flipping jumps, so the plot is cleaned before SymPy loads; then SymPy confirms the singularities and limits. The trace is broken with null gaps, dashed asymptote lines are drawn, and a badge (for example ↕ 3 vert. asym.) tells the student the gap is deliberate. I wrote this down as the “No Lies” principle.",
      },
    ],
    checked:
      "My design notes record one check against a known answer: for z = sin x · cos y the Gaussian curvature at the origin is exactly 1, and the numerical method with h = 10⁻⁴ gives 0.9998. The repository has no automated test suite yet, so beyond that the engine has been checked by hand.",
    limitations: [
      "No automated tests: correctness is checked by hand and by the one documented comparison.",
      "The first visit downloads about 20 MB for Pyodide and SymPy.",
      "Implicit surfaces use a dense grid whose cost grows with the cube of the resolution.",
    ],
    future: ["Unit tests for the asymptote detector and the curvature classification", "A smaller first download by loading SymPy modules on demand"],
    tech: ["React 18", "Pyodide", "SymPy", "mathjs", "Plotly.js", "Web Workers", "IndexedDB", "Firebase"],
    contribution: "Individual project.",
    links: [
      { label: "Repository", href: repoTree("study-buddy") },
      { label: "Graphing engine design notes", href: repoFile("study-buddy", "feature_architecture/Graphs.md") },
      { label: "Live", href: "https://study-buddy-seven-blush.vercel.app/" },
    ],
  },
  {
    slug: "bushal",
    repo: "bushal",
    title: "Bushal",
    tagline: "Teaching a shop to count stock exactly once",
    cover: { src: bushalStore, alt: "Bushal storefront headline: Crafted for Modern Heritage", w: 700, h: 500 },
    kind: "Full-stack e-commerce · individual project",
    status: "Built and deployed; no automated tests yet",
    period: "June 2026",
    summary:
      "A Next.js and Supabase storefront for Bangladesh, with stock rules enforced inside Postgres, bKash mobile payments and a separate Python service for analytics.",
    scene: { shape: "parcels", hint: "Each parcel is an order. Tap one to confirm it and its stock is counted; tap it again and nothing changes, because confirmation happens exactly once." },
    spark: [
      "A shop looks simple from the front: products, a basket, a pay button. The interesting part is underneath. Two people can try to buy the last item in the same second, and a payment provider can call you back twice for one payment. If either of those goes wrong, someone pays for something that does not exist.",
      "So the question for me was not “how do I show a product?” but “where does the truth about stock live, and who is allowed to change it?”",
    ],
    thinking: [
      {
        question: "Where should the stock rules live?",
        options: ["In the page and the API code", "Inside the database, as Postgres functions"],
        chose: 1,
        why: "Code in the interface can be bypassed or run twice. A Postgres function runs in one transaction, so checking stock and creating the order either both happen or neither does. Row-level security policies sit beside them in the migrations.",
      },
      {
        question: "When should stock actually go down?",
        options: ["The moment an order is placed", "When I confirm the order, and only once"],
        chose: 1,
        why: "A placed order is not yet a sale. Migration 015 changed the design: checkout only validates stock, and the reduction happens in one atomic function when the order is confirmed. An inventory_reduced flag on the order makes sure it cannot happen twice.",
      },
      {
        question: "Where do the heavy analytics run?",
        options: ["Inside the Next.js request path", "A separate Python service, triggered on a schedule"],
        chose: 1,
        why: "Customer segmentation (k-means) and demand forecasting (Holt–Winters, with a moving-average baseline) need Python and scikit-learn, and none of it should slow down a shopper's page. A cron trigger calls a FastAPI service that writes its results back to Postgres.",
      },
    ],
    pushback: [
      {
        title: "Stock that disagreed with itself",
        expected: "The stock count and the in-stock flag always agree.",
        observed: "After a confirmation they could drift apart; the in-stock flag was updated in a separate statement and could read a stale count.",
        found: "Two statements are two moments in time. Anything that happens between them can be read halfway.",
        changed:
          "Migration 020 replaced them with one UPDATE … RETURNING, so both values change together. Later, migration 043 rebuilt checkout with SELECT … FOR UPDATE, locking the product rows while stock is checked so two concurrent orders cannot both see the last item. Reading the migrations in order, you can watch the design being revised four times.",
      },
      {
        title: "The middleware that never ran",
        expected: "Route protection in middleware.ts runs on every matching request.",
        observed: "It did not run at all.",
        found: "Next.js only picks up the middleware file from the place it expects, and mine was somewhere else, so it was silently ignored.",
        changed: "I moved it to the project root (“so it actually executes”, as the commit says). A file that is silently ignored is worse than one that fails loudly.",
      },
      {
        title: "Deploying the Python service",
        expected: "The analytics service starts on Railway like it does locally.",
        observed: "Build failures and start-up crashes.",
        found: "The commits show three separate causes: the Python version, the server not binding to the platform's port, and cron settings that Next.js 14 expects in vercel.json.",
        changed: "I pinned Python 3.12, added a uvicorn start-up block that binds to the given port, and moved the cron configuration. A later commit fixed database connection leaks and schema mismatches, and Next.js was bumped to 14.2.35 after a security scan flagged CVEs.",
      },
    ],
    checked:
      "Honestly, not enough yet: there is no automated test suite. The forecasting job computes MAPE against held-back sales, but I have not published those numbers, so I do not report any here.",
    limitations: [
      "No automated tests.",
      "A Python virtual environment is committed to the repository and should be removed.",
      "Recommendation and analytics quality have not been measured on real traffic.",
    ],
    future: ["Integration tests for checkout and repeated payment callbacks", "Remove the committed virtual environment", "Offline evaluation of the recommendation strategies"],
    tech: ["Next.js 14", "TypeScript", "Supabase / PostgreSQL", "FastAPI", "scikit-learn", "bKash API"],
    architecture: {
      nodes: [
        ["Next.js 14 app (TypeScript)", "Supabase Postgres (RLS, RPC functions)"],
        ["Next.js API routes", "bKash create / callback / webhook"],
        ["Cron trigger", "FastAPI analytics service (Python)"],
        ["FastAPI analytics service", "Supabase Postgres"],
      ],
      note: "From the repository: app routes, 42 SQL migrations and the ml-service package.",
    },
    contribution: "Individual project.",
    links: [
      { label: "Repository", href: repoTree("bushal") },
      { label: "Architecture notes", href: repoFile("bushal", "README.md") },
    ],
  },
  {
    slug: "relevia-app",
    repo: "relevia",
    title: "Relevia",
    tagline: "A supportive chat that keeps your words on your device",
    cover: { src: releviaApp, alt: "Relevia home screen with breathing, grounding and chat tools", w: 1440, h: 900 },
    kind: "Privacy-aware web app · research testbed",
    status: "Active prototype",
    period: "April 2025 – present",
    summary:
      "A React app with breathing and grounding tools and a supportive chat that runs a language model on the user's own device through WebLLM. It is also the testbed for my Relevia research.",
    scene: { shape: "orb", hint: "Breathe with it: in while it grows, out while it settles. Tap to change its colour." },
    spark: [
      "Relevia starts from a question: when someone types something painful into a chat, where do those words go? Running the model locally, in the browser, means the conversation never reaches an inference server.",
      "But local is not the same as private. An earlier version shared chat history between sessions, expired data inconsistently and described its privacy more confidently than the code justified. So the real goal became: make every privacy and safety property something the implementation guarantees, not something the interface claims.",
    ],
    thinking: [
      {
        question: "Should chats be saved?",
        options: ["Save everything, so the chat remembers", "Keep chats in memory, and save only when the user opts in"],
        chose: 1,
        why: "Saving is opt-in, kept for 24 hours, and switched off automatically for the session once crisis language is recognised. A delete control clears chats and personalisation, cancels pending writes and says so when deletion is blocked.",
      },
      {
        question: "What happens before the model sees a message?",
        options: ["Send everything to the model", "Check for crisis language first and route it"],
        chose: 1,
        why: "A small model cannot be trusted to handle an emergency. Recognised crisis language is routed to fixed, safe responses before inference. Those rules are the S2 detector from my research, measured on held-out cases.",
      },
      {
        question: "Which model, on which device?",
        options: ["One large model for everyone", "Model tiers chosen by what the device can run"],
        chose: 1,
        why: "Device capability is an engineering constraint, not an afterthought. The app picks a model tier from the device and can fall back to a smaller one.",
      },
    ],
    pushback: [
      {
        title: "Six gigabytes before the first hello",
        expected: "A visitor can start talking within moments.",
        observed: "The first model was Llama-3.1-8B, about 6 GB. Nobody waits for that.",
        found: "The download, not the conversation, was the experience on a first visit, and on phones and integrated GPUs the model was simply too heavy.",
        changed:
          "In November 2026 I moved to Llama-3.2-3B, then made first visits start on the 1B model (0.9 GB) with an optional upgrade for devices that can run the 3B. Offline replies answer straight away while the model downloads and say how far it has got, and the GPU is warmed up right after loading so the first real reply is not slow.",
      },
      {
        title: "Deletion that silently did not delete",
        expected: "Pressing delete removes the saved chats.",
        observed: "With the app open in another tab, IndexedDB can block the deletion.",
        found: "A delete button that sometimes does nothing is worse than no delete button, because the user believes their words are gone.",
        changed: "Deletion now invalidates pending writes and tells the user when it is blocked, instead of failing quietly.",
      },
      {
        title: "A model file in the history",
        expected: "A repository anyone can clone quickly.",
        observed: "A LoRA adapter file had been committed straight into Git.",
        found: "Large binaries belong in Git LFS, not in the history.",
        changed: "In October 2025 I removed it from the history and stored LoRA files with Git LFS; in November 2026 an unused 168 MB copy in public/ went too.",
      },
    ],
    checked:
      "18 synthetic JavaScript tests cover storage, retention and deletion (as recorded in my research milestones). It has not been measured on real devices for download size, latency or memory, and it has not been clinically evaluated.",
    limitations: [
      "Saved chats are not encrypted and there is no sign-in; anyone using the same browser profile can open them.",
      "A missed risk detection can leave sensitive text in an opted-in chat.",
      "No real-device measurements yet for download size, latency or memory.",
      "Not clinically evaluated. It is not a substitute for professional care or emergency services.",
    ],
    future: ["Real-device WebLLM benchmarks", "Broader safety coverage"],
    tech: ["React", "Vite", "WebLLM", "WebGPU", "IndexedDB", "Node test runner"],
    contribution: "Individual project. Recent changes are agent-assisted and reviewed by me, as the README states.",
    links: [
      { label: "Repository", href: repoTree("relevia") },
      { label: "Live prototype", href: "https://bushrakhandoker708.github.io/relevia/" },
      { label: "The research behind it", href: "/research/relevia", internal: true },
    ],
  },
  {
    slug: "hexalock",
    repo: "HEXALOCK",
    title: "HEXALOCK",
    tagline: "A parcel locker is not a door problem",
    cover: { src: hexDashboard, alt: "HEXALOCK dashboard with six compartment indicators beside the Simulink model", w: 1600, h: 708 },
    kind: "Embedded systems · team project",
    status: "Completed academic prototype",
    period: "2026–27, Swansea University (CSC368 Embedded Systems Design)",
    summary:
      "A six-compartment smart parcel locker modelled in Simulink and Stateflow, where every operation is a transaction: PIN and barcode retrieval, fault handling and a maintenance mode.",
    scene: { shape: "hex", hint: "Six compartments. Tap one to open it; tap again to close it." },
    spark: [
      "The simplest picture of a locker is six buttons controlling six doors. We started there and moved away from it.",
      "A compartment is not free just because its door is closed. A door opening is not a successful collection until the parcel has actually been removed. The physical locker, the person at the keypad and the stored records all have to agree, and they can disagree at any moment: someone walks away halfway, types the wrong PIN three times, or a sensor reports something unexpected. So we stopped thinking about doors and started thinking about transactions, each with a beginning, guarded steps, and either completion or a way back.",
    ],
    thinking: [
      {
        question: "How do we express the control logic?",
        options: ["Long chains of if-statements", "Stateflow: explicit states and guarded transitions"],
        chose: 1,
        why: "The locker is event-driven. A keypad confirmation, a sensor event, an authentication result or a timeout decides what happens next, and a state machine makes every one of those paths visible, including the failure paths.",
      },
      {
        question: "Can a random PIN be trusted to be unique?",
        options: ["Generate a random six-digit PIN and use it", "Generate it, then check it against every active PIN"],
        chose: 1,
        why: "Random generation alone cannot establish uniqueness, so generation and the collision check are separate steps.",
      },
      {
        question: "Who owns the truth: the dashboard or the controller?",
        options: ["Let the dashboard drive the doors", "The controller decides; the dashboard only displays"],
        chose: 1,
        why: "A convincing animation is not evidence that the controller has reached a safe state. The interface has to represent the controller, never compete with it.",
      },
    ],
    pushback: [
      {
        title: "A key press is not a command",
        expected: "Typing a PIN enters a PIN.",
        observed: "A held or repeated key could be processed more than once.",
        found: "The controller needed to tell a key press apart from a completed command.",
        changed: "We added an input buffer, a digit counter, a clear operation, a confirmation event and a last-key check.",
      },
      {
        title: "Signals the dashboard could not see",
        expected: "The dashboard reads the controller's internal state directly.",
        observed: "Some internal signals were not exposed by the existing controller.",
        found: "Moving decisions into the interface would have fixed the display but broken the design principle above.",
        changed:
          "We added display-only adapters that rebuild some indicators from the controller's message transitions. It is a pragmatic adaptation for a simulation; a real locker should send direct telemetry.",
      },
    ],
    checked:
      "Scenario-based checks: storing into empty and occupied compartments, retrieving with valid PINs and barcodes, three wrong PINs, timeouts and maintenance. The repository documents the expected behaviour as a regression checklist; it does not claim measured pass rates.",
    limitations: [
      "Simulation only: sensors, motors, scanning and doors are simulated, and records do not survive a restart.",
      "A failed barcode should count towards the same lockout as a failed PIN; this needs review.",
      "Maintenance credentials are hard-coded, and the random PIN range is not regression-tested.",
    ],
    future: ["Consistent rate-limiting, secure random tokens and credential expiry", "Persistent storage that recovers after power loss", "Automated Stateflow regression tests and hardware-in-the-loop validation"],
    tech: ["MATLAB", "Simulink", "Stateflow", "Code 128C"],
    architecture: {
      nodes: [
        ["Keypad", "Input buffer"],
        ["Input buffer, sensors, scan buttons", "Stateflow controller"],
        ["Stateflow controller", "Barcode encoder / decoder"],
        ["Stateflow controller", "Database middleware → in-memory records"],
        ["Stateflow controller", "Simulated door, motor and lock"],
        ["Stateflow controller", "Dashboard (display only)"],
      ],
      note: "Logical components, as documented in the project README.",
    },
    images: [
      { src: hexStorage, alt: "Stateflow chart for the parcel storage workflow with guarded transitions between states", caption: "The storage workflow as a Stateflow state machine.", width: 1600, height: 849 },
      { src: hexBarcode, alt: "Simulated barcode generation and rendering of a Code 128C token", caption: "An eight-digit retrieval token rendered as a Code 128C barcode.", width: 1600, height: 791 },
      { src: hexLocker, alt: "HEXALOCK locker panel with numbered compartments, keypad and status display", caption: "The locker operation panel.", width: 542, height: 842 },
    ],
    contribution: null, // needs confirmation: Bushra's individual role is not yet documented
    team: "A six-person team; everyone is credited in the repository. The story above is the team's, and my individual part is being confirmed before I describe it.",
    links: [{ label: "Repository and full documentation", href: repoTree("HEXALOCK") }],
  },
];

// Smaller and earlier work, listed compactly.
export const otherProjects = [
  {
    title: "PhyCode",
    repo: "PhyCode",
    year: "2025",
    summary: "Algorithm problems set inside physics: projectile paths, forces and waves. Code runs through a Judge0 API route; the August 2025 commits show the work of wiring up Judge0 and fixing the Vercel build.",
    tech: ["Next.js", "TypeScript", "Judge0", "Firebase Auth"],
    links: [{ label: "Repository", href: repoTree("PhyCode", "", "master") }],
  },
  {
    title: "Periodic table visualiser",
    repo: "periodic_table_visualizer",
    year: "2024–25",
    summary: "A Streamlit and Plotly app for filtering element data, plotting property trends against atomic number and exploring how properties relate in 3D.",
    tech: ["Python", "Streamlit", "Plotly", "pandas"],
    links: [{ label: "Repository", href: repoTree("periodic_table_visualizer") }],
  },
];

export const getProject = (slug) => projects.find((p) => p.slug === slug);
