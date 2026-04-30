import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL_BASE = process.env.URL_BASE || 'http://localhost:4321';
const OUT = 'verification-screenshots/ili-804';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

async function open(viewport, url) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${URL_BASE}${url}`, { waitUntil: 'load' });
  await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }' });
  await page.waitForTimeout(400);
  return { ctx, page };
}

// Desktop — open the anchor article via #hash and shot the article column
{
  const { ctx, page } = await open({ width: 1440, height: 900 }, '/#were-assuming-the-system');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/anchor-open-desktop.png`, fullPage: false });
  await ctx.close();
}

// Mobile — same
{
  const { ctx, page } = await open({ width: 390, height: 844 }, '/#were-assuming-the-system');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/anchor-open-mobile.png`, fullPage: false });
  await ctx.close();
}

await browser.close();
console.log('done');
