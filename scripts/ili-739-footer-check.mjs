import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('screenshots/ili-739-footer');
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

// 1. Home — scroll to bottom, footer should be revealed.
await page.goto(`${BASE}/`, { waitUntil: 'load' });
await page.waitForTimeout(1500);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(OUT, 'home-bottom.png'), fullPage: false });
console.log('home-bottom captured');

// 2. About — scroll to bottom.
await page.goto(`${BASE}/about`, { waitUntil: 'load' });
await page.waitForTimeout(1500);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(OUT, 'about-bottom.png'), fullPage: false });
console.log('about-bottom captured');

// 3. Open an article on home, scroll to bottom — footer should reveal.
await page.goto(`${BASE}/`, { waitUntil: 'load' });
await page.waitForTimeout(1500);
const card = page.locator('.post-card').first();
await card.click();
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(OUT, 'article-open-top.png'), fullPage: false });
console.log('article-open-top captured');
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(OUT, 'article-open-bottom.png'), fullPage: false });
console.log('article-open-bottom captured');

// 4. Glossary — scroll to bottom.
await page.goto(`${BASE}/glossary`, { waitUntil: 'load' });
await page.waitForTimeout(1500);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(OUT, 'glossary-bottom.png'), fullPage: false });
console.log('glossary-bottom captured');

await browser.close();
