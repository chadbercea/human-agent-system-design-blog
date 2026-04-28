import { chromium } from "playwright";
import { resolve } from "node:path";

const URL = "file://" + resolve("screenshots/ili-770/v25-mockup.html");
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 600, height: 1000 }, deviceScaleFactor: 2 });
const page = await context.newPage();
page.on("pageerror", (e) => console.error(e.message));
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.fonts && document.fonts.status === "loaded");
await page.waitForTimeout(300);
await page.locator(".stage").screenshot({ path: resolve("screenshots/ili-770/00-v25-mockup.png") });
await browser.close();
console.log("ok");
