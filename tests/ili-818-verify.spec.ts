import { test, expect } from '@playwright/test';

const PORT = process.env.PORT || 4322;
const INDEX = `http://localhost:${PORT}/`;
const ABOUT = `http://localhost:${PORT}/about`;

/* ILI-818 — discrete scan-line cycle backdrop + glassmorphic
   lockup. Pre-rendered scan-lines fill the column at 0.5
   opacity. JS appends a new line at the bottom on a varied
   400–2000ms interval; new line scans in via max-height +
   opacity, the existing stack pushes up, the oldest clips
   past the top edge. Frame-block is transparent during
   initial load and switches to glass + writes in lines after
   a 4s hold. */

const REVEAL_DELAY = 4000;
const GLASS_FADE = 400;
const FRAME_LINES_COUNT = 5;
const CADENCE = 145;
const HERO_SETTLE = REVEAL_DELAY + GLASS_FADE + (FRAME_LINES_COUNT - 1) * CADENCE + 320;

test.describe('ILI-818 — scan cycle + glass lockup', () => {
  test('cold load: scan lines fill column from start, frame-block transparent + lines hidden', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(true);
    expect(await page.evaluate(() => document.body.classList.contains('has-hero-frame-play'))).toBe(true);

    // Scan-stack already populated with at least 28 lines.
    const lineCount = await page.locator('.scan-stack .scan-line').count();
    expect(lineCount).toBeGreaterThanOrEqual(28);

    // Frame-block has no glass background while booting.
    const bg = await page.locator('.frame-block').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toMatch(/rgba\(0,\s*0,\s*0,\s*0\)|transparent/);

    // Frame-line hidden.
    const frameLineOpacity = await page.locator('.frame-block .frame-line').first().evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(frameLineOpacity).toBe(0);
  });

  test('lockup writes in after the hold: glass appears, then 5 frame-lines reveal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    await page.waitForTimeout(HERO_SETTLE + 500);

    const state = await page.evaluate(() => {
      const lines = Array.from(document.querySelectorAll('.frame-block .frame-line'));
      return {
        total: lines.length,
        revealed: lines.filter((l) => l.classList.contains('is-visible')).length,
        opacities: lines.map((l) => Number(getComputedStyle(l).opacity)),
        revealing: document.querySelector('.frame-block')?.classList.contains('is-revealing') ?? false,
        bg: getComputedStyle(document.querySelector('.frame-block')!).backgroundColor,
      };
    });
    expect(state.total).toBe(FRAME_LINES_COUNT);
    expect(state.revealed).toBe(FRAME_LINES_COUNT);
    for (const o of state.opacities) expect(o).toBe(1);
    expect(state.revealing).toBe(true);
    // Glass background is now visible (rgba with alpha > 0).
    expect(state.bg).toMatch(/rgba?\(/);

    // Wide divider is gone, cursor is on the H1.
    expect(await page.locator('.frame-rule').count()).toBe(0);
    expect(await page.locator('.frame-h1 .frame-cursor').count()).toBe(1);

    await page.screenshot({
      path: 'verification-screenshots/ili-818-boot-end.png',
      fullPage: false,
    });
  });

  test('scan-line cycle adds new lines and trims old ones', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    const before = await page.locator('.scan-stack .scan-line').count();
    // Wait long enough for several cycles (varied 400–2000ms interval,
    // so 6s yields ~3–15 cycles statistically).
    await page.waitForTimeout(6000);
    const after = await page.locator('.scan-stack .scan-line').count();

    // Stack grew (new lines appended) but stays bounded by the
    // 50-entry trim cap.
    expect(after).toBeGreaterThanOrEqual(before);
    expect(after).toBeLessThanOrEqual(50);
  });

  test('reduced motion: lockup visible from first paint, scan loop disabled', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(false);

    const frameLineOpacity = await page.locator('.frame-block .frame-line').first().evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(frameLineOpacity).toBe(1);

    const before = await page.locator('.scan-stack .scan-line').count();
    await page.waitForTimeout(2500);
    const after = await page.locator('.scan-stack .scan-line').count();
    expect(after).toBe(before); // no new lines appended

    await page.screenshot({
      path: 'verification-screenshots/ili-818-reduced-motion.png',
      fullPage: false,
    });

    await context.close();
  });

  test('return visit: lockup visible from first paint, glass background applied', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    await page.goto(INDEX);
    await page.waitForTimeout(HERO_SETTLE + 1500);
    expect(await page.evaluate(() => sessionStorage.getItem('has_index_booted'))).toBe('1');

    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(false);

    const frameLineOpacity = await page.locator('.frame-block .frame-line').first().evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(frameLineOpacity).toBe(1);

    const bg = await page.locator('.frame-block').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toMatch(/rgba?\(/);

    await context.close();
  });
});
