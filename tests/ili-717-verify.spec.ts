import { test, expect } from '@playwright/test';

const URL = `http://localhost:${process.env.PORT || 4322}/`;

const NO_ANIM = `*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; }`;

test('landing hero — desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL);
  await page.addStyleTag({ content: NO_ANIM });
  const hero = page.locator('.col-hero .hero-inner');
  await expect(hero).toBeVisible();
  await expect(hero.locator('.protocol-chip')).toContainText('PROTOCOL 001');
  await expect(hero.locator('.hud-corner')).toHaveCount(4);
  await expect(hero.locator('.hud-corner.tl')).toContainText('OBS // SITE');
  await expect(hero.locator('.hud-corner.tr')).toContainText('INDEX // LIVE');
  await expect(hero.locator('.hud-corner.tr')).toContainText('ENTRIES');
  await expect(hero.locator('.hud-corner.bl')).toContainText('STATUS // LINK');
  await expect(hero.locator('.hud-corner.br')).toContainText('BUILD // META');
  await expect(hero.locator('.hero-logo .logo-stage .bar')).toHaveCount(7);
  await expect(hero.locator('.hero-sub svg')).toBeVisible();
  await expect(hero.locator('.hero-sub')).toContainText('BUILDING IN PUBLIC');
  await expect(hero.locator('.hero-meta')).toContainText('WRITING');
  await expect(hero.locator('.hero-meta')).toContainText('SHIPPING');
  await expect(hero.locator('.hero-meta')).toContainText('THINKING OUT LOUD');

  const tlPos = await hero.locator('.hud-corner.tl').evaluate((el) => getComputedStyle(el).position);
  expect(tlPos).toBe('absolute');

  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'verification-screenshots/ili-717-landing-desktop.png', fullPage: true });
});

test('landing hero — mobile stacks HUD corners', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(URL);
  await page.addStyleTag({ content: NO_ANIM });
  const hero = page.locator('.col-hero .hero-inner');
  await expect(hero).toBeVisible();

  const tlPos = await hero.locator('.hud-corner.tl').evaluate((el) => getComputedStyle(el).position);
  expect(tlPos).toBe('static');

  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'verification-screenshots/ili-717-landing-mobile.png', fullPage: true });
});

test('landing hero — article reader still opens over stack', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL);
  await page.addStyleTag({ content: NO_ANIM });
  await page.locator('.article-item').first().click();
  await expect(page.locator('.stage.open')).toBeVisible();
  await expect(page.locator('.art-h1')).not.toBeEmpty();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'verification-screenshots/ili-717-article-open.png', fullPage: true });
});
