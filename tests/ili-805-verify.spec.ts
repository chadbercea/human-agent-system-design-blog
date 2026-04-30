import { test, expect } from '@playwright/test';

const ROOT = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4322';

test.describe('ILI-805 — Gradient Descent prototype article', () => {
  test('/constraints/gradient-descent — full template applied', async ({ page }) => {
    const res = await page.goto(`${ROOT}/constraints/gradient-descent/`);
    expect(res?.status()).toBe(200);

    const main = page.locator('main.prose-page');

    const locator = main.locator('.framework-locator');
    await expect(locator).toBeVisible();
    await expect(locator.locator('.framework-locator-cell--constraints.is-current')).toHaveCount(1);

    const badge = main.locator('.cat-badge--constraints').first();
    await expect(badge).toBeVisible();
    const pips = badge.locator('.cat-badge-pip');
    await expect(pips).toHaveCount(3);
    await expect(pips.filter({ has: page.locator('[class*="cat-glyph--constraints"]') }).first()).toBeVisible();

    await expect(main.locator('.concept-index')).toContainText('01');
    await expect(main.locator('.concept-index')).toContainText('04');

    await expect(main.locator('h1.prose-h1')).toHaveText('The Gradient Descent Problem');
    await expect(main.locator('.concept-synopsis')).toContainText('approval signal');
    await expect(main.locator('.concept-implication')).toContainText('approval-gradient convergence');

    const inlineLink = main.locator('.prose-body .concept-link--constraints[href="/constraints/mirroring"]').first();
    await expect(inlineLink).toBeVisible();
    await expect(inlineLink).toHaveText('Mirroring');

    const refSection = main.locator('.concept-referenced-by');
    await expect(refSection).toBeVisible();
    const refLinks = refSection.locator('a.concept-link');
    await expect(refLinks).toHaveCount(3);
    for (const slug of ['mirroring', 'spiral-detection', 'adversarial-interdependence']) {
      await expect(refSection.locator(`a[href="/constraints/${slug}"], a[href="/design-requirements/${slug}"]`)).toBeVisible();
    }
  });

  test('template generalizes — /axioms/asymmetry-of-choice renders with axiom-colored badge + locator', async ({ page }) => {
    const res = await page.goto(`${ROOT}/axioms/asymmetry-of-choice/`);
    expect(res?.status()).toBe(200);

    const main = page.locator('main.prose-page');
    await expect(main.locator('.framework-locator-cell--axioms.is-current')).toHaveCount(1);
    await expect(main.locator('.cat-badge--axioms').first()).toBeVisible();
    await expect(main.locator('h1.prose-h1')).toHaveText('The Asymmetry of Choice');
  });

  test('mobile — locator stacks and badge stays legible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const res = await page.goto(`${ROOT}/constraints/gradient-descent/`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('main.prose-page .cat-badge--constraints').first()).toBeVisible();
    await expect(page.locator('main.prose-page h1.prose-h1')).toHaveText('The Gradient Descent Problem');
  });
});
