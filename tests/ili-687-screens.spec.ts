import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'screenshots', 'ili-687');
fs.mkdirSync(OUT, { recursive: true });

test.describe('ILI-687 — article reader list styling', () => {
  test('1920×1080 — bullets inside article content area', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    // "The Career Path for HAS Designers" has a Key Points list
    await page.getByText('The Career Path for HAS Designers').click();
    await page.waitForTimeout(800);

    const ul = page.locator('.art-body ul').first();
    await ul.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(OUT, 'desktop-1920-bullets.png'), fullPage: false });

    // ul padding-left should be 1.5em of body font-size (1.1vw of 1920 = 21.12px -> 31.68px)
    const body = page.locator('.art-body').first();
    const bodyFs = await body.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    const ulPl = await ul.evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft));
    expect(ulPl).toBeCloseTo(bodyFs * 1.5, 0);

    const ulMb = await ul.evaluate((el) => parseFloat(getComputedStyle(el).marginBottom));
    expect(ulMb).toBeCloseTo(bodyFs, 0);

    // li left edge must be >= the paragraph left edge (inside the content column)
    const p = page.locator('.art-body p').first();
    const pBox = await p.boundingBox();
    const li = page.locator('.art-body li').first();
    const liBox = await li.boundingBox();
    if (!pBox || !liBox) throw new Error('missing boxes');
    expect(liBox.x).toBeGreaterThanOrEqual(pBox.x);
  });

  test('375×812 — mobile padding is 1.25em', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.getByText('The Career Path for HAS Designers').click();
    await page.waitForTimeout(500);

    const ul = page.locator('.art-body ul').first();
    await ul.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(OUT, 'mobile-375-bullets.png'), fullPage: false });

    const body = page.locator('.art-body').first();
    const bodyFs = await body.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    const ulPl = await ul.evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft));
    expect(ulPl).toBeCloseTo(bodyFs * 1.25, 0);
  });
});
