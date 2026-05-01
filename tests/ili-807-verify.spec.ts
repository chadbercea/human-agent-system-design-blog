import { test, expect } from '@playwright/test';

const ROOT = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4322';

const HUB_PATHS = ['/axioms', '/constraints', '/design-requirements'];

test.describe('ILI-807 — Framework nav item', () => {
  test('Framework dropdown is present on every chrome page (desktop)', async ({ page }) => {
    for (const path of ['/', '/blog', '/about', '/contact', ...HUB_PATHS, '/constraints/mirroring']) {
      await page.goto(`${ROOT}${path}`);
      const trigger = page
        .locator('.site-header .nav-dropdown-trigger', { hasText: 'Framework' })
        .first();
      await expect(trigger, `Framework trigger missing on ${path}`).toBeVisible();
    }
  });

  test('Framework dropdown reveals the three hubs', async ({ page }) => {
    await page.goto(`${ROOT}/`);
    const trigger = page
      .locator('.site-header .nav-dropdown-trigger', { hasText: 'Framework' })
      .first();
    await trigger.click();
    const panel = page.locator('#nav-framework-panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('a', { hasText: 'Axioms' })).toHaveAttribute('href', '/axioms');
    await expect(panel.locator('a', { hasText: 'Constraints' })).toHaveAttribute('href', '/constraints');
    await expect(panel.locator('a', { hasText: 'Design Requirements' })).toHaveAttribute('href', '/design-requirements');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('Framework trigger gets active state on hub pages', async ({ page }) => {
    for (const path of HUB_PATHS) {
      await page.goto(`${ROOT}${path}`);
      const trigger = page
        .locator('.site-header .nav-dropdown-trigger', { hasText: 'Framework' })
        .first();
      await expect(trigger, `Framework not active on ${path}`).toHaveAttribute('aria-current', 'page');
    }
  });

  test('Framework trigger gets active state on a concept page', async ({ page }) => {
    await page.goto(`${ROOT}/constraints/mirroring`);
    const trigger = page
      .locator('.site-header .nav-dropdown-trigger', { hasText: 'Framework' })
      .first();
    await expect(trigger).toHaveAttribute('aria-current', 'page');
  });

  test('opening Framework closes Resources (and vice versa)', async ({ page }) => {
    await page.goto(`${ROOT}/`);
    const framework = page
      .locator('.site-header .nav-dropdown-trigger', { hasText: 'Framework' })
      .first();
    const resources = page
      .locator('.site-header .nav-dropdown-trigger', { hasText: 'Resources' })
      .first();
    await framework.click();
    await expect(framework).toHaveAttribute('aria-expanded', 'true');
    await resources.click();
    await expect(framework).toHaveAttribute('aria-expanded', 'false');
    await expect(resources).toHaveAttribute('aria-expanded', 'true');
  });

  test('mobile drawer exposes Framework dropdown with the three hubs', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${ROOT}/`);
    await page.locator('[data-sh-burger]').click();
    const drawer = page.locator('[data-sh-drawer].is-open');
    await expect(drawer).toBeVisible();
    const trigger = drawer
      .locator('[data-mobile-dropdown-trigger]', { hasText: 'Framework' })
      .first();
    await trigger.click();
    const children = page.locator('#sh-drawer-framework-children');
    await expect(children.locator('a', { hasText: 'Axioms' })).toBeVisible();
    await expect(children.locator('a', { hasText: 'Constraints' })).toBeVisible();
    await expect(children.locator('a', { hasText: 'Design Requirements' })).toBeVisible();
  });

  test('screenshots — desktop nav, dropdown open, mobile drawer', async ({ page }) => {
    await page.goto(`${ROOT}/`);
    await page.waitForLoadState('networkidle');

    await page.locator('.site-header').screenshot({
      path: 'screenshots/ili-807-nav-closed.png',
    });

    await page
      .locator('.site-header .nav-dropdown-trigger', { hasText: 'Framework' })
      .first()
      .click();
    await page.waitForTimeout(150);
    await page.locator('.site-header').screenshot({
      path: 'screenshots/ili-807-nav-framework-open.png',
    });

    // Hub page — active state
    await page.goto(`${ROOT}/axioms`);
    await page.waitForLoadState('networkidle');
    await page.locator('.site-header').screenshot({
      path: 'screenshots/ili-807-nav-active-on-hub.png',
    });

    // Mobile drawer
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${ROOT}/`);
    await page.locator('[data-sh-burger]').click();
    await page.waitForTimeout(400);
    await page.locator('[data-sh-drawer]').screenshot({
      path: 'screenshots/ili-807-mobile-drawer.png',
    });

    await page
      .locator('[data-mobile-dropdown-trigger]', { hasText: 'Framework' })
      .first()
      .click();
    await page.waitForTimeout(200);
    await page.locator('[data-sh-drawer]').screenshot({
      path: 'screenshots/ili-807-mobile-framework-open.png',
    });
  });
});
