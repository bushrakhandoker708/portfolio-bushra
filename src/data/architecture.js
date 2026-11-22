/*
 * Interactive architecture maps for the project pages and the Relevia research
 * page (components/ArchitectureMap.jsx).
 *
 * Every part, file path and link here was read from the repository at the
 * commit named in `commit`; nothing comes from design documents alone. Where
 * the code and a project's own notes disagree, the code wins and the part is
 * marked (state: "placeholder" or "retired").
 */

// The research repository is pinned once, with the evidence links on its story page.
import { RESEARCH_COMMIT } from "./research";

// The wine-quality study is one notebook; its parts are sections of it.
const WINE = "56da665b4fe1af04eab4fefb54d698e66b9b2e6a";
const NB = "wine_quality_classification.ipynb";

const STUDYBUDDY = "4de5332ca0067782b3ffbdd60dd0f5830676fac5";
const STUDYBUDDY_PYODIDE = "2de20784301e72bb015e18ea1437aa562c82ceea";
const BUSHAL = "b518e0e8fcf90ad4dabd493076d82b6c5cf990cc";
const RELEVIA = "7c9040a235404ea84826ca4a1f4f457961b459f7";
const HEXALOCK = "c4fac2d03d59c598559fd0eac9d240709da58401";

export const architectures = {
  studybuddy: {
    repo: "study-buddy",
    commit: STUDYBUDDY,
    layers: [
      { id: "pages", label: "Pages" },
      { id: "engine", label: "Graphing engine" },
      { id: "browser", label: "In the browser" },
      { id: "libs", label: "Libraries and services" },
    ],
    nodes: [
      {
        id: "app",
        layer: "pages",
        label: "App shell and routes",
        files: ["src/App.jsx"],
        detail:
          "Routes for the study tools (notes, flash cards, study sessions, habit and mastery trackers) and the two graphing pages. Every tool, the graphing pages included, sits behind a sign-in check.",
      },
      {
        id: "plot",
        layer: "pages",
        label: "2D graphing page",
        files: ["src/pages/PlotGraph.jsx"],
        detail:
          "The equation list and plot settings. For each equation it asks useEquationCAS for an analysis, then hands the equation and that analysis to the trace generator.",
      },
      {
        id: "three",
        layer: "pages",
        label: "3D graphing page",
        files: ["src/pages/3D.jsx"],
        detail:
          "Surfaces and implicit plots. With curvature switched on (the C key), it computes the Gaussian curvature at every grid point with central differences, h = 10⁻⁴, and colours the surface by it.",
      },
      {
        id: "insights",
        layer: "pages",
        label: "Insight badges",
        files: ["src/components/graphing/MathInsights.jsx"],
        detail:
          "Shows what the analysis found, for example “↕ 3 vert. asym.”, and labels where it came from: Numeric, or SymPy once the worker has answered.",
      },
      {
        id: "hook",
        layer: "engine",
        label: "useEquationCAS",
        files: ["src/hooks/useCAS.js"],
        detail:
          "Runs a numeric scan with mathjs straight away: 400 samples from −10 to 10, a vertical asymptote wherever neighbouring values flip sign and jump by more than 80, critical points where the slope changes sign, and a symmetry check. When the worker answers, its result replaces this one and is labelled SymPy.",
      },
      {
        id: "trace",
        layer: "engine",
        label: "Trace generator",
        files: ["src/services/casTraceGenerator.js"],
        detail:
          "Samples 2,000 points across the view and writes null within two steps of each known vertical asymptote, so the line breaks there instead of joining the branches. Adds dashed asymptote lines and markers for maxima and minima.",
      },
      {
        id: "manager",
        layer: "engine",
        label: "CAS manager",
        files: ["src/services/casManager.js"],
        detail:
          "Starts the Web Worker, tracks its status (loading, ready, error), matches each reply to its request by id, and checks the cache before asking.",
      },
      {
        id: "cache",
        layer: "browser",
        label: "Analysis cache",
        files: ["src/services/casCache.js"],
        detail:
          "An IndexedDB store, StudyBuddyCAS, that keeps each analysis keyed by mode, variable and expression, so a repeat visit needs no recomputation.",
      },
      {
        id: "worker",
        layer: "browser",
        label: "CAS worker",
        state: "placeholder",
        files: [
          "src/workers/Cas.worker.js",
          { path: "src/workers/Cas.worker.js", commit: STUDYBUDDY_PYODIDE, label: "The Pyodide and SymPy version (commit 2de2078)" },
        ],
        detail:
          "At this commit the worker is a placeholder: it reports ready straight away and answers every request with empty lists. The version I first wrote loaded Pyodide 0.25 from a CDN, installed SymPy and ran the analysis in Python. It was replaced on 30 May 2026 while I fixed other bugs, and restoring it is open work.",
      },
      {
        id: "mathjs",
        layer: "libs",
        label: "mathjs",
        detail: "Parses and evaluates expressions, for the numeric scan and for every plotted sample.",
      },
      {
        id: "plotly",
        layer: "libs",
        label: "Plotly.js",
        detail: "Draws the 2D and 3D plots. A null value becomes a gap in a line, which is what makes the asymptote breaks possible.",
      },
      {
        id: "firebase",
        layer: "libs",
        label: "Firebase",
        files: ["src/components/firebase.js"],
        detail: "Authentication, plus Firestore and Storage for the study tools.",
      },
    ],
    edges: [
      { from: "app", to: "firebase", label: "checks who is signed in before showing any tool" },
      { from: "plot", to: "hook", label: "each equation's expression" },
      { from: "plot", to: "trace", label: "the equation and its analysis" },
      { from: "hook", to: "insights", label: "the analysis and where it came from" },
      { from: "hook", to: "mathjs", label: "numeric scan" },
      { from: "hook", to: "manager", label: "asks for a full analysis once the worker is ready" },
      { from: "manager", to: "cache", label: "looks up first, stores after" },
      { from: "manager", to: "worker", label: "request and reply, matched by id" },
      { from: "trace", to: "mathjs", label: "evaluates 2,000 samples" },
      { from: "trace", to: "plotly", label: "traces with null gaps, asymptote lines and markers" },
      { from: "three", to: "plotly", label: "surfaces, coloured by curvature when it is on" },
    ],
    flows: [
      {
        id: "tan",
        label: "Plot tan(x)",
        steps: [
          { node: "plot", text: "You type tan(x). The page hands the expression to useEquationCAS." },
          {
            node: "hook",
            text: "A numeric scan runs at once with mathjs. Wherever neighbouring samples flip sign and jump by more than 80, it marks a vertical asymptote.",
          },
          {
            node: "trace",
            text: "The trace generator samples 2,000 points and writes null beside each marked asymptote, so the line breaks there instead of joining the branches.",
          },
          { node: "plotly", text: "Plotly draws the broken curve, with a dashed line at each asymptote." },
          { node: "trace", text: "That was the fast path. Meanwhile, the hook has also asked for a full analysis." },
          { node: "hook", text: "It sends the expression to the CAS manager." },
          { node: "manager", text: "The manager checks the IndexedDB cache first." },
          {
            node: "cache",
            text: "Nothing is cached for this expression yet, so the request goes on to the worker. Its answer will be stored under the expression.",
          },
          { node: "manager", text: "The request goes to the worker, tagged with an id." },
          {
            node: "worker",
            text: "At this commit the worker is a placeholder and answers with empty lists. In the code, that answer then replaces the numeric one, so the marked asymptotes would be dropped; I have not yet confirmed this in the running app. Restoring the SymPy worker, and keeping the numeric result when an answer is empty, is the fix.",
          },
        ],
      },
      {
        id: "surface",
        label: "Colour a surface by curvature",
        steps: [
          {
            node: "three",
            text: "On the 3D page, pressing C switches curvature on. At every grid point the page computes K = (f_xx f_yy − f_xy²) / (1 + f_x² + f_y²)² with central differences and h = 10⁻⁴.",
          },
          { node: "plotly", text: "Plotly colours the surface by K, from blue through green to red, with a colour bar." },
        ],
      },
    ],
  },

  bushal: {
    repo: "bushal",
    commit: BUSHAL,
    layers: [
      { id: "people", label: "Who uses it" },
      { id: "next", label: "Next.js app on Vercel" },
      { id: "data", label: "Data" },
      { id: "outside", label: "Separate services" },
    ],
    nodes: [
      {
        id: "store",
        layer: "people",
        label: "Storefront",
        files: ["app/(customer)/"],
        detail:
          "Product pages, cart, checkout, orders, wishlist and comparison, in the App Router's (customer) route group. Checkout needs a signed-in customer.",
      },
      {
        id: "admin",
        layer: "people",
        label: "Admin dashboard",
        files: ["app/(admin)/admin/"],
        detail:
          "Products, orders, categories, comments and restocking, plus the analytics pages: customer segments, demand forecasts and ML health. Its layout checks the signed-in account's role on the server and sends anyone who is not an admin away.",
      },
      {
        id: "mw",
        layer: "next",
        label: "Middleware",
        files: ["middleware.ts"],
        detail:
          "Runs on every page and API request. It refreshes the Supabase session, sends signed-out visitors from /checkout and /admin to the login page, and limits login, registration and payment creation to 10 requests a minute per IP address. If Redis is unreachable, it lets requests through.",
      },
      {
        id: "orders",
        layer: "next",
        label: "Orders API",
        files: ["app/api/orders/route.ts", "app/api/orders/[id]/route.ts"],
        detail:
          "Creates orders through one database function, create_order_with_stock_check, which locks the product rows while it checks stock (migration 043), and updates an order's status.",
      },
      {
        id: "pay",
        layer: "next",
        label: "bKash payment routes",
        files: [
          "app/api/bkash/create/route.ts",
          "app/api/bkash/callback/route.ts",
          "app/api/webhooks/bkash/route.ts",
          "lib/bkash/index.ts",
        ],
        detail:
          "Create the order and a bKash payment, then handle bKash's callback and webhook. When the payment executes successfully, confirm_order_and_reduce_stock reduces stock once for that order, and confirmation emails go to the customer and the admin.",
      },
      {
        id: "search",
        layer: "next",
        label: "Search API",
        files: ["app/api/search/autocomplete/route.ts", "app/api/products/search/route.ts", "lib/search/trie.ts"],
        detail:
          "Suggestions as you type, matched with a trie over product names and cached in Redis: 5 minutes for a prefix, 24 hours for an exact query.",
      },
      {
        id: "insight",
        layer: "next",
        label: "Recommendations and analytics APIs",
        files: ["app/api/recommendations/", "app/api/analytics/", "lib/recommendations/thompsonSampling.ts"],
        detail:
          "Recommendations (frequently bought together, similar products, picks for a customer) and the admin analytics, read from Postgres functions and the tables the ML service fills. Tracked impressions, clicks and purchases update a Thompson-sampling choice between recommendation models.",
      },
      {
        id: "cron",
        layer: "next",
        label: "Nightly trigger",
        files: ["app/api/cron/trigger-ml/route.ts", "vercel.json"],
        detail: "A Vercel cron job at 02:00 UTC every day calls the ML service's /run-pipeline endpoint with a shared secret.",
      },
      {
        id: "db",
        layer: "data",
        label: "Supabase Postgres",
        files: ["supabase/migrations/"],
        detail:
          "Products, orders, profiles and comments, with row-level security. The stock rules live in SQL functions, and 42 migrations show the schema and those rules being revised over time.",
      },
      {
        id: "redis",
        layer: "data",
        label: "Upstash Redis",
        files: ["lib/redis.ts"],
        detail: "Rate-limit counters, the bKash access token and cached search suggestions.",
      },
      {
        id: "bkash",
        layer: "outside",
        label: "bKash",
        state: "external",
        detail:
          "The mobile payment gateway. Bushal creates and executes payments through its API and hears the result by callback and webhook.",
      },
      {
        id: "resend",
        layer: "outside",
        label: "Resend",
        state: "external",
        files: ["lib/email/index.ts", "lib/email/templates.ts"],
        detail: "Sends the order emails: confirmation to the customer, a notification to the admin, and status updates.",
      },
      {
        id: "ml",
        layer: "outside",
        label: "FastAPI ML service",
        files: ["ml-service/main.py", "ml-service/tasks/"],
        detail:
          "A separate Python service with one job endpoint, /run-pipeline. It runs six tasks in turn (customer segmentation, demand forecasting, product recommendations, drift detection, business automation and search-cache warming), reading and writing Postgres directly.",
      },
    ],
    edges: [
      { from: "store", to: "mw", label: "every request" },
      { from: "admin", to: "mw", label: "every request" },
      { from: "mw", to: "db", label: "refreshes the session" },
      { from: "mw", to: "redis", label: "rate-limit counters" },
      { from: "store", to: "orders", label: "places an order" },
      { from: "store", to: "pay", label: "pays with bKash" },
      { from: "store", to: "search", label: "searches as the customer types" },
      { from: "store", to: "insight", label: "recommendations" },
      { from: "admin", to: "insight", label: "analytics" },
      { from: "orders", to: "db", label: "create_order_with_stock_check" },
      { from: "orders", to: "resend", label: "order emails" },
      { from: "pay", to: "db", label: "creates the order; confirm_order_and_reduce_stock" },
      { from: "pay", to: "redis", label: "cached bKash token" },
      { from: "pay", to: "bkash", label: "creates and executes the payment" },
      { from: "pay", to: "resend", label: "confirmation emails" },
      { from: "search", to: "redis", label: "cached suggestions" },
      { from: "search", to: "db", label: "product names" },
      { from: "insight", to: "db", label: "SQL functions and ML results" },
      { from: "cron", to: "ml", label: "POST /run-pipeline" },
      { from: "ml", to: "db", label: "reads orders and products, writes results" },
      { from: "ml", to: "search", label: "warms the search cache" },
    ],
    flows: [
      {
        id: "pay",
        label: "Pay with bKash",
        steps: [
          { node: "store", text: "At checkout the customer chooses bKash." },
          { node: "mw", text: "The middleware checks that they are signed in, and that payment creation is within its rate limit." },
          {
            node: "pay",
            text: "The create route makes the order with create_order_with_stock_check, which locks the product rows while it checks stock.",
          },
          { node: "db", text: "The order is stored. Stock is not reduced yet: a placed order is not yet a sale." },
          { node: "pay", text: "The route asks bKash for a payment, using the access token cached in Redis." },
          { node: "bkash", text: "The customer approves the payment in bKash, and bKash calls back." },
          { node: "pay", text: "The callback executes the payment. Only if bKash reports it completed does the order move on." },
          {
            node: "db",
            text: "confirm_order_and_reduce_stock reduces the stock once. The order's inventory_reduced flag makes a repeated confirmation do nothing.",
          },
          { node: "pay", text: "Then the emails go out." },
          { node: "resend", text: "The customer gets an order confirmation and the admin a notification." },
        ],
      },
      {
        id: "nightly",
        label: "Nightly ML run",
        steps: [
          { node: "cron", text: "At 02:00 UTC, Vercel's cron calls the trigger route." },
          {
            node: "ml",
            text: "The route calls /run-pipeline with the shared secret, and the service runs its six tasks one after another.",
          },
          {
            node: "db",
            text: "Each task reads orders and products and writes its results back, for the admin pages and recommendations to read.",
          },
          { node: "ml", text: "The last task warms the search cache." },
          { node: "search", text: "It requests common prefixes from the search API…" },
          { node: "redis", text: "…so their suggestions are already cached when customers arrive." },
        ],
      },
      {
        id: "search",
        label: "Search as you type",
        steps: [
          { node: "store", text: "The customer types the first letters of a product name." },
          { node: "search", text: "The search API checks Redis first." },
          { node: "redis", text: "A cached answer returns at once." },
          { node: "search", text: "On a miss, it goes to the database." },
          { node: "db", text: "Product names are read, matched with the trie and cached for next time." },
        ],
      },
    ],
  },

  "relevia-app": {
    repo: "relevia",
    commit: RELEVIA,
    layers: [
      { id: "ui", label: "Interface" },
      { id: "core", label: "Reply pipeline" },
      { id: "checks", label: "Checks, memory and fallbacks" },
      { id: "model", label: "The model" },
    ],
    nodes: [
      {
        id: "chat",
        layer: "ui",
        label: "Chat window",
        files: ["src/components/Chatbot.jsx"],
        detail:
          "Where the conversation happens. A reply appears a sentence at a time, once each sentence has been checked, and while the model downloads the window says how far it has got.",
      },
      {
        id: "coping",
        layer: "ui",
        label: "Coping tools",
        files: ["src/components/CopingTechniques/", "src/pages/Coping.jsx"],
        detail:
          "Breathing, mindfulness, relaxation, visualisation, affirmations, activity and journaling: fixed exercises that need no model at all.",
      },
      {
        id: "privacy",
        layer: "ui",
        label: "Privacy controls",
        files: ["src/components/ChatPrivacy.jsx"],
        detail:
          "Saving is off unless the user turns it on. Delete clears saved chats and the remembered name, and says so if deletion is blocked.",
      },
      {
        id: "brain",
        layer: "core",
        label: "think()",
        files: ["src/services/releviaBrain.js"],
        detail:
          "Decides how each message is answered: the safety router first, then the recent history, then the model if it is ready within 4 seconds, with the reply guard on everything it writes, and otherwise an offline reply.",
      },
      {
        id: "guard",
        layer: "core",
        label: "Reply guard (G3)",
        files: ["src/services/replyGuard.js", "src/services/releasePolicy.js", "tests/reply-guard.test.js", "tests/release-policy.test.js"],
        detail:
          "Checks what the model writes, because routing only reads the user. While a reply streams, only finished sentences that pass are shown (release policy R2). At the end, a refusal to talk about a death or feelings is replaced, and an unverified phone number or service is removed. Keyword rules: they do not understand meaning.",
      },
      {
        id: "safety",
        layer: "checks",
        label: "Safety router (S3)",
        files: ["src/services/safetyS3.js", "src/services/safety.js", "tests/safety-s3.test.js"],
        detail:
          "Reads every message, with the last few turns, before anything else. Something already taken or done gets a fixed emergency message naming 999, 112 and 911; urgent risk gets a fixed urgent-support reply; an ambiguous message gets a check-in question. In all three the model is never called. S3 builds on the S2 text normalisation in safety.js; both are measured in my research.",
      },
      {
        id: "offline",
        layer: "checks",
        label: "Offline replies",
        files: ["src/services/memoryUtils.js"],
        detail: "Tone detection and prepared replies, used while the model is still loading or if it fails.",
      },
      {
        id: "journal",
        layer: "checks",
        label: "Journal store",
        files: ["src/services/journalStore.js", "src/components/CopingTechniques/Journaling.jsx"],
        detail:
          "Journal entries, the draft and settings stay in memory until the person chooses “Keep on this device”. Only then are they written to localStorage, and every write reports whether it worked.",
      },
      {
        id: "chooser",
        layer: "checks",
        label: "Model chooser",
        files: ["src/services/modelConfig.js"],
        detail:
          "Picks a model the device can run, from its WebGPU features and reported memory: Llama-3.2-3B (a 1.8 GB download), Llama-3.2-1B (0.7 GB) or Qwen2.5-0.5B (0.3 GB), all 4-bit. First visits start on the 1B.",
      },
      {
        id: "store",
        layer: "checks",
        label: "Chat store",
        files: ["src/services/chatStorage.js", "tests/storage.test.js"],
        detail:
          "Keeps the chat in memory. Only if the user opts in is it saved, to localStorage and for 24 hours. A chat that touched crisis language is never saved.",
      },
      {
        id: "worker",
        layer: "model",
        label: "WebLLM worker",
        files: ["src/services/llmWorker.js"],
        detail:
          "Runs the model on the GPU through WebGPU, inside a Web Worker so the page stays responsive. Replies are capped at 110 tokens.",
      },
      {
        id: "weights",
        layer: "model",
        label: "Model files",
        state: "external",
        detail:
          "Downloaded once by WebLLM from Hugging Face and then cached by the browser. Only the model comes down; no message goes up.",
      },
      {
        id: "cloud",
        layer: "model",
        label: "Cloud API (Groq)",
        state: "retired",
        files: ["src/services/groqApi.js"],
        detail:
          "An earlier version sent messages to a hosted model. It is retired: the function now throws “Cloud inference is disabled”, and nothing calls it.",
      },
    ],
    edges: [
      { from: "chat", to: "brain", label: "each message" },
      { from: "coping", to: "journal", label: "journal entries" },
      { from: "brain", to: "guard", label: "every streamed piece, then the whole reply" },
      { from: "guard", to: "chat", label: "only checked sentences" },
      { from: "privacy", to: "store", label: "turns saving on or off; deletes" },
      { from: "brain", to: "safety", label: "checks every message first" },
      { from: "brain", to: "store", label: "reads recent turns; marks a chat sensitive" },
      { from: "brain", to: "offline", label: "if the model is not ready within 4 s" },
      { from: "brain", to: "chooser", label: "which model for this device" },
      { from: "chooser", to: "worker", label: "loads the chosen model" },
      { from: "brain", to: "worker", label: "the prompt; a streamed reply" },
      { from: "worker", to: "weights", label: "downloads once, then cached" },
    ],
    flows: [
      {
        id: "ordinary",
        label: "An ordinary message",
        steps: [
          { node: "chat", text: "You write a message." },
          { node: "brain", text: "think() receives it." },
          { node: "safety", text: "No crisis language, so it carries on." },
          { node: "brain", text: "It builds the prompt." },
          { node: "store", text: "The last few turns are read from memory." },
          { node: "brain", text: "The prompt goes to the model." },
          { node: "worker", text: "The model writes a reply on the GPU, up to 110 tokens." },
          { node: "guard", text: "As it streams, only finished sentences that pass the check are let through." },
          { node: "chat", text: "The reply appears a sentence at a time." },
          { node: "guard", text: "The whole reply is checked once more before it is kept." },
        ],
      },
      {
        id: "crisis",
        label: "A message about an emergency",
        steps: [
          { node: "chat", text: "A message says something has already been taken." },
          { node: "brain", text: "think() runs the safety router before anything else, with the last few turns." },
          { node: "safety", text: "S3 finds an emergency. A fixed message is chosen, and the model is never called." },
          { node: "brain", text: "Before replying, it records the turn." },
          { node: "store", text: "The chat is marked sensitive, so it will not be saved, even if saving was on." },
          {
            node: "chat",
            text: "The fixed message is shown: call 999 in the UK, 112 in the EU, 911 in the US and Canada; say what was taken and keep the packet. It says it is an AI and cannot call anyone.",
          },
        ],
      },
      {
        id: "ambiguous",
        label: "An ambiguous message",
        steps: [
          { node: "chat", text: "A message could mean distress or danger, and it is not clear which." },
          { node: "brain", text: "think() runs the safety router first." },
          {
            node: "safety",
            text: "Not clearly urgent and not clearly fine, so S3 asks instead of assuming: is anyone in immediate danger?",
          },
          { node: "store", text: "The chat is marked sensitive and will not be saved." },
          { node: "chat", text: "The check-in question is shown, even while the model is still downloading." },
        ],
      },
      {
        id: "first",
        label: "First visit",
        steps: [
          { node: "chat", text: "The chat opens. No model is downloaded yet." },
          { node: "brain", text: "think() asks for a model." },
          {
            node: "chooser",
            text: "The device is checked: WebGPU, the shader-f16 feature and reported memory. Even a strong device starts on the 1B model.",
          },
          { node: "worker", text: "WebLLM starts loading the 0.7 GB model in a Web Worker." },
          { node: "weights", text: "The files are downloaded once and cached by the browser." },
          { node: "brain", text: "Messages sent meanwhile do not wait for it." },
          { node: "offline", text: "They get offline replies that say how far the download has got." },
        ],
      },
    ],
  },

  // Not a project story: the map on the Relevia research page.
  "relevia-research": {
    repo: "relevia-research",
    commit: RESEARCH_COMMIT,
    stateLabels: { external: "Runs in the app", planned: "Not run yet" },
    layers: [
      { id: "inputs", label: "Data and frozen inputs" },
      { id: "runs", label: "Runs" },
      { id: "checks", label: "Safety and release checks" },
      { id: "record", label: "Analysis and record" },
    ],
    nodes: [
      {
        id: "partitions",
        layer: "inputs",
        label: "Conversation partitions",
        files: ["data/build_dataset.py", "src/splits.py", "scripts/check_leakage.py"],
        detail:
          "Splits EmpatheticDialogues by whole conversation into train, development, few-shot, validation and two test sets, and fails if any conversation lands in two of them. The dataset is CC BY-NC 4.0, so it is never committed.",
      },
      {
        id: "scenarios",
        layer: "inputs",
        label: "Synthetic scenarios",
        files: ["data/experiment_01/", "data/experiment_01_expanded/"],
        detail:
          "The prompting study's inputs: short supportive-dialogue scenarios written for it, released as CC0 and reviewed by a coding agent, not by clinicians. The runner rejects any file outside the reviewed folder, and any row without that record.",
      },
      {
        id: "freeze",
        layer: "inputs",
        label: "Frozen configuration",
        files: ["configs/experiment_01.freeze.json", "configs/expanded.freeze.json", "configs/prompts.yaml"],
        detail:
          "The model revision, prompts A and B, the rubric and the runner, hashed before any test output exists. A run stops if any frozen file has changed.",
      },
      {
        id: "safetysets",
        layer: "inputs",
        label: "Frozen safety sets",
        files: ["data/safety_v3/", "data/safety_v4/"],
        detail:
          "Urgent, ordinary and ambiguous test messages, each set hashed before the rules it tests were written. The same coding agent wrote the messages and the rules, so they are development evidence.",
      },
      {
        id: "runner",
        layer: "runs",
        label: "Paired runner",
        files: ["scripts/experiment_01.py", "scripts/controlled_inference.py"],
        detail:
          "Generates prompt A and prompt B for every scenario on the pinned Qwen2.5-1.5B, offline on the CPU, with the same seed and greedy decoding, and records time to first token, decode rate and token counts. It never trains.",
      },
      {
        id: "lora",
        layer: "runs",
        label: "LoRA pilot",
        state: "planned",
        files: ["scripts/lora_pilot.py", "results/lora/smoke-v1/"],
        detail:
          "Condition C: the same base model and prompt B plus an adapter, trained only on the audited partitions. The real pilot refuses to start without my recorded approval; only a four-step smoke test of the pipeline has run.",
      },
      {
        id: "browser",
        layer: "runs",
        label: "Browser benchmark",
        state: "external",
        files: ["docs/browser_benchmark_protocol.md", "results/performance/browser-v1-intel/"],
        detail:
          "The harness lives in the app and is not imported by the public chat. It times Llama-3.2-1B in WebLLM from start-up to the last streamed chunk, with a fixed synthetic input. One run so far, on one laptop's integrated GPU; its report is kept here.",
      },
      {
        id: "detectors",
        layer: "checks",
        label: "Frozen detectors",
        files: ["detectors/README.md", "detectors/s2/", "detectors/s3/"],
        detail:
          "Copies of the app's routing rules at each freeze, byte for byte apart from one import path, so an old result can still be reproduced after the app moves on. The code of S3's first run was not saved; its hash and outputs are the record.",
      },
      {
        id: "evaluate",
        layer: "checks",
        label: "Routing evaluation",
        files: ["scripts/evaluate_safety_s2.mjs", "scripts/evaluate_safety_s3.mjs"],
        detail:
          "Runs every version of the rules over a frozen set and writes confusion matrices with Wilson intervals. A rule changed after its first held-out run is reported as post hoc, never quietly re-run.",
      },
      {
        id: "scan",
        layer: "checks",
        label: "Over-routing scan",
        files: ["scripts/scan_s3_false_alarms.mjs"],
        detail:
          "Runs S3 over human-written EmpatheticDialogues prompts it was not tuned on and keeps only IDs and counts. It finds false alarms; it cannot find missed risk.",
      },
      {
        id: "guardaudit",
        layer: "checks",
        label: "Reply-guard audit",
        files: ["scripts/audit_reply_guard.mjs", "detectors/guard_g2/"],
        detail:
          "Runs G1, G2 and the app's G3 over all 218 saved model replies, and streams each reply word by word to measure how long text is held back. The replies were read while the guard was written, so this is development evidence.",
      },
      {
        id: "replay",
        layer: "checks",
        label: "Release replay",
        files: ["scripts/simulate_traces.mjs", "scripts/replay_release.mjs", "detectors/release_v1/"],
        detail:
          "Sends the same reply streams through release policies R0 to R3 and measures what a person would have seen, and when. Measuring unsafe text on screen needs labelled spans, which do not exist yet.",
      },
      {
        id: "analysis",
        layer: "record",
        label: "Paired analysis",
        files: ["scripts/analyse_experiment_01.py", "scripts/analyse_robustness.py"],
        detail:
          "Group-bootstrap intervals for paired differences, Wilson intervals for proportions, and the robustness checks that found the standby confound. A missing rating is never filled in.",
      },
      {
        id: "review",
        layer: "record",
        label: "Independent review",
        state: "planned",
        files: ["scripts/prepare_independent_review.py", "scripts/analyse_independent_ratings.py"],
        detail:
          "Exports two blank rating packets, each shuffled separately, and analyses only the scores that come back. None have yet: 0 of 120 replies are rated.",
      },
      {
        id: "results",
        layer: "record",
        label: "Results and claims",
        files: ["results/", "paper/claim_evidence_matrix.md"],
        detail:
          "Every number on this site is copied from a file here at a pinned commit, and the claim–evidence matrix ties each claim to its file.",
      },
      {
        id: "privacy",
        layer: "record",
        label: "Privacy scan",
        files: ["scripts/privacy_scan.py", ".githooks/pre-commit"],
        detail:
          "Checks staged changes and every tracked file for credentials and personal details, before each commit and in CI. A pass is not proof that nothing private remains.",
      },
    ],
    edges: [
      { from: "scenarios", to: "runner", label: "only the reviewed folder" },
      { from: "freeze", to: "runner", label: "stops if a hash has changed" },
      { from: "partitions", to: "lora", label: "trains on audited partitions only" },
      { from: "lora", to: "runner", label: "condition C, once trained" },
      { from: "runner", to: "analysis", label: "paired replies and timings" },
      { from: "runner", to: "review", label: "replies to rate" },
      { from: "review", to: "analysis", label: "scores, when they come back" },
      { from: "runner", to: "guardaudit", label: "saved replies" },
      { from: "safetysets", to: "evaluate", label: "frozen messages" },
      { from: "detectors", to: "evaluate", label: "the rules under test" },
      { from: "detectors", to: "scan", label: "S3" },
      { from: "browser", to: "replay", label: "the measured decode rate" },
      { from: "guardaudit", to: "replay", label: "G3, frozen" },
      { from: "evaluate", to: "results", label: "matrices and intervals" },
      { from: "scan", to: "results", label: "IDs and counts only" },
      { from: "replay", to: "results", label: "waiting times" },
      { from: "analysis", to: "results", label: "intervals" },
      { from: "privacy", to: "results", label: "checks every commit" },
    ],
    flows: [
      {
        id: "prompting",
        label: "A prompting comparison",
        steps: [
          {
            node: "freeze",
            text: "Before any test output exists, the model revision, both prompts, the rubric and the runner are hashed.",
          },
          { node: "scenarios", text: "The held-out scenarios are read from the one reviewed folder; anything else is refused." },
          {
            node: "runner",
            text: "A and B are generated for every scenario on the same pinned model, seed and decoding, with every timing recorded.",
          },
          {
            node: "analysis",
            text: "On 8 scenarios, relevance differed by +0.125, from −0.875 to +1.125: no evidence either way, from an agent that knew which prompt was which.",
          },
          {
            node: "analysis",
            text: "In the 60-pair timing run, two pairs ran while the laptop was in standby. Without them, B's 19-second lead shrinks to about 3.",
          },
          {
            node: "review",
            text: "Blank packets for two human raters, each shuffled separately. None have come back: 0 of 120 replies are rated.",
          },
          { node: "results", text: "The inconclusive result is committed as it is, with the hashes of everything that produced it." },
        ],
      },
      {
        id: "rule",
        label: "Testing a new safety rule",
        steps: [
          { node: "safetysets", text: "New urgent, ordinary and ambiguous messages are written and hashed before the new rule exists." },
          { node: "detectors", text: "The new rules are copied from the app, byte for byte, into a folder of their own." },
          {
            node: "evaluate",
            text: "Every version runs over the frozen set. On its first run, S3 caught 43 of 46 urgent messages; later fixes count as post hoc.",
          },
          { node: "scan", text: "S3 then reads 2,873 human-written prompts it was never tuned on, and raises one false alarm." },
          {
            node: "results",
            text: "Matrices, intervals and misses are committed, with the caveat that one coding agent wrote both the messages and the rules.",
          },
        ],
      },
      {
        id: "release",
        label: "When may a reply be shown?",
        steps: [
          { node: "runner", text: "The saved model replies are the starting material." },
          {
            node: "guardaudit",
            text: "G1, G2 and G3 run over all 218 replies. Streamed word by word, G3 holds the first text back to a median of 2.55 s.",
          },
          { node: "browser", text: "The one browser run supplies a real decode rate: about 5.6 tokens a second." },
          {
            node: "replay",
            text: "Simulated streams at that rate go through R0 to R3. With no labelled unsafe spans, only the waiting can be measured.",
          },
          { node: "results", text: "The study protocol fixes in advance the result that would reject my own proposed policy." },
        ],
      },
    ],
  },

  // Not a project story: the map on the ML Lab's wine-quality page.
  "wine-quality": {
    repo: "wine-quality-classification",
    commit: WINE,
    modelFile: NB,
    note: "The whole study is one notebook, so each part names the notebook section it lives in.",
    layers: [
      { id: "data", label: "Data" },
      { id: "protocol", label: "The shared protocol" },
      { id: "models", label: "Models" },
      { id: "evaluation", label: "Evaluation" },
    ],
    nodes: [
      {
        id: "csv",
        layer: "data",
        label: "White-wine data",
        files: ["winequality-white.csv", "winequality.names"],
        detail:
          "4,898 Portuguese Vinho Verde white wines from the UCI repository, each with 11 lab measurements and a quality score: the median of at least three experts' grades from 0 to 10.",
      },
      {
        id: "label",
        layer: "data",
        label: "Good or poor",
        where: ["§5 Create a binary target"],
        detail:
          "Scores of 6 and above become 'good', the rest 'poor', so about two wines in three are good. The cost is written down: a 6 and a 9 now get the same label.",
      },
      {
        id: "dedupe",
        layer: "data",
        label: "Duplicates removed",
        where: ["§6 iii Class imbalance and duplicates"],
        detail:
          "937 rows are exact copies. Keeping them could put the same wine on both sides of the split, so they go and 3,961 remain. No identical measurements carry different labels, and the class balance barely moves.",
      },
      {
        id: "eda",
        layer: "data",
        label: "Exploratory checks",
        where: ["§6 i Kernel density estimation", "§6 ii Correlation analysis"],
        detail:
          "Density plots and correlations with the label. Alcohol is the strongest (0.40 without duplicates). The correlations were first computed on all rows, then checked again once the duplicates were gone.",
      },
      {
        id: "split",
        layer: "protocol",
        label: "Stratified split",
        where: ["§7 Train-test split"],
        detail:
          "70% to learn from, 30% held out, stratified by class: 2,772 and 1,189 wines, with poor-quality shares 0.04 points apart. The notebook asserts that no row is in both.",
      },
      {
        id: "pipeline",
        layer: "protocol",
        label: "Scaler inside the pipeline",
        where: ["§8 Model implementation"],
        detail:
          "Every model is a pipeline of a StandardScaler and the classifier, so during tuning the scaler is refitted on the training folds alone and held-out data never shapes the scaling.",
      },
      {
        id: "cv",
        layer: "protocol",
        label: "Five-fold tuning",
        where: ["§8.1 k-NN (the folds)", "§8.2 SVM (the same folds, reused)"],
        detail:
          "Stratified five-fold cross-validation with a fixed seed, the same folds for k-NN and the SVM, scored on F1 for the good class. Balanced accuracy and poor-class recall are reported beside it.",
      },
      {
        id: "knn",
        layer: "models",
        label: "k-nearest neighbours",
        where: ["§8.1 k-NN"],
        detail:
          "Classifies a wine by its nearest neighbours in the training data. k from 1 to 20 was tried; k = 13 won, with a mean CV F1 of 0.8276.",
      },
      {
        id: "svm",
        layer: "models",
        label: "Support vector machine",
        where: ["§8.2 SVM"],
        detail:
          "35 settings across linear, polynomial and RBF kernels. The RBF kernel with C = 1 and gamma = 0.1 won at a mean CV F1 of 0.8333, 0.0058 ahead of k-NN: less than the fold-to-fold spread.",
      },
      {
        id: "lda",
        layer: "models",
        label: "Linear discriminant analysis",
        where: ["§8.3 LDA"],
        detail:
          "One Gaussian per class with a shared covariance, so the boundary is a plane. Nothing was tuned; five-fold CV gives F1 0.8218 but finds only 52% of the poor wines.",
      },
      {
        id: "boundaries",
        layer: "models",
        label: "Two-feature pictures",
        where: ["§7 Helper: two-feature decision-boundary plot", "§8.3 LDA prior visualisation"],
        detail:
          "Copies of each model refitted on alcohol and volatile acidity alone, with the 11-feature settings, so the boundaries can be drawn. They illustrate; their accuracies are not the results.",
      },
      {
        id: "baseline",
        layer: "evaluation",
        label: "Majority baseline",
        where: ["§9 Model evaluation on the test set"],
        detail:
          "Always answers 'good'. It reaches 65.94% accuracy and an F1 of 0.7947 without finding a single poor wine, which is why F1 alone is never the headline.",
      },
      {
        id: "test",
        layer: "evaluation",
        label: "Test-set scores",
        files: ["assets/confusion-matrices.png"],
        where: ["§9 Model evaluation on the test set"],
        detail:
          "The held-out wines are scored once, for every model, on accuracy, precision, recall, F1, poor-class recall and balanced accuracy, with a confusion matrix each. The RBF SVM is the best of the three on every measure except good-class recall.",
      },
      {
        id: "curves",
        layer: "evaluation",
        label: "ROC and precision–recall",
        files: ["assets/roc-pr-curves.png"],
        where: ["§9 ROC and precision-recall curves"],
        detail:
          "Threshold-free comparison on the same test set: ROC AUC 0.83 for the RBF SVM, 0.81 for k-NN and 0.80 for LDA; average precision 0.90, 0.87 and 0.88.",
      },
      {
        id: "errors",
        layer: "evaluation",
        label: "Errors by original score",
        where: ["§9 SVM error analysis by original quality score"],
        detail:
          "The RBF SVM's test errors grouped by the score each wine had before the cut. They gather at the boundary: 43% of the 5s and 18% of the 6s are wrong, against under 1% of the 7s.",
      },
      {
        id: "cost",
        layer: "evaluation",
        label: "Overfitting and cost",
        where: ["§9 Overfitting check and computational cost"],
        detail:
          "Training against test accuracy, and the fastest of five timed runs on one machine. LDA barely overfits (a 0.2-point gap); the RBF SVM takes about 157 ms to fit, against under 7 ms for the others.",
      },
    ],
    edges: [
      { from: "csv", to: "label", label: "scores cut at 6" },
      { from: "label", to: "dedupe", label: "4,898 rows" },
      { from: "dedupe", to: "eda", label: "correlations checked again" },
      { from: "dedupe", to: "split", label: "3,961 wines" },
      { from: "split", to: "pipeline", label: "2,772 training wines only" },
      { from: "pipeline", to: "cv", label: "scaler refitted in every fold" },
      { from: "cv", to: "knn", label: "k = 1 to 20" },
      { from: "cv", to: "svm", label: "three kernels" },
      { from: "cv", to: "lda", label: "scored; nothing to tune" },
      { from: "eda", to: "boundaries", label: "the two features drawn" },
      { from: "svm", to: "boundaries", label: "the same settings" },
      { from: "lda", to: "boundaries", label: "fitted and equal priors" },
      { from: "split", to: "baseline", label: "the training majority" },
      { from: "split", to: "test", label: "1,189 held-out wines" },
      { from: "baseline", to: "test", label: "the score to beat" },
      { from: "knn", to: "test", label: "k = 13" },
      { from: "svm", to: "test", label: "RBF, C = 1, gamma = 0.1" },
      { from: "lda", to: "test", label: "fitted on all training wines" },
      { from: "test", to: "curves", label: "without a threshold" },
      { from: "svm", to: "errors", label: "the selected model" },
      { from: "test", to: "cost", label: "training vs test accuracy" },
    ],
    flows: [
      {
        id: "label",
        label: "From a tasting score to a label",
        steps: [
          { node: "csv", text: "4,898 white wines, each with 11 lab measurements and a score from expert tasters." },
          { node: "label", text: "Scores of 6 and above become 'good', the rest 'poor': about two wines in three are good." },
          { node: "dedupe", text: "937 rows are exact copies. They go, so no wine can sit on both sides of the split: 3,961 remain." },
          { node: "split", text: "A stratified 70/30 split: 2,772 wines to learn from and 1,189 locked away until the end." },
        ],
      },
      {
        id: "tuning",
        label: "Tuning without peeking",
        steps: [
          { node: "split", text: "From here until the final scores, only the 2,772 training wines are used." },
          {
            node: "pipeline",
            text: "The scaler sits inside each model's pipeline, so it learns means and spreads from the training folds alone.",
          },
          { node: "cv", text: "Five stratified folds, the same for every model, each scored on F1." },
          { node: "svm", text: "35 SVM settings are tried. RBF wins, 0.0058 ahead of k-NN: a gap smaller than the spread between folds." },
          { node: "test", text: "Only now are the held-out wines opened: 77.46% accuracy for the RBF SVM." },
        ],
      },
      {
        id: "good",
        label: "Is 77% any good?",
        steps: [
          { node: "baseline", text: "Always saying 'good' already scores 65.94%, and finds no poor wine at all." },
          {
            node: "test",
            text: "So balanced accuracy and poor-class recall sit beside F1: 0.73 and 58% for the RBF SVM, the best of the three.",
          },
          { node: "curves", text: "Without a threshold the SVM still ranks wines best: ROC AUC 0.83, against 0.81 and 0.80." },
          { node: "errors", text: "Its errors gather at the cut: 43% of the 5s and 18% of the 6s are wrong, under 1% of the 7s." },
          { node: "cost", text: "And it is the slowest, about 157 ms to fit against under 7 ms for the others, on one machine." },
        ],
      },
      {
        id: "lda",
        label: "Why LDA misses poor wines",
        steps: [
          { node: "cv", text: "LDA has nothing to tune, so the folds only score it." },
          { node: "lda", text: "F1 is a respectable 0.82, but it finds only 52% of the poor wines." },
          {
            node: "boundaries",
            text: "Drawn on two features, its boundary leans towards the poor class, because the priors are 0.34 and 0.66.",
          },
          { node: "boundaries", text: "With equal priors, that two-feature model finds 69.4% of the poor test wines instead of 49.6%." },
        ],
      },
    ],
  },

  hexalock: {
    repo: "HEXALOCK",
    commit: HEXALOCK,
    modelFile: "Hexalock.slx.slx",
    note: "A team project: this maps the team's Simulink model, not my individual part. All of it lives in one model file, Hexalock.slx.slx; the paths show where each part sits inside it.",
    layers: [
      { id: "inputs", label: "Inputs (simulated)" },
      { id: "control", label: "Controller (Stateflow)" },
      { id: "data", label: "Records and codes (Stateflow)" },
      { id: "outputs", label: "Outputs" },
    ],
    nodes: [
      {
        id: "keypad",
        layer: "inputs",
        label: "Keypad",
        where: ["Push Button blocks on the top level"],
        detail: "Push buttons for the digits and the actions, read by the chart as keypad_input.",
      },
      {
        id: "random",
        layer: "inputs",
        label: "Random PIN source",
        where: ["Random 6 digit code (Uniform Random Number block)"],
        detail: "Gives the chart a candidate six-digit PIN (random_pin).",
      },
      {
        id: "sensors",
        layer: "inputs",
        label: "Scan and parcel sensor",
        where: ["barcode_scan (Data Store Memory)", "object_detected (chart input)"],
        detail: "Stand-ins for a barcode scanner and a parcel sensor, driven from the dashboard.",
      },
      {
        id: "buffer",
        layer: "control",
        label: "Input buffer",
        where: ["Chart › Buffer"],
        detail: "Collects digits, tracks how many have been entered, clears, and signals when an entry is complete.",
      },
      {
        id: "controller",
        layer: "control",
        label: "Main controller",
        where: ["Chart › Controller › Main", "StoreParcel, RetrieveParcel, maintenance, Fault, Idle, Timeout"],
        detail:
          "Coordinates storage, retrieval by PIN or barcode, maintenance, timeouts and faults, each as explicit states and guarded transitions. Repeated failed PIN attempts lead to a temporary lockout.",
      },
      {
        id: "middleware",
        layer: "data",
        label: "Database middleware",
        where: ["Chart › DB › DB_Middleware"],
        detail: "Turns the controller's requests into record operations, and checks scanned tokens.",
      },
      {
        id: "core",
        layer: "data",
        label: "Database core",
        where: ["Chart › DB › DataBase_Core"],
        detail: "Six-element arrays, one slot per locker, for occupancy, stored PINs, barcode tokens and lock status. Held in memory only.",
      },
      {
        id: "codec",
        layer: "data",
        label: "Barcode encoder and decoder",
        where: ["Chart › DB › Barcode_Encoder", "Chart › DB › Barcode_Decoder"],
        detail: "Turn a locker and PIN into an eight-digit token, and a scanned token back into a locker and PIN.",
      },
      {
        id: "renderer",
        layer: "outputs",
        label: "Barcode renderer",
        where: ["Enabled Subsystem › MATLAB Function", "Video Viewer"],
        detail: "Draws the token as a greyscale Code 128C image.",
      },
      {
        id: "door",
        layer: "outputs",
        label: "Door animation",
        where: ["HEXALOCK_UI › UI_DoorAnimation (Stateflow)"],
        detail: "Animates the selected door opening and closing, from the controller's messages.",
      },
      {
        id: "dashboard",
        layer: "outputs",
        label: "Dashboard",
        where: ["ui_Dashboard › ui_SceneAnimator, ui_StatusPanel, ui_SignalAdapter, ui_TextMapper"],
        detail: "The status banner, counters, attempts, progress, door and lock badges, and the parcel animation.",
      },
    ],
    edges: [
      { from: "keypad", to: "buffer", label: "digits and confirm" },
      { from: "buffer", to: "controller", label: "a complete entry" },
      { from: "random", to: "controller", label: "a candidate PIN" },
      { from: "sensors", to: "controller", label: "a scanned token; parcel detected" },
      { from: "controller", to: "middleware", label: "store, look up, clear" },
      { from: "controller", to: "codec", label: "encode a locker and PIN" },
      { from: "middleware", to: "core", label: "reads and writes records" },
      { from: "middleware", to: "codec", label: "checks a scanned token" },
      { from: "codec", to: "renderer", label: "the eight-digit token" },
      { from: "controller", to: "door", label: "messages and the selected locker" },
      { from: "controller", to: "dashboard", label: "messages, occupancy, attempts and faults" },
    ],
    flows: [
      {
        id: "store",
        label: "Store a parcel",
        steps: [
          { node: "keypad", text: "The courier chooses to store a parcel." },
          { node: "buffer", text: "The keypad entry is collected and confirmed." },
          {
            node: "controller",
            text: "StoreParcel shows the free lockers, takes a choice, opens the door and waits for the parcel sensor before closing it.",
          },
          { node: "random", text: "CheckPIN draws a candidate PIN, and rejects it if an occupied locker already uses it." },
          { node: "controller", text: "With a unique PIN, the controller records the parcel." },
          { node: "middleware", text: "The middleware writes the record." },
          { node: "core", text: "Occupancy, PIN and token are stored in that locker's slot." },
          { node: "codec", text: "The locker and PIN become an eight-digit token." },
          { node: "renderer", text: "The token is drawn as a Code 128C barcode for the recipient." },
        ],
      },
      {
        id: "collect",
        label: "Collect with a barcode",
        steps: [
          { node: "sensors", text: "The recipient scans the barcode." },
          { node: "controller", text: "RetrieveParcel is waiting for a scan (WaitForScan, then BarcodeEntry)." },
          { node: "middleware", text: "The middleware checks the token…" },
          { node: "codec", text: "…decoding it back into a locker and PIN." },
          { node: "middleware", text: "Then it looks the pair up." },
          { node: "core", text: "It must match an occupied locker. A wrong code counts as a failed attempt." },
          { node: "middleware", text: "A match is passed back to the controller." },
          { node: "controller", text: "The controller opens that locker." },
          { node: "door", text: "The door opens; once the parcel is taken it closes, and the locker is free again." },
        ],
      },
    ],
  },
};
