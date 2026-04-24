import { test, expect } from '@playwright/test';

test('site-header on /design-system — desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/design-system/');
  const header = page.locator('.site-header');
  await expect(header).toBeVisible();
  await expect(header.locator('.sh-mark .sh-name')).toHaveText('HAS / STYLE');
  await expect(header.locator('.sh-mark .sh-dot')).toBeVisible();
  await expect(header.locator('.sh-mark .sh-logo')).toBeVisible();
  await expect(header.locator('.sh-telemetry .kv')).toHaveCount(3);
  await expect(header.locator('.sh-telemetry .kv').nth(0)).toContainText('REV');
  await expect(header.locator('.sh-telemetry .kv').nth(0)).toContainText('01.00');
  await expect(header.locator('.sh-telemetry .kv').nth(1)).toContainText('BUILD');
  await expect(header.locator('.sh-telemetry .kv').nth(2)).toContainText('CH');
  await expect(header.locator('.sh-telemetry .kv').nth(2)).toContainText('01');
  await page.screenshot({ path: 'verification-screenshots/ili-704-topbar-desktop.png', fullPage: false });
});

test('site-header on /design-system — mobile hides telemetry', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/design-system/');
  const header = page.locator('.site-header');
  await expect(header).toBeVisible();
  await expect(header.locator('.sh-name')).toBeVisible();
  await expect(header.locator('.sh-telemetry')).toBeHidden();
  await page.screenshot({ path: 'verification-screenshots/ili-704-topbar-mobile.png', fullPage: false });
});
