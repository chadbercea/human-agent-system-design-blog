import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'screenshots', 'ili-771-footer');
fs.mkdirSync(OUT, { recursive: true });

const BASE = process.env.E2E_BASE || 'http://localhost:4326';
test.use({ baseURL: BASE });

test.describe('ILI-771 — diagnostic page footer pinning', () => {
  for (const [w, h] of [[1920, 1080], [1440, 900], [900, 1400], [375, 812]] as const) {
    test(`${w}x${h} — direct page footer position`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(BASE + '/diagnostic');
      await page.waitForTimeout(800);

      const foot = page.locator('.diag-foot');
      const fbox = await foot.boundingBox();
      const bodyH = await page.evaluate(() => document.documentElement.scrollHeight);
      // eslint-disable-next-line no-console
      console.log(`[${w}x${h}] foot=${fbox?.y}+${fbox?.height} bodyH=${bodyH} viewportH=${h}`);

      await page.screenshot({ path: path.join(OUT, `direct-${w}x${h}.png`), fullPage: false });
    });
  }
});
