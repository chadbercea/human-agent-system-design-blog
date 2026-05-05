import { test } from '@playwright/test';
import * as fs from 'fs';

test('sample pixel colors inside vs outside lockup', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4322/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(9000);

  // Take screenshot, sample pixels.
  const buf = await page.screenshot({ clip: { x: 0, y: 80, width: 1007, height: 740 } });
  fs.writeFileSync('/tmp/hero-clip.png', buf);

  const points = await page.evaluate(() => {
    const fb = document.querySelector('.frame-block') as HTMLElement;
    const r = fb.getBoundingClientRect();
    return {
      // INSIDE lockup, in padding area (above the eyebrow text), x=300 to avoid text
      insideTop: { x: 300, y: r.top + 12 },
      // INSIDE lockup, between H1 and dek (in margin-bottom of H1)
      insideMid: { x: 700, y: r.top + r.height / 2 - 20 },
      // INSIDE lockup, padding bottom area
      insideBot: { x: 300, y: r.top + r.height - 12 },
      // OUTSIDE lockup, just above
      outsideAbove: { x: 300, y: r.top - 30 },
      // OUTSIDE lockup, just below
      outsideBelow: { x: 300, y: r.top + r.height + 30 },
    };
  });
  console.log('SAMPLE POINTS:', JSON.stringify(points, null, 2));
  console.log('Saved screenshot clip to /tmp/hero-clip.png');
});
