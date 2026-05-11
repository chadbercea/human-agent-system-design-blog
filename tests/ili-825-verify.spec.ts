import { test, expect } from '@playwright/test';

const PORT = process.env.PORT || 4322;
const INDEX = `http://localhost:${PORT}/`;

/**
 * ILI-825 — cold load animation sequence rework.
 *
 * Order:
 *   1. Scan-line reveal is the INITIAL animation (runs from t=0).
 *   2. At the half-mark of the scan clock (~3s), panels slot in
 *      at their canonical 180ms cadence — header → rail → list → footer.
 *   3. Hero CONTENT (lockup) is the FINAL step. Glass blur fades
 *      0 → 1 during GLASS_FADE just before the first frame-line
 *      writes in.
 *
 * Computed timing (mirrors the orchestrator constants):
 *   INITIAL_DELAY=280, CADENCE=145, SCAN_LINES_COUNT=40
 *   lastScanAt        = 280 + 39*145 = 5935
 *   PANEL_START_AT    = floor(5935/2) = 2967
 *   scanSettleAt      = 5935 + 320   = 6255
 *   lockupRevealAt    = 6255 + 200   = 6455   (blur fades here)
 *   frameLinesStartAt = 6455 + 400   = 6855
 *   bootEndAt         ≈ 8155ms
 */
test.describe('ILI-825 — cold load reorder', () => {
  test('phase 0 — black field on first paint, scan + blur both hidden', async ({ page }) => {
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

  test('scan-lines are the initial animation — printing while panels are still hidden', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // At t=1500ms, the scan-line reveal is mid-run and the panels
    // (which slot in at ~2967ms) are still hidden.
    await page.waitForTimeout(1500);
    const at1_5s = await page.evaluate(() => {
      const lines = Array.from(document.querySelectorAll('.scan-stack .scan-line'));
      return {
        scanVisible: lines.filter((l) => l.classList.contains('is-visible')).length,
        scanTotal: lines.length,
        header: Number(getComputedStyle(document.querySelector('.site-header')!).opacity),
        footer: Number(getComputedStyle(document.querySelector('.site-footer')!).opacity),
      };
    });
    expect(at1_5s.scanVisible).toBeGreaterThan(0);
    expect(at1_5s.scanVisible).toBeLessThan(at1_5s.scanTotal);
    expect(at1_5s.header).toBe(0);
    expect(at1_5s.footer).toBe(0);

    await page.screenshot({
      path: 'verification-screenshots/ili-825-phaseA-scan.png',
      fullPage: false,
    });
  });

  test('panels slot in at the half-mark of the scan clock', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // At t=3050ms (just after PANEL_START_AT=2967), the header has
    // begun its reveal; later panels (footer at 3507) are still hidden.
    await page.waitForTimeout(3050);
    const midPanel = await page.evaluate(() => ({
      header: Number(getComputedStyle(document.querySelector('.site-header')!).opacity),
      footer: Number(getComputedStyle(document.querySelector('.site-footer')!).opacity),
    }));
    expect(midPanel.header).toBeGreaterThan(0);
    expect(midPanel.footer).toBe(0);

    // By t=4300ms all four panels have started and the last has
    // settled; scan-lines are still printing.
    await page.waitForTimeout(1250);
    const afterPanels = await page.evaluate(() => {
      const lines = Array.from(document.querySelectorAll('.scan-stack .scan-line'));
      return {
        header: Number(getComputedStyle(document.querySelector('.site-header')!).opacity),
        footer: Number(getComputedStyle(document.querySelector('.site-footer')!).opacity),
        scanVisible: lines.filter((l) => l.classList.contains('is-visible')).length,
        scanTotal: lines.length,
      };
    });
    expect(afterPanels.header).toBe(1);
    expect(afterPanels.footer).toBe(1);
    expect(afterPanels.scanVisible).toBeLessThan(afterPanels.scanTotal);

    await page.screenshot({
      path: 'verification-screenshots/ili-825-phaseB-panels.png',
      fullPage: false,
    });
  });

  test('blur fades on just before frame-lines write in', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // Wait past lockupRevealAt + GLASS_FADE (6455 + 400 = 6855ms).
    // Add a small buffer to clear the transition.
    await page.waitForTimeout(7000);

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

  test('end state — boot classes cleared, lockup visible (~8.2s)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // Full boot ≈ 8.2s. Wait past bootEndAt with a buffer.
    await page.waitForTimeout(8800);

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
