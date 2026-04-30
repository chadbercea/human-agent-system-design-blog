import { test, expect } from '@playwright/test';

const ROOT = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4322';

const HUBS: Array<{ slug: string; plural: string; expectedCount: number }> = [
  { slug: 'axioms', plural: 'Axioms', expectedCount: 5 },
  { slug: 'constraints', plural: 'Constraints', expectedCount: 4 },
  { slug: 'design-requirements', plural: 'Design Requirements', expectedCount: 4 },
];

test.describe('ILI-803 — three hub pages live with derived counts and hub-to-hub nav', () => {
  for (const hub of HUBS) {
    test(`/${hub.slug}/ — renders ${hub.expectedCount} members + locator + KEEP READING`, async ({ page }) => {
      const res = await page.goto(`${ROOT}/${hub.slug}/`);
      expect(res?.status()).toBe(200);
      await page.waitForLoadState('networkidle');

      const eyebrow = page.locator('.eyebrow').first();
      await expect(eyebrow).toContainText(`${hub.expectedCount}`);
      await expect(eyebrow).toContainText(/CONSTRAINT|AXIOM|DESIGN REQUIREMENT/i);

      const h1 = page.locator('h1.hub-title');
      await expect(h1).toHaveText(hub.plural);

      const memberCount = await page.locator('.hub-list-item').count();
      expect(memberCount).toBe(hub.expectedCount);

      const locator = page.locator('.framework-locator');
      await expect(locator).toBeVisible();

      const currentCell = locator.locator('.framework-locator-cell.is-current');
      await expect(currentCell).toHaveCount(1);
      await expect(currentCell).toContainText(hub.plural);

      const others = HUBS.filter((h) => h.slug !== hub.slug);
      const footLinks = page.locator('.hub-foot-links a');
      await expect(footLinks).toHaveCount(2);
      for (const other of others) {
        await expect(page.locator(`.hub-foot-links a[href="/${other.slug}"]`)).toBeVisible();
      }
    });
  }

  test('mismatched category/concept returns 404', async ({ page }) => {
    const res = await page.goto(`${ROOT}/axioms/gradient-descent/`);
    expect(res?.status()).toBe(404);
  });
});
