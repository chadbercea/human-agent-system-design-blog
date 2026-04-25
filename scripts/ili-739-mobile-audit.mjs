import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(process.argv[2] || 'screenshots/ili-739-before');
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'http://localhost:4321';

const routes = [
  { name: 'home', path: '/' },
  { name: 'design-system', path: '/design-system' },
  { name: 'about', path: '/about' },
  { name: 'glossary', path: '/glossary' },
  { name: 'contact', path: '/contact' },
];

const viewports = [
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'iphone-14', width: 390, height: 844 },
  { name: 'narrow-tablet', width: 768, height: 1024 },
  { name: 'breakpoint-edge', width: 899, height: 900 },
];

const browser = await chromium.launch();

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: vp.width < 768,
    hasTouch: vp.width < 768,
  });
  const page = await context.newPage();

  for (const r of routes) {
    await page.goto(`${BASE}${r.path}`, { waitUntil: 'load' });
    await page.waitForTimeout(1800);
    await page.screenshot({
      path: path.join(OUT, `${vp.name}-${r.name}.png`),
      fullPage: true,
    });
    console.log(`captured ${vp.name}-${r.name}.png`);
  }

  // Article-open state on mobile homepage
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const firstCard = await page.locator('.post-card').first();
  if (await firstCard.count()) {
    await firstCard.click().catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(OUT, `${vp.name}-home-article-open.png`),
      fullPage: true,
    });
    console.log(`captured ${vp.name}-home-article-open.png`);
  }

  await context.close();
}

await browser.close();
