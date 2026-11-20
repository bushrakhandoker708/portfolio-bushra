import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { profile } from "../../data/profile";
import { LAST_UPDATED } from "../../data/site";
import { usePageMeta } from "../../hooks/usePageMeta";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
// Deterministic formatting so server and client render identical text.
const formatDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

const NAV = [
  { to: "/research", label: "Research" },
  { to: "/ml-lab", label: "ML Lab" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/cv", label: "CV" },
];

function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const buttonRef = useRef(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const linkClass = ({ isActive }) =>
    `block py-2 no-underline transition-colors md:py-0 ${isActive ? "text-ink" : "text-muted hover:text-ink"}`;

  return (
    <header data-site-header className="sticky top-0 z-40 border-b border-rule bg-canvas/90 backdrop-blur supports-[backdrop-filter]:bg-canvas/75">
      <div className="wrap flex min-h-[64px] items-center justify-between gap-6">
        <Link to="/" className="font-serif text-lg text-ink no-underline">
          {profile.name}
        </Link>
        <button
          ref={buttonRef}
          type="button"
          className="btn btn-quiet min-h-[40px] px-3 py-1 text-sm md:hidden"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
        <nav id="site-nav" aria-label="Main" className={`${open ? "block" : "hidden"} absolute inset-x-0 top-full border-b border-rule bg-canvas md:static md:block md:border-0 md:bg-transparent`}>
          <ul className="wrap flex flex-col py-3 md:flex-row md:gap-7 md:p-0 md:px-0">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} className={linkClass}>
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer data-site-footer className="mt-16 border-t border-rule">
      <div className="wrap grid gap-6 py-10 text-sm text-muted sm:grid-cols-[1fr_auto]">
        <div>
          <p className="font-serif text-base text-ink">{profile.name}</p>
          <p>
            {profile.role}, {profile.affiliation} · {profile.location}
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Contact">
          <li>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </li>
          <li>
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer">
              GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          {profile.links.linkedin && (
            <li>
              <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          )}
          <li>
            <Link to="/archive">Creative archive</Link>
          </li>
        </ul>
        <p className="text-xs text-faint sm:col-span-2">
          Last updated <time dateTime={LAST_UPDATED}>{formatDate(LAST_UPDATED)}</time>.
          Results shown on this site link to the files they come from.
        </p>
      </div>
    </footer>
  );
}

/** Scroll to the top on navigation, or to the hash target when present. */
function useScrollManagement() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
}

export default function Layout() {
  usePageMeta();
  useScrollManagement();
  return (
    <>
      <a href="#main" className="sr-only z-50 rounded-md bg-teal px-4 py-2 text-canvas focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}
