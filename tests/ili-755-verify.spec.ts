import { test, expect } from '@playwright/test';

const URL = `http://localhost:${process.env.PORT || 4322}/`;
const NO_ANIM = `*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; }`;

test.describe('ILI-755 — post numbering is publish-order, not display-position', () => {
  test('homepage labels Hello, world. as POST 01 and Assuming the System as POST 02', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card');

    const newest = page.locator('.post-card').first();
    await expect(newest.locator('.post-card-title')).toHaveText("We're Assuming the System");
    await expect(newest.locator('.post-card-id')).toHaveText('// POST 02');

    const oldest = page.locator('.post-card').nth(1);
    await expect(oldest.locator('.post-card-title')).toHaveText('Hello, world.');
    await expect(oldest.locator('.post-card-id')).toHaveText('// POST 01');

    await page.screenshot({
      path: 'verification-screenshots/ili-755-homepage.png',
      fullPage: false,
    });
  });

  test('opening Hello, world. shows POST 01 in the article header', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card');

    await page.locator('.post-card').nth(1).click();
    await page.waitForTimeout(300);
    await expect(page.locator('#stage.open')).toBeVisible();
    await expect(page.locator('#art-head-id')).toHaveText('// POST 01');
    await expect(page.locator('#art-h1')).toHaveText('Hello, world.');

    await page.screenshot({
      path: 'verification-screenshots/ili-755-hello-world-open.png',
      fullPage: false,
    });
  });

  test('opening Were Assuming the System shows POST 02', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card');

    await page.locator('.post-card').first().click();
    await page.waitForTimeout(300);
    await expect(page.locator('#stage.open')).toBeVisible();
    await expect(page.locator('#art-head-id')).toHaveText('// POST 02');
    await expect(page.locator('#art-h1')).toHaveText("We're Assuming the System");

    await page.screenshot({
      path: 'verification-screenshots/ili-755-assuming-system-open.png',
      fullPage: false,
    });
  });
});
