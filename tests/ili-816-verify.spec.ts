import { test } from '@playwright/test';

test('ILI-816 — diagnostic page mobile screenshots', async ({ page }) => {
  // iPhone 14 Pro portrait
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:4321/diagnostic/index.html');
  await page.waitForSelector('.slider', { state: 'visible' });
  await page.screenshot({
    path: 'screenshots/ili-816/mobile-iphone-top.png',
  });
  await page.screenshot({
    path: 'screenshots/ili-816/mobile-iphone-full.png',
    fullPage: true,
  });

  // iPad portrait — used to fall into desktop layout because old breakpoint was 700px
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('http://localhost:4321/diagnostic/index.html');
  await page.waitForSelector('.slider', { state: 'visible' });
  await page.screenshot({
    path: 'screenshots/ili-816/mobile-ipad-portrait-full.png',
    fullPage: true,
  });

  // Desktop sanity check — should still be two-column with sliders left
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4321/diagnostic/index.html');
  await page.waitForSelector('.slider', { state: 'visible' });
  await page.screenshot({
    path: 'screenshots/ili-816/desktop-1440-top.png',
  });
});
