import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { metaFor } from "../data/pages";
import { SITE_URL } from "../data/site";

const setMeta = (selector, attr, value) => {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
};

/**
 * Keeps <title>, description, canonical and Open Graph tags in sync with the
 * route after client-side navigation. The initial values are written into the
 * static HTML by scripts/prerender.mjs, from the same data.
 */
export function usePageMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = pathname !== "/" ? pathname.replace(/\/$/, "") : pathname;
    const meta = metaFor(path);
    const url = `${SITE_URL}${path === "/" ? "/" : path}`;
    document.title = meta.title;
    setMeta('meta[name="description"]', "content", meta.description);
    setMeta('link[rel="canonical"]', "href", url);
    setMeta('meta[property="og:title"]', "content", meta.title);
    setMeta('meta[property="og:description"]', "content", meta.description);
    setMeta('meta[property="og:url"]', "content", url);
    const ld = document.getElementById("ld-json");
    if (ld) ld.textContent = meta.jsonLd ? JSON.stringify(meta.jsonLd) : "{}";
  }, [pathname]);
}
