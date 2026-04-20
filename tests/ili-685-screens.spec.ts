import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'screenshots', 'ili-685');
fs.mkdirSync(OUT, { recursive: true });

test.describe('ILI-685 verification — vw typography, no max-width cap', () => {
  test('1400×900 — reader open', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('/');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, 'desktop-1400.png'), fullPage: false });

    const body = page.locator('.art-body').first();
    const bodyFs = await body.evaluate((el) => getComputedStyle(el).fontSize);
    // 1.4vw of 1400 = 19.6px
    expect(parseFloat(bodyFs)).toBeCloseTo(19.6, 0);

    const inner = page.locator('.article-inner');
    const maxW = await inner.evaluate((el) => getComputedStyle(el).maxWidth);
    expect(maxW).toBe('none');
  });

  test('1920×1080 — reader open', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, 'desktop-1920.png'), fullPage: false });

    const body = page.locator('.art-body').first();
    const bodyFs = await body.evaluate((el) => getComputedStyle(el).fontSize);
    // 1.4vw of 1920 = 26.88px
    expect(parseFloat(bodyFs)).toBeCloseTo(26.88, 0);
  });

  test('2560×1600 — reader open', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1600 });
    await page.goto('/');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, 'desktop-2560.png'), fullPage: false });

    const body = page.locator('.art-body').first();
    const bodyFs = await body.evaluate((el) => getComputedStyle(el).fontSize);
    // 1.4vw of 2560 = 35.84px
    expect(parseFloat(bodyFs)).toBeCloseTo(35.84, 0);
  });

  test('400×900 — mobile reader preserved', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 900 });
    await page.goto('/');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, 'mobile-400.png'), fullPage: true });

    const body = page.locator('.art-body').first();
    const bodyFs = await body.evaluate((el) => getComputedStyle(el).fontSize);
    expect(bodyFs).toBe('17px');
  });
});
