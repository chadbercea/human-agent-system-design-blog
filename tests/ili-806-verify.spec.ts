import { test, expect } from '@playwright/test';

const ROOT = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4322';

test.describe('ILI-806 — article framework affordance is data-driven', () => {
  test('article with references shows the bar; article without does not', async ({ page }) => {
    await page.goto(`${ROOT}/#were-assuming-the-system`);
    await page.waitForLoadState('networkidle');

    const framework = page.locator('#art-framework');
    await expect(framework).toBeVisible();
    await expect(framework.locator('.framework-locator')).toBeVisible();

    // No tags row should exist anywhere on the page.
    await expect(page.locator('#art-tags')).toHaveCount(0);
    await expect(page.locator('.art-tags')).toHaveCount(0);

    // Switch to hello-world via its post card.
    const helloCard = page.locator('.post-card[data-slug="hello-world"]').first();
    await helloCard.click();

    // Bar should be hidden.
    await expect(framework).toBeHidden();
  });

  test('hello-world deep-link does not render the bar', async ({ page }) => {
    await page.goto(`${ROOT}/#hello-world`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#stage')).toHaveClass(/open/);
    await expect(page.locator('#art-framework')).toBeHidden();
  });

  test('switching back from no-bar to bar article re-shows the bar', async ({ page }) => {
    await page.goto(`${ROOT}/#hello-world`);
    await page.waitForLoadState('networkidle');

    const framework = page.locator('#art-framework');
    await expect(framework).toBeHidden();

    await page.locator('.post-card[data-slug="were-assuming-the-system"]').first().click();
    await expect(framework).toBeVisible();
  });
});
