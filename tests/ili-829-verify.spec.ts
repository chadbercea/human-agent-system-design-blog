import { test, expect } from '@playwright/test';

test('ILI-829 — sliders render after CSP fix, share modal works', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4321/diagnostic/index.html');
  await page.waitForSelector('.slider', { state: 'visible', timeout: 5000 });
  expect(await page.locator('.slider').count()).toBe(5);

  await page.locator('#s-0').evaluate((el: HTMLInputElement) => {
    el.value = '5';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(await page.locator('#paragraph').textContent()).toContain('sabbatical');

  await page.locator('#btn-share').click();
  await page.waitForSelector('.share-modal[data-loading="false"]', { timeout: 15000 });
  expect(await page.locator('#share-preview-img').getAttribute('src')).toMatch(/^data:image\/png/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:4321/diagnostic/index.html');
  await page.waitForSelector('.slider', { state: 'visible', timeout: 5000 });
  expect(await page.locator('.slider').count()).toBe(5);

  expect(errors, 'console errors').toEqual([]);
});
