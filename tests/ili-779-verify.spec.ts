import { test, expect } from '@playwright/test';

const URL = `http://localhost:${process.env.PORT || 4322}/`;

test.describe('ILI-779 — back bar inverted hover (white fill, black label)', () => {
  test('rest: transparent bg, dim label; hover: white bg, black label', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.waitForSelector('.post-card');

    // Open article reader so the vertical BACK column appears
    await page.locator('.post-card').first().click();
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => document.getElementById('stage')?.classList.contains('open'))).toBe(true);

    const backBtn = page.locator('#back-btn');
    await expect(backBtn).toBeVisible();

    // Hit area must be the full column strip, not just the glyphs.
    // .col-hero is 80px wide when stage is open; the button fills it via inset:0.
    const colBox = await page.locator('.col-hero').boundingBox();
    const btnBox = await backBtn.boundingBox();
    if (!colBox || !btnBox) throw new Error('boxes not found');
    // Allow 1–2px slack for the column's hairline border (right border on .col).
    expect(Math.abs(btnBox.width - colBox.width)).toBeLessThanOrEqual(2);
    expect(Math.abs(btnBox.height - colBox.height)).toBeLessThanOrEqual(2);

    // Cursor pointer
    const cursor = await backBtn.evaluate((el) => getComputedStyle(el).cursor);
    expect(cursor).toBe('pointer');

    // REST: transparent background, dim label color
    const restBg = await backBtn.evaluate((el) => getComputedStyle(el).backgroundColor);
    const restColor = await backBtn.evaluate((el) => getComputedStyle(el).color);
    expect(restBg).toBe('rgba(0, 0, 0, 0)');
    expect(restColor).toBe('rgb(122, 122, 122)'); // #7a7a7a

    await page.screenshot({
      path: 'verification-screenshots/ili-779-rest.png',
      fullPage: false,
    });

    // HOVER: white background, black label
    await backBtn.hover();
    await page.waitForTimeout(180);

    const hoverBg = await backBtn.evaluate((el) => getComputedStyle(el).backgroundColor);
    const hoverColor = await backBtn.evaluate((el) => getComputedStyle(el).color);
    expect(hoverBg).toBe('rgb(255, 255, 255)');
    expect(hoverColor).toBe('rgb(0, 0, 0)');

    await page.screenshot({
      path: 'verification-screenshots/ili-779-hover.png',
      fullPage: false,
    });

    // Transition includes background-color and color around 120ms
    const transition = await backBtn.evaluate((el) => getComputedStyle(el).transition);
    expect(transition).toContain('background-color');
    expect(transition).toContain('color');
    expect(transition).toContain('0.12s');
  });

  test('focus-visible mirrors hover (keyboard nav)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.waitForSelector('.post-card');
    await page.locator('.post-card').first().click();
    await page.waitForTimeout(800);

    const backBtn = page.locator('#back-btn');
    await backBtn.focus();
    await page.waitForTimeout(180);

    const bg = await backBtn.evaluate((el) => getComputedStyle(el).backgroundColor);
    const color = await backBtn.evaluate((el) => getComputedStyle(el).color);
    expect(bg).toBe('rgb(255, 255, 255)');
    expect(color).toBe('rgb(0, 0, 0)');
  });
});
