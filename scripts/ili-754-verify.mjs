import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT = resolve('verification-screenshots/ili-754');
mkdirSync(OUT, { recursive: true });

const URL = 'http://localhost:4321/';

const browser = await chromium.launch();

async function shootHomepage(name, viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  await ctx.close();
}

async function shootArticleOpen(name, viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(URL + '#the-system-is-the-third-thing', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  await ctx.close();
}

await shootHomepage('homepage-desktop', { width: 1440, height: 900 });
await shootArticleOpen('article-open-desktop', { width: 1440, height: 900 });
await shootHomepage('homepage-mobile', { width: 390, height: 844 });
await shootArticleOpen('article-open-mobile', { width: 390, height: 844 });

await browser.close();
console.log('done →', OUT);
