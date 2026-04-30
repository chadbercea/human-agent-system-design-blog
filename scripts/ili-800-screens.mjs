import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL_BASE = process.env.URL_BASE || 'http://localhost:4322';
const OUT = 'verification-screenshots/ili-800';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

async function shotElement(viewport, url, locator, name) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${URL_BASE}${url}`, { waitUntil: 'load' });
  await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }' });
  await page.waitForTimeout(300);
  const el = page.locator(locator).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await el.screenshot({ path: `${OUT}/${name}.png` });
  await ctx.close();
}

// In-place on a real concept article
await shotElement({ width: 1440, height: 900 }, '/constraints/gradient-descent/', '.framework-locator', 'concept-page-desktop');
// On a hub
await shotElement({ width: 1440, height: 900 }, '/axioms/', '.framework-locator', 'hub-page-desktop');
// Mobile (single concept) — locator stacks
await shotElement({ width: 390, height: 844 }, '/constraints/gradient-descent/', '.framework-locator', 'concept-page-mobile');

// Showcase — design-system stack of all four states (3 currents + neutral)
async function shotShowcase(viewport, name) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${URL_BASE}/design-system`, { waitUntil: 'load' });
  await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }' });
  await page.waitForTimeout(300);
  const el = page.locator('.cat-locator-preview').first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await el.screenshot({ path: `${OUT}/${name}.png` });
  await ctx.close();
}
await shotShowcase({ width: 1440, height: 900 }, 'showcase-all-states');

await browser.close();
console.log('done');
