import { test, expect } from '@playwright/test';

const PORT = process.env.PORT || 4322;
const INDEX = `http://localhost:${PORT}/`;
const ABOUT = `http://localhost:${PORT}/about`;

/* ILI-818 — scan-marquee backdrop scrolls bottom-to-top
   continuously. On cold load, an intro keyframe pushes the track
   from below the column up to filling it (~6s); the moment the
   intro finishes the frame-block lockup scans in via the canonical
   max-height + opacity reveal. The H1 carries a blinking terminal
   cursor. The wide divider (.frame-rule) is gone. */

const INTRO_DURATION = 6000;
const HERO_SETTLE = INTRO_DURATION + 5 * 145 + 320; // 5 frame lines + transition

test.describe('ILI-818 — scan-marquee + lockup', () => {
  test('cold load: marquee + corners visible, frame-block hidden until intro completes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // Boot classes set pre-paint.
    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(true);
    expect(await page.evaluate(() => document.body.classList.contains('has-hero-frame-play'))).toBe(true);

    // Marquee is present and animating.
    const marqueeAnim = await page.locator('.scan-marquee-track').evaluate((el) => getComputedStyle(el).animationName);
    expect(marqueeAnim).toContain('scan-intro');

    // Corners always visible (not part of boot reveal).
    const cornerOpacity = await page.locator('.frame-corner--tl').evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(cornerOpacity).toBeCloseTo(0.5, 2);

    // Frame-line hidden during boot (max-height: 0 + opacity: 0).
    const frameLineOpacity = await page.locator('.frame-block .frame-line').first().evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(frameLineOpacity).toBe(0);
  });

  test('frame-block scans in after intro: 5 lines reveal at 145ms cadence', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // Wait until well past hero-settle.
    await page.waitForTimeout(HERO_SETTLE + 500);

    const frameLineState = await page.evaluate(() => {
      const lines = Array.from(document.querySelectorAll('.frame-block .frame-line'));
      return {
        total: lines.length,
        revealed: lines.filter((l) => l.classList.contains('is-visible')).length,
        opacities: lines.map((l) => Number(getComputedStyle(l).opacity)),
      };
    });
    expect(frameLineState.total).toBe(5);
    expect(frameLineState.revealed).toBe(5);
    for (const o of frameLineState.opacities) expect(o).toBe(1);

    // The wide divider is gone.
    const ruleCount = await page.locator('.frame-rule').count();
    expect(ruleCount).toBe(0);

    // Cursor is present on the H1.
    const cursorCount = await page.locator('.frame-h1 .frame-cursor').count();
    expect(cursorCount).toBe(1);

    await page.screenshot({
      path: 'verification-screenshots/ili-818-boot-end.png',
      fullPage: false,
    });
  });

  test('marquee transitions from intro to infinite loop without breaking', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // Wait into the loop phase (after intro + a few seconds).
    await page.waitForTimeout(INTRO_DURATION + 2000);

    const animName = await page.locator('.scan-marquee-track').evaluate((el) => getComputedStyle(el).animationName);
    // Two-stage chain: scan-intro then scan-loop. After intro
    // completes, scan-loop is the active animation.
    expect(animName).toMatch(/scan-loop|scan-intro,\s*scan-loop/);
  });

  test('reduced motion: lockup visible, marquee static', async ({ browser }) => {
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

    await page.screenshot({
      path: 'verification-screenshots/ili-818-reduced-motion.png',
      fullPage: false,
    });

    await context.close();
  });

  test('return visit (reload): lockup visible from first paint', async ({ browser }) => {
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

  test('internal navigation /about → /: lockup visible from first paint', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    await page.goto(ABOUT);
    await page.waitForLoadState('domcontentloaded');

    await page.click('.sh-logo');
    await page.waitForURL(INDEX);
    await page.waitForTimeout(400);

    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(false);
    const frameLineOpacity = await page.locator('.frame-block .frame-line').first().evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(frameLineOpacity).toBe(1);

    await context.close();
  });
});
