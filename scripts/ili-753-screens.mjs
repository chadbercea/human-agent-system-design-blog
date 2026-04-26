import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT = resolve('verification-screenshots/ili-753');
mkdirSync(OUT, { recursive: true });

const URL = 'http://localhost:4321/glossary';

const browser = await chromium.launch();

async function shoot(name, viewport, locatorSelector) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  if (locatorSelector) {
    const el = page.locator(locatorSelector).first();
    await el.scrollIntoViewIfNeeded();
    await el.screenshot({ path: `${OUT}/${name}.png` });
  } else {
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  }
  await ctx.close();
}

await shoot('desktop-full', { width: 1440, height: 900 });
await shoot('desktop-entry-05', { width: 1440, height: 900 }, 'article[data-slug="co-authored-epistemology"]');
await shoot('desktop-entry-01', { width: 1440, height: 900 }, 'article[data-slug="different-not-lesser"]');
await shoot('mobile-entry-05', { width: 390, height: 844 }, 'article[data-slug="co-authored-epistemology"]');

// Hover state: focus the link and capture
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  const link = page.locator('article[data-slug="co-authored-epistemology"] .ref-link').first();
  await link.scrollIntoViewIfNeeded();
  await link.hover();
  await page.waitForTimeout(150);
  const entry = page.locator('article[data-slug="co-authored-epistemology"]').first();
  await entry.screenshot({ path: `${OUT}/desktop-entry-05-hover.png` });
  await ctx.close();
}

await browser.close();
console.log('done →', OUT);
