import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const OUT_DIR = resolve("screenshots/ili-766");
mkdirSync(OUT_DIR, { recursive: true });

const URL = "http://localhost:4321/diagnostic/index.html";

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2
});
const page = await context.newPage();

page.on("console", (m) => {
  console.log("[browser:" + m.type() + "]", m.text());
});
page.on("pageerror", (e) => console.error("[pageerror]", e.message));
page.on("response", (r) => {
  if (!r.ok()) console.warn("[bad response]", r.status(), r.url());
});

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.fonts && document.fonts.status === "loaded");
await page.waitForFunction(() => document.querySelector('#sliders .slider'), null, { timeout: 10000 });

// Apply v10 mockup pattern [1, 4, 2, 3, 5]
await page.evaluate(() => {
  const apply = (i, v) => {
    const input = document.getElementById("s-" + i);
    input.value = String(v);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };
  apply(0, 1);
  apply(1, 4);
  apply(2, 2);
  apply(3, 3);
  apply(4, 5);
});

await page.screenshot({ path: resolve(OUT_DIR, "01-diagnostic-page.png"), fullPage: true });

// Confirm Share button label and that Reset is enabled (because some are non-neutral)
const buttonLabel = await page.locator("#btn-share").innerText();
console.log("btn-share label:", JSON.stringify(buttonLabel));
const shareDisabled = await page.locator("#btn-share").isDisabled();
console.log("btn-share disabled:", shareDisabled);

// Open share modal
await page.click("#btn-share");

// Wait until preview is rendered (loading flag clears)
await page.waitForFunction(() => {
  const m = document.getElementById("share-modal");
  return m && m.dataset.open === "true" && m.dataset.loading === "false";
}, null, { timeout: 30000 });

await page.waitForTimeout(300); // settle

await page.screenshot({ path: resolve(OUT_DIR, "02-share-modal.png"), fullPage: false });

// Verify download button is rendered, enabled, visible
const downloadInfo = await page.evaluate(() => {
  const b = document.getElementById("btn-download");
  const r = b.getBoundingClientRect();
  return {
    text: b.textContent.trim(),
    disabled: b.disabled,
    rect: { x: r.x, y: r.y, w: r.width, h: r.height },
    inViewport: r.top >= 0 && r.bottom <= window.innerHeight && r.width > 0
  };
});
console.log("download button:", JSON.stringify(downloadInfo));

// Verify modal a11y
const a11y = await page.evaluate(() => {
  const m = document.getElementById("share-modal");
  return {
    role: m.getAttribute("role"),
    ariaModal: m.getAttribute("aria-modal"),
    ariaHidden: m.getAttribute("aria-hidden"),
    ariaLabelledby: m.getAttribute("aria-labelledby"),
    activeIsInside: m.contains(document.activeElement)
  };
});
console.log("a11y:", JSON.stringify(a11y));

// Test backdrop click closes — click corner outside the panel
await page.mouse.click(20, 20);
await page.waitForFunction(() => document.getElementById("share-modal").dataset.open !== "true");
console.log("backdrop close OK");

// Re-open for next tests
await page.click("#btn-share");
await page.waitForFunction(() => {
  const m = document.getElementById("share-modal");
  return m && m.dataset.open === "true" && m.dataset.loading === "false";
}, null, { timeout: 30000 });

// Snapshot the off-screen render node directly via DOM screenshot at scale
const renderHandle = await page.locator("#share-card");
await page.evaluate(() => {
  const stage = document.querySelector(".share-card-stage");
  stage.style.left = "0";
  stage.style.top = "0";
  stage.style.zIndex = "-1";
});
// Move modal away to capture render node directly
await page.evaluate(() => {
  const m = document.getElementById("share-modal");
  m.style.display = "none";
});
await renderHandle.screenshot({ path: resolve(OUT_DIR, "03-render-node-1080x1920.png") });

// Re-show modal
await page.evaluate(() => {
  const m = document.getElementById("share-modal");
  m.style.display = "";
});

// Pull the data URL of the captured PNG straight out so we can save the actual capture too
const captured = await page.evaluate(() => {
  const img = document.getElementById("share-preview-img");
  return img && img.src ? img.src : null;
});
if (captured && captured.startsWith("data:image/png;base64,")) {
  const b64 = captured.slice("data:image/png;base64,".length);
  writeFileSync(resolve(OUT_DIR, "04-captured-png.png"), Buffer.from(b64, "base64"));
  console.log("Saved captured PNG");
}

// ESC closes
await page.evaluate(() => {
  const m = document.getElementById("share-modal");
  m.style.display = "";
});
await page.keyboard.press("Escape");
await page.waitForFunction(() => document.getElementById("share-modal").dataset.open !== "true");
console.log("ESC close OK");

await browser.close();
console.log("Done. Artifacts in", OUT_DIR);
