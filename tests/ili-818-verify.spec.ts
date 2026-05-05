import { test, expect } from '@playwright/test';

const PORT = process.env.PORT || 4322;
const INDEX = `http://localhost:${PORT}/`;
const ABOUT = `http://localhost:${PORT}/about`;

/* ILI-818 — boot prints two scan stacks, the frame-block lockup,
   and 4 corner brackets, all via the canonical .scan-line reveal
   (max-height + opacity, 145ms cadence). No strip-down, no fade,
   no hud-ambient. Resting state has scan lines above + below the
   centered lockup with corner brackets on each corner. */

test.describe('ILI-818 — hero boot reveal', () => {
  test('cold load: top scan, frame-block, bottom scan, corners hidden initially', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // Body is in boot mode pre-paint; scan-lines, frame-lines, corners hidden.
    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(true);

    // Hidden initially via max-height:0 / opacity:0.
    const opacities = await page.evaluate(() => {
      const top = document.querySelector('.scan-stack--top .scan-line');
      const bot = document.querySelector('.scan-stack--bot .scan-line');
      const frame = document.querySelector('.frame-block .frame-line');
      const corner = document.querySelector('.frame-corner');
      return {
        top: top ? Number(getComputedStyle(top).opacity) : -1,
        bot: bot ? Number(getComputedStyle(bot).opacity) : -1,
        frame: frame ? Number(getComputedStyle(frame).opacity) : -1,
        corner: corner ? Number(getComputedStyle(corner).opacity) : -1,
      };
    });
    expect(opacities.top).toBe(0);
    expect(opacities.bot).toBe(0);
    expect(opacities.frame).toBe(0);
    expect(opacities.corner).toBe(0);
  });

  test('boot reveal completes: top + bottom scan + frame + corners all visible', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // Boot timing: 280 + (13-1)*145 + 280 + 145 + (6-1)*145 + 280 + 145 + (13-1)*145
    //   + 280 + 145 + (4-1)*145 + 320 transition ≈ 6700ms hero settle.
    // Wait until well past that.
    await page.waitForTimeout(8500);

    const counts = await page.evaluate(() => ({
      topVisible: document.querySelectorAll('.scan-stack--top .scan-line.is-visible').length,
      topTotal: document.querySelectorAll('.scan-stack--top .scan-line').length,
      botVisible: document.querySelectorAll('.scan-stack--bot .scan-line.is-visible').length,
      botTotal: document.querySelectorAll('.scan-stack--bot .scan-line').length,
      frameVisible: document.querySelectorAll('.frame-block .frame-line.is-visible').length,
      frameTotal: document.querySelectorAll('.frame-block .frame-line').length,
      cornerVisible: document.querySelectorAll('.frame-corner.is-visible').length,
      cornerTotal: document.querySelectorAll('.frame-corner').length,
    }));
    expect(counts.topVisible).toBe(counts.topTotal);
    expect(counts.botVisible).toBe(counts.botTotal);
    expect(counts.frameVisible).toBe(counts.frameTotal);
    expect(counts.cornerVisible).toBe(counts.cornerTotal);
    expect(counts.topTotal).toBeGreaterThanOrEqual(13);
    expect(counts.botTotal).toBeGreaterThanOrEqual(13);
    expect(counts.cornerTotal).toBe(4);

    // Frame-viewport is grid 1fr auto 1fr — lockup centers
    // vertically, scan stacks fill row 1 and row 3.
    const layout = await page.locator('.frame-viewport').evaluate((el) => ({
      display: getComputedStyle(el).display,
      rows: getComputedStyle(el).gridTemplateRows,
    }));
    expect(layout.display).toBe('grid');
    expect(layout.rows).toMatch(/[\d.]+px [\d.]+px [\d.]+px/);

    // Post-boot fade: scan lines settle at opacity 0.5, corners at 0.25.
    // Wait past the 600ms fade duration after boot end (~7.8s).
    await page.waitForTimeout(1200);
    const dimmed = await page.evaluate(() => ({
      scan: Number(getComputedStyle(document.querySelector('.scan-line.is-visible')!).opacity),
      corner: Number(getComputedStyle(document.querySelector('.frame-corner.is-visible')!).opacity),
    }));
    expect(dimmed.scan).toBeCloseTo(0.5, 2);
    expect(dimmed.corner).toBeCloseTo(0.25, 2);

    await page.screenshot({
      path: 'verification-screenshots/ili-818-boot-end.png',
      fullPage: false,
    });
  });

  test('reduced motion: all elements visible at first paint', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // No boot class on reduced-motion path.
    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(false);

    // No boot class → resting state from first paint:
    // scan lines at 0.5, lockup at 1, corners at 0.25.
    const opacities = await page.evaluate(() => ({
      top: Number(getComputedStyle(document.querySelector('.scan-stack--top .scan-line')!).opacity),
      bot: Number(getComputedStyle(document.querySelector('.scan-stack--bot .scan-line')!).opacity),
      frame: Number(getComputedStyle(document.querySelector('.frame-block .frame-line')!).opacity),
      corner: Number(getComputedStyle(document.querySelector('.frame-corner')!).opacity),
    }));
    expect(opacities.top).toBeCloseTo(0.5, 2);
    expect(opacities.bot).toBeCloseTo(0.5, 2);
    expect(opacities.frame).toBe(1);
    expect(opacities.corner).toBeCloseTo(0.25, 2);

    await page.screenshot({
      path: 'verification-screenshots/ili-818-reduced-motion.png',
      fullPage: false,
    });

    await context.close();
  });

  test('return visit (reload): all elements visible at first paint, no boot', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    // First visit — let boot run.
    await page.goto(INDEX);
    await page.waitForTimeout(8500);
    expect(await page.evaluate(() => sessionStorage.getItem('has_index_booted'))).toBe('1');

    // Reload — should land directly on the assembled state.
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(false);

    const opacities = await page.evaluate(() => ({
      top: Number(getComputedStyle(document.querySelector('.scan-stack--top .scan-line')!).opacity),
      bot: Number(getComputedStyle(document.querySelector('.scan-stack--bot .scan-line')!).opacity),
      frame: Number(getComputedStyle(document.querySelector('.frame-block .frame-line')!).opacity),
      corner: Number(getComputedStyle(document.querySelector('.frame-corner')!).opacity),
    }));
    expect(opacities.top).toBeCloseTo(0.5, 2);
    expect(opacities.bot).toBeCloseTo(0.5, 2);
    expect(opacities.frame).toBe(1);
    expect(opacities.corner).toBeCloseTo(0.25, 2);

    await context.close();
  });

  test('internal navigation /about → /: lands directly on assembled state', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    await page.goto(ABOUT);
    await page.waitForLoadState('domcontentloaded');

    await page.click('.sh-logo');
    await page.waitForURL(INDEX);
    await page.waitForTimeout(400);

    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(false);

    const opacities = await page.evaluate(() => ({
      top: Number(getComputedStyle(document.querySelector('.scan-stack--top .scan-line')!).opacity),
      bot: Number(getComputedStyle(document.querySelector('.scan-stack--bot .scan-line')!).opacity),
    }));
    expect(opacities.top).toBeCloseTo(0.5, 2);
    expect(opacities.bot).toBeCloseTo(0.5, 2);

    await context.close();
  });
});
