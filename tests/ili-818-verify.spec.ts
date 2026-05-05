import { test, expect } from '@playwright/test';

const PORT = process.env.PORT || 4322;
const INDEX = `http://localhost:${PORT}/`;
const ABOUT = `http://localhost:${PORT}/about`;

/* ILI-818 — cold load reveals 28 pre-rendered scan-lines at
   145ms cadence (canonical boot reveal), then a 200ms breath,
   then the glass blur fades on, then 5 frame-lines write in.
   Once everything has loaded in, the one-in/one-out varied-
   interval loop begins (and runs forever after). Return visits
   and reduced-motion paint everything visible from first paint. */

const INITIAL_DELAY = 280;
const CADENCE = 145;
const REVEAL_TRANSITION = 320;
const SCAN_BREATH = 200;
const GLASS_FADE = 400;
const SCAN_LINES_COUNT = 40;
const FRAME_LINES_COUNT = 5;
const POST_LOCKUP_BREATH = 400;

const LAST_SCAN_AT = INITIAL_DELAY + (SCAN_LINES_COUNT - 1) * CADENCE;
const SCAN_SETTLE_AT = LAST_SCAN_AT + REVEAL_TRANSITION;
const LOCKUP_REVEAL_AT = SCAN_SETTLE_AT + SCAN_BREATH;
const FRAME_LINES_START_AT = LOCKUP_REVEAL_AT + GLASS_FADE;
const LAST_FRAME_AT = FRAME_LINES_START_AT + (FRAME_LINES_COUNT - 1) * CADENCE;
const HERO_SETTLE = LAST_FRAME_AT + REVEAL_TRANSITION;
const LOOP_START_AT = HERO_SETTLE + POST_LOCKUP_BREATH;

test.describe('ILI-818 — scan cycle + glass lockup', () => {
  test('cold load first paint: scan lines hidden, frame-block transparent + lines hidden', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(true);
    expect(await page.evaluate(() => document.body.classList.contains('has-hero-frame-play'))).toBe(true);

    // 28 pre-rendered scan-lines exist in the DOM but are hidden
    // (the body class flips them to max-height: 0, opacity: 0
    // until the orchestrator adds .is-visible at 145ms cadence).
    const lineCount = await page.locator('.scan-stack .scan-line').count();
    expect(lineCount).toBe(SCAN_LINES_COUNT);
    const firstScanOpacity = await page.locator('.scan-stack .scan-line').first().evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(firstScanOpacity).toBe(0);

    // Frame-block carries backdrop-filter blur always — over a
    // black background it's a no-op (blur of black = black).
    const bf = await page.locator('.frame-block').evaluate((el) => getComputedStyle(el).backdropFilter || (el as any).webkitBackdropFilter || 'none');
    expect(bf).toContain('blur');

    // Frame-line hidden.
    const frameLineOpacity = await page.locator('.frame-block .frame-line').first().evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(frameLineOpacity).toBe(0);

    // Corner brackets hidden — they reveal alongside the lockup.
    const cornerOpacity = await page.locator('.frame-corner--tl').evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(cornerOpacity).toBe(0);
  });

  test('scan-lines write in one by one before the lockup', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // Mid-reveal: some scan-lines visible, some still hidden.
    await page.waitForTimeout(LAST_SCAN_AT / 2);
    const midState = await page.evaluate(() => {
      const lines = Array.from(document.querySelectorAll('.scan-stack .scan-line'));
      return {
        visible: lines.filter((l) => l.classList.contains('is-visible')).length,
        total: lines.length,
      };
    });
    expect(midState.visible).toBeGreaterThan(0);
    expect(midState.visible).toBeLessThan(midState.total);

    // Just before the lockup reveal trigger: all scan-lines
    // should be revealed.
    const settleCheckAt = LOCKUP_REVEAL_AT - 250;
    await page.waitForTimeout(settleCheckAt - (LAST_SCAN_AT / 2));
    const settled = await page.evaluate(() => {
      const lines = Array.from(document.querySelectorAll('.scan-stack .scan-line'));
      return {
        revealedScans: lines.filter((l) => l.classList.contains('is-visible')).length,
      };
    });
    expect(settled.revealedScans).toBe(SCAN_LINES_COUNT);
  });

  test('lockup writes in after the hold: glass appears, then 5 frame-lines reveal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    await page.waitForTimeout(HERO_SETTLE + 500);

    const state = await page.evaluate(() => {
      const lines = Array.from(document.querySelectorAll('.frame-block .frame-line'));
      const fb = document.querySelector('.frame-block') as HTMLElement | null;
      return {
        total: lines.length,
        revealed: lines.filter((l) => l.classList.contains('is-visible')).length,
        opacities: lines.map((l) => Number(getComputedStyle(l).opacity)),
        revealing: fb?.classList.contains('is-revealing') ?? false,
        backdrop: fb ? (getComputedStyle(fb).backdropFilter || (fb as any).webkitBackdropFilter || 'none') : 'none',
      };
    });
    expect(state.total).toBe(FRAME_LINES_COUNT);
    expect(state.revealed).toBe(FRAME_LINES_COUNT);
    for (const o of state.opacities) expect(o).toBe(1);
    expect(state.revealing).toBe(true);
    expect(state.backdrop).toContain('blur');

    // Corners revealed alongside the lockup.
    const cornerOpacities = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.frame-corner')).map((el) =>
        Number(getComputedStyle(el).opacity)
      );
    });
    for (const o of cornerOpacities) expect(o).toBeCloseTo(0.5, 2);

    // Wide divider is gone, cursor is on the H1.
    expect(await page.locator('.frame-rule').count()).toBe(0);
    expect(await page.locator('.frame-h1 .frame-cursor').count()).toBe(1);

    await page.screenshot({
      path: 'verification-screenshots/ili-818-boot-end.png',
      fullPage: false,
    });
  });

  test('one-in/one-out loop only starts AFTER everything has loaded in', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // Just before loop start: no extra lines beyond the 28 pre-rendered.
    await page.waitForTimeout(LOOP_START_AT - 200);
    const beforeLoop = await page.locator('.scan-stack .scan-line').count();
    expect(beforeLoop).toBe(SCAN_LINES_COUNT);

    // Wait several seconds into the loop's window — at 400–2000ms
    // varied intervals, 6s of loop time yields ~3–15 cycles.
    await page.waitForTimeout(LOOP_START_AT + 6000 - (LOOP_START_AT - 200));
    const afterLoop = await page.locator('.scan-stack .scan-line').count();
    expect(afterLoop).toBeGreaterThan(beforeLoop);
    expect(afterLoop).toBeLessThanOrEqual(50);
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

  test('return visit: lockup visible from first paint, no boot', async ({ browser }) => {
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

    await context.close();
  });
});
