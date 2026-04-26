import { test, expect } from '@playwright/test';

const URL = `http://localhost:${process.env.PORT || 4322}/glossary`;
const NO_ANIM = `*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; }`;

const SEEDED_SLUG = 'co-authored-epistemology';
const UNSEEDED_SLUG = 'different-not-lesser';

test.describe('ILI-753 — Glossary "Referenced In" backlinks', () => {
  test('seeded entry renders REFERENCED IN block linking to article hash', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });

    const entry = page.locator(`article[data-slug="${SEEDED_SLUG}"]`);
    const refs = entry.locator('.entry-references');
    await expect(refs).toBeVisible();
    await expect(refs.locator('.ref-label')).toHaveText('REFERENCED IN');
    await expect(refs.locator('.ref-label')).toHaveCSS('font-family', /JetBrains Mono/);
    await expect(refs.locator('.ref-label')).toHaveCSS('text-transform', 'uppercase');

    const link = refs.locator('.ref-link').first();
    await expect(link).toHaveAttribute('href', '/#hello-world');
    await expect(link.locator('.ref-num')).toHaveText('// POST 01');
    await expect(link.locator('.ref-num')).toHaveCSS('font-family', /JetBrains Mono/);
    await expect(link.locator('.ref-title')).toHaveText('Hello, world.');
    await expect(link.locator('.ref-title')).toHaveCSS('font-family', /Lato/);
  });

  test('entries without curated references skip the block entirely', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });

    const entry = page.locator(`article[data-slug="${UNSEEDED_SLUG}"]`);
    await expect(entry.locator('.entry-references')).toHaveCount(0);
  });

  test('mobile renders the references block in stacked entry layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });

    const entry = page.locator(`article[data-slug="${SEEDED_SLUG}"]`);
    const refs = entry.locator('.entry-references');
    await expect(refs).toBeVisible();
    await expect(refs.locator('.ref-link')).toHaveAttribute('href', '/#hello-world');
  });
});
