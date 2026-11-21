/*
 * Interactive architecture maps for the project pages (components/ArchitectureMap.jsx).
 *
 * Every part, file path and link here was read from the repository at the
 * commit named in `commit`; nothing comes from design documents alone. Where
 * the code and a project's own notes disagree, the code wins and the part is
 * marked (state: "placeholder" or "retired").
 */

const STUDYBUDDY = "4de5332ca0067782b3ffbdd60dd0f5830676fac5";
const STUDYBUDDY_PYODIDE = "2de20784301e72bb015e18ea1437aa562c82ceea";
const BUSHAL = "b518e0e8fcf90ad4dabd493076d82b6c5cf990cc";
const RELEVIA = "0b8df47ec0b1495dfb2b8954408fce2b8918408f";
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
          "Where the conversation happens. Replies stream in token by token, and while the model downloads the window says how far it has got.",
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
          "Decides how each message is answered: the safety check first, then the recent history, then the model if it is ready within 4 seconds, and otherwise an offline reply.",
      },
      {
        id: "safety",
        layer: "checks",
        label: "Safety router (S2)",
        files: ["src/services/safety.js", "tests/safety-s2.test.js"],
        detail:
          "Normalises the text and checks it for crisis language before anything else. A match returns a fixed urgent-support reply, and the model is never called. These are the S2 rules measured in my research.",
      },
      {
        id: "offline",
        layer: "checks",
        label: "Offline replies",
        files: ["src/services/memoryUtils.js"],
        detail: "Tone detection and prepared replies, used while the model is still loading or if it fails.",
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
          { node: "chat", text: "The reply streams into the window as it is written." },
        ],
      },
      {
        id: "crisis",
        label: "A message with crisis language",
        steps: [
          { node: "chat", text: "A message contains crisis language." },
          { node: "brain", text: "think() runs the safety check before anything else." },
          { node: "safety", text: "A match. A fixed urgent-support reply is returned, and the model is never called." },
          { node: "brain", text: "Before replying, it records the turn." },
          { node: "store", text: "The chat is marked sensitive, so it will not be saved, even if saving was on." },
          {
            node: "chat",
            text: "The fixed reply is shown: it says plainly that it is an AI and cannot keep anyone safe, and points to emergency services and, in the UK, Samaritans.",
          },
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
