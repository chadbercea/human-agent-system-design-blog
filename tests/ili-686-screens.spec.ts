import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'screenshots', 'ili-686');
fs.mkdirSync(OUT, { recursive: true });

test.describe('ILI-686 — tightened article section gaps (superseded by ILI-687 caps)', () => {
  test('1920×1080 — reader open, verify gaps cap at ILI-687 spec', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, 'desktop-1920.png'), fullPage: true });

    const lede = page.locator('.art-lede').first();
    const ledeMb = await lede.evaluate((el) => parseFloat(getComputedStyle(el).marginBottom));
    expect(ledeMb).toBe(24);

    const p = page.locator('.art-body p').first();
    const pMb = await p.evaluate((el) => parseFloat(getComputedStyle(el).marginBottom));
    expect(pMb).toBe(20);

    const h2 = page.locator('.art-body h2').first();
    const h2Mt = await h2.evaluate((el) => parseFloat(getComputedStyle(el).marginTop));
    expect(h2Mt).toBe(40);
    const h2Mb = await h2.evaluate((el) => parseFloat(getComputedStyle(el).marginBottom));
    expect(h2Mb).toBe(8);
  });
});
