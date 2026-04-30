import { test, expect } from '@playwright/test';

const ROOT = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4322';

test.describe('ILI-791 — anchor article: H2 + synopsis above diagnostic button', () => {
  test('desktop — H2 "The diagnostic" + paragraph render directly above .diag-embed', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${ROOT}/blog/`);
    await page.waitForLoadState('networkidle');

    const diag = page.locator('.art-body .diag-embed');
    await expect(diag).toBeVisible();

    // The element directly preceding .diag-embed should be a <p> (synopsis),
    // and the element preceding that <p> should be an <h2> "The diagnostic".
    const prevTags = await page.evaluate(() => {
      const diag = document.querySelector('.art-body .diag-embed') as HTMLElement | null;
      if (!diag) return null;
      const p = diag.previousElementSibling as HTMLElement | null;
      const h2 = p?.previousElementSibling as HTMLElement | null;
      return {
        pTag: p?.tagName ?? null,
        pText: p?.textContent?.trim() ?? null,
        h2Tag: h2?.tagName ?? null,
        h2Text: h2?.textContent?.trim() ?? null,
      };
    });

    expect(prevTags).not.toBeNull();
    expect(prevTags!.h2Tag).toBe('H2');
    expect(prevTags!.h2Text).toBe('The diagnostic');
    expect(prevTags!.pTag).toBe('P');
    expect(prevTags!.pText).toMatch(/scored/i);
    expect(prevTags!.pText).toMatch(/diagnosis updates/i);

    // Scroll synopsis into view; capture the band including the button.
    const h2 = page.locator('.art-body h2', { hasText: 'The diagnostic' });
    await h2.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: 'verification-screenshots/ili-791-desktop.png',
      fullPage: false,
    });
  });

  test('desktop — no orphan gap: bottom of synopsis sits just above top of button', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${ROOT}/blog/`);
    await page.waitForLoadState('networkidle');

    const gap = await page.evaluate(() => {
      const diag = document.querySelector('.art-body .diag-embed') as HTMLElement | null;
      const p = diag?.previousElementSibling as HTMLElement | null;
      if (!diag || !p) return null;
      const pBottom = p.getBoundingClientRect().bottom;
      const dTop = diag.getBoundingClientRect().top;
      return dTop - pBottom;
    });

    expect(gap).not.toBeNull();
    // .diag-embed has 2.5em margin-top; with 18-20px base font that's ~40-50px.
    // Anything under ~80px is "directly above" with no orphan spacing.
    expect(gap!).toBeGreaterThan(0);
    expect(gap!).toBeLessThan(80);
  });

  test('mobile — H2 + synopsis render in same order, no orphan gap', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${ROOT}/blog/`);
    await page.waitForLoadState('networkidle');

    const order = await page.evaluate(() => {
      const diag = document.querySelector('.art-body .diag-embed') as HTMLElement | null;
      const p = diag?.previousElementSibling as HTMLElement | null;
      const h2 = p?.previousElementSibling as HTMLElement | null;
      return {
        h2Tag: h2?.tagName ?? null,
        h2Text: h2?.textContent?.trim() ?? null,
        pTag: p?.tagName ?? null,
      };
    });

    expect(order.h2Tag).toBe('H2');
    expect(order.h2Text).toBe('The diagnostic');
    expect(order.pTag).toBe('P');

    const gap = await page.evaluate(() => {
      const diag = document.querySelector('.art-body .diag-embed') as HTMLElement | null;
      const p = diag?.previousElementSibling as HTMLElement | null;
      if (!diag || !p) return null;
      return diag.getBoundingClientRect().top - p.getBoundingClientRect().bottom;
    });
    expect(gap!).toBeGreaterThan(0);
    expect(gap!).toBeLessThan(80);

    const h2 = page.locator('.art-body h2', { hasText: 'The diagnostic' });
    await h2.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: 'verification-screenshots/ili-791-mobile.png',
      fullPage: false,
    });
  });
});
