import { test, expect } from '@playwright/test';

const URL = `http://127.0.0.1:${process.env.PORT || 4322}/design-system/`;

test('topbar — desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL);
  const topbar = page.locator('.topbar');
  await expect(topbar).toBeVisible();
  await expect(topbar.locator('.mark .name')).toHaveText('HAS / STYLE');
  await expect(topbar.locator('.mark .dot')).toBeVisible();
  await expect(topbar.locator('.kv')).toHaveCount(4);
  await expect(topbar.locator('.kv').nth(0)).toContainText('REV');
  await expect(topbar.locator('.kv').nth(0)).toContainText('01.00');
  await expect(topbar.locator('.kv').nth(1)).toContainText('BUILD');
  await expect(topbar.locator('.kv').nth(1)).toContainText('2026.04.23');
  await expect(topbar.locator('.kv').nth(2)).toContainText('HASH');
  await expect(topbar.locator('.kv').nth(2)).toContainText('9F2A-8C1D');
  await expect(topbar.locator('.kv').nth(3)).toContainText('CH');
  await expect(topbar.locator('.kv').nth(3)).toContainText('01 / OPS');
  await page.screenshot({ path: 'verification-screenshots/ili-704-topbar-desktop.png', fullPage: false });
});

test('topbar — mobile stacks', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(URL);
  const topbar = page.locator('.topbar');
  await expect(topbar).toBeVisible();
  const columns = await topbar.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
  expect(columns.split(' ').length).toBe(1);
  await page.screenshot({ path: 'verification-screenshots/ili-704-topbar-mobile.png', fullPage: false });
});
