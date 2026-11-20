import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  "/",
  "/research",
  "/research/relevia",
  "/ml-lab",
  "/ml-lab/wine-quality",
  "/projects",
  "/projects/studybuddy",
  "/projects/hexalock",
  "/projects/bushal",
  "/projects/relevia-app",
  "/about",
  "/cv",
  "/archive",
];

/** Collect console errors and page errors (including React hydration errors). */
function watchErrors(page) {
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

for (const route of ROUTES) {
  test.describe(route, () => {
    test("loads directly, hydrates without errors and has route-specific metadata", async ({ page }) => {
      const errors = watchErrors(page);
      const res = await page.goto(route);
      expect(res.status()).toBe(200);
      // Content is present in the static HTML, before any JavaScript runs.
      const html = await res.text();
      expect(html).toContain("<h1");
      expect(html).toMatch(/<link rel="canonical" href="https:\/\/[^"]+"/);
      expect(html).toContain('<script type="application/ld+json" id="ld-json">');
      await page.waitForLoadState("networkidle");
      await expect(page.locator("h1")).toHaveCount(1);
      expect(await page.title()).not.toBe("");
      expect(errors).toEqual([]);
    });

    test("has no detectable WCAG A/AA violations", async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const summary = results.violations.map((v) => `${v.id}: ${v.nodes.length} × ${v.nodes[0]?.target}`);
      expect(summary).toEqual([]);
    });

    test("does not scroll horizontally", async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}

test("unknown URLs return 404 with the not-found page", async ({ page }) => {
  const errors = watchErrors(page);
  const res = await page.goto("/no-such-page");
  expect(res.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/does not exist/);
  await page.waitForLoadState("networkidle");
  // The browser logs the document's own (intended) 404 status; anything else is a real error.
  expect(errors.filter((e) => !/status of 404/.test(e))).toEqual([]);
});

test("old routes redirect permanently", async ({ request }) => {
  for (const [from, to] of [
    ["/my-works", "/projects"],
    ["/my-story", "/about"],
  ]) {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers().location).toBe(to);
  }
});

test("sitemap lists every route and robots points to it", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const r of ROUTES) expect(sitemap).toContain(`${r === "/" ? "/" : r}</loc>`);
  expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap:");
});

test("every internal link resolves", async ({ page, request }) => {
  test.setTimeout(90_000);
  const seen = new Set();
  for (const route of ROUTES) {
    await page.goto(route);
    const hrefs = await page.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")));
    for (const h of hrefs) seen.add(h.split("#")[0] || "/");
  }
  const broken = [];
  for (const href of seen) {
    const res = await request.get(href);
    if (res.status() !== 200) broken.push(`${href} → ${res.status()}`);
  }
  expect(broken).toEqual([]);
});

test("skip link moves focus to the main content", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard test runs on desktop");
  await page.goto("/research/relevia");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("client-side navigation updates title and canonical", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Research" }).click();
  await expect(page).toHaveURL(/\/research$/);
  await expect(page).toHaveTitle("Research · Bushra Khandoker");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/research$/);
});

test("mobile menu opens, closes with Escape and returns focus", async ({ page, isMobile }) => {
  test.skip(!isMobile, "menu button only exists on small screens");
  await page.goto("/");
  const button = page.getByRole("button", { name: "Menu" });
  await button.click();
  await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
  await expect(button).toBeFocused();
});

test("the home page starts the bubble universe, and it can be paused and cleared", async ({ page, isMobile }) => {
  await page.goto("/");
  // Desktop: starts on its own once the page is idle. Phone: waits for the first touch.
  if (isMobile) {
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-hero] canvas")).toHaveCount(0);
    await page.touchscreen.tap(6, 130);
  }
  await expect(page.locator("[data-hero] canvas")).toBeVisible({ timeout: 20000 });
  await expect(page.getByText(/^\d+ \/ \d+ bubbles$/)).toBeVisible();
  const pause = page.getByRole("button", { name: "Pause" });
  await pause.click();
  await expect(page.getByRole("button", { name: "Play" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Clear" }).click();
  await expect(page.getByText(/^0 \//)).toBeVisible();
});

test("project pages load their 3D piece lazily and it survives taps", async ({ page, isMobile }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/projects/hexalock");
  if (isMobile) {
    // Tap only once the page has hydrated, or the listener is not there yet.
    await page.waitForLoadState("networkidle");
    await page.touchscreen.tap(6, 130);
  }
  const canvas = page.locator("[data-scene] canvas");
  await expect(canvas).toBeVisible({ timeout: 20000 });
  const box = await canvas.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.click(box.x + box.width / 3, box.y + box.height / 3);
  expect(errors).toEqual([]);
});

test("pages other than home never request the WebGL bundle", async ({ page }) => {
  const scripts = [];
  page.on("request", (r) => r.resourceType() === "script" && scripts.push(r.url()));
  for (const r of ["/research/relevia", "/projects", "/archive", "/about"]) {
    await page.goto(r);
    await page.waitForLoadState("networkidle");
  }
  expect(scripts.filter((u) => u.includes("BubbleUniverse"))).toEqual([]);
});
