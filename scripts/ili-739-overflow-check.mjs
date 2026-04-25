import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';
const routes = ['/', '/design-system', '/about', '/glossary', '/contact'];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();

for (const r of routes) {
  await page.goto(`${BASE}${r}`, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  const info = await page.evaluate(() => {
    const w = document.documentElement;
    const offenders = [];
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 1 && r.width > 0) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && el.className.toString().slice(0, 60)) || '',
          id: el.id || '',
          right: Math.round(r.right),
          width: Math.round(r.width),
        });
      }
    });
    return {
      viewport: window.innerWidth,
      docScrollW: w.scrollWidth,
      docClientW: w.clientWidth,
      bodyScrollW: document.body.scrollWidth,
      offenders: offenders.slice(0, 12),
    };
  });
  console.log(r, JSON.stringify(info, null, 2));
}

await browser.close();
