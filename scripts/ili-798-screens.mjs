import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL_BASE = process.env.URL_BASE || 'http://localhost:4322';
const OUT = 'verification-screenshots/ili-798';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

async function shot(viewport, name) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${URL_BASE}/design-system`, { waitUntil: 'load' });
  await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }' });
  await page.waitForTimeout(200);
  const dump = await page.evaluate(() => {
    const panels = [...document.querySelectorAll('section.panel')];
    const found = panels.find((p) => (p.querySelector('.panel-head .title')?.textContent || '').includes('CATEGORY LANGUAGE'));
    return {
      panelCount: panels.length,
      foundTop: found ? found.getBoundingClientRect().top + window.scrollY : null,
      bodyHeight: document.body.scrollHeight,
      docHeight: document.documentElement.scrollHeight,
      htmlOverflow: getComputedStyle(document.documentElement).overflow,
      bodyOverflow: getComputedStyle(document.body).overflow,
    };
  });
  console.log(name, JSON.stringify(dump));
  await ctx.close();
}

await shot({ width: 1440, height: 900 }, 'desktop');
await shot({ width: 768, height: 1024 }, 'tablet');
await shot({ width: 390, height: 1100 }, 'mobile');

await browser.close();
console.log('done');
