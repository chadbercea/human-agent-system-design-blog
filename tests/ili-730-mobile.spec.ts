import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('verification-screenshots/ili-730');
fs.mkdirSync(OUT, { recursive: true });

test('ILI-730 — mobile hero renders full story on one line per row', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'load' });
  await page.waitForTimeout(3200);

  await page.screenshot({ path: path.join(OUT, 'hero-mobile-view.png'), fullPage: false });

  // Each story line should fit on a single visual row — no wrap.
  const heights = await page.$$eval('.type-line', (els) => els.map((el) => el.getBoundingClientRect().height));
  const lineHeight = Math.min(...heights);
  for (const h of heights) {
    expect(h).toBeLessThan(lineHeight * 1.5);
  }
});
