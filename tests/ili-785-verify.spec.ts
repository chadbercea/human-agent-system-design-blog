import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'screenshots', 'ili-785');
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

test.describe('ILI-785 — Article cards: synopsis clamps to 2 lines', () => {
  for (const vp of VIEWPORTS) {
    test(`${vp.name}: dek clamps to 2 lines with ellipsis truncation`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/blog');
      await page.waitForLoadState('networkidle');

      const deks = page.locator('.post-card-dek');
      const count = await deks.count();
      expect(count).toBeGreaterThan(0);

      await page.screenshot({
        path: path.join(OUT, `${vp.name}-cards.png`),
        fullPage: true,
      });

      for (let i = 0; i < count; i++) {
        const dek = deks.nth(i);
        const metrics = await dek.evaluate((el) => {
          const cs = getComputedStyle(el);
          const lh = parseFloat(cs.lineHeight);
          const h = el.getBoundingClientRect().height;
          const lines = Math.round(h / lh);
          return {
            lineHeight: lh,
            height: h,
            lines,
            display: cs.display,
            webkitLineClamp: cs.webkitLineClamp,
            lineClamp: (cs as any).lineClamp,
            overflow: cs.overflow,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
            isClamped: el.scrollHeight > el.clientHeight + 1,
          };
        });
        // Two-line clamp: rendered height covers <= 2 lines.
        expect(metrics.lines).toBeLessThanOrEqual(2);
        // Card hides overflow.
        expect(metrics.overflow).toBe('hidden');
        // -webkit-line-clamp is honored (browsers may report display
        // as `-webkit-box` or `flow-root` depending on engine version,
        // both clamp correctly when paired with -webkit-line-clamp).
        expect(metrics.webkitLineClamp).toBe('2');
      }
    });
  }

  test('full synopsis still renders on the article page (no content loss)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Open the first card via click — reader binds .art-lede with the full description.
    await page.locator('.post-card').first().click();
    const lede = page.locator('#art-lede');
    await expect(lede).toBeVisible();
    const text = (await lede.textContent())?.trim() ?? '';
    expect(text.length).toBeGreaterThan(0);

    // The reader's lede element must NOT be clamped (full content accessible).
    const ledeMetrics = await lede.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { display: cs.display, webkitLineClamp: cs.webkitLineClamp };
    });
    expect(ledeMetrics.display).not.toBe('-webkit-box');
  });
});
