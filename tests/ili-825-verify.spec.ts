import { test, expect } from '@playwright/test';

const PORT = process.env.PORT || 4322;
const INDEX = `http://localhost:${PORT}/`;

/**
 * ILI-825 — cold load animation sequence rework.
 *
 * New order: panels reveal at half-time first, then hero
 * (scan-lines → blur fade → frame-lines) runs as the final
 * step. Blur layer is 0% opacity until `.frame-block.is-revealing`
 * lands, then transitions to 100% during GLASS_FADE.
 *
 * Constants in ArticleListView.astro:
 *   PANEL_START_AT = 3600
 *   HERO_START_AT  = 4500
 */
test.describe('ILI-825 — cold load reorder', () => {
  test('phase 0 — black field on first paint', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(true);
    expect(await page.evaluate(() => document.body.classList.contains('has-hero-frame-play'))).toBe(true);

    // Hero blur layer must start invisible during cold load.
    const blurOpacity = await page.evaluate(() => {
      const fb = document.querySelector('.frame-block');
      if (!fb) return -1;
      const cs = getComputedStyle(fb, '::before');
      return Number(cs.opacity);
    });
    expect(blurOpacity).toBe(0);

    await page.screenshot({
      path: 'verification-screenshots/ili-825-phase0-black.png',
      fullPage: false,
    });
  });

  test('phase A — panels reveal at ~3.6s before hero scan starts', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // At t=3000ms (before panels start), everything should still be hidden
    // and hero scan-lines should still be hidden too.
    await page.waitForTimeout(3000);
    const at3s = await page.evaluate(() => ({
      header: Number(getComputedStyle(document.querySelector('.site-header')!).opacity),
      footer: Number(getComputedStyle(document.querySelector('.site-footer')!).opacity),
      firstScanVisible: document.querySelector('.scan-line')?.classList.contains('is-visible'),
    }));
    expect(at3s.header).toBe(0);
    expect(at3s.footer).toBe(0);
    expect(at3s.firstScanVisible).toBe(false);

    // At t=4200ms (after panels start at 3600, before hero scan at 4500),
    // panels should be visible/revealing but hero scan-lines still hidden.
    await page.waitForTimeout(1200);
    const at4_2s = await page.evaluate(() => ({
      header: Number(getComputedStyle(document.querySelector('.site-header')!).opacity),
      rail:   Number(getComputedStyle(document.querySelector('.rail')!).opacity),
      firstScanVisible: document.querySelector('.scan-line')?.classList.contains('is-visible'),
    }));
    expect(at4_2s.header).toBe(1);
    expect(at4_2s.rail).toBeGreaterThan(0);
    expect(at4_2s.firstScanVisible).toBe(false);

    await page.screenshot({
      path: 'verification-screenshots/ili-825-phaseA-panels.png',
      fullPage: false,
    });
  });

  test('phase B — hero scan starts at ~4.5s (panels already settled)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // Just after HERO_START_AT + INITIAL_DELAY (4500 + 280 ≈ 4800ms),
    // the first scan-line should have started revealing.
    await page.waitForTimeout(5000);
    const firstScanVisible = await page.evaluate(() =>
      document.querySelector('.scan-line')?.classList.contains('is-visible'),
    );
    expect(firstScanVisible).toBe(true);

    // Blur is still 0 — only flips on at lockupRevealAt.
    const blurOpacity = await page.evaluate(() => {
      const fb = document.querySelector('.frame-block');
      const cs = getComputedStyle(fb!, '::before');
      return Number(cs.opacity);
    });
    expect(blurOpacity).toBe(0);

    await page.screenshot({
      path: 'verification-screenshots/ili-825-phaseB-scanning.png',
      fullPage: false,
    });
  });

  test('blur fades on before frame-lines write in', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // Wait past lockupRevealAt so `.is-revealing` has landed and the blur
    // transition has run. HERO_START_AT(4500) + INITIAL_DELAY(280) +
    // 39*145 + 320 + 200 = ~10955ms.  Wait 11400 to clear the 400ms fade.
    await page.waitForTimeout(11400);

    const result = await page.evaluate(() => {
      const fb = document.querySelector('.frame-block');
      const isRevealing = fb?.classList.contains('is-revealing');
      const cs = getComputedStyle(fb!, '::before');
      return { isRevealing, opacity: Number(cs.opacity) };
    });
    expect(result.isRevealing).toBe(true);
    expect(result.opacity).toBe(1);

    await page.screenshot({
      path: 'verification-screenshots/ili-825-blur-on.png',
      fullPage: false,
    });
  });

  test('end state — boot classes cleared, lockup visible', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // Full boot ≈ 12.7s with current scan-line cadence. Wait 13.5s.
    await page.waitForTimeout(13500);

    const result = await page.evaluate(() => ({
      isBooting: document.body.classList.contains('is-index-booting'),
      heroPlaying: document.body.classList.contains('has-hero-frame-play'),
      header: Number(getComputedStyle(document.querySelector('.site-header')!).opacity),
      footer: Number(getComputedStyle(document.querySelector('.site-footer')!).opacity),
      blur: (() => {
        const fb = document.querySelector('.frame-block');
        return Number(getComputedStyle(fb!, '::before').opacity);
      })(),
    }));
    expect(result.isBooting).toBe(false);
    expect(result.heroPlaying).toBe(false);
    expect(result.header).toBe(1);
    expect(result.footer).toBe(1);
    expect(result.blur).toBe(1);

    await page.screenshot({
      path: 'verification-screenshots/ili-825-end-state.png',
      fullPage: false,
    });
  });

  test('reduced motion — end state on first paint, no boot', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(false);

    // Blur defaults to opacity 1 when no cold-load body class is set.
    const blurOpacity = await page.evaluate(() => {
      const fb = document.querySelector('.frame-block');
      const cs = getComputedStyle(fb!, '::before');
      return Number(cs.opacity);
    });
    expect(blurOpacity).toBe(1);

    await context.close();
  });
});
