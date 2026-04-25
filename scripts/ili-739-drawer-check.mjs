import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('screenshots/ili-739-drawer');
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:4321';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();

await page.goto(`${BASE}/`, { waitUntil: 'load' });
await page.waitForTimeout(1000);
await page.click('[data-sh-burger]');

// Mid-typing: ~150ms after open kick-off (started at 80ms). Each item ~22ms/char.
// Articles=8 chars → ~176ms typing. Capture mid-typing of 2nd item.
await page.waitForTimeout(280);
await page.screenshot({ path: path.join(OUT, 'mid-typing.png'), fullPage: false });
console.log('mid-typing captured');

// Post-typing: total typing budget ≈ 80 (kick) + 5×(8×22) + 4×60 = 80+880+240 = 1200ms.
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(OUT, 'settled.png'), fullPage: false });
console.log('settled captured');

await browser.close();
