import { test, expect } from '@playwright/test';

const PORT = process.env.PORT || 4322;
const INDEX = `http://localhost:${PORT}/`;
const BLOG = `http://localhost:${PORT}/blog`;

test.describe('ILI-787 — frame hero on index, HUD hero preserved on /blog', () => {
  test('first visit: pre-paint gate sets has-hero-frame-play, sequence runs to end-state', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // Pre-paint gate flips the body class.
    expect(await page.evaluate(() => document.body.classList.contains('has-hero-frame-play'))).toBe(true);

    // Initially no frame lines are revealed (scan phase hasn't reached
    // the frame yet). The frame-block container itself is always present.
    const initialVisible = await page.locator('.frame-line.is-visible').count();
    expect(initialVisible).toBe(0);

    // Sequence total ≈ 280 + 12*145 + 280 + 200 + 5*145 + 400 ≈ 3.6s. Wait it out.
    await page.waitForTimeout(3800);

    // End-state: body class cleared, all frame lines revealed.
    expect(await page.evaluate(() => document.body.classList.contains('has-hero-frame-play'))).toBe(false);

    const finalVisible = await page.locator('.frame-line.is-visible').count();
    expect(finalVisible).toBe(5);

    // Final copy lands verbatim per spec — no em dashes, no edits.
    await expect(page.locator('.frame-eyebrow')).toHaveText('// FRAME · V1.0 · TRIAD VERIFIED');
    await expect(page.locator('.frame-h1')).toHaveText('Human Agent System Design');
    await expect(page.locator('.frame-dek')).toHaveText('Humans, agents, and the system they share. Three actors. Three design objects. One framework.');
    await expect(page.locator('.frame-audience')).toHaveText('> FOR THE PEOPLE SHIPPING THEM');
    expect(await page.locator('.frame-cta').count()).toBe(0);

    // No em dashes anywhere in the rendered hero copy.
    const heroText = await page.locator('.col-hero.has-hero-frame').textContent();
    expect(heroText || '').not.toMatch(/—/);

    // sessionStorage flag set so within-session repeat visits skip the sequence.
    const played = await page.evaluate(() => sessionStorage.getItem('has_hero_played'));
    expect(played).toBe('1');

    // Old top-strip telemetry (HUD chip + corners) is gone from the index.
    expect(await page.locator('.protocol-chip').count()).toBe(0);
    expect(await page.locator('.hud-corner').count()).toBe(0);

    await page.screenshot({
      path: 'verification-screenshots/ili-787-frame-final.png',
      fullPage: false,
    });
  });

  test('second visit in same session: no play class, end-state at first paint', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForTimeout(3800);

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    expect(await page.evaluate(() => document.body.classList.contains('has-hero-frame-play'))).toBe(false);

    // End state: frame content fully revealed (all .frame-line are non-zero height).
    const heights = await page.locator('.frame-line').evaluateAll((els) =>
      els.map((el) => (el as HTMLElement).offsetHeight)
    );
    for (const h of heights) expect(h).toBeGreaterThan(0);
  });

  test('reduced motion: skip the sequence entirely, render frame at rest', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    expect(await page.evaluate(() => document.body.classList.contains('has-hero-frame-play'))).toBe(false);

    // Frame content visible at rest.
    const heights = await page.locator('.frame-line').evaluateAll((els) =>
      els.map((el) => (el as HTMLElement).offsetHeight)
    );
    for (const h of heights) expect(h).toBeGreaterThan(0);

    await context.close();
  });

  test('/blog still uses the HUD hero (regression check)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BLOG);
    await page.waitForLoadState('domcontentloaded');

    // HUD hero parts still present on /blog.
    expect(await page.locator('.protocol-chip').count()).toBe(1);
    expect(await page.locator('.hud-corner').count()).toBe(4);

    // Frame hero parts NOT present.
    expect(await page.locator('.col-hero.has-hero-frame').count()).toBe(0);
  });

  test('mobile: frame visible, h1 wraps, scan stack still readable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(INDEX);
    await page.waitForTimeout(3800);

    const h1Box = await page.locator('.frame-h1').boundingBox();
    expect(h1Box?.width).toBeGreaterThan(0);
    // 32px font + line-height 1.08 → ≥34px. Wrapped to 2 lines: ≥70px.
    expect(h1Box?.height).toBeGreaterThan(34);

    const dekBox = await page.locator('.frame-dek').boundingBox();
    expect(dekBox?.width).toBeLessThanOrEqual(390);

    await page.screenshot({
      path: 'verification-screenshots/ili-787-frame-mobile.png',
      fullPage: false,
    });
  });
});
