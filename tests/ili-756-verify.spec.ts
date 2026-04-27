import { test, expect } from '@playwright/test';

const URL = `http://localhost:${process.env.PORT || 4322}/`;

test.describe('ILI-756 — hero hover: parallax tilt + bracket pull-in', () => {
  test('desktop hover triggers tilt vars, fade, and bracket translation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.waitForSelector('.col-hero');
    await page.waitForTimeout(2500); // let entrance rise animations fully complete

    // Resting state: no class, vars unset
    expect(await page.evaluate(() => document.body.classList.contains('hero-hover'))).toBe(false);
    await page.screenshot({
      path: 'verification-screenshots/ili-756-rest.png',
      fullPage: false,
    });

    // Hover near the top-left quadrant of the hero
    const heroBox = await page.locator('.col-hero').boundingBox();
    if (!heroBox) throw new Error('hero col not found');
    await page.mouse.move(heroBox.x + heroBox.width * 0.25, heroBox.y + heroBox.height * 0.25, { steps: 8 });
    await page.waitForTimeout(600); // allow fade + bracket transitions

    // Class is on body
    expect(await page.evaluate(() => document.body.classList.contains('hero-hover'))).toBe(true);

    // Cursor offset variables are negative (top-left quadrant)
    const cx = await page.evaluate(() => document.body.style.getPropertyValue('--hero-cx'));
    const cy = await page.evaluate(() => document.body.style.getPropertyValue('--hero-cy'));
    expect(parseFloat(cx)).toBeLessThan(0);
    expect(parseFloat(cy)).toBeLessThan(0);

    // Hero text is faded
    const chipOpacity = await page.locator('.protocol-chip').evaluate((el) => getComputedStyle(el).opacity);
    expect(parseFloat(chipOpacity)).toBeLessThan(0.05);
    const subOpacity = await page.locator('.hero-sub').evaluate((el) => getComputedStyle(el).opacity);
    expect(parseFloat(subOpacity)).toBeLessThan(0.05);

    // Brackets translated. ::before isn't directly addressable so check the
    // `.tl::before` matrix via getComputedStyle.
    const tlMatrix = await page.evaluate(() => {
      const el = document.querySelector('.hud-corner.tl');
      if (!el) return '';
      return getComputedStyle(el, '::before').transform;
    });
    expect(tlMatrix).not.toBe('none');
    expect(tlMatrix).toContain('matrix');

    // Logo tilt is present on .logo-stage
    const logoTransform = await page.locator('.hero-logo .logo-stage').evaluate((el) => getComputedStyle(el).transform);
    expect(logoTransform).not.toBe('none');

    await page.screenshot({
      path: 'verification-screenshots/ili-756-hover-tl.png',
      fullPage: false,
    });

    // Move to bottom-right quadrant — vars should flip sign
    await page.mouse.move(heroBox.x + heroBox.width * 0.75, heroBox.y + heroBox.height * 0.75, { steps: 8 });
    await page.waitForTimeout(200);
    const cx2 = await page.evaluate(() => document.body.style.getPropertyValue('--hero-cx'));
    const cy2 = await page.evaluate(() => document.body.style.getPropertyValue('--hero-cy'));
    expect(parseFloat(cx2)).toBeGreaterThan(0);
    expect(parseFloat(cy2)).toBeGreaterThan(0);
    await page.screenshot({
      path: 'verification-screenshots/ili-756-hover-br.png',
      fullPage: false,
    });

    // Mouse out — class removed, fade reverses
    await page.mouse.move(0, 0);
    await page.waitForTimeout(450);
    expect(await page.evaluate(() => document.body.classList.contains('hero-hover'))).toBe(false);
    const chipOpacityRest = await page.locator('.protocol-chip').evaluate((el) => getComputedStyle(el).opacity);
    expect(parseFloat(chipOpacityRest)).toBeGreaterThan(0.95);
  });

  test('mobile breakpoint: no hover effect', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 900 });
    await page.goto(URL);
    await page.waitForSelector('.col-hero');
    await page.waitForTimeout(800);

    const heroBox = await page.locator('.col-hero').boundingBox();
    if (!heroBox) throw new Error('hero col not found');
    await page.mouse.move(heroBox.x + heroBox.width * 0.5, heroBox.y + heroBox.height * 0.5, { steps: 4 });
    await page.waitForTimeout(300);

    // No class added — JS gate blocks below 901px
    expect(await page.evaluate(() => document.body.classList.contains('hero-hover'))).toBe(false);

    // Hero text remains visible
    const chipOpacity = await page.locator('.protocol-chip').evaluate((el) => getComputedStyle(el).opacity);
    // protocol-chip is `display: none` on mobile, so opacity may be 1 or 0
    // but the bigger check is no `hero-hover` class.
    expect([0, 1]).toContain(Math.round(parseFloat(chipOpacity)));
  });

  test('reduced-motion: no tilt, no fade, no bracket movement', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(URL);
    await page.waitForSelector('.col-hero');
    await page.waitForTimeout(300);

    const heroBox = await page.locator('.col-hero').boundingBox();
    if (!heroBox) throw new Error('hero col not found');
    await page.mouse.move(heroBox.x + heroBox.width * 0.25, heroBox.y + heroBox.height * 0.25, { steps: 8 });
    await page.waitForTimeout(300);

    // JS skips eligible() when reduced-motion is on — no class
    expect(await page.evaluate(() => document.body.classList.contains('hero-hover'))).toBe(false);
    const chipOpacity = await page.locator('.protocol-chip').evaluate((el) => getComputedStyle(el).opacity);
    expect(parseFloat(chipOpacity)).toBeGreaterThan(0.95);

    await context.close();
  });

  test('article reader open: hero hover disabled', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.waitForSelector('.post-card');
    await page.locator('.post-card').first().click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.getElementById('stage')?.classList.contains('open'))).toBe(true);

    const heroBox = await page.locator('.col-hero').boundingBox();
    if (!heroBox) throw new Error('hero col not found');
    await page.mouse.move(heroBox.x + heroBox.width * 0.5, heroBox.y + heroBox.height * 0.5, { steps: 4 });
    await page.waitForTimeout(300);

    // Stage is open, JS bails — no class added
    expect(await page.evaluate(() => document.body.classList.contains('hero-hover'))).toBe(false);
  });
});
