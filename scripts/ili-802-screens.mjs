import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL_BASE = process.env.URL_BASE || 'http://localhost:4322';
const OUT = 'verification-screenshots/ili-802';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

async function shotElement(viewport, locator, name) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${URL_BASE}/design-system`, { waitUntil: 'load' });
  await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }' });
  await page.waitForTimeout(300);
  const el = page.locator(locator).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await el.screenshot({ path: `${OUT}/${name}.png` });
  await ctx.close();
}

await shotElement({ width: 1440, height: 900 }, '.cat-link-preview', 'showcase-desktop');

// Hover state — focus the second link to demonstrate the hover treatment
async function shotHover(viewport, name) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${URL_BASE}/design-system`, { waitUntil: 'load' });
  await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }' });
  await page.waitForTimeout(300);
  const block = page.locator('.cat-link-preview').first();
  await block.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  // Hover the mirroring link (constraint, amber)
  const link = page.locator('.cat-link-preview-prose .concept-link--constraints').first();
  await link.hover();
  await page.waitForTimeout(200);
  await block.screenshot({ path: `${OUT}/${name}.png` });
  await ctx.close();
}
await shotHover({ width: 1440, height: 900 }, 'showcase-desktop-hover');

// Standalone prose at narrow viewport — bypass the page's mobile theatre-hide
async function shotIsolated(viewport, name) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${URL_BASE}/design-system`, { waitUntil: 'load' });
  const proseHtml = await page.evaluate(() => {
    const p = document.querySelector('.cat-link-preview-prose');
    return p ? p.outerHTML : '';
  });
  const styles = await page.evaluate(() => {
    return [...document.styleSheets]
      .map((s) => {
        try { return [...s.cssRules].map((r) => r.cssText).join('\n'); }
        catch { return ''; }
      })
      .join('\n');
  });
  await page.setContent(`<!doctype html><html><head><style>
    body { background: #0a0a0b; color: #fff; padding: 24px; margin: 0; font-family: 'Lato', sans-serif; }
    ${styles}
  </style></head><body>${proseHtml}</body></html>`);
  await page.waitForTimeout(200);
  const prose = page.locator('.cat-link-preview-prose').first();
  await prose.screenshot({ path: `${OUT}/${name}.png` });
  await ctx.close();
}
await shotIsolated({ width: 390, height: 800 }, 'prose-mobile');

await browser.close();
console.log('done');
