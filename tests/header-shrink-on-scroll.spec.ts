import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('verification-screenshots/header-shrink');
fs.mkdirSync(OUT, { recursive: true });

const PORT = Number(process.env.VERIFY_PORT) || 4323;
const BASE = `http://127.0.0.1:${PORT}`;

test('mobile header collapses on scroll-down and re-expands on 20px scroll-up', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  // Homepage in test data may be short; ensure page has enough scroll height
  // for the listener thresholds. Inject a tall spacer at the end of body.
  await page.evaluate(() => {
    const s = document.createElement('div');
    s.style.height = '2000px';
    s.setAttribute('data-test-spacer', '');
    document.body.appendChild(s);
  });

  const headerH = () =>
    page.$eval('.site-header', (el) => Math.round(el.getBoundingClientRect().height));
  const burgerScale = () =>
    page.$eval('.sh-burger', (el) => {
      const t = getComputedStyle(el).transform;
      if (t === 'none') return 1;
      // matrix(a, b, c, d, tx, ty) — a is x-scale
      const m = t.match(/matrix\(([^)]+)\)/);
      return m ? parseFloat(m[1].split(',')[0]) : 1;
    });

  // Baseline at top — full height, no scale.
  expect(await headerH()).toBe(80);
  expect(await burgerScale()).toBeCloseTo(1, 2);
  await page.screenshot({
    path: path.join(OUT, '1-top.png'),
    clip: { x: 0, y: 0, width: 390, height: 100 },
  });

  // Scroll well past the 80px collapse threshold.
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(400);
  expect(await headerH()).toBe(40);
  expect(await burgerScale()).toBeCloseTo(0.6, 2);
  await page.screenshot({
    path: path.join(OUT, '2-condensed.png'),
    clip: { x: 0, y: 0, width: 390, height: 100 },
  });

  // Scroll up 25px (more than the 20px threshold) — should re-expand.
  await page.evaluate(() => window.scrollTo(0, 575));
  await page.waitForTimeout(400);
  expect(await headerH()).toBe(80);
  expect(await burgerScale()).toBeCloseTo(1, 2);
  await page.screenshot({
    path: path.join(OUT, '3-reexpanded.png'),
    clip: { x: 0, y: 0, width: 390, height: 100 },
  });

  // Scroll up by less than 20px after condensing again — should stay condensed.
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(300);
  expect(await headerH()).toBe(40);
  await page.evaluate(() => window.scrollTo(0, 590)); // 10px up
  await page.waitForTimeout(300);
  expect(await headerH()).toBe(40);
  await page.screenshot({
    path: path.join(OUT, '4-still-condensed.png'),
    clip: { x: 0, y: 0, width: 390, height: 100 },
  });

  // Back to top resets condensed.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  expect(await headerH()).toBe(80);
});

test('desktop header is unaffected', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.waitForTimeout(600);

  const headerH = () =>
    page.$eval('.site-header', (el) => Math.round(el.getBoundingClientRect().height));

  expect(await headerH()).toBe(80);
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(400);
  // CSS only collapses --header-h under (max-width: 900px), so desktop stays 80.
  expect(await headerH()).toBe(80);
});
