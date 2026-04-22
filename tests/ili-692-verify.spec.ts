import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'screenshots', 'ili-692');
fs.mkdirSync(OUT, { recursive: true });

test.describe('ILI-692 — verify hello world pre-ship', () => {
  test('desktop 1920×1080 — homepage + article open', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const items = page.locator('.article-item');
    await expect(items).toHaveCount(1);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/Lorem ipsum/i);
    expect(bodyText).not.toMatch(/Placeholder/i);

    await page.screenshot({ path: path.join(OUT, 'desktop-default.png'), fullPage: false });

    await items.first().click();
    await page.waitForTimeout(800);

    await expect(page.locator('#art-h1')).toHaveText('Hello, world.');
    const lede = await page.locator('#art-lede').innerText();
    expect(lede.length).toBeGreaterThan(20);
    const body = await page.locator('#art-body').innerText();
    expect(body).toContain('HAS-D');
    expect(body).toContain('Chad');

    await page.screenshot({ path: path.join(OUT, 'desktop-article-open.png'), fullPage: false });
  });

  test('mobile 375×812 — homepage + article open', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT, 'mobile-default.png'), fullPage: false });

    await page.locator('.article-item').first().click();
    await page.waitForTimeout(600);
    await expect(page.locator('#art-h1')).toHaveText('Hello, world.');
    await page.screenshot({ path: path.join(OUT, 'mobile-article-open.png'), fullPage: false });
  });

  test('OG/social metadata is present with right title and URL', async ({ page }) => {
    await page.goto('/');
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
    const ogSite = await page.locator('meta[property="og:site_name"]').getAttribute('content');
    const twCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');

    expect(ogTitle).toBe('HAS Design');
    expect(ogType).toBe('website');
    expect(ogSite).toBe('HAS Design');
    expect(twCard).toBe('summary');
    expect(ogDesc && ogDesc.length).toBeGreaterThan(20);
    expect(desc && desc.length).toBeGreaterThan(20);
    expect(ogUrl).toMatch(/^https?:\/\/.+/);
    expect(canonical).toMatch(/^https?:\/\/.+/);
  });
});
