import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('verification-screenshots/ili-738');
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
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

for (const r of routes) {
  await page.goto(`${BASE}${r.path}`, { waitUntil: 'load' });
  // Long enough for chrome fade (160ms), main rise (640+stagger), and any
  // route flourish to settle (~1.4s for archive). 1700ms is the floor.
  await page.waitForTimeout(1700);
  await page.screenshot({ path: path.join(OUT, `${r.name}-settled.png`), fullPage: false });
  console.log(`captured ${r.name}-settled.png`);
}

// Capture the archive overlay mid-typing.
await page.goto(`${BASE}/`, { waitUntil: 'load' });
await page.waitForTimeout(800);
await page.click('a[href="/glossary"]');
await page.waitForURL('**/glossary');
// Overlay shows ~900-1200ms after page-load while lines type in.
await page.waitForTimeout(900);
await page.screenshot({ path: path.join(OUT, 'glossary-overlay-mid.png'), fullPage: false });
console.log('captured glossary-overlay-mid.png');

// Mid-transition signal-loss capture — go from glossary to about, snapshot
// during loss before swap.
await page.goto(`${BASE}/glossary`, { waitUntil: 'load' });
await page.waitForTimeout(1500);

await Promise.all([
  page.click('a[href="/about"]').catch(() => {}),
  (async () => {
    // Catch the loss frame as soon as it appears.
    await page.waitForFunction(() => document.body.getAttribute('data-signal') === 'loss', null, { timeout: 1500 }).catch(() => {});
    await page.screenshot({ path: path.join(OUT, 'transition-signal-loss.png'), fullPage: false });
    console.log('captured transition-signal-loss.png');
  })(),
]);

await browser.close();
