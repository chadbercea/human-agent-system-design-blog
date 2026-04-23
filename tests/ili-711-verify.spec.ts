import { test, expect } from '@playwright/test';

const URL = `http://localhost:${process.env.PORT || 4321}/design-system/`;

test('footer — desktop single row', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL);

  const footer = page.locator('.footer');
  await expect(footer).toBeVisible();

  await expect(footer).toContainText('END');
  await expect(footer).toContainText('HAS STYLE VIBE V01');
  await expect(footer.locator('strong').first()).toHaveText('END');
  await expect(footer).toContainText('BUILD');
  await expect(footer).toContainText('2026.04.23.1832');
  await expect(footer).toContainText('HASH');
  await expect(footer).toContainText('9F2A-8C1D');
  await expect(footer).toContainText('7 BARS');
  await expect(footer).toContainText('1 IDEA');

  const grid = await footer.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
  expect(grid.split(' ').length).toBe(5);

  await footer.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'verification-screenshots/ili-711-footer-desktop.png', fullPage: false });
});

test('footer — mobile stacked', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(URL);

  const footer = page.locator('.footer');
  await expect(footer).toBeVisible();
  const grid = await footer.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
  expect(grid.split(' ').length).toBe(1);

  await footer.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'verification-screenshots/ili-711-footer-mobile.png', fullPage: false });
});
