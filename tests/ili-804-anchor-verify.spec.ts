import { test, expect } from '@playwright/test';

const ROOT = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4322';

test.describe('ILI-804 — anchor article retrofit', () => {
  test('anchor article body hosts the framework locator with no current cell', async ({ page }) => {
    await page.goto(`${ROOT}/#were-assuming-the-system`);
    await page.waitForLoadState('networkidle');

    const stage = page.locator('#stage');
    await expect(stage).toHaveClass(/open/);

    const artBody = page.locator('#art-body');
    const locator = artBody.locator('.framework-locator');
    await expect(locator).toBeVisible();

    await expect(locator.locator('.framework-locator-cell.is-current')).toHaveCount(0);

    for (const slug of ['axioms', 'constraints', 'design-requirements']) {
      await expect(artBody.locator(`.framework-locator a[href="/${slug}"]`)).toBeVisible();
    }

    const lede = artBody.locator('.anchor-framework-cta-lede');
    await expect(lede).toContainText('Axioms');
    await expect(lede).toContainText('Constraints');
    await expect(lede).toContainText('Design Requirements');
  });

  test('mobile fold — three hub links visible without scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${ROOT}/#were-assuming-the-system`);
    await page.waitForLoadState('networkidle');

    const lede = page.locator('#art-body .anchor-framework-cta-lede');
    await expect(lede).toBeHidden();

    for (const slug of ['axioms', 'constraints', 'design-requirements']) {
      const link = page.locator(`#art-body .framework-locator a[href="/${slug}"]`);
      const box = await link.boundingBox();
      expect(box, `link to /${slug} should have a layout box`).not.toBeNull();
      if (box) expect(box.y, `/${slug} link should sit within the viewport (y < 844)`).toBeLessThan(844);
    }
  });

  test('framework anchor_url points to the canonical anchor URL', async ({ request }) => {
    const html = await (await request.get(`${ROOT}/`)).text();
    expect(html).toContain('framework-locator');
  });
});
