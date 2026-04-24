import { test, expect } from '@playwright/test';

const PORT = process.env.PORT || 4322;
const BASE = `http://localhost:${PORT}`;

const NO_ANIM = `*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; }`;

const ROUTES = ['/', '/design-system', '/about', '/contact'];

for (const route of ROUTES) {
  test(`footer renders on ${route} — desktop`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}${route}`);
    await page.addStyleTag({ content: NO_ANIM });

    const footer = page.locator('footer.site-footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('strong')).toHaveText('END');
    await expect(footer.locator('.sf-mark')).toContainText('HAS DESIGN');
    await expect(footer.locator('.kv .k').nth(0)).toHaveText('BUILD');
    await expect(footer.locator('.kv .k').nth(1)).toHaveText('HASH');
    await expect(footer.locator('.sf-tagline')).toHaveText(
      'BUILT BY HAND · ASSISTED BY AGENT',
    );

    const cols = await footer.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(cols.split(' ').length).toBeGreaterThanOrEqual(5);

    const fontFamily = await footer.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(fontFamily.toLowerCase()).toContain('jetbrains mono');

    const fontSize = await footer.evaluate((el) => getComputedStyle(el).fontSize);
    expect(fontSize).toBe('10px');

    const letterSpacing = await footer.evaluate((el) => getComputedStyle(el).letterSpacing);
    expect(parseFloat(letterSpacing)).toBeCloseTo(3, 0);

    await page.waitForTimeout(400);
    const safe = route === '/' ? 'home' : route.replace(/\//g, '');
    await page.screenshot({
      path: `verification-screenshots/ili-719-${safe}-desktop.png`,
      fullPage: true,
    });
  });

  test(`footer stacks on ${route} — mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}${route}`);
    await page.addStyleTag({ content: NO_ANIM });

    const footer = page.locator('footer.site-footer');
    await expect(footer).toBeVisible();

    const cols = await footer.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(cols.split(' ').length).toBe(1);

    await page.waitForTimeout(400);
    const safe = route === '/' ? 'home' : route.replace(/\//g, '');
    await page.screenshot({
      path: `verification-screenshots/ili-719-${safe}-mobile.png`,
      fullPage: true,
    });
  });
}
