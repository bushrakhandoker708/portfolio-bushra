import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useOutlet } from "react-router-dom";
import { profile } from "../../data/profile";
import { LAST_UPDATED, ART_PORTFOLIO } from "../../data/site";
import { usePageMeta } from "../../hooks/usePageMeta";
import { AnimatePresence, m } from "framer-motion";
import { MotionProvider } from "../motion";
import { CopyEmail, mailto } from "../Contact";
import cosmosLg from "../../assets/img/cosmos.webp";
import cosmosSm from "../../assets/img/cosmos-sm.webp";

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
  { to: "/archive", label: "Art" },
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
    `relative block py-2 font-label text-[0.95rem] font-semibold tracking-wide no-underline transition-colors md:py-0 ${
      isActive ? "text-champagne after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:bg-gradient-to-r after:from-lavender after:to-mauve" : "text-muted hover:text-champagne"
    }`;

  return (
    <header data-site-header className="sticky top-0 z-40 border-b border-white/10 bg-canvas/70 backdrop-blur-xl">
      <div className="wrap flex min-h-[64px] items-center justify-between gap-6">
        <Link to="/" className="group flex items-center gap-2.5 font-serif text-lg font-semibold text-ink no-underline">
          <span aria-hidden="true" className="bubble h-7 w-7 shrink-0 transition-transform duration-500 group-hover:scale-110" />
          <span className="text-cosmic">{profile.name}</span>
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
        <nav id="site-nav" aria-label="Main" className={`${open ? "block" : "hidden"} absolute inset-x-0 top-full border-b border-white/10 bg-canvas/95 backdrop-blur-xl md:static md:block md:border-0 md:bg-transparent md:backdrop-blur-none`}>
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
    <footer data-site-footer className="mt-16 border-t border-white/10 bg-canvas/80">
      <div className="wrap grid gap-6 py-10 text-sm text-muted sm:grid-cols-[1fr_auto]">
        <div>
          <p className="text-cosmic font-serif text-xl font-semibold">{profile.name}</p>
          <p>
            {profile.role}, {profile.affiliation} · {profile.location}
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Contact">
          <li className="flex flex-wrap items-center gap-3">
            <a href={mailto("Hello from your portfolio")}>{profile.email}</a>
            <CopyEmail />
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
            <Link to="/archive">Art &amp; making</Link>
          </li>
          <li>
            <a href={ART_PORTFOLIO} target="_blank" rel="noopener noreferrer">
              Art portfolio<span className="sr-only"> (opens in a new tab)</span>
            </a>
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
    window.scrollTo(0, 0);
    if (!hash) return undefined;
    // The target may be on a page that is still loading (pages are lazy), so
    // keep looking for it for a moment before giving up.
    const id = decodeURIComponent(hash.slice(1));
    let frame;
    const started = performance.now();
    const seek = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView();
      else if (performance.now() - started < 3000) frame = requestAnimationFrame(seek);
    };
    seek();
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
}

/** Fixed nebula and starfield behind every page. */
function CosmicBackdrop() {
  return (
    <div aria-hidden="true" className="cosmos" style={{ "--cosmos-sm": `url(${cosmosSm})`, "--cosmos-lg": `url(${cosmosLg})` }} />
  );
}

export default function Layout() {
  usePageMeta();
  useScrollManagement();
  const { pathname } = useLocation();
  const outlet = useOutlet();
  return (
    <MotionProvider>
      <CosmicBackdrop />
      <a href="#main" className="sr-only z-50 rounded-md bg-teal px-4 py-2 text-canvas focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        {/* Page transition. initial={false}: the first, prerendered page is shown as-is. */}
        <AnimatePresence mode="wait" initial={false}>
          <m.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: "easeOut" }}>
            {outlet}
          </m.div>
        </AnimatePresence>
      </main>
      <SiteFooter />
    </MotionProvider>
  );
}
