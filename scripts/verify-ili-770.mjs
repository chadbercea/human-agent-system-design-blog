import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const OUT_DIR = resolve("screenshots/ili-770");
mkdirSync(OUT_DIR, { recursive: true });

const URL = "file://" + resolve("public/diagnostic/index.html");

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2
});
const page = await context.newPage();

page.on("console", (m) => console.log("[browser:" + m.type() + "]", m.text()));
page.on("pageerror", (e) => console.error("[pageerror]", e.message));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.fonts && document.fonts.status === "loaded");
await page.waitForFunction(() => document.querySelector('#sliders .slider'), null, { timeout: 10000 });

// Mockup uses pattern [1, 4, 2, 3, 5] (0%, 75%, 25%, 50%, 100%)
await page.evaluate(() => {
  const apply = (i, v) => {
    const input = document.getElementById("s-" + i);
    input.value = String(v);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };
  apply(0, 1); apply(1, 4); apply(2, 2); apply(3, 3); apply(4, 5);
});

await page.click("#btn-share");
await page.waitForFunction(() => {
  const m = document.getElementById("share-modal");
  return m && m.dataset.open === "true" && m.dataset.loading === "false";
}, null, { timeout: 30000 });
await page.waitForTimeout(300);

await page.screenshot({ path: resolve(OUT_DIR, "02-share-modal.png"), fullPage: false });

// Snapshot the off-screen render node directly at 1080x1920
const renderHandle = await page.locator("#share-card");
await page.evaluate(() => {
  const stage = document.querySelector(".share-card-stage");
  stage.style.left = "0";
  stage.style.top = "0";
  stage.style.zIndex = "-1";
  const m = document.getElementById("share-modal");
  m.style.display = "none";
});
await renderHandle.screenshot({ path: resolve(OUT_DIR, "03-render-node-1080x1920.png") });

// Save the actual captured PNG (what ships when user clicks Download)
const captured = await page.evaluate(() => {
  const img = document.getElementById("share-preview-img");
  return img && img.src ? img.src : null;
});
if (captured && captured.startsWith("data:image/png;base64,")) {
  const b64 = captured.slice("data:image/png;base64,".length);
  writeFileSync(resolve(OUT_DIR, "04-captured-png.png"), Buffer.from(b64, "base64"));
  console.log("Saved captured PNG");
}

await browser.close();
console.log("Done. Artifacts in", OUT_DIR);
