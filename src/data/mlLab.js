import { repoTree, repoFile } from "./site";

const V = "Ai-Machine-Learning";

// Machine-learning foundations, from github.com/bushrakhandoker708/Ai-Machine-Learning
// (an Obsidian study vault, last pushed 2026-11-03).
//
// Evidence levels:
//   "notes"        - written notes with derivations exist in the repository
//   "started"      - only a few introductory notes exist
// No topic is marked "implemented": the repository contains no implementation
// code, notebooks or tests. `notes` counts are Markdown files in each folder.
// `progress` repeats Bushra's own status from the vault README where one exists.

export const mlLab = {
  repo: repoTree(V),
  readme: repoFile(V, "README.md"),
  intro:
    "My rule for this vault is that I don't really know something until I can explain it, derive it or build it. It holds my working notes as I rebuild the mathematics and classical machine learning underneath the models I use in research.",
  labIntro:
    "The lab has two halves. Experiments are where I build: real data, one protocol for every model, and every number traced back to a notebook output. The notes are where I explain and derive what those models stand on.",
  evidenceNote:
    "The notes include worked derivations, but the vault itself holds no implementations, notebooks or tests yet, so no topic is labelled as implemented. Experiments live in their own repositories and are linked from their pages.",
  // Working rules, each one visible in a published experiment (the anchor says where).
  method: [
    {
      title: "A baseline before a winner",
      text: "Every comparison includes a model that learns nothing. If a metric cannot tell that model from the real ones, the metric is the problem.",
      where: { slug: "wine-quality", anchor: "results", label: "The always-good baseline" },
    },
    {
      title: "Nothing learns from the test set",
      text: "Scaling sits inside the pipeline, tuning happens on cross-validation folds, and the test set is used once. A fix spotted on test results is shown as an illustration, not applied.",
      where: { slug: "wine-quality", anchor: "thinking", label: "Where scaling happens" },
    },
    {
      title: "Score every class",
      text: "A headline metric goes next to balanced accuracy, minority-class recall and the confusion matrix, so a model cannot look good by ignoring the smaller class.",
      where: { slug: "wine-quality", anchor: "pushback", label: "The baseline that scored 0.79" },
    },
    {
      title: "Say what one split cannot show",
      text: "Differences are compared with the spread between folds, and every experiment ends with what it does not establish.",
      where: { slug: "wine-quality", anchor: "open", label: "Limitations" },
    },
  ],
  groups: [
    {
      title: "Mathematics",
      topics: [
        {
          name: "Linear algebra",
          notes: 146,
          level: "notes",
          progress: "Intuition in place; working on depth",
          path: "01.Maths/Linear Algebra",
          covers: "Vectors, elimination, vector spaces, orthogonality, determinants, eigenvalues, linear transformations",
        },
        {
          name: "Calculus",
          notes: 246,
          level: "notes",
          progress: "In progress",
          path: "01.Maths/Calculus",
          covers: "Limits through multivariable and vector calculus, partial derivatives, differential equations",
        },
        {
          name: "Probability",
          notes: 174,
          level: "notes",
          progress: "In progress",
          path: "01.Maths/Probability",
          covers: "Random variables, expectation, joint distributions, transformations, inequalities, Markov chains, MCMC",
        },
      ],
    },
    {
      title: "Numerical Python",
      topics: [
        {
          name: "Python foundations",
          notes: 67,
          level: "notes",
          path: "02.Python/01.Basics Python",
          covers: "Language fundamentals for clear, debuggable experiment code",
        },
        {
          name: "NumPy",
          notes: 100,
          level: "notes",
          path: "02.Python/02.Python Libraries for Machine Learning/01.NumPy",
          covers: "dtypes and precision, views versus copies, broadcasting, random generation",
        },
        {
          name: "pandas",
          notes: 119,
          level: "notes",
          path: "02.Python/02.Python Libraries for Machine Learning/02.Pandas",
          covers: "Data manipulation for exploratory analysis",
        },
        {
          name: "Matplotlib",
          notes: 112,
          level: "notes",
          path: "02.Python/02.Python Libraries for Machine Learning/03.Matplotlib",
          covers: "Visualisation for analysis and reporting",
        },
      ],
    },
    {
      title: "Classical machine learning",
      topics: [
        {
          name: "Foundations",
          notes: 8,
          level: "notes",
          path: "04.ML/00.Foundations",
          covers: "The learning problem, statistical learning theory, framing ML problems",
        },
        {
          name: "Exploratory data analysis",
          notes: 4,
          level: "notes",
          path: "04.ML/02.Understanding Data",
          covers: "Univariate, multivariate and automated EDA",
        },
        {
          name: "Feature engineering",
          notes: 8,
          level: "notes",
          path: "04.ML/03.Feature Engineering",
          covers: "Standardisation, normalisation, categorical encoding, column transformers, pipelines",
        },
        {
          name: "Supervised learning",
          notes: 7,
          level: "notes",
          progress: "Working through it",
          path: "04.ML/07.Supervised Learning",
          covers: "Linear and logistic regression, GLMs, SVMs, decision trees, naive Bayes, k-nearest neighbours",
        },
        {
          name: "Model evaluation",
          notes: 5,
          level: "notes",
          progress: "Ongoing",
          path: "04.ML/04.Evaluation",
          covers: "Train/validation/test splits, cross-validation, metrics, bias-variance, hyperparameter tuning",
        },
        {
          name: "Ensembles",
          notes: 3,
          level: "notes",
          progress: "Planned in README; notes started",
          path: "04.ML/05.Ensemble",
          covers: "Bagging and random forests, boosting, stacking",
        },
        {
          name: "Unsupervised learning",
          notes: 13,
          level: "notes",
          progress: "Up next",
          path: "04.ML/08.Unsupervised learning",
          covers: "k-means, GMMs, hierarchical clustering, DBSCAN, PCA, kernel PCA, t-SNE, UMAP, autoencoders",
        },
        {
          name: "Probabilistic models",
          notes: 3,
          level: "notes",
          progress: "Planned",
          path: "04.ML/09.Probabilistic",
          covers: "Bayesian networks, Markov models, Gaussian processes",
        },
        {
          name: "ML practice",
          notes: 4,
          level: "notes",
          path: "04.ML/13.Practice",
          covers: "Project workflow, pipelines and experiments, interpretability, deployment",
        },
      ],
    },
    {
      title: "Neural networks",
      topics: [
        {
          name: "Perceptron and neural-network foundations",
          notes: 6,
          level: "started",
          path: "05.Neural Networks & Deep Learning",
          covers: "Perceptron, training rule and loss function",
        },
      ],
    },
  ],
  // The lab's four tracks. Each item is labelled by the evidence behind it:
  //   "published" - an experiment or research result on this site
  //   "notes"     - study notes in the vault (sometimes with code inside a note),
  //                 but no tested implementation in a repository
  //   "planned"   - nothing public yet
  // Items never get their own page until there is something to publish.
  tracks: [
    {
      title: "Mathematical implementations",
      items: [
        {
          name: "Gradient descent",
          status: "notes",
          href: repoFile(
            V,
            "02.Python/02.Python Libraries for Machine Learning/01.NumPy/93.Gradient descent in NumPy — linear regression from scratch.md",
          ),
        },
        {
          name: "Linear regression",
          status: "notes",
          href: repoFile(V, "01.Maths/Probability/09.Conditional Expectations/05.Linear Regression.md"),
        },
        { name: "Logistic regression", status: "notes", href: repoTree(V, "04.ML/07.Supervised Learning") },
        {
          name: "Principal component analysis",
          status: "notes",
          href: repoFile(V, "02.Python/02.Python Libraries for Machine Learning/01.NumPy/96.Implementing PCA via np.linalg.svd().md"),
        },
        { name: "Numerical optimisation", status: "planned" },
        { name: "Probability distributions", status: "notes", href: repoTree(V, "01.Maths/Probability") },
        { name: "Maximum likelihood estimation", status: "planned" },
      ],
    },
    {
      title: "Classical machine learning",
      items: [
        {
          name: "Decision trees",
          status: "notes",
          href: repoFile(V, "03.Data Structure and Algorithms/158.Decision tree structure — how CART maps to a binary tree.md"),
        },
        {
          name: "Random forests",
          status: "notes",
          href: repoTree(V, "04.ML/05.Ensemble"),
          note: "The demo at the top of this page trains one on synthetic data; that is a teaching aid, not an experiment.",
        },
        { name: "Gradient boosting", status: "notes", href: repoTree(V, "04.ML/05.Ensemble") },
        {
          name: "Support vector machines",
          status: "published",
          href: "/ml-lab/wine-quality",
          note: "Linear and RBF SVMs in the wine-quality study.",
        },
        {
          name: "Clustering",
          status: "notes",
          href: repoFile(V, "02.Python/02.Python Libraries for Machine Learning/01.NumPy/97.Implementing K-Means in NumPy.md"),
        },
        { name: "Model calibration", status: "planned" },
        {
          name: "Statistical evaluation",
          status: "published",
          href: "/ml-lab/wine-quality#results",
          note: "Cross-validation spread in the wine study; paired bootstrap and Wilson intervals in Relevia.",
        },
      ],
    },
    {
      title: "Deep learning",
      items: [
        {
          name: "Neural networks from scratch",
          status: "planned",
          note: "Perceptron notes started; the vault README lists a NumPy network as in progress, with no code published.",
        },
        { name: "Backpropagation", status: "planned" },
        { name: "Optimisation algorithms (SGD, momentum, Adam)", status: "planned" },
        { name: "PyTorch training pipelines", status: "planned" },
        { name: "Convolutional networks", status: "planned" },
        { name: "Attention mechanisms", status: "planned" },
      ],
    },
    {
      title: "Language models",
      items: [
        { name: "Tokenisation", status: "planned" },
        { name: "Embeddings", status: "planned" },
        { name: "Self-attention and transformer blocks", status: "planned" },
        {
          name: "A small GPT, written from scratch",
          status: "planned",
          note: "The LLMs-from-scratch repository on my GitHub is a fork of Sebastian Raschka's book code, not my implementation.",
        },
        {
          name: "Parameter-efficient fine-tuning",
          status: "planned",
          href: "/research/relevia#question",
          note: "Proposed as condition C in Relevia; no adapter trained beyond a four-step pipeline check.",
        },
        { name: "Quantisation", status: "planned" },
        {
          name: "Inference benchmarking",
          status: "published",
          href: "/research/relevia#cost",
          note: "Preliminary: paired CPU latency in Relevia, and one browser run on one laptop.",
        },
      ],
    },
  ],
  // What every implementation should carry before it is published here.
  standard: {
    items: [
      "Mathematical derivation",
      "Algorithm explanation",
      "Implementation",
      "Experiment",
      "Correctness tests",
      "Results",
      "Limitations",
      "Repository link",
    ],
    note: "The wine-quality study meets six of the eight: its models are scikit-learn's, not my own implementations, and the repository has no correctness tests. Implementations written from scratch will be published only with tests that check them against a reference.",
  },
  appliedElsewhere: {
    text: "Language-model work (prompting, evaluation and inference measurement) happens in the Relevia research project rather than in this vault.",
    href: "/research/relevia",
  },
};
