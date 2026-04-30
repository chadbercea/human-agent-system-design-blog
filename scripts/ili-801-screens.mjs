import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL_BASE = process.env.URL_BASE || 'http://localhost:4322';
const OUT = 'verification-screenshots/ili-801';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

async function shotPage(viewport, url, name) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${URL_BASE}${url}`, { waitUntil: 'load' });
  await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  await ctx.close();
}

await shotPage({ width: 1440, height: 900 }, '/axioms/', 'hub-axioms-desktop');
await shotPage({ width: 1440, height: 900 }, '/constraints/', 'hub-constraints-desktop');
await shotPage({ width: 1440, height: 900 }, '/design-requirements/', 'hub-design-requirements-desktop');
await shotPage({ width: 390, height: 844 }, '/constraints/', 'hub-constraints-mobile');

await browser.close();
console.log('done');
