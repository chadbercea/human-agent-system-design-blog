import { test, expect } from '@playwright/test';

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1440, height: 900 };

test('ILI-817 — mobile pager: hero default → list → article → back', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto('http://localhost:4321/');

  await page.waitForSelector('.stage', { state: 'attached' });
  // Wait for boot sequence to complete by giving the frame hero time to play.
  await page.waitForTimeout(3500);

  await page.screenshot({ path: 'screenshots/ili-817/01-mobile-hero-default.png' });

  // Default view should be hero (no data-view attribute).
  const initialView = await page.evaluate(() => {
    const s = document.getElementById('stage');
    return s?.getAttribute('data-view') || 'hero';
  });
  expect(initialView).toBe('hero');

  // Tap "Begin transmission" — should slide to list, not navigate.
  await page.click('.frame-cta');
  await page.waitForTimeout(450);
  await page.screenshot({ path: 'screenshots/ili-817/02-mobile-list.png' });

  const afterCtaView = await page.evaluate(() => document.getElementById('stage')?.getAttribute('data-view'));
  expect(afterCtaView).toBe('list');
  // URL should remain /, no navigation.
  expect(new URL(page.url()).pathname).toBe('/');

  // Tap the first article.
  await page.click('.post-card[data-index="0"]');
  await page.waitForTimeout(450);
  await page.screenshot({ path: 'screenshots/ili-817/03-mobile-article.png' });

  const afterCardView = await page.evaluate(() => document.getElementById('stage')?.getAttribute('data-view'));
  expect(afterCardView).toBe('article');

  // Tap article back button — should go to list view.
  await page.click('#mobile-back');
  await page.waitForTimeout(450);
  await page.screenshot({ path: 'screenshots/ili-817/04-mobile-back-to-list.png' });

  const afterBackToList = await page.evaluate(() => document.getElementById('stage')?.getAttribute('data-view'));
  expect(afterBackToList).toBe('list');

  // Tap list back button — should go to hero.
  await page.click('#mobile-back-list');
  await page.waitForTimeout(450);
  await page.screenshot({ path: 'screenshots/ili-817/05-mobile-back-to-hero.png' });

  const afterBackToHero = await page.evaluate(() => document.getElementById('stage')?.getAttribute('data-view'));
  expect(afterBackToHero).toBe('hero');
});

test('ILI-817 — hardware back walks the stack', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto('http://localhost:4321/');
  await page.waitForSelector('.stage', { state: 'attached' });
  await page.waitForTimeout(3500);

  await page.click('.frame-cta');
  await page.waitForTimeout(450);
  await page.click('.post-card[data-index="0"]');
  await page.waitForTimeout(450);

  // Hardware back: should go to list.
  await page.goBack();
  await page.waitForTimeout(450);
  let v = await page.evaluate(() => document.getElementById('stage')?.getAttribute('data-view'));
  expect(v).toBe('list');

  // Hardware back again: should go to hero.
  await page.goBack();
  await page.waitForTimeout(450);
  v = await page.evaluate(() => document.getElementById('stage')?.getAttribute('data-view'));
  expect(v).toBe('hero');
});

test('ILI-817 — desktop layout unchanged (no pager)', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await page.goto('http://localhost:4321/');
  await page.waitForSelector('.stage', { state: 'attached' });
  await page.waitForTimeout(3500);

  await page.screenshot({ path: 'screenshots/ili-817/06-desktop-default.png' });

  // Desktop should not set data-view (pager is mobile-only).
  const dataView = await page.evaluate(() => document.getElementById('stage')?.getAttribute('data-view'));
  expect(dataView == null || dataView === '').toBe(true);

  // Begin transmission opens article inline (existing behavior).
  await page.click('.frame-cta');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'screenshots/ili-817/07-desktop-open.png' });

  const stageOpen = await page.evaluate(() => document.getElementById('stage')?.classList.contains('open'));
  expect(stageOpen).toBe(true);
});

test('ILI-817 — /blog mobile lands on list view', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto('http://localhost:4321/blog');
  await page.waitForSelector('.stage', { state: 'attached' });
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'screenshots/ili-817/08-mobile-blog-list.png' });

  const view = await page.evaluate(() => document.getElementById('stage')?.getAttribute('data-view'));
  expect(view).toBe('list');
});
