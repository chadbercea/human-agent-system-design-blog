import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'screenshots', 'ili-783');
fs.mkdirSync(OUT, { recursive: true });

test.describe('ILI-783 — Resources: Reading List + System Recipes (placeholders)', () => {
  test('desktop: dropdown contains 5 items in canonical order', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-resources-trigger]').click();
    const items = page.locator('[data-resources-panel] a');
    await expect(items).toHaveCount(5);
    await expect(items.nth(0)).toHaveText('Glossary');
    await expect(items.nth(1)).toHaveText('Design System');
    await expect(items.nth(2)).toHaveText('Diagnostic');
    await expect(items.nth(3)).toHaveText('Reading List');
    await expect(items.nth(4)).toHaveText('System Recipes');
    await expect(items.nth(3)).toHaveAttribute('href', '/reading-list');
    await expect(items.nth(4)).toHaveAttribute('href', '/system-recipes');

    await page.screenshot({ path: path.join(OUT, 'desktop-dropdown-open.png'), fullPage: false });
  });

  test('desktop: Resources parent active on both new routes; correct child marked', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const [route, child] of [
      ['/reading-list', '/reading-list'],
      ['/system-recipes', '/system-recipes'],
    ]) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('[data-resources-trigger]')).toHaveAttribute('aria-current', 'page');
      await page.locator('[data-resources-trigger]').click();
      await expect(
        page.locator(`[data-resources-panel] a[href="${child}"]`)
      ).toHaveAttribute('aria-current', 'page');
    }
  });

  test('mobile: accordion expands to 5 items; auto-expands on placeholder routes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/reading-list');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-sh-burger]').click();
    await page.waitForTimeout(150);

    const wrap = page.locator('[data-mobile-resources]');
    await expect(wrap).toHaveClass(/is-open/);
    const children = page.locator('[data-mobile-resources-children] a');
    await expect(children).toHaveCount(5);
    await expect(children.nth(3)).toHaveAttribute('href', '/reading-list');
    await expect(children.nth(4)).toHaveAttribute('href', '/system-recipes');
    await expect(children.nth(3)).toHaveAttribute('aria-current', 'page');

    await page.screenshot({ path: path.join(OUT, 'mobile-accordion-reading-list.png'), fullPage: true });
  });

  test('placeholder pages render expected copy + CTA → /blog', async ({ page }) => {
    for (const [route, heading] of [
      ['/reading-list', 'READING LIST · COMING SOON'],
      ['/system-recipes', 'SYSTEM RECIPES · COMING SOON'],
    ]) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const block = page.locator('main.coming-soon');
      await expect(block).toBeVisible();
      await expect(block).toContainText(heading);
      await expect(block).toContainText('CONTENT IN PRODUCTION');
      await expect(block).toContainText('CHANNEL ACTIVE');
      await expect(block).toContainText('CHECK BACK SOON');

      const cta = block.locator('a.cs-cta');
      await expect(cta).toHaveAttribute('href', '/blog');
      await expect(cta).toContainText('BACK TO ARTICLES');

      await page.screenshot({
        path: path.join(OUT, `desktop${route.replace(/\//g, '-')}.png`),
        fullPage: false,
      });

      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: path.join(OUT, `mobile${route.replace(/\//g, '-')}.png`),
        fullPage: false,
      });
    }
  });

  test('placeholder pages set noindex + appropriate <title>', async ({ page }) => {
    for (const [route, title] of [
      ['/reading-list', 'Reading List — Coming Soon'],
      ['/system-recipes', 'System Recipes — Coming Soon'],
    ]) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveTitle(title);
      const robots = await page.locator('meta[name="robots"]').getAttribute('content');
      expect(robots).toBe('noindex');
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      expect(ogTitle).toBe(title);
    }
  });

  test('no console errors on placeholder routes', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    for (const route of ['/reading-list', '/system-recipes']) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
    }
    expect(errors).toEqual([]);
  });
});
