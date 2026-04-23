import { test, expect } from '@playwright/test';

const URL = `http://localhost:${process.env.PORT || 4322}/design-system/`;

test('logo system — desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL);

  const panel = page.locator('section.panel').filter({ has: page.locator('.panel-rail', { hasText: '04' }) });
  await expect(panel).toBeVisible();
  await panel.scrollIntoViewIfNeeded();

  await expect(panel.locator('.panel-head .id')).toHaveText('// 04');
  await expect(panel.locator('.panel-head .title')).toContainText('LOGO SYSTEM');
  await expect(panel.locator('.panel-head .meta')).toContainText('ILI-699');

  const bed = panel.locator('.scales-bed');
  await expect(bed).toBeVisible();
  await expect(bed.locator('.shell')).toHaveCount(3);
  await expect(bed.locator('.shell--lg .tick')).toContainText('1.0');
  await expect(bed.locator('.shell--md .tick')).toContainText('0.6');
  await expect(bed.locator('.shell--sm .tick')).toContainText('0.3');

  const before = await bed.evaluate((el) => getComputedStyle(el, '::before').content);
  expect(before).toContain('SCALE SPECIMENS');
  const after = await bed.evaluate((el) => getComputedStyle(el, '::after').content);
  expect(after).toContain('REV 01.00');

  for (const sel of ['.shell--lg', '.shell--md', '.shell--sm']) {
    const bars = bed.locator(`${sel} .logo-stage .bar`);
    await expect(bars).toHaveCount(7);
  }

  const variants = panel.locator('.variant');
  await expect(variants).toHaveCount(2);
  const darkBg = await panel.locator('.variant--dark').evaluate((el) => getComputedStyle(el).backgroundColor);
  const lightBg = await panel.locator('.variant--light').evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(darkBg).toBe('rgb(0, 0, 0)');
  expect(lightBg).toBe('rgb(255, 255, 255)');

  const invBar = panel.locator('.logo-stage--inv .bar').first();
  const invBarBg = await invBar.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(invBarBg).toBe('rgb(0, 0, 0)');

  await expect(panel.locator('.logo-spec > div')).toHaveCount(4);
  await expect(panel.locator('.logo-spec')).toContainText('FULL BAR');
  await expect(panel.locator('.logo-spec')).toContainText('HALF BAR');
  await expect(panel.locator('.logo-spec')).toContainText('TIP ANGLE');
  await expect(panel.locator('.logo-spec')).toContainText('COMPOSITION');

  await page.screenshot({ path: 'verification-screenshots/ili-709-logo-desktop.png', fullPage: true });
});

test('logo system — mobile stacks grids', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(URL);

  const panel = page.locator('section.panel').filter({ has: page.locator('.panel-head .id', { hasText: '// 04' }) });
  await panel.scrollIntoViewIfNeeded();

  const variantsCols = await panel.locator('.variants').evaluate((el) => getComputedStyle(el).gridTemplateColumns);
  expect(variantsCols.split(' ')).toHaveLength(1);

  const specCols = await panel.locator('.logo-spec').evaluate((el) => getComputedStyle(el).gridTemplateColumns);
  expect(specCols.split(' ')).toHaveLength(2);

  await page.screenshot({ path: 'verification-screenshots/ili-709-logo-mobile.png', fullPage: true });
});
