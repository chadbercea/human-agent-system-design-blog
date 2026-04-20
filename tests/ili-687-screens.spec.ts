import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'screenshots', 'ili-687');
fs.mkdirSync(OUT, { recursive: true });

test.describe('ILI-687 — article reader list + responsive vertical gaps (clamp)', () => {
  test('1920×1080 — bullets inside column, gaps cap at spec max', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.getByText('The Career Path for HAS Designers').click();
    await page.waitForTimeout(800);

    const ul = page.locator('.art-body ul').first();
    await ul.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(OUT, 'desktop-1920-bullets.png'), fullPage: false });

    const body = page.locator('.art-body').first();
    const bodyFs = await body.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

    // ul padding-left stays 1.5em (unchanged — keeps bullets inside the column)
    const ulPl = await ul.evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft));
    expect(ulPl).toBeCloseTo(bodyFs * 1.5, 0);

    // At 1920 the middle rem term saturates all four clamps to their caps.
    const ulMb = await ul.evaluate((el) => parseFloat(getComputedStyle(el).marginBottom));
    expect(ulMb).toBe(20);

    const li = page.locator('.art-body li').first();
    const liMb = await li.evaluate((el) => parseFloat(getComputedStyle(el).marginBottom));
    expect(liMb).toBe(8);

    const lede = page.locator('.art-lede').first();
    const ledeMb = await lede.evaluate((el) => parseFloat(getComputedStyle(el).marginBottom));
    expect(ledeMb).toBe(24);

    const p = page.locator('.art-body p').first();
    const pMb = await p.evaluate((el) => parseFloat(getComputedStyle(el).marginBottom));
    expect(pMb).toBe(20);

    const h2 = page.locator('.art-body h2').first();
    const h2Mt = await h2.evaluate((el) => parseFloat(getComputedStyle(el).marginTop));
    const h2Mb = await h2.evaluate((el) => parseFloat(getComputedStyle(el).marginBottom));
    expect(h2Mt).toBe(40);
    expect(h2Mb).toBe(8);

    // li left edge ≥ paragraph left edge (bullets inside column)
    const pBox = await p.boundingBox();
    const liBox = await li.boundingBox();
    if (!pBox || !liBox) throw new Error('missing boxes');
    expect(liBox.x).toBeGreaterThanOrEqual(pBox.x);
  });

  test('375×812 — mobile unchanged (ILI-687 scope is desktop only)', async ({ page }) => {
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
