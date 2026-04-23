import { test, expect } from '@playwright/test';

const URL = `http://localhost:${process.env.PORT || 4322}/design-system/`;

test('palette — desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL);

  const panel = page.locator('section.panel').filter({ has: page.locator('.panel-rail', { hasText: '03' }) });
  await expect(panel).toBeVisible();
  await panel.scrollIntoViewIfNeeded();

  await expect(panel.locator('.panel-head .id')).toHaveText('// 03');
  await expect(panel.locator('.panel-head .title')).toContainText('PALETTE');
  await expect(panel.locator('.panel-head .meta')).toContainText('21:1 CONTRAST');

  const swatches = panel.locator('.swatch');
  await expect(swatches).toHaveCount(2);

  const black = panel.locator('.swatch--black');
  await expect(black.locator('.swatch-top strong')).toHaveText('01 / BLACK');
  await expect(black.locator('.swatch-top span')).toHaveText('RGB 0 0 0');
  await expect(black.locator('.swatch-hex')).toHaveText('#000000');
  await expect(black.locator('.swatch-name')).toHaveText('Void');
  await expect(black.locator('.swatch-role')).toContainText('CANVAS');

  const white = panel.locator('.swatch--white');
  await expect(white.locator('.swatch-top strong')).toHaveText('02 / WHITE');
  await expect(white.locator('.swatch-top span')).toHaveText('RGB 255 255 255');
  await expect(white.locator('.swatch-hex')).toHaveText('#FFFFFF');
  await expect(white.locator('.swatch-name')).toHaveText('Signal');
  await expect(white.locator('.swatch-role')).toContainText('MARK');

  const blackBg = await black.evaluate((el) => getComputedStyle(el).backgroundColor);
  const blackFg = await black.evaluate((el) => getComputedStyle(el).color);
  expect(blackBg).toBe('rgb(0, 0, 0)');
  expect(blackFg).toBe('rgb(255, 255, 255)');

  const whiteBg = await white.evaluate((el) => getComputedStyle(el).backgroundColor);
  const whiteFg = await white.evaluate((el) => getComputedStyle(el).color);
  expect(whiteBg).toBe('rgb(255, 255, 255)');
  expect(whiteFg).toBe('rgb(0, 0, 0)');

  const roleStyles = await black.locator('.swatch-role').evaluate((el) => {
    const cs = getComputedStyle(el);
    return { writingMode: cs.writingMode, opacity: cs.opacity, position: cs.position };
  });
  expect(roleStyles.writingMode).toMatch(/vertical-rl/);
  expect(roleStyles.position).toBe('absolute');
  expect(Number(roleStyles.opacity)).toBeCloseTo(0.45, 2);

  await expect(panel.locator('.palette-meta > div')).toHaveCount(4);
  await expect(panel.locator('.palette-meta')).toContainText('WCAG AAA');
  await expect(panel.locator('.palette-meta')).toContainText('100.0');
  await expect(panel.locator('.palette-meta')).toContainText('82%');
  await expect(panel.locator('.palette-meta')).toContainText('K100 / PAPER');

  await page.screenshot({ path: 'verification-screenshots/ili-708-palette-desktop.png', fullPage: true });
});

test('palette — mobile stacks grid', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(URL);

  const panel = page.locator('section.panel').filter({ has: page.locator('.panel-head .id', { hasText: '// 03' }) });
  await panel.scrollIntoViewIfNeeded();

  const cols = await panel.locator('.palette-grid').evaluate((el) => getComputedStyle(el).gridTemplateColumns);
  expect(cols.split(' ')).toHaveLength(1);

  const metaCols = await panel.locator('.palette-meta').evaluate((el) => getComputedStyle(el).gridTemplateColumns);
  expect(metaCols.split(' ')).toHaveLength(2);

  await page.screenshot({ path: 'verification-screenshots/ili-708-palette-mobile.png', fullPage: true });
});
