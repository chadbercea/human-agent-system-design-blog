import { test, expect } from '@playwright/test';

const URL = `http://localhost:${process.env.PORT || 4322}/`;
const NO_ANIM = `*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; }`;

test.describe('ILI-731 — article H1 JetBrains Mono + mobile fallback', () => {
  test('desktop 1440: mono caps, tight tracking, 20ch measure', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card');
    await page.locator('.post-card').first().click();
    await page.waitForSelector('#stage.open');

    const h1 = page.locator('#art-h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCSS('font-family', /JetBrains Mono/);
    await expect(h1).toHaveCSS('font-weight', '700');
    await expect(h1).toHaveCSS('text-transform', 'uppercase');
    await expect(h1).toHaveCSS('letter-spacing', /.+/);
    await expect(h1).toHaveCSS('line-height', /.+/);

    await page.screenshot({
      path: 'verification-screenshots/ili-731-desktop-h1.png',
      fullPage: true,
    });
  });

  test('tablet 768: still mono caps', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card');
    await page.locator('.post-card').first().click();
    await page.waitForTimeout(200);

    const h1 = page.locator('#art-h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCSS('font-family', /JetBrains Mono/);
    await expect(h1).toHaveCSS('text-transform', 'uppercase');

    await page.screenshot({
      path: 'verification-screenshots/ili-731-tablet-h1.png',
      fullPage: true,
    });
  });

  test('mobile 390: falls back to Lato, no uppercase', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card');
    await page.locator('.post-card').first().click();
    await page.waitForTimeout(200);

    const h1 = page.locator('#art-h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCSS('font-family', /Lato/);
    await expect(h1).toHaveCSS('font-weight', '900');
    await expect(h1).toHaveCSS('text-transform', 'none');

    await page.screenshot({
      path: 'verification-screenshots/ili-731-mobile-h1.png',
      fullPage: true,
    });
  });

  test('mobile 320 (edge): Lato fallback still applies', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card');
    await page.locator('.post-card').first().click();
    await page.waitForTimeout(200);

    const h1 = page.locator('#art-h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCSS('font-family', /Lato/);
    await expect(h1).toHaveCSS('text-transform', 'none');

    await page.screenshot({
      path: 'verification-screenshots/ili-731-mobile-320-h1.png',
      fullPage: true,
    });
  });
});
