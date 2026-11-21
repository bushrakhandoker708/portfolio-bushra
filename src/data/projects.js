import { repoTree, repoFile } from "./site";
import hexDashboard from "../assets/img/hexalock-dashboard.webp";
import hexStorage from "../assets/img/hexalock-storage-stateflow.webp";
import hexBarcode from "../assets/img/hexalock-barcode.webp";
import releviaApp from "../assets/img/relevia-app.webp";
import hexLocker from "../assets/img/hexalock-locker.webp";
import bushalStore from "../assets/img/bushal-store.webp";
import studyBuddy from "../assets/img/studybuddy-home.webp";
import hexRetrieval from "../assets/img/hexalock-retrieval-stateflow.webp";
import sbGraphing from "../assets/img/studybuddy-graphing-2025.webp";
import sbArchitecture from "../assets/img/studybuddy-architecture.webp";
import releviaTools from "../assets/img/relevia-tools-2025.webp";
import releviaCoping from "../assets/img/relevia-coping-2025.webp";

// Commits the code excerpts below were copied from, so the links never drift.
const BUSHAL_SHA = "b518e0e8fcf90ad4dabd493076d82b6c5cf990cc";
const STUDYBUDDY_SHA = "4de5332ca0067782b3ffbdd60dd0f5830676fac5";
// The commit where StudyBuddy's worker still ran Pyodide and SymPy (replaced by a placeholder later that day).
const STUDYBUDDY_PYODIDE_SHA = "2de20784301e72bb015e18ea1437aa562c82ceea";

/*
 * Every project page tells the story of the build, in Bushra's voice:
 *   spark      where it started: the question, in a few paragraphs
 *   thinking   design decisions: { question, options[], chose, why }
 *   pushback   where it fought back: { title, expected, observed, found, changed }
 *   checked    how I know it works (and where I don't yet)
 *   limitations, future   what is still open
 *   repo       GitHub repository key for the synced activity line (data/github.json)
 *   scene      the interactive 3D piece shown in the header (components/cosmos/Gem.jsx)
 *   sparkFigures  pictures shown beside the spark paragraphs, in order
 *   figure     on a decision or a debugging story: the picture or the real
 *              code excerpt that goes with it (components/story.jsx StoryMedia)
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
    status: "Live; the symbolic stage is switched off at the current commit",
    period: "January 2025 – June 2026",
    summary:
      "A React study suite whose graphing engine is designed to show where a function breaks instead of joining its branches, using mathjs and Plotly in the browser. Its symbolic stage, SymPy through Pyodide, is switched off at the current commit.",
    sparkFigures: [
      {
        src: sbGraphing,
        alt: "An earlier StudyBuddy graphing page with an equation field and options for derivatives, integrals, roots and asymptotes",
        caption: "The 2D graphing page in an earlier version of StudyBuddy, from my 2025 portfolio.",
        width: 1600,
        height: 712,
      },
      {
        src: sbArchitecture,
        alt: "Diagram of four layers: React interface, trace generation engine, CAS orchestration layer, and a Pyodide web worker running SymPy",
        caption:
          "The engine's layers as designed, from the notes in the repository. The timings are targets, not measurements, and at the current commit the Pyodide worker at the bottom is a placeholder.",
        width: 1600,
        height: 1063,
      },
    ],
    scene: {
      shape: "surface",
      hint: "z = sin x · cos y, coloured by the sign of its Gaussian curvature: teal where it curves like a bowl, rose where it curves like a saddle. Gold dots are maxima, blue minima, pale saddle points. Tap to send a ripple through it.",
    },
    spark: [
      "It started with tan(x). Most graphing tools draw it as one continuous line, with tall vertical strokes joining the branches where the function actually goes off to infinity. A student looking at that sees something that is not true.",
      "Desktop computer algebra systems handle this carefully, but they need a licence or an installation. I wanted to find out how much of that symbolic care could run inside a browser tab, and that set the constraints before I wrote any code: no server, interactive in under three seconds, usable offline after the first visit, and no visual artefacts that could mislead someone learning. I have not benchmarked StudyBuddy against other graphing tools, so I make no claim that it does better than any of them.",
    ],
    thinking: [
      {
        question: "Where should the symbolic maths run?",
        options: ["A hosted API such as Wolfram Alpha", "My own CAS server", "SymPy in the browser, through Pyodide (WebAssembly)"],
        chose: 2,
        why: "Only the browser option meets all four constraints: nothing to host, it works offline, and the expressions never leave the device. The price is a download of about 20 MB. I built this worker, then replaced it with a placeholder while fixing other bugs, so it is not running in the current version.",
        figure: {
          code: `importScripts(\`\${PYODIDE_URL}pyodide.js\`);
self.pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
await self.pyodide.loadPackage('sympy');`,
          caption:
            "The worker as I first wrote it (commit 2de2078, abridged). At the current commit the same file is a placeholder that returns empty results.",
          source: `https://github.com/bushrakhandoker708/study-buddy/blob/${STUDYBUDDY_PYODIDE_SHA}/src/workers/Cas.worker.js#L12-L24`,
          sourceLabel: "src/workers/Cas.worker.js at 2de2078",
        },
      },
      {
        question: "How do I stay fast while a 20 MB engine loads?",
        options: ["Show a spinner until SymPy is ready", "Plot numerically at once, then upgrade the same plot when SymPy answers"],
        chose: 1,
        why: "I called it fast-first. The numeric trace and a quick numeric analysis from mathjs appear almost immediately; the worker's answer was meant to replace them with exact results (asymptote gaps, critical points, reference lines), cached in IndexedDB by expression. With the worker switched off, the numeric analysis is the only real one.",
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
        figure: {
          code: `const fxx = (f(h,0) - 2*f0 + f(-h,0))/(h*h);
const fyy = (f(0,h) - 2*f0 + f(0,-h))/(h*h);
const fxy = (f(h,h)-f(h,-h)-f(-h,h)+f(-h,-h))/(4*h*h);
const D   = (1+fx*fx+fy*fy)**2;
return D > 1e-12 ? (fxx*fyy - fxy*fxy)/D : 0;`,
          caption: "Central differences for the Gaussian curvature, K = (f_xx f_yy − f_xy²) / (1 + f_x² + f_y²)², with h = 10⁻⁴.",
          source: `https://github.com/bushrakhandoker708/study-buddy/blob/${STUDYBUDDY_SHA}/src/pages/3D.jsx#L138-L157`,
          sourceLabel: "src/pages/3D.jsx",
        },
      },
    ],
    pushback: [
      {
        title: "The spikes that would not go away",
        expected: "A clean plot of rational functions and tan(x), with a visible break at each asymptote.",
        observed:
          "Vertical spikes. The plotting library connects samples with straight lines, so two samples on either side of a singularity get joined.",
        found:
          "Sampling more densely only moves the spike; any finite sampling can straddle a singularity. The fix had to know where the singularities are.",
        changed:
          "Two phases. A quick numeric pass flags large sign-flipping jumps, so the plot can be cleaned straight away; SymPy was then to confirm the singularities and limits. The trace is broken with null gaps, dashed asymptote lines are drawn, and a badge (for example ↕ 3 vert. asym.) tells the student the gap is deliberate. I wrote this down as the “No Lies” principle. With the SymPy stage switched off, only the numeric pass is real at the moment.",
      },
    ],
    checked:
      "My design notes record one check against a known answer: for z = sin x · cos y the Gaussian curvature at the origin is exactly 1, and the numerical method with h = 10⁻⁴ gives 0.9998. The repository has no automated test suite yet, so beyond that the engine has been checked by hand.",
    limitations: [
      "No automated tests: correctness is checked by hand and by the one documented comparison.",
      "The curvature uses finite differences with a fixed step, so values near flat regions can have the wrong sign; only the sign is used, and its error has not been measured.",
      "The SymPy stage is switched off: at the current commit the worker is a placeholder that returns empty results.",
      "Reading the code, that empty answer still replaces the numeric analysis and is labelled SymPy, which would drop the asymptote gaps. I have not confirmed this in the running app yet; it needs fixing either way.",
      "Implicit surfaces use a dense grid whose cost grows with the cube of the resolution.",
    ],
    future: [
      "Correctness tests against known answers: the vertical asymptotes of rational and trigonometric functions, and Gaussian curvature against closed forms on a grid of points",
      "A measured error curve for the finite-difference step size, instead of a single check at the origin",
      "Restore the SymPy worker, and keep the numeric result whenever an answer comes back empty",
      "A smaller first download by loading SymPy modules on demand",
    ],
    tech: ["React 18", "mathjs", "Plotly.js", "Web Workers", "IndexedDB", "Firebase", "Pyodide and SymPy (switched off)"],
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
    scene: {
      shape: "parcels",
      hint: "Each parcel is an order. Tap one to confirm it and its stock is counted; tap it again and nothing changes, because confirmation happens exactly once.",
    },
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
        figure: {
          code: `IF NOT v_order.inventory_reduced THEN
    -- reduce stock for each item in the order …
    UPDATE public.orders SET inventory_reduced = true WHERE id = p_order_id;`,
          caption: "The guard from migration 015 (abridged): stock is reduced only if this order has not reduced it before.",
          source: `https://github.com/bushrakhandoker708/bushal/blob/${BUSHAL_SHA}/supabase/migrations/015_inventory_on_confirmation.sql#L93-L118`,
          sourceLabel: "015_inventory_on_confirmation.sql",
        },
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
        observed:
          "After a confirmation they could drift apart; the in-stock flag was updated in a separate statement and could read a stale count.",
        found: "Two statements are two moments in time. Anything that happens between them can be read halfway.",
        changed:
          "Migration 020 replaced them with one UPDATE … RETURNING, so both values change together. Later, migration 043 rebuilt checkout with SELECT … FOR UPDATE, locking the product rows while stock is checked so two concurrent orders cannot both see the last item. Reading the migrations in order, you can watch the design being revised four times.",
        figure: {
          code: `SELECT stock_quantity, discount_percent
INTO v_current_stock, v_discount_percent
FROM public.products
WHERE id = v_product_id
  AND is_deleted = false
FOR UPDATE;`,
          caption:
            "Migration 043: the row stays locked until the order's transaction commits, so a second checkout waits instead of reading stale stock.",
          source: `https://github.com/bushrakhandoker708/bushal/blob/${BUSHAL_SHA}/supabase/migrations/043_atomic_checkout_rpc.sql#L74-L83`,
          sourceLabel: "043_atomic_checkout_rpc.sql",
        },
      },
      {
        title: "The middleware that never ran",
        expected: "Route protection in middleware.ts runs on every matching request.",
        observed: "It did not run at all.",
        found:
          "Next.js only picks up the middleware file from the place it expects, and mine was somewhere else, so it was silently ignored.",
        changed:
          "I moved it to the project root (“so it actually executes”, as the commit says). A file that is silently ignored is worse than one that fails loudly.",
      },
      {
        title: "Deploying the Python service",
        expected: "The analytics service starts on Railway like it does locally.",
        observed: "Build failures and start-up crashes.",
        found:
          "The commits show three separate causes: the Python version, the server not binding to the platform's port, and cron settings that Next.js 14 expects in vercel.json.",
        changed:
          "I pinned Python 3.12, added a uvicorn start-up block that binds to the given port, and moved the cron configuration. A later commit fixed database connection leaks and schema mismatches, and Next.js was bumped to 14.2.35 after a security scan flagged CVEs.",
      },
    ],
    checked:
      "Honestly, not enough yet: there is no automated test suite. The forecasting job computes MAPE against held-back sales, but I have not published those numbers, so I do not report any here.",
    implementedNotValidated:
      "Implemented, not validated: the code contains k-means segmentation, Holt–Winters forecasting, collaborative filtering, a product graph and Thompson-sampling recommendations, and a drift check. None of these has a published offline evaluation, so none is presented as a model that works well.",
    limitations: [
      "No automated tests.",
      "A Python virtual environment is committed to the repository and should be removed.",
      "Recommendation and analytics quality have not been measured on real traffic.",
    ],
    future: [
      "Integration tests for checkout, concurrent orders for the last item and repeated payment callbacks",
      "Remove the committed virtual environment",
      "Offline evaluation of the recommendation strategies on a time-based split, against a popularity baseline",
      "Forecast backtesting with rolling origins, reported against a seasonal-naive baseline",
    ],
    tech: ["Next.js 14", "TypeScript", "Supabase / PostgreSQL", "FastAPI", "scikit-learn", "bKash API"],
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
    sparkFigures: [
      {
        src: releviaTools,
        alt: "Relevia techniques page with deep breathing, mindfulness, progressive relaxation, visualisation, affirmations, physical activity and journaling",
        caption: "The calming tools the chat sits beside, in an earlier version of the app (2025).",
        width: 1600,
        height: 795,
      },
      {
        src: releviaCoping,
        alt: "Relevia coping techniques page with a Start Breathing Exercise button for quick relief",
        caption: "The coping page in the same earlier version. Its fixed exercises need no model at all.",
        width: 1600,
        height: 781,
      },
    ],
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
        found:
          "The download, not the conversation, was the experience on a first visit, and on phones and integrated GPUs the model was simply too heavy.",
        changed:
          "In November 2026 I moved to Llama-3.2-3B, then made first visits start on the 1B model (a 0.7 GB download) with an optional upgrade for devices that can run the 3B. Offline replies answer straight away while the model downloads and say how far it has got, and the GPU is warmed up right after loading so the first real reply is not slow.",
      },
      {
        title: "Deletion that silently did not delete",
        expected: "Pressing delete removes the saved chats.",
        observed: "With the app open in another tab, IndexedDB can block the deletion.",
        found:
          "A delete button that sometimes does nothing is worse than no delete button, because the user believes their words are gone.",
        changed: "Deletion now invalidates pending writes and tells the user when it is blocked, instead of failing quietly.",
      },
      {
        title: "A model file in the history",
        expected: "A repository anyone can clone quickly.",
        observed: "A LoRA adapter file had been committed straight into Git.",
        found: "Large binaries belong in Git LFS, not in the history.",
        changed:
          "In October 2025 I removed it from the history and stored LoRA files with Git LFS; in November 2026 an unused 168 MB copy in public/ went too.",
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
    tech: ["React", "Vite", "WebLLM", "WebGPU", "Web Workers", "localStorage (opt-in)", "Node test runner"],
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
    sparkFigures: [
      {
        src: hexLocker,
        alt: "HEXALOCK locker panel with numbered compartments, keypad and status display",
        caption: "The locker operation panel: six compartments, a keypad and a status line.",
        width: 542,
        height: 842,
      },
      {
        src: hexBarcode,
        alt: "Simulated barcode generation and rendering of a Code 128C token",
        caption: "An eight-digit retrieval token rendered as a Code 128C barcode.",
        width: 1600,
        height: 791,
      },
    ],
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
        figure: {
          src: hexRetrieval,
          alt: "Stateflow chart for the parcel retrieval workflow",
          caption: "Retrieval as a Stateflow chart: every guarded transition, including the failure paths, is drawn.",
          width: 1600,
          height: 771,
        },
      },
      {
        question: "Can a random PIN be trusted to be unique?",
        options: ["Generate a random six-digit PIN and use it", "Generate it, then check it against every active PIN"],
        chose: 1,
        why: "Random generation alone cannot establish uniqueness, so generation and the collision check are separate steps.",
        figure: {
          src: hexStorage,
          alt: "Stateflow chart for the storage workflow, including the CheckPIN state that rejects a PIN already used by an occupied locker",
          caption: "The storage chart. Its CheckPIN state draws a candidate PIN and rejects it if any occupied locker already uses it.",
          width: 1600,
          height: 849,
        },
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
      "PIN and barcode checks are simulated authentication logic. No cryptographic security is claimed or tested.",
    ],
    future: [
      "Consistent rate-limiting, secure random tokens and credential expiry",
      "Persistent storage that recovers after power loss",
      "Automated Stateflow regression tests and hardware-in-the-loop validation",
    ],
    tech: ["MATLAB", "Simulink", "Stateflow", "Code 128C"],
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
    summary:
      "Algorithm problems set inside physics: projectile paths, forces and waves. Code runs through a Judge0 API route; the August 2025 commits show the work of wiring up Judge0 and fixing the Vercel build.",
    tech: ["Next.js", "TypeScript", "Judge0", "Firebase Auth"],
    links: [{ label: "Repository", href: repoTree("PhyCode", "", "master") }],
  },
  {
    title: "Periodic table visualiser",
    repo: "periodic_table_visualizer",
    year: "2024–25",
    summary:
      "A Streamlit and Plotly app for filtering element data, plotting property trends against atomic number and exploring how properties relate in 3D.",
    tech: ["Python", "Streamlit", "Plotly", "pandas"],
    links: [{ label: "Repository", href: repoTree("periodic_table_visualizer") }],
  },
];

export const getProject = (slug) => projects.find((p) => p.slug === slug);
