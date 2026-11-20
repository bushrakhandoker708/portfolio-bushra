import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui";

export default function NotFound() {
  return (
    <PageHeader eyebrow="404" title="This page does not exist">
      <p className="lede">The page may have moved when this site was reorganised.</p>
      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/research">Research</Link>
        </li>
        <li>
          <Link to="/projects">Projects</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
      </ul>
    </PageHeader>
  );
}
