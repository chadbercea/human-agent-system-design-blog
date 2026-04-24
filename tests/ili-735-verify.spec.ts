import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('verification-screenshots/ili-735');
fs.mkdirSync(OUT, { recursive: true });

const routes: Array<{ name: string; path: string; mainSelector: string }> = [
  { name: 'home', path: '/', mainSelector: '.stage' },
  { name: 'about', path: '/about', mainSelector: 'main' },
  { name: 'contact', path: '/contact', mainSelector: 'main' },
  { name: 'design-system', path: '/design-system', mainSelector: 'main' },
];

test.describe('ILI-735 — load / entry animation pass', () => {
  for (const r of routes) {
    test(`${r.name} — chrome fades in, content rises`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(r.path, { waitUntil: 'load' });

      // At t≈0, content is invisible / offset, chrome is fading.
      await page.screenshot({ path: path.join(OUT, `${r.name}-t0.png`), fullPage: false });

      // Chrome animations complete by var(--dur-fast) = 160ms; give a buffer.
      await page.waitForTimeout(220);
      const headerOpacity = await page.$eval('.site-header', (el) => getComputedStyle(el).opacity);
      expect(Number(headerOpacity)).toBeCloseTo(1, 1);

      // After 1500ms the longest stagger (+ duration) has settled for all
      // pages; content should be at translateY(0) opacity(1).
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUT, `${r.name}-settled.png`), fullPage: false });

      const targetOpacity = await page.$eval(r.mainSelector, (el) => getComputedStyle(el).opacity);
      expect(Number(targetOpacity)).toBeCloseTo(1, 1);
    });
  }

  test('chrome uses fade keyframe', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/about', { waitUntil: 'load' });

    const header = await page.$eval('.site-header', (el) => getComputedStyle(el).animationName);
    const footer = await page.$eval('.site-footer', (el) => getComputedStyle(el).animationName);
    const rail = await page.$eval('.rail', (el) => getComputedStyle(el).animationName);
    expect(header).toBe('fade');
    expect(footer).toBe('fade');
    expect(rail).toBe('fade');
  });

  test('main > * uses rise keyframe on design-system hero', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/design-system', { waitUntil: 'load' });

    // First child of <main> is the hero section (no .reveal class).
    const anim = await page.$eval('main > *:first-child', (el) => getComputedStyle(el).animationName);
    expect(anim).toBe('rise');
  });

  test('.reveal panels opt out of load-time rise', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/design-system', { waitUntil: 'load' });

    // Every panel carries .reveal and must not carry the load-time rise —
    // ILI-734 scroll observer owns their entry.
    const names = await page.$$eval('main > .reveal', (els) =>
      els.map((el) => getComputedStyle(el).animationName),
    );
    expect(names.length).toBeGreaterThan(0);
    for (const n of names) expect(n).toBe('none');
  });

  test('homepage stage rises on load', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    const anim = await page.$eval('.stage', (el) => getComputedStyle(el).animationName);
    expect(anim).toBe('rise');
  });

  test('reduced motion — everything settled instantly, no rise / fade frames', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/about', { waitUntil: 'load' });

    // Global reduced-motion guard crushes animation-duration to ~0.001ms, so
    // a single rAF is enough for end states to apply.
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))));

    const headerOpacity = await page.$eval('.site-header', (el) => getComputedStyle(el).opacity);
    const mainOpacity = await page.$eval('main', (el) => getComputedStyle(el).opacity);
    expect(Number(headerOpacity)).toBeCloseTo(1, 1);
    expect(Number(mainOpacity)).toBeCloseTo(1, 1);

    await page.screenshot({ path: path.join(OUT, 'about-reduced-motion.png'), fullPage: false });
    await context.close();
  });
});
