import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'screenshots', 'ili-773');
fs.mkdirSync(OUT, { recursive: true });

test.describe('ILI-773 — paginated footer in the article list panel', () => {
  test('/blog renders the pagination footer (strip or single label)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    const footer = page.locator('.pagination-footer');
    await expect(footer).toBeVisible();
    // Either a single-page label OR a multi-page strip — both are valid
    // states for the footer depending on the current article count.
    const single = page.locator('.pagination-single');
    const strip = page.locator('.pagination-strip');
    const singleVisible = await single.isVisible().catch(() => false);
    const stripVisible = await strip.isVisible().catch(() => false);
    expect(singleVisible || stripVisible).toBe(true);

    await page.screenshot({ path: path.join(OUT, 'blog-desktop.png'), fullPage: false });
  });

  test('/ also renders the article list with the pagination footer', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.pagination-footer')).toBeVisible();
  });

  test('header Articles nav points to /blog and is current on /blog', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    const articlesLink = page.locator('header.site-header nav.nav a[href="/blog"]');
    await expect(articlesLink).toHaveCount(1);
    await expect(articlesLink).toHaveAttribute('aria-current', 'page');
  });

  test('footer sits flush at the bottom of the col-list panel', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    const colBox = await page.locator('.col-list').boundingBox();
    const footerBox = await page.locator('.pagination-footer').boundingBox();
    expect(colBox).not.toBeNull();
    expect(footerBox).not.toBeNull();
    // Footer bottom matches col-list bottom (within 1px).
    const colBottom = (colBox!.y + colBox!.height);
    const footerBottom = (footerBox!.y + footerBox!.height);
    expect(Math.abs(colBottom - footerBottom)).toBeLessThanOrEqual(1);
  });

  test('mobile renders the pagination footer at the foot of the panel', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    const footer = page.locator('.pagination-footer');
    await expect(footer).toBeVisible();
    await page.screenshot({ path: path.join(OUT, 'blog-mobile.png'), fullPage: true });
  });

  test('opening an article keeps the article reader navigation working', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    await page.locator('.post-card:not([data-page-hidden])').first().click();
    await expect(page.locator('#stage')).toHaveClass(/open/);
    await expect(page.locator('#art-h1')).not.toBeEmpty();
  });

  test('no console errors on /blog', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
});
