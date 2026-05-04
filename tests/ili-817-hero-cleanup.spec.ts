import { test, expect } from '@playwright/test';

const MOBILE = { width: 390, height: 844 };

test('mobile hero — // FRAME eyebrow is hidden, footer is not visible, page does not scroll', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto('http://localhost:4321/');
  await page.waitForSelector('.stage', { state: 'attached' });
  await page.waitForTimeout(3500);

  // The // FRAME · V1.0 · TRIAD VERIFIED line should not render.
  const eyebrowVisible = await page.evaluate(() => {
    const el = document.querySelector('.frame-eyebrow') as HTMLElement | null;
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.height > 0 && r.width > 0;
  });
  expect(eyebrowVisible).toBe(false);

  // Footer must not be in view OR in flow on hero.
  const footerInfo = await page.evaluate(() => {
    const f = document.querySelector('.site-footer') as HTMLElement;
    const display = getComputedStyle(f).display;
    const r = f.getBoundingClientRect();
    return { display, height: r.height, top: r.top };
  });
  expect(footerInfo.display).toBe('none');

  // Document is exactly viewport height — header + hero = 100vh, no scroll.
  const dimens = await page.evaluate(() => ({
    docH: document.documentElement.scrollHeight,
    viewportH: window.innerHeight,
  }));
  expect(dimens.docH).toBeLessThanOrEqual(dimens.viewportH + 1);

  await page.screenshot({ path: 'screenshots/ili-817/12-mobile-hero-no-eyebrow-no-footer.png' });
});

test('mobile list/article — footer stays hidden on every view', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto('http://localhost:4321/');
  await page.waitForSelector('.stage', { state: 'attached' });
  await page.waitForTimeout(3500);

  await page.click('.frame-cta');
  await page.waitForTimeout(450);

  const listFooterDisplay = await page.evaluate(() => {
    return getComputedStyle(document.querySelector('.site-footer')!).display;
  });
  expect(listFooterDisplay).toBe('none');

  await page.click('.post-card[data-index="0"]');
  await page.waitForTimeout(450);

  const articleFooterDisplay = await page.evaluate(() => {
    return getComputedStyle(document.querySelector('.site-footer')!).display;
  });
  expect(articleFooterDisplay).toBe('none');
});

test('desktop hero — eyebrow + footer both visible, no regression', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4321/');
  await page.waitForSelector('.stage', { state: 'attached' });
  await page.waitForTimeout(3500);

  const eyebrowVisible = await page.evaluate(() => {
    const el = document.querySelector('.frame-eyebrow') as HTMLElement | null;
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.height > 0 && r.width > 0;
  });
  expect(eyebrowVisible).toBe(true);

  const footerDisplay = await page.evaluate(() => {
    return getComputedStyle(document.querySelector('.site-footer')!).display;
  });
  expect(footerDisplay).not.toBe('none');
});
