import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL_BASE = process.env.URL_BASE || 'http://localhost:4321';
const OUT = 'verification-screenshots/ili-806';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

async function shot(viewport, url, name, fullPage = false) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${URL_BASE}${url}`, { waitUntil: 'load' });
  await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
  await ctx.close();
}

// Anchor article (has framework references) — bar should appear
await shot({ width: 1440, height: 900 }, '/#were-assuming-the-system', 'anchor-with-framework-desktop');
await shot({ width: 390, height: 844 }, '/#were-assuming-the-system', 'anchor-with-framework-mobile');

// Hello world (no framework references) — no bar, no tag line
await shot({ width: 1440, height: 900 }, '/#hello-world', 'hello-world-no-framework-desktop');
await shot({ width: 390, height: 844 }, '/#hello-world', 'hello-world-no-framework-mobile');

await browser.close();
console.log('done');
