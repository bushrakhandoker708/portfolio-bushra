import rocPr from "../../../assets/img/wine-roc-pr.webp";

/*
 * Wine quality: k-NN, SVM and LDA on one shared protocol.
 *
 * Source: github.com/bushrakhandoker708/wine-quality-classification
 * (wine_quality_classification.ipynb, executed outputs; README.md).
 * Every number below is copied from a notebook output or from the notebook's
 * own written analysis; nothing is re-run or estimated here. Proportions are
 * stored as fractions (0.7746), never as percentage strings.
 *
 * Coursework: the README says the study was originally developed for the
 * Big Data & Machine Learning module at Swansea University. The site links to
 * the public repository; it does not copy the notebook or the PDF report.
 */
const wine = {
  slug: "wine-quality",
  number: 1,
  title: "Wine quality: three classifiers, one protocol",
  short: "Wine quality",
  kind: "Comparative study",
  date: "2026-11-20",
  period: "Autumn 2026",
  repo: "wine-quality-classification",
  scene: { shape: "margin", hint: "A linear SVM trained in your browser on 64 synthetic points (not the wine data): lavender is the decision plane, the outer planes are the margin, ringed points are support vectors, and the lines show each one’s distance to the boundary." },
  tagline: "Distance, margin or statistics: which way of drawing a line works best on the same data?",
  summary:
    "A controlled comparison of k-nearest neighbours, support vector machines and linear discriminant analysis on 3,961 white wines, each trained and tested under exactly the same split, scaling, tuning and metrics.",
  question:
    "How do distance-based, margin-based and statistical classifiers compare when distinguishing good-quality from poor-quality wines using the same features and evaluation protocol?",
  context: {
    text: "Originally developed for the Big Data & Machine Learning module at Swansea University, then published as a standalone repository.",
    note: "The full notebook and report live in the repository; this page summarises them.",
  },
  tags: ["Classification", "SVM", "k-NN", "LDA", "Cross-validation", "Class imbalance"],
  // Names must match topics in src/data/mlLab.js so the foundations map can link both ways.
  topics: ["Exploratory data analysis", "Feature engineering", "Supervised learning", "Model evaluation"],
  stack: ["Python", "scikit-learn", "pandas", "NumPy", "Matplotlib", "seaborn", "Jupyter"],
  links: [
    {
      label: "Repository",
      href: "https://github.com/bushrakhandoker708/wine-quality-classification",
    },
    {
      label: "Notebook",
      href: "https://github.com/bushrakhandoker708/wine-quality-classification/blob/main/wine_quality_classification.ipynb",
    },
    {
      label: "Dataset (UCI, CC BY 4.0)",
      href: "https://doi.org/10.24432/C56S3T",
    },
  ],

  // The few numbers a reader should leave with. `of` explains each one.
  headline: [
    {
      value: "0.7276",
      label: "balanced accuracy, RBF SVM",
      of: "the best of the three on the held-out test set; the always-good baseline scores 0.5",
    },
    {
      value: "0.5802",
      label: "poor-quality recall, RBF SVM",
      of: "the best of the three; all three found poor wines far less reliably than good ones",
    },
    {
      value: "0.0058",
      label: "CV F1 gap, RBF SVM over k-NN",
      of: "smaller than the fold-to-fold spread of about 0.01, so the ranking could flip on another split",
    },
  ],

  dataset: {
    name: "UCI Wine Quality, white wine",
    citation: "Cortez et al., 2009",
    licence: "CC BY 4.0",
    href: "https://doi.org/10.24432/C56S3T",
    rows: 4898,
    features: 11,
    missing: 0,
    duplicates: 937,
    kept: 3961,
    conflicts: 0,
    featureNames: [
      "fixed acidity",
      "volatile acidity",
      "citric acid",
      "residual sugar",
      "chlorides",
      "free sulfur dioxide",
      "total sulfur dioxide",
      "density",
      "pH",
      "sulphates",
      "alcohol",
    ],
    // Quality scores in the original 4,898 rows.
    scores: [
      { score: 3, n: 20 },
      { score: 4, n: 163 },
      { score: 5, n: 1457 },
      { score: 6, n: 2198 },
      { score: 7, n: 880 },
      { score: 8, n: 175 },
      { score: 9, n: 5 },
    ],
    cut: 6, // good quality if score >= 6
    split: { train: 2772, test: 1189, poorTrain: 0.3402, poorTest: 0.3406 },
    // Point-biserial correlation with the binary target: all rows, then after removing duplicates.
    correlations: [
      { feature: "alcohol", all: 0.383, dedup: 0.401 },
      { feature: "density", all: -0.269, dedup: -0.292 },
      { feature: "volatile acidity", all: -0.225, dedup: -0.223 },
      { feature: "chlorides", all: -0.184, dedup: -0.192 },
      { feature: "total sulfur dioxide", all: -0.171, dedup: null },
    ],
  },

  protocol: [
    {
      step: "Clean",
      detail: "No missing values. 937 exact duplicates removed, leaving 3,961 wines, with zero conflicting labels.",
      state: "completed",
    },
    {
      step: "Label",
      detail: "Good if the quality score is 6 or more, poor otherwise: 66 / 34.",
      state: "completed",
    },
    {
      step: "Explore",
      detail: "KDE plots per class and point-biserial correlations, before and after de-duplication.",
      state: "completed",
    },
    {
      step: "Split",
      detail: "70 / 30, stratified, random_state = 42: 2,772 training and 1,189 test wines.",
      state: "completed",
    },
    {
      step: "Scale inside the pipeline",
      detail: "StandardScaler is the first step of every pipeline, so it is fitted on training folds only.",
      state: "completed",
    },
    {
      step: "Tune",
      detail: "5-fold stratified CV with GridSearchCV, selecting on F1 for the good class. LDA is scored on the same folds.",
      state: "completed",
    },
    {
      step: "Test once",
      detail: "Each selected model is evaluated a single time on the held-out 30%, next to an always-good baseline.",
      state: "completed",
    },
    {
      step: "Look closer",
      detail: "Confusion matrices, ROC and precision-recall curves, train-test gaps, timing and errors by original score.",
      state: "completed",
    },
  ],

  theory: [
    {
      name: "k-nearest neighbours",
      family: "Distance",
      idea: "A new wine takes the majority label of the k most similar training wines. Nothing is learned up front: the training set is the model.",
      formula: "d(x, y) = √Σᵢ (xᵢ − yᵢ)²",
      boundary: "Any shape; follows local neighbourhoods",
      cost: "Instant to fit; every prediction compares against all 2,772 training wines",
      reference: "Cover & Hart, 1967",
    },
    {
      name: "Support vector machine",
      family: "Margin",
      idea: "Find the boundary with the widest margin between the classes. Only the points on or inside the margin, the support vectors, decide where it goes; a kernel lets it bend.",
      formula: "f(x) = Σᵢ αᵢ yᵢ K(xᵢ, x) + b",
      boundary: "Straight (linear) or curved (polynomial, RBF)",
      cost: "Slowest to fit; prediction evaluates the kernel against every support vector",
      reference: "Cortes & Vapnik, 1995",
    },
    {
      name: "Linear discriminant analysis",
      family: "Statistical",
      idea: "Model each class as a Gaussian with its own mean and one shared covariance, then use Bayes' rule. Because the covariance is shared, the quadratic terms cancel and the boundary is a hyperplane.",
      formula: "δₖ(x) = xᵀΣ⁻¹μₖ − ½ μₖᵀΣ⁻¹μₖ + log πₖ",
      boundary: "Always straight",
      cost: "Fits by estimating means and one covariance; predicts with one linear function",
      reference: "Fisher, 1936",
    },
  ],

  thinking: [
    {
      question: "How should a 0–10 score become a classification target?",
      options: ["Keep the scores and predict them directly", "Two classes: good if the score is 6 or more"],
      chose: 1,
      why: "The research question compares classifiers on one shared binary task, so the scores were cut at 6. The cost is written into the notebook: a 6 and a 9 get the same label, and the ordinal information is gone. An ordinal formulation is on the future list.",
    },
    {
      question: "What to do with 937 identical rows?",
      options: ["Keep them: they could be different wines that measure the same", "Remove them before splitting"],
      chose: 1,
      why: "Identical measurements could in principle be two different wines, but keeping them risks the same sample landing in both training and test sets, which would make the test score look better than it is. Removing them barely moved the class balance (66.5% good before, 66.0% after) and no identical rows disagreed on their label.",
    },
    {
      question: "Where does feature scaling happen?",
      options: ["Standardise the whole dataset once, then split", "Make StandardScaler the first step of each model's pipeline"],
      chose: 1,
      why: "If the mean and standard deviation are computed on all the data, the test wines quietly shape the training data. Inside the pipeline the scaler is refitted on the training folds only, every time, so the held-out data stays held out.",
    },
    {
      question: "What should choose the hyperparameters?",
      options: ["Accuracy", "F1 for the good class, with balanced accuracy and poor-class recall reported beside it"],
      chose: 1,
      why: "At 66 / 34, a model that always says 'good' already reaches about 66% accuracy, so accuracy alone was ruled out. F1 for the good class has its own blind spot, since it never counts correctly found poor wines; that is why balanced accuracy and poor-class recall sit next to it, and why tuning on balanced accuracy is first on the future list.",
    },
    {
      question: "Which SVM kernel?",
      options: ["Linear: one hyperplane", "Polynomial, degree 3", "RBF: a smooth curved boundary"],
      chose: 2,
      why: "Cross-validation decided, not intuition: RBF reached a mean CV F1 of 0.8333 against 0.8189 for linear and 0.8244 for polynomial. The differences are small, so this says which kernel scored higher on these folds, not how curved the true boundary is.",
    },
  ],

  // Mean F1 across the 5 validation folds, with the fold standard deviation
  // (not a confidence interval and not a significance test).
  cv: [
    { label: "k-NN", params: "k = 13", mean: 0.8276, sd: 0.0132 },
    { label: "SVM, linear", params: "C = 1", mean: 0.8189, sd: 0.0121 },
    {
      label: "SVM, polynomial",
      params: "C = 0.1, coef0 = 1, degree = 3",
      mean: 0.8244,
      sd: 0.0046,
    },
    { label: "SVM, RBF", params: "C = 1, γ = 0.1", mean: 0.8333, sd: 0.013 },
    { label: "LDA", params: "default priors", mean: 0.8218, sd: 0.0102 },
  ],
  cvGap: "0.0058", // RBF SVM minus k-NN, from the unrounded notebook output

  // Held-out test set, 1,189 wines. Good quality is the positive class.
  metrics: [
    {
      key: "accuracy",
      label: "Accuracy",
      explain: "Share of all wines labelled correctly. The baseline scores high just by matching the class balance.",
    },
    {
      key: "f1",
      label: "F1 (good)",
      explain:
        "Balance of precision and recall for the good class. It never counts correctly found poor wines, so the baseline still scores 0.79.",
    },
    {
      key: "balanced",
      label: "Balanced accuracy",
      explain: "The average of the recall on each class. Guessing scores 0.5, so this is where the baseline is exposed.",
    },
    {
      key: "poorRecall",
      label: "Poor-class recall",
      explain: "Of the poor wines, how many were caught. The baseline catches none.",
    },
    {
      key: "precision",
      label: "Precision (good)",
      explain: "Of the wines called good, how many were good.",
    },
    {
      key: "recall",
      label: "Recall (good)",
      explain: "Of the good wines, how many were found.",
    },
  ],
  models: [
    {
      label: "Always 'good' baseline",
      baseline: true,
      accuracy: 0.6594,
      precision: 0.6594,
      recall: 1,
      f1: 0.7947,
      poorRecall: 0,
      balanced: 0.5,
    },
    {
      label: "k-NN (k = 13)",
      accuracy: 0.7502,
      precision: 0.7828,
      recall: 0.8597,
      f1: 0.8195,
      poorRecall: 0.5383,
      balanced: 0.699,
    },
    {
      label: "SVM, RBF",
      best: true,
      accuracy: 0.7746,
      precision: 0.8014,
      recall: 0.875,
      f1: 0.8366,
      poorRecall: 0.5802,
      balanced: 0.7276,
    },
    {
      label: "LDA",
      accuracy: 0.7502,
      precision: 0.7727,
      recall: 0.8801,
      f1: 0.8229,
      poorRecall: 0.4988,
      balanced: 0.6894,
    },
  ],
  // Rows: actual class; columns: predicted class.
  confusion: [
    {
      label: "k-NN",
      goodGood: 674,
      goodPoor: 110,
      poorGood: 187,
      poorPoor: 218,
    },
    {
      label: "SVM, RBF",
      goodGood: 686,
      goodPoor: 98,
      poorGood: 170,
      poorPoor: 235,
    },
    { label: "LDA", goodGood: 690, goodPoor: 94, poorGood: 203, poorPoor: 202 },
  ],
  curves: {
    auc: { "k-NN": 0.81, "SVM, RBF": 0.83, LDA: 0.8 },
    ap: { "k-NN": 0.87, "SVM, RBF": 0.9, LDA: 0.88 },
  },

  // RBF SVM test errors grouped by the original quality score.
  errorsByScore: [
    { score: 3, n: 5, error: 0.6 },
    { score: 4, n: 47, error: 0.298 },
    { score: 5, n: 353, error: 0.433 },
    { score: 6, n: 528, error: 0.182 },
    { score: 7, n: 219, error: 0.009 },
    { score: 8, n: 35, error: 0 },
    { score: 9, n: 2, error: 0 },
  ],

  // Measured once on one machine: the ordering matters more than the values.
  costs: [
    {
      label: "k-NN",
      train: 0.7926,
      test: 0.7502,
      fitMs: 6.55,
      predictMs: 41.78,
    },
    {
      label: "SVM, RBF",
      train: 0.8099,
      test: 0.7746,
      fitMs: 156.92,
      predictMs: 123.08,
    },
    { label: "LDA", train: 0.7522, test: 0.7502, fitMs: 4.62, predictMs: 1.14 },
  ],
  supportVectors: { n: 1574, of: 2772 },
  bestName: "RBF SVM",

  pushback: [
    {
      title: "The baseline that scored 0.79",
      expected: "Compare the three classifiers on the held-out test set, with an always-'good' baseline as the floor.",
      observed:
        "The baseline, which never predicts a single poor wine, scored 65.94% accuracy and an F1 of 0.7947. On those two numbers alone it does not look far behind the real models.",
      found:
        "With two-thirds of the wines labelled good, accuracy and good-class F1 both reward agreeing with the majority. Neither one counts the poor wines a model actually finds.",
      changed:
        "Balanced accuracy and poor-class recall are reported beside every score. They separate the models clearly: 0.5 and 0 for the baseline against 0.69–0.73 and 0.50–0.58 for the classifiers.",
    },
    {
      title: "LDA kept calling borderline wines good",
      expected: "LDA with its default priors, estimated from the training data.",
      observed:
        "A healthy-looking CV F1 of 0.8218, but only 52.39% of poor wines recognised against 86.87% of good ones. On the test set its poor-class recall was the lowest of the three, 49.88%.",
      found:
        "The prior term log πₖ. With priors of 0.34 and 0.66, the boundary moves towards the poor-class mean, so wines near it tip into the good class.",
      changed:
        "An illustration with two features and equal priors lifted poor-class recall from 49.6% to 69.4%. The main model kept its default priors, because changing them after seeing test results would mean tuning on the test set.",
    },
    {
      title: "The errors sat on the cut",
      expected: "Treat every misclassification as the same kind of mistake.",
      observed:
        "Grouped by the original score, the RBF SVM was wrong on 43.3% of the wines scored 5 but only 18.2% of those scored 6, 0.9% of 7s and none of the 8s.",
      found:
        "Scores 5 and 6 are neighbouring ratings that the binary target puts on opposite sides, and they are the two biggest groups in the data. The hardest wines are the ones closest to the line drawn at 6.",
      changed:
        "Errors are reported by original score as well as by class, and an ordinal formulation that keeps the scores is on the future list. The 9s are only two wines, so their perfect score proves nothing.",
    },
  ],

  figures: [
    {
      src: rocPr,
      w: 1211,
      h: 540,
      alt: "ROC curves (left) and precision-recall curves (right) for k-NN, RBF SVM and LDA on the test set. RBF SVM has the highest ROC AUC, 0.83, against 0.81 for k-NN and 0.80 for LDA, and the highest average precision, 0.90, against 0.88 for LDA and 0.87 for k-NN.",
      caption:
        "Threshold-free comparison from the notebook. The RBF SVM's lead comes from ranking wines better, not only from where its default threshold sits.",
    },
  ],

  limitations: [
    "One stratified train-test split. The fold-to-fold spread of F1 (about 0.01) is larger than the 0.0058 gap between RBF SVM and k-NN, so their order could change on another split.",
    "Small hyperparameter grids (for example C ∈ {0.1, 1, 10, 100}, γ ∈ {0.01, 0.03, 0.1, 0.3, 1}); better settings may exist.",
    "Cutting the scores at 6 discards the difference between a 6 and an 8 and puts the borderline 6s in the good class.",
    "Skewed features (residual sugar, chlorides, free sulfur dioxide) were standardised but not transformed, and LDA's shared-covariance assumption was not formally tested.",
    "Timings were measured once on one machine; only their order is meaningful.",
  ],
  future: [
    "Tune on balanced accuracy, and try class weighting, to lift poor-class recall.",
    "Log-transform the skewed features and test whether LDA and k-NN improve.",
    "Cross-validated feature selection inside the training data.",
    "Repeated or nested cross-validation to see how stable the ranking is.",
    "An ordinal formulation that keeps the 3–9 scores instead of cutting them.",
  ],
  references: [
    "Cortez, P., Cerdeira, A., Almeida, F., Matos, T. and Reis, J. (2009) 'Modeling wine preferences by data mining from physicochemical properties', Decision Support Systems, 47(4), pp. 547–553.",
    "Cover, T. and Hart, P. (1967) 'Nearest neighbor pattern classification', IEEE Transactions on Information Theory, 13(1), pp. 21–27.",
    "Cortes, C. and Vapnik, V. (1995) 'Support-vector networks', Machine Learning, 20(3), pp. 273–297.",
    "Fisher, R.A. (1936) 'The use of multiple measurements in taxonomic problems', Annals of Eugenics, 7(2), pp. 179–188.",
  ],
};

export default wine;
