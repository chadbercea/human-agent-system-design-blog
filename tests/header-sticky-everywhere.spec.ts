import { expect, test } from '@playwright/test';

const PORT = Number(process.env.VERIFY_PORT) || 4322;
const BASE = `http://127.0.0.1:${PORT}`;

// design-system.css set `overflow-x: hidden` on `html, body` globally, which
// silently coerced overflow-y to auto and made body its own scroll container.
// The document scroll lives on <html>, so the sticky header pinned against
// body never stayed at the viewport top — broke on every page using
// DesignSystemLayout (glossary, design-system). Same trap had already been
// fixed once in chrome.css. Asserts every public route keeps the sticky
// header pinned at viewport top after scrolling.
const ROUTES = ['/', '/about', '/contact', '/glossary', '/design-system'];

for (const route of ROUTES) {
  test(`sticky header stays at viewport top after scroll · ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE}${route}`, { waitUntil: 'load' });
    await page.waitForTimeout(400);
    // Make sure there's something to scroll.
    await page.evaluate(() => {
      const s = document.createElement('div');
      s.style.height = '2000px';
      document.body.appendChild(s);
    });
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(200);
    const headerTop = await page.$eval('.site-header', (el) => el.getBoundingClientRect().top);
    // sticky header should be pinned at viewport top (within sub-pixel tolerance)
    expect(Math.abs(headerTop)).toBeLessThan(2);
  });
}
