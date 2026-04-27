import { test, expect } from '@playwright/test';

const URL = `http://localhost:${process.env.PORT || 4321}/`;
const NO_ANIM = `*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; }`;

test.describe('ILI-721 — post card HUD styling', () => {
  test('desktop homepage renders cards with HUD shell', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card');

    const first = page.locator('.post-card').first();
    await expect(first).toBeVisible();
    await expect(first.locator('.post-card-id')).toHaveText('// POST 02');
    await expect(first.locator('.post-card-date')).toContainText('2026.');
    await expect(first.locator('.post-card-title')).toBeVisible();
    await expect(first.locator('.post-card-read')).toContainText('MIN READ');
    await expect(first.locator('.post-card-tags')).toContainText('HAS-D');

    await page.waitForTimeout(400);
    await page.screenshot({
      path: 'verification-screenshots/ili-721-desktop-closed.png',
      fullPage: false,
    });
  });

  test('hover brightens card border', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card');
    const first = page.locator('.post-card').first();
    await first.hover();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: 'verification-screenshots/ili-721-desktop-hover.png',
      fullPage: false,
    });
  });

  test('opening an article keeps list visible and updates active state', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card');
    await page.locator('.post-card').first().click();
    await page.waitForTimeout(300);
    await expect(page.locator('#stage.open')).toBeVisible();
    await expect(page.locator('.post-card.active').first()).toBeVisible();
    await page.screenshot({
      path: 'verification-screenshots/ili-721-desktop-open.png',
      fullPage: false,
    });
  });

  test('mobile viewport renders cards stacked', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card');
    await page.waitForTimeout(300);
    await page.screenshot({
      path: 'verification-screenshots/ili-721-mobile.png',
      fullPage: true,
    });
  });
});
