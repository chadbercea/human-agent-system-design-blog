import { test, expect } from '@playwright/test';

const MOBILE = { width: 390, height: 844 };

test('ILI-817 follow-up — mobile footer is not pinned; reveals on scroll', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto('http://localhost:4321/');
  await page.waitForSelector('.stage', { state: 'attached' });
  // Wait past the boot sequence.
  await page.waitForTimeout(3500);

  // On hero (initial view), the footer should sit BELOW the viewport, not
  // pinned at the bottom. The viewport is 844px; footer top should be >= 844.
  const heroFooter = await page.evaluate(() => {
    const f = document.querySelector('.site-footer') as HTMLElement;
    return { top: f.getBoundingClientRect().top, viewportH: window.innerHeight };
  });
  expect(heroFooter.top).toBeGreaterThanOrEqual(heroFooter.viewportH - 1);

  // Document must be tall enough to scroll to the footer.
  const docMetrics = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    viewportH: window.innerHeight,
  }));
  expect(docMetrics.scrollHeight).toBeGreaterThan(docMetrics.viewportH);

  // Scroll all the way down — footer should now be in view.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(150);
  const heroScrolled = await page.evaluate(() => {
    const f = document.querySelector('.site-footer') as HTMLElement;
    return { bottom: f.getBoundingClientRect().bottom, viewportH: window.innerHeight };
  });
  expect(heroScrolled.bottom).toBeLessThanOrEqual(heroScrolled.viewportH + 1);

  // Same on the article view.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('.frame-cta');
  await page.waitForTimeout(450);
  await page.click('.post-card[data-index="0"]');
  await page.waitForTimeout(450);

  const articleFooter = await page.evaluate(() => {
    const f = document.querySelector('.site-footer') as HTMLElement;
    return { top: f.getBoundingClientRect().top, viewportH: window.innerHeight };
  });
  expect(articleFooter.top).toBeGreaterThanOrEqual(articleFooter.viewportH - 1);

  await page.screenshot({ path: 'screenshots/ili-817/09-mobile-hero-not-pinned.png' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'screenshots/ili-817/10-mobile-article-top.png' });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(150);
  await page.screenshot({ path: 'screenshots/ili-817/11-mobile-article-bottom-with-footer.png' });
});

test('ILI-817 follow-up — desktop footer pinning is unchanged', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4321/');
  await page.waitForSelector('.stage', { state: 'attached' });
  await page.waitForTimeout(3500);

  // Desktop should not enter the mobile pager. data-view is unset.
  const dv = await page.evaluate(() => document.getElementById('stage')?.getAttribute('data-view'));
  expect(dv == null || dv === '').toBe(true);
});
