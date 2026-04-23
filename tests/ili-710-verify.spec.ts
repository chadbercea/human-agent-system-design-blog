import { test, expect } from '@playwright/test';

const URL = `http://127.0.0.1:${process.env.PORT || 4322}/design-system/`;

test('panel 05 — system readout desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL);

  const panel = page.locator('section.panel').nth(4);
  await expect(panel).toBeVisible();
  await expect(panel.locator('.panel-head .id')).toHaveText('// 05');
  await expect(panel.locator('.panel-head .title')).toContainText('SYSTEM READOUT');

  const term = panel.locator('.term');
  await expect(term).toBeVisible();
  await expect(term.locator('.term-head .live')).toContainText('LIVE');
  await expect(term.locator('.term-head .live .pip')).toBeVisible();

  const lines = term.locator('.term-line');
  await expect(lines).toHaveCount(13);
  await expect(lines.first()).toContainText('INIT');
  await expect(lines.last()).toContainText('DONE');
  await expect(lines.last().locator('.cursor')).toBeVisible();

  // Grid columns on each line
  const grid = await lines.first().evaluate((el) => getComputedStyle(el).gridTemplateColumns);
  expect(grid.split(' ').length).toBe(3);

  await expect(term.locator('.term-foot')).toContainText('EXCHANGES 13');
  await expect(term.locator('.term-foot')).toContainText('TRUST');

  await panel.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'verification-screenshots/ili-710-readout-desktop.png', fullPage: false });
});

test('panel 05 — system readout mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(URL);

  const panel = page.locator('section.panel').nth(4);
  await expect(panel).toBeVisible();
  const term = panel.locator('.term');
  await expect(term).toBeVisible();
  await panel.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'verification-screenshots/ili-710-readout-mobile.png', fullPage: false });
});
