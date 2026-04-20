import { test, expect } from '@playwright/test';

test('header and col-list stay at top after window scroll (sticky works)', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.locator('.article-item').first().click();
  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(200);

  const headerTop = await page.locator('.header').evaluate(
    (el) => el.getBoundingClientRect().top
  );
  expect(headerTop).toBeCloseTo(0, 1);

  const listTop = await page.locator('.col-list').evaluate(
    (el) => el.getBoundingClientRect().top
  );
  expect(listTop).toBeCloseTo(80, 1);
});

test('document scrolls when article is open', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.locator('.article-item').first().click();
  await page.waitForTimeout(700);

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => window.innerHeight);
  expect(scrollHeight).toBeGreaterThan(vh);
});

test('close restores homepage scroll position', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  const firstIdx = 0;
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('.article-item').nth(firstIdx).click();
  await page.waitForTimeout(600);
  const topAfterOpen = await page.evaluate(() => window.scrollY);
  expect(topAfterOpen).toBe(0);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const topAfterClose = await page.evaluate(() => window.scrollY);
  expect(topAfterClose).toBe(0);
});
