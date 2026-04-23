import { test, expect } from '@playwright/test';

const URL = 'http://127.0.0.1:4322/design-system/';

test('design-system shell — desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL);
  await expect(page.locator('.rail--left')).toBeVisible();
  await expect(page.locator('.rail--right')).toBeVisible();
  await expect(page.locator('main')).toBeAttached();
  await page.screenshot({ path: 'verification-screenshots/ili-703-shell-desktop.png', fullPage: false });
});

test('design-system shell — mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(URL);
  await expect(page.locator('.rail--left')).toBeHidden();
  await expect(page.locator('.rail--right')).toBeHidden();
  await page.screenshot({ path: 'verification-screenshots/ili-703-shell-mobile.png', fullPage: false });
});
