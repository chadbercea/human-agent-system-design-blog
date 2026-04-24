import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('verification-screenshots/ili-730');
fs.mkdirSync(OUT, { recursive: true });

test.describe('ILI-730 — hero typography animation', () => {
  test('story reveal — 4 lines, final cursor lands at ~3380ms', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForSelector('.hero-story');

    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT, 'hero-t1000.png'), fullPage: false });

    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT, 'hero-t2500.png'), fullPage: false });

    // The last line's reveal completes at 3380ms of animation time; dev-mode
    // paint lag can push that a bit past our cumulative waits, so poll until
    // the clip-path reports fully revealed before the end-state screenshot.
    await page.waitForFunction(
      () => {
        const last = document.querySelector('.type-line:last-of-type') as HTMLElement | null;
        if (!last) return false;
        const cp = getComputedStyle(last).clipPath;
        return /^inset\((0(px|%)?\s*){1,4}\)$/.test(cp);
      },
      undefined,
      { timeout: 4000 },
    );

    // Give the cursor a moment to become visible (opacity jump at 3380ms)
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(OUT, 'hero-end-state.png'), fullPage: false });

    // Exactly 4 story lines exist
    const lineCount = await page.$$eval('.type-line', (els) => els.length);
    expect(lineCount).toBe(4);

    // Copy is exact — no `//` prefixes, in locked order
    const lines = await page.$$eval('.type-line', (els) =>
      els.map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim()),
    );
    expect(lines[0]).toBe('Humans set intent.');
    expect(lines[1]).toBe('Agents carry execution.');
    expect(lines[2]).toBe('System design is how we make it work.');
    // Line 3 text includes the empty cursor span; its textContent drops that
    expect(lines[3]).toBe('These are the field notes.');

    // All 4 lines fully revealed by 4s
    const clips = await page.$$eval('.type-line', (els) =>
      els.map((el) => getComputedStyle(el).clipPath),
    );
    for (const clip of clips) {
      expect(clip).toMatch(/^inset\((0(px|%)?\s*){1,4}\)$/);
    }

    // Cursor is a child of the final line (not jumping between lines)
    const cursorParent = await page.$eval('.cursor', (el) => {
      const line = el.closest('.type-line') as HTMLElement | null;
      const all = Array.from(document.querySelectorAll('.type-line'));
      return line ? all.indexOf(line) : -1;
    });
    expect(cursorParent).toBe(3);

    // Exactly one cursor
    expect(await page.$$eval('.cursor', (els) => els.length)).toBe(1);

    // Cursor should be visible by now (appears at 3380ms)
    const cursorOpacity = await page.$eval('.cursor', (el) => getComputedStyle(el).opacity);
    expect(Number(cursorOpacity)).toBeGreaterThan(0.3);
  });

  test('telemetry — T+ ticks, HASH resolves, ENTRIES matches target', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const tText = (await page.textContent('#hud-t')) || '';
    expect(tText).toMatch(/^T\+\d{2}:\d{2}:\d{2}$/);
    expect(tText).not.toBe('T+00:00:00');

    const hashText = (await page.textContent('#hud-hash')) || '';
    expect(hashText).toBe('9F2A-8C1D');

    const entriesText = (await page.textContent('#hud-entries')) || '';
    const entriesTarget = await page.getAttribute('#hud-entries', 'data-target');
    expect(entriesText.replace(/^0+/, '') || '0').toBe(String(Number(entriesTarget)));
  });

  test('reduced motion — 4 lines visible, cursor static, T+ frozen', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(OUT, 'hero-reduced-motion.png'), fullPage: false });

    // All 4 lines at end state
    const clips = await page.$$eval('.type-line', (els) =>
      els.map((el) => getComputedStyle(el).clipPath),
    );
    expect(clips.length).toBe(4);
    for (const clip of clips) {
      expect(clip).toMatch(/^inset\((0(px|%)?\s*){1,4}\)$/);
    }

    // Cursor visible but NOT animated (opacity 1, no blink keyframe running)
    const cursor = await page.$eval('.cursor', (el) => {
      const cs = getComputedStyle(el);
      return { opacity: cs.opacity, animationName: cs.animationName };
    });
    expect(Number(cursor.opacity)).toBe(1);
    expect(cursor.animationName).toBe('none');

    // T+ should not tick
    const t1 = await page.textContent('#hud-t');
    await page.waitForTimeout(1200);
    const t2 = await page.textContent('#hud-t');
    expect(t1).toBe(t2);

    await context.close();
  });

  test('logo hover shifts bars', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(4000);

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
