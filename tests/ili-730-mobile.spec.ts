import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('verification-screenshots/ili-730');
fs.mkdirSync(OUT, { recursive: true });

test('ILI-730 — mobile hero renders 4 story lines + cursor', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'load' });
  await page.waitForTimeout(4000);

  await page.screenshot({ path: path.join(OUT, 'hero-mobile-view.png'), fullPage: false });

  expect(await page.$$eval('.type-line', (els) => els.length)).toBe(4);
  expect(await page.$$eval('.cursor', (els) => els.length)).toBe(1);

  // Page must not scroll sideways at this viewport
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
