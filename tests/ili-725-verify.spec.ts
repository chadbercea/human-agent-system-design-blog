import { test, expect } from '@playwright/test';

const PORT = process.env.PORT || 4321;
const BASE = `http://localhost:${PORT}`;
const NO_ANIM = `*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; }`;

test.describe('ILI-725 — Protocol 001 / Phase Alpha framing site-wide', () => {
  test('home: rails render with live timer, header shows HASH kv', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/');
    await page.addStyleTag({ content: NO_ANIM });

    await expect(page.locator('.rail--left')).toBeVisible();
    await expect(page.locator('.rail--right')).toBeVisible();
    await expect(page.locator('.rail--left')).toContainText('PROTOCOL 001');
    await expect(page.locator('.rail--left')).toContainText('PHASE ALPHA');
    await expect(page.locator('.rail--right')).toContainText('LIVE TRANSMISSION');

    const timer = page.locator('.rail--right [data-site-timer]');
    await expect(timer).toHaveText(/^\d{2}:\d{2}:\d{2}$/);
    const first = await timer.textContent();
    await page.waitForTimeout(1200);
    const second = await timer.textContent();
    expect(second).not.toBe(first);

    const hashKv = page.locator('.site-header .kv-hash');
    await expect(hashKv).toContainText('HASH');
    await expect(hashKv.locator('.v')).toHaveText(/^[0-9A-F]{4}-[0-9A-F]{4}$/);

    await page.screenshot({
      path: 'verification-screenshots/ili-725-home-desktop.png',
      fullPage: false,
    });
  });

  test('about: rails present on HomepageLayout route', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/about');
    await page.addStyleTag({ content: NO_ANIM });
    await expect(page.locator('.rail--left')).toBeVisible();
    await expect(page.locator('.rail--right')).toBeVisible();
    await expect(page.locator('.rail--right [data-site-timer]')).toHaveText(/^\d{2}:\d{2}:\d{2}$/);
    await page.screenshot({
      path: 'verification-screenshots/ili-725-about-desktop.png',
      fullPage: false,
    });
  });

  test('contact: rails present on HomepageLayout route', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/contact');
    await page.addStyleTag({ content: NO_ANIM });
    await expect(page.locator('.rail--left')).toBeVisible();
    await expect(page.locator('.rail--right')).toBeVisible();
    await page.screenshot({
      path: 'verification-screenshots/ili-725-contact-desktop.png',
      fullPage: false,
    });
  });

  test('design-system: rails still render after SiteRails refactor', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/design-system');
    await page.addStyleTag({ content: NO_ANIM });
    await expect(page.locator('.rail--left')).toBeVisible();
    await expect(page.locator('.rail--right')).toBeVisible();
    await expect(page.locator('.panel-rail').first()).toBeVisible();
    await page.screenshot({
      path: 'verification-screenshots/ili-725-designsystem-desktop.png',
      fullPage: false,
    });
  });

  test('home: left rail tag is "// FEED · LIVE"', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/');
    await page.addStyleTag({ content: NO_ANIM });
    await expect(page.locator('[data-rail-tag]')).toHaveText('// FEED · LIVE');
  });

  test('about: left rail tag is "// OPERATOR · BIO"', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/about');
    await page.addStyleTag({ content: NO_ANIM });
    await expect(page.locator('[data-rail-tag]')).toHaveText('// OPERATOR · BIO');
  });

  test('opening an article swaps rails to DISPATCH + date + read-time', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/');
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card');
    await page.locator('.post-card').first().click();
    await page.waitForSelector('#stage.open');

    const tag = await page.locator('[data-rail-tag]').textContent();
    const channel = await page.locator('[data-rail-channel]').textContent();
    const transmission = await page.locator('[data-rail-transmission]').textContent();
    expect(tag).toMatch(/^\/\/ DISPATCH · \/\/ POST \d+$|^\/\/ DISPATCH · POST \d+$/);
    expect(channel).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
    expect(transmission).toMatch(/MIN READ/);

    // Timer still ticking
    await expect(page.locator('[data-site-timer]')).toHaveText(/^\d{2}:\d{2}:\d{2}$/);

    await page.screenshot({
      path: 'verification-screenshots/ili-725-home-article-open.png',
      fullPage: false,
    });
  });

  test('closing an article restores default rails', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/');
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card');
    await page.locator('.post-card').first().click();
    await page.waitForSelector('#stage.open');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.getElementById('stage')?.classList.contains('open'));

    await expect(page.locator('[data-rail-tag]')).toHaveText('// FEED · LIVE');
    await expect(page.locator('[data-rail-channel]')).toHaveText('CH 01 · SIGNAL STRONG');
    await expect(page.locator('[data-rail-transmission]')).toHaveText('LIVE TRANSMISSION');
    await expect(page.locator('[data-site-timer]')).toHaveText(/^\d{2}:\d{2}:\d{2}$/);
  });

  test('mobile: rails hidden below 900px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE + '/');
    await page.addStyleTag({ content: NO_ANIM });
    await expect(page.locator('.rail--left')).toBeHidden();
    await expect(page.locator('.rail--right')).toBeHidden();
    await page.screenshot({
      path: 'verification-screenshots/ili-725-home-mobile.png',
      fullPage: false,
    });
  });
});
