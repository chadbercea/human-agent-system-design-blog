import { test, expect } from '@playwright/test';

const MOBILE = { width: 390, height: 844 };

test('ILI-817 follow-up — article footer is not pinned; reveals on scroll', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto('http://localhost:4321/');
  await page.waitForSelector('.stage', { state: 'attached' });
  // Wait past the boot sequence.
  await page.waitForTimeout(3500);

  // Page from hero → list → article. The hero view itself hides the
  // footer entirely (header + hero = 100vh). We only check the article
  // here: the footer is in flow at the bottom, not pinned to the
  // viewport.
  await page.click('.frame-cta');
  await page.waitForTimeout(450);
  await page.click('.post-card[data-index="0"]');
  await page.waitForTimeout(450);

  const articleFooter = await page.evaluate(() => {
    const f = document.querySelector('.site-footer') as HTMLElement;
    return { top: f.getBoundingClientRect().top, viewportH: window.innerHeight };
  });
  expect(articleFooter.top).toBeGreaterThanOrEqual(articleFooter.viewportH - 1);

  // Document is tall enough to scroll the footer into view.
  const docMetrics = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    viewportH: window.innerHeight,
  }));
  expect(docMetrics.scrollHeight).toBeGreaterThan(docMetrics.viewportH);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(150);
  const articleScrolled = await page.evaluate(() => {
    const f = document.querySelector('.site-footer') as HTMLElement;
    return { bottom: f.getBoundingClientRect().bottom, viewportH: window.innerHeight };
  });
  expect(articleScrolled.bottom).toBeLessThanOrEqual(articleScrolled.viewportH + 1);

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
