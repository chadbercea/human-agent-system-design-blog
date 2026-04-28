import { test, expect } from '@playwright/test';

const URL = `http://localhost:${process.env.PORT || 4322}/`;

test.describe('ILI-776 — hero: no parallax, corner-shift, mouse-follow tooltip', () => {
  test('no parallax — logo and grid sit static during hover', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.waitForSelector('.col-hero');
    await page.waitForTimeout(2200);

    const logoTransformRest = await page
      .locator('.hero-logo .logo-stage')
      .evaluate((el) => getComputedStyle(el).transform);
    const bodyBeforeTransformRest = await page.evaluate(() => getComputedStyle(document.body, '::before').transform);

    const heroBox = await page.locator('.col-hero').boundingBox();
    if (!heroBox) throw new Error('hero col not found');
    await page.mouse.move(heroBox.x + heroBox.width * 0.25, heroBox.y + heroBox.height * 0.25, { steps: 8 });
    await page.waitForTimeout(220);

    const logoTransformHover = await page
      .locator('.hero-logo .logo-stage')
      .evaluate((el) => getComputedStyle(el).transform);
    const bodyBeforeTransformHover = await page.evaluate(() => getComputedStyle(document.body, '::before').transform);

    expect(logoTransformHover).toBe(logoTransformRest);
    expect(bodyBeforeTransformHover).toBe(bodyBeforeTransformRest);

    // No parallax CSS vars set
    const cx = await page.evaluate(() => document.body.style.getPropertyValue('--hero-cx'));
    const cy = await page.evaluate(() => document.body.style.getPropertyValue('--hero-cy'));
    expect(cx).toBe('');
    expect(cy).toBe('');
  });

  test('corner labels stay visible and translate with brackets on hover', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.waitForSelector('.col-hero');
    await page.waitForTimeout(2200);

    const heroBox = await page.locator('.col-hero').boundingBox();
    if (!heroBox) throw new Error('hero col not found');
    await page.mouse.move(heroBox.x + heroBox.width * 0.5, heroBox.y + heroBox.height * 0.5, { steps: 6 });
    await page.waitForTimeout(220);

    expect(await page.evaluate(() => document.body.classList.contains('hero-hover'))).toBe(true);

    // All four corner labels remain at full opacity
    for (const corner of ['tl', 'tr', 'bl', 'br']) {
      const opacity = await page
        .locator(`.hud-corner.${corner} .hud-corner-text`)
        .evaluate((el) => getComputedStyle(el).opacity);
      expect(parseFloat(opacity)).toBeGreaterThan(0.95);
    }

    // Container transform — bracket + label translate as one unit
    const tlT = await page.locator('.hud-corner.tl').evaluate((el) => getComputedStyle(el).transform);
    const trT = await page.locator('.hud-corner.tr').evaluate((el) => getComputedStyle(el).transform);
    const blT = await page.locator('.hud-corner.bl').evaluate((el) => getComputedStyle(el).transform);
    const brT = await page.locator('.hud-corner.br').evaluate((el) => getComputedStyle(el).transform);
    for (const t of [tlT, trT, blT, brT]) {
      expect(t).not.toBe('none');
      expect(t).toContain('matrix');
    }

    await page.screenshot({
      path: 'verification-screenshots/ili-776-hover-corners.png',
      fullPage: false,
    });

    // Hover-leave returns corners to rest
    await page.mouse.move(0, 0);
    await page.waitForTimeout(220);
    expect(await page.evaluate(() => document.body.classList.contains('hero-hover'))).toBe(false);
    const tlRest = await page.locator('.hud-corner.tl').evaluate((el) => getComputedStyle(el).transform);
    expect(tlRest).toBe('none');
  });

  test('mouse-follow tooltip appears with mission-control copy and trails the cursor', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.waitForSelector('.col-hero');
    await page.waitForTimeout(2200);

    const tooltip = page.locator('#hero-tooltip');
    await expect(tooltip).toBeAttached();

    // Hidden at rest (opacity 0)
    expect(parseFloat(await tooltip.evaluate((el) => getComputedStyle(el).opacity))).toBeLessThan(0.05);

    const heroBox = await page.locator('.col-hero').boundingBox();
    if (!heroBox) throw new Error('hero col not found');
    await page.mouse.move(heroBox.x + heroBox.width * 0.4, heroBox.y + heroBox.height * 0.5, { steps: 8 });
    await page.waitForTimeout(280);

    // Visible
    expect(parseFloat(await tooltip.evaluate((el) => getComputedStyle(el).opacity))).toBeGreaterThan(0.95);

    // Copy
    const lines = await tooltip.locator('.hero-tooltip-line').allTextContents();
    expect(lines).toEqual(['> VISITOR ACQUIRED', '> TELEMETRY NOMINAL', '> ARCHIVE STANDING BY']);

    // Tooltip is positioned via translate3d (transform on element, not 'none')
    const t1 = await tooltip.evaluate((el) => getComputedStyle(el).transform);
    expect(t1).not.toBe('none');

    // Move cursor — transform updates
    await page.mouse.move(heroBox.x + heroBox.width * 0.7, heroBox.y + heroBox.height * 0.3, { steps: 8 });
    await page.waitForTimeout(220);
    const t2 = await tooltip.evaluate((el) => getComputedStyle(el).transform);
    expect(t2).not.toBe(t1);

    await page.screenshot({
      path: 'verification-screenshots/ili-776-tooltip.png',
      fullPage: false,
    });

    // Leave — fades out
    await page.mouse.move(0, 0);
    await page.waitForTimeout(280);
    expect(parseFloat(await tooltip.evaluate((el) => getComputedStyle(el).opacity))).toBeLessThan(0.05);
  });

  test('reduced-motion: tooltip pinned, no corner translate', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(URL);
    await page.waitForSelector('.col-hero');
    await page.waitForTimeout(300);

    const heroBox = await page.locator('.col-hero').boundingBox();
    if (!heroBox) throw new Error('hero col not found');
    await page.mouse.move(heroBox.x + heroBox.width * 0.5, heroBox.y + heroBox.height * 0.5, { steps: 6 });
    await page.waitForTimeout(200);

    // Tooltip is visible and pinned (no transform translate driven by JS)
    const tooltip = page.locator('#hero-tooltip');
    expect(parseFloat(await tooltip.evaluate((el) => getComputedStyle(el).opacity))).toBeGreaterThan(0.95);
    const pinned = await tooltip.evaluate((el) => el.classList.contains('hero-tooltip--pinned'));
    expect(pinned).toBe(true);

    await context.close();
  });

  test('article reader open: tooltip + corner-shift suppressed', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.waitForSelector('.post-card');
    await page.locator('.post-card').first().click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.getElementById('stage')?.classList.contains('open'))).toBe(true);

    const heroBox = await page.locator('.col-hero').boundingBox();
    if (!heroBox) throw new Error('hero col not found');
    await page.mouse.move(heroBox.x + heroBox.width * 0.5, heroBox.y + heroBox.height * 0.5, { steps: 4 });
    await page.waitForTimeout(220);

    expect(await page.evaluate(() => document.body.classList.contains('hero-hover'))).toBe(false);
    const tooltipOpacity = await page.locator('#hero-tooltip').evaluate((el) => getComputedStyle(el).opacity);
    expect(parseFloat(tooltipOpacity)).toBeLessThan(0.05);
  });

  test('mobile breakpoint: hero-hover, tooltip, and corners hidden', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 900 });
    await page.goto(URL);
    await page.waitForSelector('.col-hero');
    await page.waitForTimeout(400);

    const heroBox = await page.locator('.col-hero').boundingBox();
    if (!heroBox) throw new Error('hero col not found');
    await page.mouse.move(heroBox.x + heroBox.width * 0.5, heroBox.y + heroBox.height * 0.2, { steps: 4 });
    await page.waitForTimeout(220);

    // No hero-hover class on body
    expect(await page.evaluate(() => document.body.classList.contains('hero-hover'))).toBe(false);
    // Tooltip element hidden via display:none
    const tooltipDisplay = await page.locator('#hero-tooltip').evaluate((el) => getComputedStyle(el).display);
    expect(tooltipDisplay).toBe('none');
    const cornerDisplay = await page.locator('.hud-corner.tl').evaluate((el) => getComputedStyle(el).display);
    expect(cornerDisplay).toBe('none');
  });
});
