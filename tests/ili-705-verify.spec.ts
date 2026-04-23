import { test, expect } from '@playwright/test';

const URL = `http://localhost:${process.env.PORT || 4322}/design-system/`;

test('hero — desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL);
  const hero = page.locator('.hero');
  await expect(hero).toBeVisible();
  await expect(hero.locator('.hud-corner')).toHaveCount(4);
  await expect(hero.locator('.hud-corner.tl')).toContainText('OBS // SITE');
  await expect(hero.locator('.hud-corner.tr')).toContainText('SPEC // GEOMETRY');
  await expect(hero.locator('.hud-corner.bl')).toContainText('STATUS // LINK');
  await expect(hero.locator('.hud-corner.br')).toContainText('BUILD // META');
  await expect(hero.locator('.hero-logo .logo-stage .bar')).toHaveCount(7);
  await expect(hero.locator('.hero-sub svg')).toBeVisible();
  await expect(hero.locator('.hero-meta')).toContainText('GEOMETRIC WORDMARK');
  await expect(hero.locator('.hero-meta')).toContainText('TWO HEXAGONAL PRIMITIVES');
  await expect(hero.locator('.hero-meta')).toContainText('SEVEN POSITIONED BARS');
  await page.waitForTimeout(3500);
  await page.screenshot({ path: 'verification-screenshots/ili-705-hero-desktop.png', fullPage: true });
});

test('hero — mobile stacks HUD corners', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(URL);
  const hero = page.locator('.hero');
  await expect(hero).toBeVisible();
  const pos = await hero.locator('.hud-corner.tl').evaluate((el) => getComputedStyle(el).position);
  expect(pos).toBe('static');
  await page.waitForTimeout(3500);
  await page.screenshot({ path: 'verification-screenshots/ili-705-hero-mobile.png', fullPage: true });
});
