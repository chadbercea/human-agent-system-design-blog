import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL_BASE = process.env.URL_BASE || 'http://localhost:4321';
const OUT = 'verification-screenshots/ili-805';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

async function shot(viewport, url, name, fullPage = true) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${URL_BASE}${url}`, { waitUntil: 'load' });
  await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
  await ctx.close();
}

await shot({ width: 1440, height: 900 }, '/constraints/gradient-descent/', 'gradient-descent-desktop');
await shot({ width: 390, height: 844 }, '/constraints/gradient-descent/', 'gradient-descent-mobile');

// Smoke test a different concept (axioms category) — confirms the
// upgraded template renders for any concept slug, not just the one
// we converted to .mdx.
await shot({ width: 1440, height: 900 }, '/axioms/asymmetry-of-choice/', 'smoke-axioms-asymmetry-desktop');

await browser.close();
console.log('done');
