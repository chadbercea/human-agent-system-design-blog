import { test, expect } from '@playwright/test';

const URL = `http://localhost:${process.env.PORT || 4322}/`;

test.describe('ILI-781 — hero sequenced on-load reveal', () => {
  test('first visit: body.hero-sequence-play set, sequence runs, ~2.5s total', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);

    // Right after the inline pre-paint gate runs, the body should
    // have the play class. We sample on DOMContentLoaded.
    await page.waitForLoadState('domcontentloaded');
    expect(await page.evaluate(() => document.body.classList.contains('hero-sequence-play'))).toBe(true);

    // Hero corners + chip start hidden (visibility:hidden). Verify
    // the protocol chip isn't visible at t≈0 even though the
    // element is in the DOM.
    const chipVisAtStart = await page.evaluate(() => {
      const el = document.querySelector('.protocol-chip') as HTMLElement | null;
      return el ? getComputedStyle(el).visibility : '';
    });
    expect(chipVisAtStart).toBe('hidden');

    // After the full sequence completes (~2500ms), the play class
    // is removed and everything reads its final state.
    await page.waitForTimeout(2700);
    expect(await page.evaluate(() => document.body.classList.contains('hero-sequence-play'))).toBe(false);

    // Corner labels carry their typed text back.
    const tlText = await page.locator('.hud-corner.tl .hud-corner-label').textContent();
    expect((tlText || '').trim()).toBe('OBS // SITE');

    // Protocol chip text settled.
    const chipText = await page.locator('.protocol-chip').textContent();
    expect((chipText || '').trim()).toBe('PROTOCOL 001 · PHASE ALPHA');

    // sessionStorage flag set.
    const played = await page.evaluate(() => sessionStorage.getItem('hero_sequence_played'));
    expect(played).toBe('true');

    await page.screenshot({
      path: 'verification-screenshots/ili-781-final.png',
      fullPage: false,
    });
  });

  test('subsequent visit (sessionStorage set): no play class, no animation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    // First visit — let the sequence finish so sessionStorage is set.
    await page.waitForTimeout(2700);

    // Reload — same tab, sessionStorage persists.
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Class should NOT be applied this time.
    expect(await page.evaluate(() => document.body.classList.contains('hero-sequence-play'))).toBe(false);

    // Elements visible immediately, no waiting.
    const chipVis = await page.evaluate(() => {
      const el = document.querySelector('.protocol-chip') as HTMLElement | null;
      return el ? getComputedStyle(el).visibility : '';
    });
    expect(chipVis).toBe('visible');
  });

  test('reduced motion: skip the sequence entirely', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(URL);
    await page.waitForLoadState('domcontentloaded');

    // The pre-paint gate refuses to add the class for reduced-motion.
    expect(await page.evaluate(() => document.body.classList.contains('hero-sequence-play'))).toBe(false);

    // Final state on the spot.
    const chipVis = await page.evaluate(() => {
      const el = document.querySelector('.protocol-chip') as HTMLElement | null;
      return el ? getComputedStyle(el).visibility : '';
    });
    expect(chipVis).toBe('visible');

    await context.close();
  });

  test('mid-sequence: corner brackets are drawing in via clip-path', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.waitForLoadState('domcontentloaded');

    // Snapshot at t≈220ms: bracket animation runs 150–480ms, so the
    // top-left bracket should be mid-clip. clip-path inset starts at
    // (0 100% 100% 0) and ends at (0 0 0 0) — non-empty animation
    // value during play.
    await page.waitForTimeout(220);
    const clip = await page.locator('.hud-corner.tl').evaluate((el) => {
      const before = getComputedStyle(el, '::before').clipPath;
      return before;
    });
    // clipPath isn't 'none' — sequence is active on the bracket.
    expect(clip).not.toBe('none');
  });
});
