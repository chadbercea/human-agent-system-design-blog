import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('verification-screenshots/redacted-mobile');
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:4322';

const browser = await chromium.launch();

const viewports = [
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'iphone-14', width: 390, height: 844 },
  { name: 'narrow-tablet', width: 768, height: 1024 },
  { name: 'breakpoint-edge', width: 899, height: 900 },
  { name: 'desktop', width: 1280, height: 900 },
];

for (const v of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: v.width, height: v.height },
    deviceScaleFactor: 2,
    isMobile: v.width < 900,
    hasTouch: v.width < 900,
  });
  const page = await ctx.newPage();
  // Reset any unlocked state so we always see the fully-redacted view
  await page.goto(`${BASE}/glossary?reset=1`, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(OUT, `${v.name}-glossary.png`),
    fullPage: false,
  });
  // Scroll to first entry section and screenshot the redacted entries
  await page.evaluate(() => {
    const e = document.querySelector('.glossary-entry');
    if (e) e.scrollIntoView({ block: 'start' });
  });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(OUT, `${v.name}-entry.png`),
    fullPage: false,
  });
  console.log(`captured ${v.name}-glossary.png`);
  await ctx.close();
}

await browser.close();
