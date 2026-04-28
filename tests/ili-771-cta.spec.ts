import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'screenshots', 'ili-771-cta');
fs.mkdirSync(OUT, { recursive: true });

const BASE = process.env.E2E_BASE || 'http://localhost:4326';
const ARTICLE_TITLE = "We're Assuming the System";

test.use({ baseURL: BASE });

test.describe('ILI-771 — diag-embed CTA card', () => {
  for (const [w, h] of [[1920, 1080], [1440, 900], [900, 1100], [375, 812]] as const) {
    test(`${w}x${h} — CTA is 80px tall and full column width`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(BASE + '/');
      await page.getByText(ARTICLE_TITLE).first().click();
      await page.waitForTimeout(1500);

      const cta = page.locator('#art-body .diag-embed-cta');
      await cta.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);

      const ctaBox = await cta.boundingBox();
      const iframeBox = await page.locator('#art-body .diag-embed iframe').boundingBox();
      if (!ctaBox || !iframeBox) throw new Error('missing boxes');

      // 80px tall on every viewport
      expect(ctaBox.height).toBe(80);
      // Full width — same as the iframe (the article column)
      expect(Math.round(ctaBox.width)).toBe(Math.round(iframeBox.width));

      // Has correct text and target
      const href = await cta.getAttribute('href');
      const target = await cta.getAttribute('target');
      expect(href).toBe('/diagnostic');
      expect(target).toBe('_blank');
      await expect(cta).toContainText(/Open the diagnostic/i);

      await cta.screenshot({ path: path.join(OUT, `cta-${w}x${h}.png`), timeout: 5000 });
    });
  }
});
