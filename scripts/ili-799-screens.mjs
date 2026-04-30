import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL_BASE = process.env.URL_BASE || 'http://localhost:4322';
const OUT = 'verification-screenshots/ili-799';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

async function shot(viewport, name, locatorFn) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${URL_BASE}/design-system`, { waitUntil: 'load' });
  await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }' });
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const panels = document.querySelectorAll('section.panel');
    for (const p of panels) {
      const t = p.querySelector('.panel-head .title')?.textContent || '';
      if (t.includes('CATEGORY LANGUAGE')) {
        p.scrollIntoView({ block: 'start', behavior: 'instant' });
        break;
      }
    }
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  await ctx.close();
}

// Badges in isolation — bypasses the design-system page's mobile theatre-hide
async function shotIsolated(viewport, name) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  // Pull rendered HTML for the three badges from the design-system page
  // and remount on a clean canvas so the mobile media query in the page
  // doesn't display:none our subject.
  await page.goto(`${URL_BASE}/design-system`, { waitUntil: 'load' });
  const badgesHtml = await page.evaluate(() => {
    const row = document.querySelector('.cat-badge-preview-row');
    return row ? row.outerHTML : '';
  });
  const styles = await page.evaluate(() => {
    return [...document.styleSheets]
      .map((s) => {
        try {
          return [...s.cssRules].map((r) => r.cssText).join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');
  });
  await page.setContent(`<!doctype html><html><head><style>
    body { background: #0a0a0b; color: #fff; padding: 32px; margin: 0; font-family: 'Lato', sans-serif; }
    ${styles}
  </style></head><body>${badgesHtml}</body></html>`);
  await page.waitForTimeout(200);
  const row = page.locator('.cat-badge-preview-row').first();
  await row.screenshot({ path: `${OUT}/${name}.png` });
  await ctx.close();
}

await shot({ width: 1440, height: 900 }, 'panel-desktop');
await shotIsolated({ width: 900, height: 600 }, 'badges-only-wide');
await shotIsolated({ width: 390, height: 844 }, 'badges-only-mobile');

await browser.close();
console.log('done');
