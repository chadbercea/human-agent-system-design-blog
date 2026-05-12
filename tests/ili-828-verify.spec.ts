import { test, expect } from '@playwright/test';

/* ILI-828 — pagination should swap the article list without
   rerouting the whole blog. Verifies:
   - Clicking page 02 does NOT navigate (URL stays on /blog).
   - The visible card set changes (page-1 cards hidden, page-2 cards shown).
   - The active-page indicator moves to 02.
   - The /blog/2 route no longer exists. */
test.describe('ILI-828 — client-side pagination swaps cards in place', () => {
  test('clicking page 02 does not navigate and swaps the visible cards', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    const strip = page.locator('.pagination-strip');
    // Skip cleanly when the archive only has one page worth of articles.
    if (!(await strip.isVisible().catch(() => false))) {
      test.skip(true, 'Only one page of articles — nothing to paginate.');
    }

    const pageBtn2 = page.locator('[data-pagination-page="2"]');
    await expect(pageBtn2).toBeVisible();

    const visibleBefore = await page.locator('.post-card:not([data-page-hidden])').count();
    expect(visibleBefore).toBeGreaterThan(0);
    const firstSlugBefore = await page
      .locator('.post-card:not([data-page-hidden])')
      .first()
      .getAttribute('data-slug');

    await pageBtn2.click();

    // URL stays on /blog (no full-page nav, no /blog/2).
    expect(new URL(page.url()).pathname).toBe('/blog');

    // Active state moved to 02.
    await expect(page.locator('[data-pagination-page="2"]')).toHaveClass(/is-active/);
    await expect(page.locator('[data-pagination-page="1"]')).not.toHaveClass(/is-active/);

    // Visible cards changed — different first card.
    const firstSlugAfter = await page
      .locator('.post-card:not([data-page-hidden])')
      .first()
      .getAttribute('data-slug');
    expect(firstSlugAfter).not.toBe(firstSlugBefore);

    // The cards we saw on page 1 are now hidden (still in DOM).
    await expect(
      page.locator(`.post-card[data-slug="${firstSlugBefore}"][data-page-hidden]`)
    ).toHaveCount(1);
  });

  test('/blog/2 route no longer exists', async ({ page }) => {
    const response = await page.goto('/blog/2', { waitUntil: 'domcontentloaded' });
    // Static build returns the 404 page (or hosting 404). Either way
    // the response status is not OK.
    expect(response).not.toBeNull();
    expect(response!.ok()).toBe(false);
  });
});
