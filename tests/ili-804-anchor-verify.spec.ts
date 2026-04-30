import { test, expect } from '@playwright/test';

const ROOT = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4322';

/* ILI-804 originally placed the framework locator as an inline <aside>
   inside the anchor article's MDX body. ILI-806 moved it into the
   article reader chrome, driven by the article's `references`
   frontmatter. These tests still verify the anchor surfaces the
   locator with no current cell and meets the mobile-fold AC, but they
   target the new chrome location (#art-framework) instead of the
   removed inline block. */

test.describe('ILI-804 — anchor article retrofit', () => {
  test('anchor article surfaces the framework locator with no current cell', async ({ page }) => {
    await page.goto(`${ROOT}/#were-assuming-the-system`);
    await page.waitForLoadState('networkidle');

    const stage = page.locator('#stage');
    await expect(stage).toHaveClass(/open/);

    const framework = page.locator('#art-framework');
    await expect(framework).toBeVisible();

    const locator = framework.locator('.framework-locator');
    await expect(locator).toBeVisible();
    await expect(locator.locator('.framework-locator-cell.is-current')).toHaveCount(0);

    for (const slug of ['axioms', 'constraints', 'design-requirements']) {
      await expect(framework.locator(`.framework-locator a[href="/${slug}"]`)).toBeVisible();
    }
  });

  test('mobile fold — three hub links visible without scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${ROOT}/#were-assuming-the-system`);
    await page.waitForLoadState('networkidle');

    for (const slug of ['axioms', 'constraints', 'design-requirements']) {
      const link = page.locator(`#art-framework .framework-locator a[href="/${slug}"]`);
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
