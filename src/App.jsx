import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { redirects } from "./data/pages";

// Home is eager (it is the most common landing page); the rest are split.
const Research = lazy(() => import("./pages/Research"));
const ReleviaCase = lazy(() => import("./pages/ReleviaCase"));
const MlLab = lazy(() => import("./pages/MlLab"));
const LabExperiment = lazy(() => import("./pages/LabExperiment"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectCase = lazy(() => import("./pages/ProjectCase"));
const About = lazy(() => import("./pages/About"));
const Cv = lazy(() => import("./pages/Cv"));
const Archive = lazy(() => import("./pages/Archive"));

const page = (Component) => (
  <Suspense fallback={<div className="wrap min-h-[60vh] py-16" aria-busy="true" />}>
    <Component />
  </Suspense>
);

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="research" element={page(Research)} />
        <Route path="research/relevia" element={page(ReleviaCase)} />
        <Route path="ml-lab" element={page(MlLab)} />
        <Route path="ml-lab/:slug" element={page(LabExperiment)} />
        <Route path="projects" element={page(Projects)} />
        <Route path="projects/:slug" element={page(ProjectCase)} />
        <Route path="about" element={page(About)} />
        <Route path="cv" element={page(Cv)} />
        <Route path="archive" element={page(Archive)} />
        {Object.entries(redirects).map(([from, to]) => (
          <Route key={from} path={from.slice(1)} element={<Navigate to={to} replace />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
