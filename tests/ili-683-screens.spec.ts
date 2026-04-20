import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'screenshots', 'ili-683');
fs.mkdirSync(OUT, { recursive: true });

test.describe('ILI-683 verification screenshots', () => {
  test('1920×1080 — mid article, reader open', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, 'desktop-1920-top.png'), fullPage: false });
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, 'desktop-1920-scrolled.png'), fullPage: false });
  });

  test('2560×1600 — bounded column, generous margins', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1600 });
    await page.goto('/');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, 'desktop-2560-top.png'), fullPage: false });
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, 'desktop-2560-scrolled.png'), fullPage: false });
  });

  test('400×900 — mobile reader', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 900 });
    await page.goto('/');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, 'mobile-400.png'), fullPage: true });
  });
});
