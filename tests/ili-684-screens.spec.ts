import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'screenshots', 'ili-684');
fs.mkdirSync(OUT, { recursive: true });

test.describe('ILI-684 verification — 78ch column, no lede rule', () => {
  test('1920×1080 — reader open, top', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, 'desktop-1920-top.png'), fullPage: false });

    const lede = page.locator('.art-lede');
    const borderBottom = await lede.evaluate((el) => getComputedStyle(el).borderBottomWidth);
    const paddingBottom = await lede.evaluate((el) => getComputedStyle(el).paddingBottom);
    const marginBottom = await lede.evaluate((el) => getComputedStyle(el).marginBottom);
    expect(borderBottom).toBe('0px');
    expect(paddingBottom).toBe('0px');
    expect(parseFloat(marginBottom)).toBeGreaterThan(0);
  });

  test('2560×1600 — widened column check', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1600 });
    await page.goto('/');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, 'desktop-2560-top.png'), fullPage: false });
  });

  test('400×900 — mobile reader', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 900 });
    await page.goto('/');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, 'mobile-400.png'), fullPage: true });
  });
});
