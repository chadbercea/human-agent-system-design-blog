import { test, expect } from '@playwright/test';

const URL = 'http://127.0.0.1:4321/about';

test('about MVP — desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL);
  await expect(page.locator('h1.prose-h1')).toHaveText('About HAS-D');
  await expect(page.locator('p.eyebrow')).toHaveText('Human · Agent · System Design');
  const text = await page.locator('main').innerText();
  expect(text).not.toMatch(/[—–]/);
  await page.screenshot({ path: 'verification-screenshots/ili-693-about-desktop.png', fullPage: true });
});

test('about MVP — mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(URL);
  await page.screenshot({ path: 'verification-screenshots/ili-693-about-mobile.png', fullPage: true });
});
