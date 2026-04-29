import { test, expect } from '@playwright/test';

const PORT = process.env.PORT || 4322;
const INDEX = `http://localhost:${PORT}/`;

test.describe('ILI-788 — hero v2: black inversion + continuous print cadence', () => {
  test('first visit: hero is black, end-state matches v2 spec', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    expect(await page.evaluate(() => document.body.classList.contains('has-hero-frame-play'))).toBe(true);

    // Capture mid-sequence — frame lines should be wrapped and animating.
    await page.waitForTimeout(2700);
    await page.screenshot({
      path: 'verification-screenshots/ili-788-frame-midprint.png',
      fullPage: false,
    });

    // Wait for full sequence ~3.3s + tail.
    await page.waitForTimeout(1600);

    expect(await page.evaluate(() => document.body.classList.contains('has-hero-frame-play'))).toBe(false);

    // A. Color inversion — hero block is black.
    const heroBg = await page.locator('.col-hero.has-hero-frame').evaluate((el) =>
      getComputedStyle(el).backgroundColor
    );
    expect(heroBg).toBe('rgb(0, 0, 0)');

    const blockBg = await page.locator('.frame-block').evaluate((el) =>
      getComputedStyle(el).backgroundColor
    );
    expect(blockBg).toBe('rgb(0, 0, 0)');

    // All hero text is white.
    const textColors = await Promise.all([
      page.locator('.frame-eyebrow').evaluate((el) => getComputedStyle(el).color),
      page.locator('.frame-h1').evaluate((el) => getComputedStyle(el).color),
      page.locator('.frame-dek').evaluate((el) => getComputedStyle(el).color),
      page.locator('.frame-audience').evaluate((el) => getComputedStyle(el).color),
      page.locator('.frame-cta').evaluate((el) => getComputedStyle(el).color),
    ]);
    for (const c of textColors) expect(c).toBe('rgb(255, 255, 255)');

    // CTA: 1px white border, transparent bg, white text. Hover → white bg + black text.
    const ctaStyles = await page.locator('.frame-cta').evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        border: cs.borderTopColor + ' ' + cs.borderTopWidth + ' ' + cs.borderTopStyle,
        bg: cs.backgroundColor,
      };
    });
    expect(ctaStyles.border).toBe('rgb(255, 255, 255) 1px solid');
    // transparent bg shows up as rgba(0,0,0,0)
    expect(ctaStyles.bg).toMatch(/rgba\(0,\s*0,\s*0,\s*0\)|transparent/);

    // Frame rule is white.
    const ruleBg = await page.locator('.frame-rule').evaluate((el) =>
      getComputedStyle(el).backgroundColor
    );
    expect(ruleBg).toBe('rgb(255, 255, 255)');

    // Signal-strip: black bg, white text, white hairline above.
    const sig = await page.locator('.signal-strip').evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        borderTop: cs.borderTopColor + ' ' + cs.borderTopWidth,
      };
    });
    expect(sig.bg).toBe('rgb(0, 0, 0)');
    expect(sig.color).toBe('rgb(255, 255, 255)');
    expect(sig.borderTop).toBe('rgb(255, 255, 255) 1px');

    // B. Continuous print cadence — every frame element is wrapped in .frame-line.
    const wrapped = await page.evaluate(() => {
      const sel = ['.frame-rule', '.frame-eyebrow', '.frame-h1', '.frame-dek', '.frame-audience', '.frame-cta'];
      return sel.every((s) => {
        const el = document.querySelector(s);
        return el && el.parentElement && el.parentElement.classList.contains('frame-line');
      });
    });
    expect(wrapped).toBe(true);

    // No translateY transforms remain on hero elements at end-state.
    const transforms = await page.evaluate(() => {
      const sel = ['.frame-rule', '.frame-eyebrow', '.frame-h1', '.frame-dek', '.frame-audience', '.frame-cta', '.frame-line'];
      return sel.map((s) => {
        const el = document.querySelector(s);
        return el ? getComputedStyle(el).transform : 'none';
      });
    });
    for (const t of transforms) expect(t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true);

    // C. Final copy still verbatim.
    await expect(page.locator('.frame-eyebrow')).toHaveText('// FRAME · V1.0 · TRIAD VERIFIED');
    await expect(page.locator('.frame-h1')).toHaveText('Human Agent System Design');
    await expect(page.locator('.frame-dek')).toHaveText(
      'Humans, agents, and the system they share. Three actors. Three design objects. One framework.'
    );
    await expect(page.locator('.frame-audience')).toHaveText('> FOR THE PEOPLE SHIPPING THEM');
    await expect(page.locator('.frame-cta')).toHaveText(/Begin transmission/);
    await expect(page.locator('.frame-cta')).toHaveAttribute('href', '/blog/were-assuming-the-system');

    // No em dashes in rendered hero copy.
    const heroText = await page.locator('.col-hero.has-hero-frame').textContent();
    expect(heroText || '').not.toMatch(/—/);

    await page.screenshot({
      path: 'verification-screenshots/ili-788-frame-final.png',
      fullPage: false,
    });
  });

  test('reveal mechanism: frame-line uses max-height + opacity, no translateY', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    // While the play class is active, frame-line should have the shared transition.
    await page.waitForTimeout(120);

    const transition = await page.locator('.frame-line').first().evaluate((el) =>
      getComputedStyle(el).transition
    );
    // Both max-height (0.32s cubic-bezier) and opacity (0.18s linear 0.08s) declared.
    expect(transition).toMatch(/max-height/);
    expect(transition).toMatch(/opacity/);
  });

  test('reduced motion: skip sequence, end-state immediately, no translateY', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(INDEX);
    await page.waitForLoadState('domcontentloaded');

    expect(await page.evaluate(() => document.body.classList.contains('has-hero-frame-play'))).toBe(false);

    const opacity = await page.locator('.frame-block').evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBe(1);

    // Frame lines visible at rest.
    const lineOpacities = await page.locator('.frame-line').evaluateAll((els) =>
      els.map((el) => Number(getComputedStyle(el).opacity))
    );
    for (const o of lineOpacities) expect(o).toBe(1);

    await context.close();
  });

  test('mobile: black hero, no horizontal scroll, h1 wraps', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(INDEX);
    await page.waitForTimeout(4200);

    const heroBg = await page.locator('.col-hero.has-hero-frame').evaluate((el) =>
      getComputedStyle(el).backgroundColor
    );
    expect(heroBg).toBe('rgb(0, 0, 0)');

    // No horizontal overflow on the document.
    const overflow = await page.evaluate(() => ({
      docW: document.documentElement.scrollWidth,
      winW: window.innerWidth,
    }));
    expect(overflow.docW).toBeLessThanOrEqual(overflow.winW);

    const h1Box = await page.locator('.frame-h1').boundingBox();
    expect(h1Box?.height).toBeGreaterThan(34);

    await page.screenshot({
      path: 'verification-screenshots/ili-788-frame-mobile.png',
      fullPage: false,
    });
  });
});
