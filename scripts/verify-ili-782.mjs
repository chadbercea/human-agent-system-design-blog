import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4337';
const OUT = './verification-screenshots/ili-782';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];
const PAGES = ['/contact', '/thanks'];

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  for (const route of PAGES) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    const file = `${OUT}/${vp.name}${route.replace('/', '_')}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log('saved', file);
  }
  await ctx.close();
}
await browser.close();
