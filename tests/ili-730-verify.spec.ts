import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('verification-screenshots/ili-730');
fs.mkdirSync(OUT, { recursive: true });

test.describe('ILI-730 — hero typography animation', () => {
  test('animation sequence snapshots at t=500/1500/3000', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForSelector('.hero-story');

    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, 'hero-t500.png'), fullPage: false });

    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT, 'hero-t1500.png'), fullPage: false });

    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT, 'hero-t3000.png'), fullPage: false });

    // Acceptance — after 3s every story line should be fully revealed.
    // Computed inset collapses to `inset(0px)` when all sides equal zero.
    const revealed = await page.$$eval('.type-line', (els) =>
      els.map((el) => getComputedStyle(el).clipPath),
    );
    for (const clip of revealed) {
      // Computed `inset(0 0 0 0)` may serialize as `inset(0px)`, `inset(0px 0px 0px 0px)`,
      // or — when reached via keyframe tween from `100%` — `inset(0px 0% 0px 0px)`. All
      // of these mean fully revealed.
      expect(clip).toMatch(/^inset\((0(px|%)?\s*){1,4}\)$/);
    }

    // Cursor should be on the last line
    const typingLines = await page.$$eval('.type-line.is-typing', (els) => els.length);
    expect(typingLines).toBe(1);
    const lastIsTyping = await page.$eval('.type-line:last-of-type', (el) =>
      el.classList.contains('is-typing'),
    );
    expect(lastIsTyping).toBe(true);

    // T+ counter should have ticked past 00:00:00
    const tText = (await page.textContent('#hud-t')) || '';
    expect(tText).toMatch(/^T\+\d{2}:\d{2}:\d{2}$/);
    expect(tText).not.toBe('T+00:00:00');

    // HASH should have resolved to the final value
    const hashText = (await page.textContent('#hud-hash')) || '';
    expect(hashText).toBe('9F2A-8C1D');

    // ENTRIES should match data-target
    const entriesText = (await page.textContent('#hud-entries')) || '';
    const entriesTarget = await page.getAttribute('#hud-entries', 'data-target');
    expect(entriesText.replace(/^0+/, '') || '0').toBe(String(Number(entriesTarget)));
  });

  test('reduced motion — end states visible, no cursor', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Small wait to let any layout settle
    await page.waitForTimeout(120);
    await page.screenshot({ path: path.join(OUT, 'hero-reduced-motion.png'), fullPage: false });

    const revealed = await page.$$eval('.type-line', (els) =>
      els.map((el) => getComputedStyle(el).clipPath),
    );
    for (const clip of revealed) {
      // Computed `inset(0 0 0 0)` may serialize as `inset(0px)`, `inset(0px 0px 0px 0px)`,
      // or — when reached via keyframe tween from `100%` — `inset(0px 0% 0px 0px)`. All
      // of these mean fully revealed.
      expect(clip).toMatch(/^inset\((0(px|%)?\s*){1,4}\)$/);
    }

    const cursorShown = await page.$$eval('.type-line.is-typing', (els) => els.length);
    expect(cursorShown).toBe(0);

    // T+ counter should NOT tick under reduced motion
    const t1 = await page.textContent('#hud-t');
    await page.waitForTimeout(1200);
    const t2 = await page.textContent('#hud-t');
    expect(t1).toBe(t2);

    await context.close();
  });

  test('logo hover shifts bars', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3200);
    const logo = page.locator('.hero-logo');
    const before = await page.$$eval('.hero-logo .bar', (els) =>
      els.map((el) => getComputedStyle(el).transform),
    );
    await logo.hover();
    await page.waitForTimeout(260);
    const after = await page.$$eval('.hero-logo .bar', (els) =>
      els.map((el) => getComputedStyle(el).transform),
    );
    const changed = before.filter((b, i) => b !== after[i]).length;
    expect(changed).toBeGreaterThan(0);
    await page.screenshot({ path: path.join(OUT, 'hero-logo-hover.png'), fullPage: false });
  });
});
