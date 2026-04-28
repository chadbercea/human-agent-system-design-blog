import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'screenshots', 'ili-774');
fs.mkdirSync(OUT, { recursive: true });

test.describe('ILI-774 — header strip telemetry, right-align nav, gray ONLINE', () => {
  for (const [w, h] of [[1920, 1080], [1440, 900], [1100, 800], [900, 1100], [375, 812]] as const) {
    test(`${w}x${h} — header has two clusters and renders ONLINE in gray Light mono`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const header = page.locator('header.site-header');
      await expect(header).toBeVisible();

      // Telemetry block is gone from the DOM
      await expect(header.locator('.sh-telemetry')).toHaveCount(0);
      await expect(header.locator('[data-channel-value="header"]')).toHaveCount(0);

      // ONLINE renders, no HAS / DESIGN
      const name = header.locator('.sh-name');
      await expect(name).toHaveText('ONLINE');

      // Gray (var(--mid) = #8a8a8c) and weight 300
      const nameColor = await name.evaluate((el) => getComputedStyle(el).color);
      expect(nameColor).toBe('rgb(138, 138, 140)');
      const nameWeight = await name.evaluate((el) => getComputedStyle(el).fontWeight);
      expect(nameWeight).toBe('300');
      const nameFamily = await name.evaluate((el) => getComputedStyle(el).fontFamily);
      expect(nameFamily.toLowerCase()).toContain('jetbrains');

      // Disc is still flashing (animation set)
      const dotAnim = await header.locator('.sh-dot').evaluate((el) => getComputedStyle(el).animationName);
      expect(dotAnim).not.toBe('none');

      if (w > 900) {
        // Desktop — nav visible, right-aligned, burger hidden
        const nav = header.locator('nav.nav');
        await expect(nav).toBeVisible();
        const navBox = await nav.boundingBox();
        const headerBox = await header.boundingBox();
        if (!navBox || !headerBox) throw new Error('missing boxes');
        // Nav's right edge sits within the header's right padding (1.5rem=24 or 2.5rem=40)
        const distFromRight = (headerBox.x + headerBox.width) - (navBox.x + navBox.width);
        expect(distFromRight).toBeGreaterThan(0);
        expect(distFromRight).toBeLessThanOrEqual(48);

        await expect(header.locator('.sh-burger')).toBeHidden();
      } else {
        // Mobile — nav hidden, burger visible
        await expect(header.locator('nav.nav')).toBeHidden();
        await expect(header.locator('.sh-burger')).toBeVisible();
      }

      await header.screenshot({ path: path.join(OUT, `header-${w}x${h}.png`) });
    });
  }

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
});
