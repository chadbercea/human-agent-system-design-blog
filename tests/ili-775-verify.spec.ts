import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'screenshots', 'ili-775');
fs.mkdirSync(OUT, { recursive: true });

test.describe('ILI-775 — nav Resources dropdown + mobile accordion', () => {
  test('desktop: top-level nav has exactly 4 items in order', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const nav = page.locator('header.site-header nav.nav');
    // Top-level rows: 3 anchors + 1 trigger button
    const topLevel = nav.locator('> a, > .nav-resources > .nav-resources-trigger');
    await expect(topLevel).toHaveCount(4);

    const labels = await topLevel.evaluateAll((nodes) =>
      nodes.map((n) => (n.textContent || '').trim().replace(/\s+/g, ' '))
    );
    // Trigger label includes a "▾" glyph after "Resources" — match prefix.
    expect(labels[0]).toBe('Articles');
    expect(labels[1].startsWith('Resources')).toBeTruthy();
    expect(labels[2]).toBe('About');
    expect(labels[3]).toBe('Contact');

    // Glossary / Design System are NOT top-level anymore.
    await expect(nav.locator('> a[href="/glossary"]')).toHaveCount(0);
    await expect(nav.locator('> a[href="/design-system"]')).toHaveCount(0);
  });

  test('desktop: dropdown opens on click, contains Glossary/Design System/Diagnostic in order', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const trigger = page.locator('[data-resources-trigger]');
    const wrap = page.locator('[data-resources]');
    const panel = page.locator('[data-resources-panel]');

    await expect(panel).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    await expect(panel).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(wrap).toHaveClass(/is-open/);

    const items = panel.locator('a');
    await expect(items).toHaveCount(3);
    await expect(items.nth(0)).toHaveText('Glossary');
    await expect(items.nth(1)).toHaveText('Design System');
    await expect(items.nth(2)).toHaveText('Diagnostic');
    await expect(items.nth(0)).toHaveAttribute('href', '/glossary');
    await expect(items.nth(1)).toHaveAttribute('href', '/design-system');
    await expect(items.nth(2)).toHaveAttribute('href', '/diagnostic');
  });

  test('desktop: dropdown closes on outside click and on Escape', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const trigger = page.locator('[data-resources-trigger]');
    const wrap = page.locator('[data-resources]');

    // Outside click closes
    await trigger.click();
    await expect(wrap).toHaveClass(/is-open/);
    await page.locator('body').click({ position: { x: 10, y: 400 } });
    await expect(wrap).not.toHaveClass(/is-open/);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Escape closes and returns focus to trigger
    await trigger.click();
    await expect(wrap).toHaveClass(/is-open/);
    await page.keyboard.press('Escape');
    await expect(wrap).not.toHaveClass(/is-open/);
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-resources-trigger') !== null);
    expect(focused).toBeTruthy();
  });

  test('desktop: chevron rotates 180° on open', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const chevron = page.locator('.nav-resources-chevron');
    const closed = await chevron.evaluate((el) => getComputedStyle(el).transform);
    await page.locator('[data-resources-trigger]').click();
    await page.waitForTimeout(200);
    const open = await chevron.evaluate((el) => getComputedStyle(el).transform);
    expect(open).not.toBe(closed);
    // Rotated form contains "matrix(-1," i.e. cos(180°) = -1.
    expect(open).toContain('-1');
  });

  test('desktop: Resources parent is active on /glossary, /design-system', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const route of ['/glossary', '/design-system']) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      const trigger = page.locator('[data-resources-trigger]');
      await expect(trigger).toHaveAttribute('aria-current', 'page');
      // Articles link is NOT active on these routes. ILI-773 moved the
      // canonical articles route from `/` to `/blog`, so the nav link
      // points to `/blog` now.
      await expect(page.locator('header.site-header nav.nav > a[href="/blog"]')).not.toHaveAttribute('aria-current', 'page');
    }
  });

  test('desktop: active child is marked inside open dropdown on /glossary', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/glossary');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-resources-trigger]').click();
    const panel = page.locator('[data-resources-panel]');
    await expect(panel.locator('a[href="/glossary"]')).toHaveAttribute('aria-current', 'page');
    await expect(panel.locator('a[href="/design-system"]')).not.toHaveAttribute('aria-current', 'page');
    await expect(panel.locator('a[href="/diagnostic"]')).not.toHaveAttribute('aria-current', 'page');
  });

  test('desktop: ArrowDown on closed trigger opens panel and focuses first item', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const trigger = page.locator('[data-resources-trigger]');
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('[data-resources]')).toHaveClass(/is-open/);
    const focusedHref = await page.evaluate(() => (document.activeElement as HTMLAnchorElement | null)?.getAttribute('href'));
    expect(focusedHref).toBe('/glossary');
  });

  test('mobile: Resources accordion collapsed by default, expands on tap', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-sh-burger]').click();
    // Wait for typewriter to settle.
    await page.waitForTimeout(900);

    const wrap = page.locator('[data-mobile-resources]');
    const trigger = page.locator('[data-mobile-resources-trigger]');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(wrap).not.toHaveClass(/is-open/);

    await trigger.click();
    await expect(wrap).toHaveClass(/is-open/);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Children are visible and ordered.
    const children = page.locator('[data-mobile-resources-children] a');
    await expect(children).toHaveCount(3);
    await expect(children.nth(0)).toHaveAttribute('href', '/glossary');
    await expect(children.nth(1)).toHaveAttribute('href', '/design-system');
    await expect(children.nth(2)).toHaveAttribute('href', '/diagnostic');
  });

  test('mobile: accordion auto-expands when current route is a Resources child', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/glossary');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-sh-burger]').click();
    await page.waitForTimeout(150);
    const wrap = page.locator('[data-mobile-resources]');
    await expect(wrap).toHaveClass(/is-open/);
    await expect(page.locator('[data-mobile-resources-trigger]')).toHaveAttribute('aria-expanded', 'true');
  });

  test('mobile: accordion state does not persist across menu sessions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open drawer, expand accordion, close drawer.
    await page.locator('[data-sh-burger]').click();
    await page.waitForTimeout(900);
    await page.locator('[data-mobile-resources-trigger]').click();
    await expect(page.locator('[data-mobile-resources]')).toHaveClass(/is-open/);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // Reopen — accordion should be collapsed again.
    await page.locator('[data-sh-burger]').click();
    await page.waitForTimeout(150);
    await expect(page.locator('[data-mobile-resources]')).not.toHaveClass(/is-open/);
  });

  test('no console errors on home, glossary, design-system', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    for (const route of ['/', '/glossary', '/design-system']) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
    }
    expect(errors).toEqual([]);
  });
});
