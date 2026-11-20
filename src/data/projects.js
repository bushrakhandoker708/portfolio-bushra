import { repoTree, repoFile } from "./site";
import hexDashboard from "../assets/img/hexalock-dashboard.webp";
import hexStorage from "../assets/img/hexalock-storage-stateflow.webp";
import hexBarcode from "../assets/img/hexalock-barcode.webp";
import releviaApp from "../assets/img/relevia-app.webp";

// Case-study schema (every featured project follows it):
// slug, title, kind, status, period, summary, problem, motivation, objectives[],
// architecture{nodes, note} | images[], decisions[], contribution, tech[],
// evaluation, results[], challenges[], limitations[], future[], links[]
// Statements are limited to what the linked repository shows.

export const projects = [
  {
    slug: "hexalock",
    title: "HEXALOCK smart parcel locker",
    kind: "Embedded systems · team project",
    status: "Completed academic prototype",
    period: "2026–27, Swansea University (CSC368 Embedded Systems Design)",
    summary:
      "A six-compartment parcel locker modelled in Simulink and Stateflow as a transaction-based control system, with PIN and barcode retrieval, fault handling and a maintenance mode.",
    problem:
      "A locker has to keep the physical process, user interaction and stored records consistent. A compartment is not free just because its door is closed, and opening a door is not a successful collection until the parcel has been removed.",
    motivation:
      "The team modelled each operation as a transaction with a beginning, guarded actions, and either completion or a recovery path. This replaced a simpler design of six buttons controlling six doors.",
    objectives: [
      "Track availability across six independently addressed compartments",
      "Store and retrieve parcels through a keypad, using a PIN or a barcode",
      "Handle incomplete transactions, failed attempts and faults explicitly",
      "Provide authorised maintenance and reset paths",
    ],
    architecture: {
      nodes: [
        ["Keypad", "Input buffer"],
        ["Input buffer, sensors, scan buttons", "Stateflow controller"],
        ["Stateflow controller", "Barcode encoder / decoder"],
        ["Stateflow controller", "Database middleware → in-memory records"],
        ["Stateflow controller", "Simulated door, motor and lock"],
        ["Stateflow controller", "Dashboard"],
      ],
      note: "Logical components, as documented in the project README. The Simulink wiring is in the screenshots below.",
    },
    images: [
      { src: hexDashboard, alt: "HEXALOCK dashboard showing six locker compartments beside the top-level Simulink model", caption: "Interactive dashboard and top-level Simulink architecture.", width: 1600, height: 708 },
      { src: hexStorage, alt: "Stateflow chart for the parcel storage workflow with guarded transitions between states", caption: "Storage workflow as a Stateflow state machine.", width: 1600, height: 849 },
      { src: hexBarcode, alt: "Simulated barcode generation and rendering of a Code 128C token", caption: "Eight-digit retrieval token rendered as a Code 128C barcode.", width: 1600, height: 791 },
    ],
    decisions: [
      "Used Stateflow for event-driven control (keypad confirmation, sensor event, authentication result, timeout) instead of long chains of conditionals.",
      "Generated random six-digit PINs, with a collision check against active PINs.",
      "Encoded eight-digit tokens with Code 128C so retrieval could use either a PIN or a simulated scan.",
      "Added failed-attempt tracking, a temporary lockout and transaction timeouts as explicit states.",
    ],
    contribution: null, // needs confirmation: Bushra's individual role is not yet documented
    team: "Six-person team. All members are credited in the repository; individual roles are being confirmed.",
    tech: ["MATLAB", "Simulink", "Stateflow", "Code 128C"],
    evaluation:
      "Scenario-based checks: storing in empty and occupied compartments, retrieving with valid PINs and barcodes, three incorrect PINs, timeouts and maintenance. The repository documents the expected behaviour as a regression checklist. It does not claim measured pass rates.",
    results: [
      "Screenshots show barcode rendering, occupancy feedback and an opening-door event.",
      "The lockout transition is documented in the model. A captured runtime lockout is not shown.",
    ],
    challenges: [
      "Keeping door state, parcel presence and records consistent when a user abandons an operation partway through.",
    ],
    limitations: [
      "Simulation only: sensors, motors, scanning and doors are simulated, and records are not persisted across restarts.",
      "The failed-barcode branch should increment the same attempt counter as failed PIN entry; this needs review.",
      "The maintenance credentials are hard-coded, and the random PIN range is not yet regression-tested.",
    ],
    future: [
      "Consistent rate-limiting, secure random tokens and credential expiry",
      "Persistent, atomic storage with recovery after power loss",
      "Automated Stateflow regression tests and hardware-in-the-loop validation",
    ],
    links: [{ label: "Repository and full documentation", href: repoTree("HEXALOCK") }],
  },
  {
    slug: "bushal",
    title: "Bushal e-commerce platform",
    kind: "Full-stack software engineering",
    status: "Built; no automated tests yet",
    period: "June 2026",
    summary:
      "A Next.js and Supabase storefront for Bangladesh, with database-enforced inventory, bKash mobile payments and a separate Python service for analytics jobs.",
    problem:
      "Real-world checkout has concurrency and payment-confirmation problems that a simple CRUD design gets wrong: two buyers can claim the last item, and a payment callback can arrive more than once.",
    motivation:
      "I wanted to build something where correctness lives in the database and the payment flow, not only in the interface.",
    objectives: [
      "Atomic stock reservation and order creation",
      "Row-level security on user data",
      "Payment confirmation that is safe to receive twice",
      "Analytics jobs running outside the request path",
    ],
    architecture: {
      nodes: [
        ["Next.js 14 app (TypeScript)", "Supabase Postgres (RLS, RPC functions)"],
        ["Next.js API routes", "bKash create / callback / webhook"],
        ["Cron trigger", "FastAPI ML service (Python)"],
        ["FastAPI ML service", "Supabase Postgres"],
      ],
      note: "Derived from the repository structure: app routes, 42 SQL migrations and the ml-service package.",
    },
    decisions: [
      "Checkout and stock updates run as Postgres RPC functions that use row locks (FOR UPDATE), so concurrent orders cannot oversell.",
      "Row-level security policies are defined in the migrations for products, orders, profiles and related tables.",
      "The bKash webhook checks whether an order is already fulfilled before updating it, which makes repeated callbacks harmless.",
      "Autocomplete uses a trie cache. Recommendation code includes collaborative filtering, a product graph, and Thompson sampling (a Beta–Bernoulli bandit) to choose between recommendation strategies.",
      "Customer segmentation (k-means with scikit-learn) and demand forecasting (Holt–Winters with a moving-average baseline, evaluated by MAPE) run in a separate Python service.",
    ],
    contribution: "Individual project.",
    tech: ["Next.js 14", "TypeScript", "Supabase / PostgreSQL", "FastAPI", "scikit-learn", "NumPy", "bKash API"],
    evaluation:
      "No automated test suite is present in the repository. The forecasting job computes MAPE against held-back actuals, but no results are published, so none are reported here.",
    results: [],
    challenges: [
      "Several migrations exist specifically to make stock synchronisation and checkout atomic, which shows the concurrency design was revised more than once.",
    ],
    limitations: [
      "No automated tests.",
      "A Python virtual environment is committed to the repository and should be removed.",
      "Analytics and recommendation quality are not measured on real traffic.",
    ],
    future: ["Integration tests for checkout and payment callbacks", "Remove the committed virtual environment", "Offline evaluation of the recommendation strategies"],
    links: [
      { label: "Repository", href: repoTree("bushal") },
      { label: "Architecture notes", href: repoFile("bushal", "README.md") },
    ],
  },
  {
    slug: "relevia-app",
    title: "Relevia application",
    kind: "Privacy-aware web application · research testbed",
    status: "Active prototype",
    period: "April 2025 – present",
    summary:
      "A React application with breathing and grounding tools and a supportive chat that runs a language model locally through WebLLM (WebGPU). It is the testbed for the Relevia research project.",
    problem:
      "Local inference keeps conversation text off an inference server, but it does not make an application private by itself. Shared chat history, inconsistent expiry and optimistic privacy wording were all problems in the earlier version.",
    motivation:
      "I wanted the privacy and safety properties to come from the implementation rather than from statements in the interface.",
    objectives: [
      "Keep chats in memory by default; save only with explicit consent, with bounded retention",
      "Route recognised crisis language before inference",
      "Fall back to curated replies when local inference is unavailable",
    ],
    images: [
      { src: releviaApp, alt: "Relevia home page with a heart illustration and the heading 'Hey friend, You're SAFE here'", caption: "Live deployment, captured 20 November 2026.", width: 1440, height: 900 },
    ],
    decisions: [
      "Session-specific memory store by default. Saving is opt-in, has a 24-hour retention period, and is disabled automatically for a session once crisis context is recognised.",
      "A delete control clears chat records and personalisation, invalidates pending writes and reports when deletion is blocked.",
      "Device-selection logic chooses between configured model tiers, so device capability is treated as an engineering constraint.",
      "Speech starts disabled. The README documents the separate data flows for model downloads, analytics and speech.",
    ],
    contribution: "Individual project. Recent changes are agent-assisted and subject to my review, as the README states.",
    tech: ["React", "Vite", "WebLLM", "WebGPU", "IndexedDB", "Node test runner"],
    evaluation: "18 synthetic JavaScript tests cover storage, retention and deletion behaviour (as reported in the research milestone records).",
    results: ["The S2 safety-routing rules evaluated in the research project now run in the application."],
    challenges: ["Making deletion reliable when IndexedDB deletion is blocked by another open tab."],
    limitations: [
      "Saved chats are not encrypted and have no authentication; anyone sharing the browser profile can open them.",
      "Missed risk detections can leave sensitive text in an opted-in chat.",
      "No measurements on real devices yet for download size, latency or memory.",
      "Not clinically evaluated. Not a substitute for professional care or emergency services.",
    ],
    future: ["Real-device WebLLM benchmarks", "Broader safety coverage"],
    links: [
      { label: "Repository", href: repoTree("relevia") },
      { label: "Live prototype", href: "https://bushrakhandoker708.github.io/relevia/" },
      { label: "Research case study", href: "/research/relevia", internal: true },
    ],
  },
];

// Earlier work, listed compactly with no case-study page.
export const otherProjects = [
  {
    title: "StudyBuddy",
    year: "2025–26",
    summary: "React and Firebase study suite: session timers with an IndexedDB offline queue, flashcards, and notes with wiki-links rendered as a force-directed concept graph.",
    tech: ["React", "Firebase", "IndexedDB", "Canvas"],
    links: [
      { label: "Repository", href: repoTree("study-buddy") },
      { label: "Live", href: "https://study-buddy-seven-blush.vercel.app/" },
    ],
  },
  {
    title: "PhyCode",
    year: "2025–26",
    summary: "Next.js and TypeScript platform pairing algorithm problems with physics contexts; code is executed through a Judge0 API route.",
    tech: ["Next.js", "TypeScript", "Judge0", "Firebase Auth"],
    links: [{ label: "Repository", href: repoTree("PhyCode", "", "master") }],
  },
  {
    title: "Periodic table visualiser",
    year: "2024–25",
    summary: "Streamlit and Plotly app for filtering element data, plotting property trends against atomic number and exploring 3D relationships between properties.",
    tech: ["Python", "Streamlit", "Plotly", "pandas"],
    links: [{ label: "Repository", href: repoTree("periodic_table_visualizer") }],
  },
];

export const getProject = (slug) => projects.find((p) => p.slug === slug);
