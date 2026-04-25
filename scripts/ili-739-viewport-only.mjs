import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('screenshots/ili-739-viewport');
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:4321';
const routes = [
  { name: 'home', path: '/' },
  { name: 'design-system', path: '/design-system' },
  { name: 'about', path: '/about' },
  { name: 'glossary', path: '/glossary' },
  { name: 'contact', path: '/contact' },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();

for (const r of routes) {
  await page.goto(`${BASE}${r.path}`, { waitUntil: 'load' });
  await page.waitForTimeout(1800);
  await page.screenshot({
    path: path.join(OUT, `${r.name}.png`),
    fullPage: false,
  });
  console.log(`captured ${r.name}.png`);
}

// Drawer open
await page.goto(`${BASE}/`, { waitUntil: 'load' });
await page.waitForTimeout(1000);
await page.click('[data-sh-burger]').catch(() => {});
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, 'drawer-open.png'), fullPage: false });
console.log('captured drawer-open.png');

await browser.close();
