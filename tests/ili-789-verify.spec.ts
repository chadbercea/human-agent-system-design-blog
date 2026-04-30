import { test, expect } from '@playwright/test';

const PORT = process.env.PORT || 4322;
const INDEX = `http://localhost:${PORT}/`;
const ABOUT = `http://localhost:${PORT}/about`;

test.describe('ILI-789 — index boot sequence', () => {
  test('cold load: black field on first paint, panels masked', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // Phase 0–1: boot class set, panels at opacity 0.
    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(true);
    expect(await page.evaluate(() => document.body.classList.contains('has-hero-frame-play'))).toBe(true);

    const masked = await page.evaluate(() => {
      const sel = ['.site-header', '.rail', '.col-list', '.site-footer'];
      return sel.map((s) => {
        const el = document.querySelector(s);
        return el ? Number(getComputedStyle(el).opacity) : -1;
      });
    });
    for (const o of masked) expect(o).toBe(0);

    // Body bg should be #000 during boot.
    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bodyBg).toBe('rgb(0, 0, 0)');

    await page.screenshot({
      path: 'verification-screenshots/ili-789-phase0-black.png',
      fullPage: false,
    });
  });

  test('mid-hero: hero scanning, panels still hidden', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');
    // ~1.5s in: scan lines partially printed, panels still masked.
    await page.waitForTimeout(1500);

    const headerOpacity = await page.locator('.site-header').evaluate((el) => Number(getComputedStyle(el).opacity));
    const railOpacity = await page.locator('.rail').evaluate((el) => Number(getComputedStyle(el).opacity));
    const listOpacity = await page.locator('.col-list').evaluate((el) => Number(getComputedStyle(el).opacity));
    const footerOpacity = await page.locator('.site-footer').evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(headerOpacity).toBe(0);
    expect(railOpacity).toBe(0);
    expect(listOpacity).toBe(0);
    expect(footerOpacity).toBe(0);

    await page.screenshot({
      path: 'verification-screenshots/ili-789-phase1-scanning.png',
      fullPage: false,
    });
  });

  test('reveal sequence: panels appear in order header → rail → list → footer', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // Hero settles at ~3.4s. Panels start revealing then.
    await page.waitForTimeout(3500);
    const afterHeader = await page.evaluate(() => {
      return {
        header: Number(getComputedStyle(document.querySelector('.site-header')!).opacity),
        rail:   Number(getComputedStyle(document.querySelector('.rail')!).opacity),
        list:   Number(getComputedStyle(document.querySelector('.col-list')!).opacity),
        footer: Number(getComputedStyle(document.querySelector('.site-footer')!).opacity),
      };
    });
    // Header has had time to start its 320ms transition; rail/list/footer still 0.
    expect(afterHeader.header).toBeGreaterThan(0);
    expect(afterHeader.footer).toBe(0);

    // Allow full sequence + tail to settle.
    await page.waitForTimeout(2000);

    const final = await page.evaluate(() => ({
      header: Number(getComputedStyle(document.querySelector('.site-header')!).opacity),
      rail:   Number(getComputedStyle(document.querySelector('.rail')!).opacity),
      list:   Number(getComputedStyle(document.querySelector('.col-list')!).opacity),
      footer: Number(getComputedStyle(document.querySelector('.site-footer')!).opacity),
    }));
    expect(final.header).toBe(1);
    expect(final.rail).toBe(1);
    expect(final.list).toBe(1);
    expect(final.footer).toBe(1);

    // Boot classes cleared, sessionStorage flag set.
    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(false);
    const flag = await page.evaluate(() => {
      try { return sessionStorage.getItem('has_index_booted'); } catch { return null; }
    });
    expect(flag).toBe('1');

    // Hero block stays black at end-state.
    const heroBg = await page.locator('.col-hero.has-hero-frame').evaluate((el) =>
      getComputedStyle(el).backgroundColor
    );
    expect(heroBg).toBe('rgb(0, 0, 0)');

    await page.screenshot({
      path: 'verification-screenshots/ili-789-end-state.png',
      fullPage: false,
    });
  });

  test('repeat visit in same tab: end-state immediately, no boot', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    // First visit — let it run.
    await page.goto(INDEX);
    await page.waitForTimeout(5500);
    expect(await page.evaluate(() => sessionStorage.getItem('has_index_booted'))).toBe('1');

    // Second visit (reload) — should skip the boot entirely.
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(false);
    // Wait past the existing entry.css `fade` animation (160ms) so we
    // assert against the settled end-state, not the in-progress fade.
    await page.waitForTimeout(400);

    const opacities = await page.evaluate(() => ({
      header: Number(getComputedStyle(document.querySelector('.site-header')!).opacity),
      rail:   Number(getComputedStyle(document.querySelector('.rail')!).opacity),
      list:   Number(getComputedStyle(document.querySelector('.col-list')!).opacity),
      footer: Number(getComputedStyle(document.querySelector('.site-footer')!).opacity),
    }));
    expect(opacities.header).toBe(1);
    expect(opacities.rail).toBe(1);
    expect(opacities.list).toBe(1);
    expect(opacities.footer).toBe(1);

    await context.close();
  });

  test('internal navigation /about → / skips boot', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    await page.goto(ABOUT);
    await page.waitForLoadState('domcontentloaded');

    // Click the logo (which is an /-link in the header).
    await page.click('.sh-logo');
    await page.waitForURL(INDEX);
    // Wait past the chrome `fade` animation so the end-state opacity is 1.
    await page.waitForTimeout(400);

    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(false);

    const headerOpacity = await page.locator('.site-header').evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(headerOpacity).toBe(1);

    await context.close();
  });

  test('reduced motion: end-state on first paint, no boot', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    expect(await page.evaluate(() => document.body.classList.contains('is-index-booting'))).toBe(false);

    const headerOpacity = await page.locator('.site-header').evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(headerOpacity).toBe(1);

    await context.close();
  });

  test('panels occupy real layout space while hidden (visibility, not display:none)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // Spec says: "Use `visibility` not `display: none` so layout is stable."
    // While the boot is running, every masked panel must still render at
    // its final size — i.e. computed display ≠ none, dimensions > 0.
    const dims = await page.evaluate(() => {
      const sel = ['.site-header', '.rail', '.col-list', '.site-footer'];
      return sel.map((s) => {
        const el = document.querySelector(s) as HTMLElement | null;
        if (!el) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return { sel: s, display: cs.display, visibility: cs.visibility, w: r.width, h: r.height };
      });
    });
    for (const d of dims) {
      expect(d).not.toBeNull();
      expect(d!.display).not.toBe('none');
      expect(d!.visibility).toBe('hidden');
      expect(d!.w).toBeGreaterThan(0);
      expect(d!.h).toBeGreaterThan(0);
    }
  });
});
