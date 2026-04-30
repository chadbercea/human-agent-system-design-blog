import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL_BASE = process.env.URL_BASE || 'http://localhost:4322';
const OUT = 'verification-screenshots/ili-797';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

async function shot(path, name, viewport = { width: 1440, height: 900 }) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${URL_BASE}${path}`, { waitUntil: 'load' });
  await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  await ctx.close();
}

await shot('/constraints/', 'hub-constraints');
await shot('/constraints/gradient-descent/', 'concept-gradient-descent');
await shot('/axioms/', 'hub-axioms');
await shot('/design-requirements/', 'hub-design-requirements');
await shot('/design-requirements/adversarial-interdependence/', 'concept-adversarial-interdependence', { width: 390, height: 844 });

await browser.close();
console.log('done');
