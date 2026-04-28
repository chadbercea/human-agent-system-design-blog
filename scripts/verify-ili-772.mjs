import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const OUT_DIR = resolve("screenshots/ili-772");
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();

const desktop = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const dPage = await desktop.newPage();
dPage.on("pageerror", (e) => console.error("[pageerror]", e.message));

const routes = [
  ["home", "http://127.0.0.1:4321/"],
  ["about", "http://127.0.0.1:4321/about"],
  ["design-system", "http://127.0.0.1:4321/design-system"],
];

for (const [name, url] of routes) {
  await dPage.goto(url, { waitUntil: "networkidle" });
  await dPage.waitForFunction(
    () => document.fonts && document.fonts.status === "loaded"
  );
  await dPage.waitForTimeout(400);
  await dPage.screenshot({
    path: resolve(OUT_DIR, `desktop-${name}.png`),
    fullPage: false,
  });

  const railRect = await dPage.evaluate(() => {
    const left = document.querySelector(".rail--left");
    const right = document.querySelector(".rail--right");
    if (!left) return { error: "no left rail" };
    const cs = getComputedStyle(left);
    return {
      hasLeft: true,
      hasRight: !!right,
      leftBg: cs.backgroundColor,
      leftColor: cs.color,
      leftWidth: cs.width,
      leftHeight: left.getBoundingClientRect().height,
      viewportH: window.innerHeight,
    };
  });
  console.log(`[${name}]`, JSON.stringify(railRect, null, 2));
}

// Article-open state on home: rail should slide off
await dPage.goto("http://127.0.0.1:4321/", { waitUntil: "networkidle" });
await dPage.waitForTimeout(400);
const opened = await dPage.evaluate(() => {
  const item = document.querySelector(".col-list .post-item, [data-slug]");
  if (!item) return false;
  item.click();
  return true;
});
if (opened) {
  await dPage.waitForTimeout(500);
  await dPage.screenshot({
    path: resolve(OUT_DIR, "desktop-home-article-open.png"),
    fullPage: false,
  });
}

// Mobile: rail should be hidden
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
});
const mPage = await mobile.newPage();
await mPage.goto("http://127.0.0.1:4321/", { waitUntil: "networkidle" });
await mPage.waitForTimeout(400);
const mobileRail = await mPage.evaluate(() => {
  const left = document.querySelector(".rail--left");
  const right = document.querySelector(".rail--right");
  return {
    hasLeft: !!left,
    hasRight: !!right,
    leftDisplay: left ? getComputedStyle(left).display : null,
  };
});
console.log("[mobile]", JSON.stringify(mobileRail, null, 2));
await mPage.screenshot({
  path: resolve(OUT_DIR, "mobile-home.png"),
  fullPage: false,
});

await browser.close();
console.log("done →", OUT_DIR);
