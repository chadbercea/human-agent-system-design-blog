import { test, expect } from '@playwright/test';

const PORT = process.env.PORT || 4322;
const INDEX = `http://localhost:${PORT}/`;
const ABOUT = `http://localhost:${PORT}/about`;

// ILI-818 timing: boot ends ~4.4s after load (footer reveal complete);
// strip-down hold = 600ms; fade duration = 500ms. So:
//   strip starts at ~5.0s
//   strip completes at ~5.5s
const STRIP_START_AT = 5000;
const STRIP_END_AT = 5600;

test.describe('ILI-818 — hero strip-down', () => {
  test('cold load: chrome visible immediately after boot, before strip', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // Just after boot completes (footer reveal done) but before strip
    // hold elapses — chrome should still be visible.
    await page.waitForTimeout(4500);

    expect(await page.evaluate(() => document.body.classList.contains('hero-stripping'))).toBe(false);
    expect(await page.evaluate(() => document.body.classList.contains('hero-stripped'))).toBe(false);

    const scanStackOpacity = await page.locator('.scan-stack').evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(scanStackOpacity).toBe(1);

    await page.screenshot({
      path: 'verification-screenshots/ili-818-pre-strip.png',
      fullPage: false,
    });
  });

  test('strip-down: chrome fades, kept block recentres', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // Wait past strip start: stripping class is on, chrome opacity ≤ 1.
    await page.waitForTimeout(STRIP_START_AT + 100);
    await page.screenshot({
      path: 'verification-screenshots/ili-818-mid-strip.png',
      fullPage: false,
    });

    // Wait past strip end: stripped class is on, chrome gone.
    await page.waitForTimeout(STRIP_END_AT - (STRIP_START_AT + 100) + 200);

    expect(await page.evaluate(() => document.body.classList.contains('hero-stripped'))).toBe(true);
    expect(await page.evaluate(() => document.body.classList.contains('hero-stripping'))).toBe(false);

    // Chrome elements removed from layout.
    const scanStackDisplay = await page.evaluate(() => {
      const el = document.querySelector('.scan-stack');
      return el ? getComputedStyle(el).display : null;
    });
    expect(scanStackDisplay).toBe('none');

    const eyebrowDisplay = await page.evaluate(() => {
      const el = document.querySelector('.frame-line:has(.frame-eyebrow)');
      return el ? getComputedStyle(el).display : null;
    });
    expect(eyebrowDisplay).toBe('none');

    const ruleDisplay = await page.evaluate(() => {
      const el = document.querySelector('.frame-line:has(.frame-rule)');
      return el ? getComputedStyle(el).display : null;
    });
    expect(ruleDisplay).toBe('none');

    // Signal-strip (second hairline + telemetry row) gone on desktop.
    const signalStripDisplay = await page.evaluate(() => {
      const el = document.querySelector('.signal-strip');
      return el ? getComputedStyle(el).display : null;
    });
    expect(signalStripDisplay).toBe('none');

    // Frame-viewport now centers content.
    const justifyContent = await page.locator('.frame-viewport').evaluate((el) => getComputedStyle(el).justifyContent);
    expect(justifyContent).toBe('center');

    // Kept content (h1/dek/audience/cta) is visible.
    expect(await page.locator('.frame-h1').isVisible()).toBe(true);
    expect(await page.locator('.frame-dek').isVisible()).toBe(true);
    expect(await page.locator('.frame-audience').isVisible()).toBe(true);
    expect(await page.locator('.frame-cta').isVisible()).toBe(true);

    // Surrounding chrome panels stay at full opacity (no layout shift
    // affecting them during the fade).
    const panels = await page.evaluate(() => ({
      header: Number(getComputedStyle(document.querySelector('.site-header')!).opacity),
      rail: Number(getComputedStyle(document.querySelector('.rail')!).opacity),
      list: Number(getComputedStyle(document.querySelector('.col-list')!).opacity),
      footer: Number(getComputedStyle(document.querySelector('.site-footer')!).opacity),
    }));
    expect(panels.header).toBe(1);
    expect(panels.rail).toBe(1);
    expect(panels.list).toBe(1);
    expect(panels.footer).toBe(1);

    await page.screenshot({
      path: 'verification-screenshots/ili-818-post-strip.png',
      fullPage: false,
    });
  });

  test('reduced motion: lands directly on stripped state', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(false);
    expect(await page.evaluate(() => document.body.classList.contains('hero-stripped'))).toBe(true);

    const scanStackDisplay = await page.evaluate(() => {
      const el = document.querySelector('.scan-stack');
      return el ? getComputedStyle(el).display : null;
    });
    expect(scanStackDisplay).toBe('none');

    const justifyContent = await page.locator('.frame-viewport').evaluate((el) => getComputedStyle(el).justifyContent);
    expect(justifyContent).toBe('center');

    await page.screenshot({
      path: 'verification-screenshots/ili-818-reduced-motion.png',
      fullPage: false,
    });

    await context.close();
  });

  test('return visit (reload): lands directly on stripped state, no boot', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    // First visit — let boot + strip run.
    await page.goto(INDEX);
    await page.waitForTimeout(STRIP_END_AT + 200);
    expect(await page.evaluate(() => sessionStorage.getItem('has_index_booted'))).toBe('1');

    // Reload — should land directly on stripped state.
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    expect(await page.evaluate(() => document.body.classList.contains('hero-stripped'))).toBe(true);
    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(false);

    const scanStackDisplay = await page.evaluate(() => {
      const el = document.querySelector('.scan-stack');
      return el ? getComputedStyle(el).display : null;
    });
    expect(scanStackDisplay).toBe('none');

    await context.close();
  });

  test('internal navigation /about → /: lands directly on stripped state', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    await page.goto(ABOUT);
    await page.waitForLoadState('domcontentloaded');

    await page.click('.sh-logo');
    await page.waitForURL(INDEX);
    await page.waitForTimeout(400);

    expect(await page.evaluate(() => document.body.classList.contains('hero-stripped'))).toBe(true);
    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(false);

    await context.close();
  });
});
