// Captures the "after" screenshots in docs/screenshots/after/ from the built site.
// Usage: npm run build && npm run preview (in another terminal) && node scripts/screenshots.mjs
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:4173";
const OUT = "docs/screenshots/after";
const ROUTES = { home: "/", research: "/research", relevia: "/research/relevia", "ml-lab": "/ml-lab", projects: "/projects", hexalock: "/projects/hexalock", about: "/about", cv: "/cv", archive: "/archive" };
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 375, height: 812 } };

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: vpName === "mobile" ? 2 : 1, colorScheme: "dark", reducedMotion: "reduce" });
  const page = await ctx.newPage();
  for (const [name, path] of Object.entries(ROUTES)) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    // First screen as a visitor sees it, plus the full page for review.
    await page.screenshot({ path: `${OUT}/${name}-${vpName}.jpg`, type: "jpeg", quality: 80 });
    if (["home", "relevia"].includes(name)) {
      await page.screenshot({ path: `${OUT}/${name}-${vpName}-full.jpg`, type: "jpeg", quality: 70, fullPage: true });
    }
  }
  await ctx.close();
}
// One light-scheme capture to document the second theme.
const light = await browser.newContext({ viewport: VIEWPORTS.desktop, colorScheme: "light" });
const lp = await light.newPage();
await lp.goto(BASE + "/research/relevia", { waitUntil: "networkidle" });
await lp.screenshot({ path: `${OUT}/relevia-desktop-light.jpg`, type: "jpeg", quality: 80 });
await browser.close();
console.log("screenshots written to", OUT);
