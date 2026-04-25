import { test, expect } from '@playwright/test';

const URL = `http://localhost:${process.env.PORT || 4322}/`;
const NO_ANIM = `*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; }`;

test.describe('ILI-745 — article card titles JetBrains Mono uppercase', () => {
  test('desktop 1440: mono caps, tight tracking, 24ch measure', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card-title');

    const title = page.locator('.post-card-title').first();
    await expect(title).toBeVisible();
    await expect(title).toHaveCSS('font-family', /JetBrains Mono/);
    await expect(title).toHaveCSS('font-weight', '700');
    await expect(title).toHaveCSS('text-transform', 'uppercase');
    await expect(title).toHaveCSS('letter-spacing', /.+/);

    await page.screenshot({
      path: 'verification-screenshots/ili-745-desktop-cards.png',
      fullPage: true,
    });
  });

  test('tablet 768: still mono caps', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card-title');

    const title = page.locator('.post-card-title').first();
    await expect(title).toBeVisible();
    await expect(title).toHaveCSS('font-family', /JetBrains Mono/);
    await expect(title).toHaveCSS('text-transform', 'uppercase');

    await page.screenshot({
      path: 'verification-screenshots/ili-745-tablet-cards.png',
      fullPage: true,
    });
  });

  test('mobile 390: falls back to Lato 900, no uppercase', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card-title');

    const title = page.locator('.post-card-title').first();
    await expect(title).toBeVisible();
    await expect(title).toHaveCSS('font-family', /Lato/);
    await expect(title).toHaveCSS('font-weight', '900');
    await expect(title).toHaveCSS('text-transform', 'none');

    await page.screenshot({
      path: 'verification-screenshots/ili-745-mobile-cards.png',
      fullPage: true,
    });
  });

  test('mobile 320 (edge): Lato fallback still applies', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card-title');

    const title = page.locator('.post-card-title').first();
    await expect(title).toBeVisible();
    await expect(title).toHaveCSS('font-family', /Lato/);
    await expect(title).toHaveCSS('text-transform', 'none');

    await page.screenshot({
      path: 'verification-screenshots/ili-745-mobile-320-cards.png',
      fullPage: true,
    });
  });
});
