// Capture authentic screenshots of live project deployments for case studies.
// Usage: node scripts/capture_screens.mjs   (uses the locally installed Chrome)
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "legacy-assets/screens";
const TARGETS = [
  { name: "relevia-home", url: "https://bushrakhandoker708.github.io/relevia/" },
  { name: "bushal-home", url: "https://bushal.vercel.app/" },
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const t of TARGETS) {
  try {
    const res = await page.goto(t.url, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `${OUT}/${t.name}.png` });
    console.log(`${t.name}: HTTP ${res?.status()} -> ${page.url()}`);
  } catch (err) {
    console.log(`${t.name}: failed (${err.message.split("\n")[0]})`);
  }
}
await browser.close();
