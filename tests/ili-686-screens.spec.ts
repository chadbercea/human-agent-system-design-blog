import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'screenshots', 'ili-686');
fs.mkdirSync(OUT, { recursive: true });

test.describe('ILI-686 — tightened article section gaps (B2 mockup)', () => {
  test('1920×1080 — reader open, verify margins', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, 'desktop-1920.png'), fullPage: true });

    const lede = page.locator('.art-lede').first();
    const ledeMb = await lede.evaluate((el) => getComputedStyle(el).marginBottom);
    // 1.5rem = 24px
    expect(ledeMb).toBe('24px');

    const body = page.locator('.art-body').first();
    const bodyFs = await body.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    // body is 1.1vw of 1920 = 21.12px
    const p = page.locator('.art-body p').first();
    const pMb = await p.evaluate((el) => parseFloat(getComputedStyle(el).marginBottom));
    // 1em on body font-size
    expect(pMb).toBeCloseTo(bodyFs, 0);

    const h2 = page.locator('.art-body h2').first();
    const h2Mt = await h2.evaluate((el) => parseFloat(getComputedStyle(el).marginTop));
    const h2Fs = await h2.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    // 2em of h2 font-size
    expect(h2Mt).toBeCloseTo(h2Fs * 2, 0);

    const h2Mb = await h2.evaluate((el) => parseFloat(getComputedStyle(el).marginBottom));
    // 0.4em of h2 font-size
    expect(h2Mb).toBeCloseTo(h2Fs * 0.4, 0);
  });
});
