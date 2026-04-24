import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('verification-screenshots/ili-730');
fs.mkdirSync(OUT, { recursive: true });

test.describe('ILI-730 — hero typography animation (terminal reveal)', () => {
  test('terminal reveal — 3 mono lines typed via steps(), cursor on line 3', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    // Wait for the first line to exist and at least one paint tick before
    // the first screenshot — dev-mode load sometimes arms but doesn't paint.
    await page.waitForSelector('.terminal-reveal .type-line');
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))));

    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT, 'hero-t1000.png'), fullPage: false });

    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT, 'hero-t2500.png'), fullPage: false });

    // Line 3's typing completes at 2240 + 37*40ms = 3720ms. Poll using the
    // actual animated `width` vs its end target `calc(chars * 1ch)` so we
    // don't assume a specific ch size across the clamped font scale.
    await page.waitForFunction(
      () => {
        const last = document.querySelector('.type-line:last-of-type') as HTMLElement | null;
        if (!last) return false;
        const cs = getComputedStyle(last);
        const chars =
          Number((last.style.getPropertyValue('--chars') || '0').trim()) || 37;
        // parseFloat rounds any sub-pixel noise; require within 1px of final.
        const current = parseFloat(cs.width);
        const fontSize = parseFloat(cs.fontSize);
        // Final width per the keyframe:
        //   chars * (1ch + 0.02em) + 0.5ch + 2px
        // At JetBrains Mono 500, 1ch ≈ 0.6 × font-size (empirical), 1em = font-size.
        const ch = fontSize * 0.6;
        const em = fontSize;
        const target = chars * (ch + 0.02 * em) + 0.5 * ch + 2;
        return current >= target - 1;
      },
      undefined,
      { timeout: 5000 },
    );
    // An extra paint frame after width hits target — belt-and-suspenders for
    // the cursor, which only becomes visible when the clip opens to the end.
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(OUT, 'hero-end-state.png'), fullPage: false });

    // Exactly 3 lines, locked copy, in order
    const lines = await page.$$eval('.type-line', (els) =>
      els.map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim()),
    );
    expect(lines.length).toBe(3);
    expect(lines[0]).toBe('Humans set intent.');
    expect(lines[1]).toBe('Agents carry execution.');
    expect(lines[2]).toBe('System design is how we make it work.');

    // Typography is JetBrains Mono, not Lato
    const fontFamily = await page.$eval('.type-line', (el) => getComputedStyle(el).fontFamily);
    expect(fontFamily).toMatch(/JetBrains Mono/);

    // Animation is the step-typing type, not clip-path reveal
    const animName = await page.$eval('.type-line', (el) => getComputedStyle(el).animationName);
    expect(animName).toBe('type');

    // Left alignment — every line's left edge matches the logo's left edge
    const [logoLeft, ...lineLefts] = await page.evaluate(() => {
      const logo = document.querySelector('.hero-logo') as HTMLElement;
      const ls = Array.from(document.querySelectorAll('.type-line')) as HTMLElement[];
      return [logo.getBoundingClientRect().left, ...ls.map((l) => l.getBoundingClientRect().left)];
    });
    for (const left of lineLefts) {
      expect(Math.abs(left - logoLeft)).toBeLessThan(1);
    }

    // Cursor is a single span nested inside line 3 only
    expect(await page.$$eval('.cursor', (els) => els.length)).toBe(1);
    const cursorLineIdx = await page.$eval('.cursor', (el) => {
      const line = el.closest('.type-line') as HTMLElement;
      return Array.from(document.querySelectorAll('.type-line')).indexOf(line);
    });
    expect(cursorLineIdx).toBe(2);
  });

  test('logo + canonical tagline intact — no DISPATCHES, no WRITING/SHIPPING', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });

    // HUMAN AGENT SYSTEM DESIGN SVG is present
    const subLabel = await page.getAttribute('.hero-sub svg', 'aria-label');
    expect(subLabel).toBe('HUMAN AGENT SYSTEM DESIGN');

    // Removed copy is gone from the DOM
    const body = (await page.textContent('body')) || '';
    expect(body.toUpperCase()).not.toContain('DISPATCHES FROM THE HANDOFF');
    expect(body.toUpperCase()).not.toMatch(/WRITING\s*\/\s*SHIPPING/);
    expect(body.toUpperCase()).not.toContain('THINKING OUT LOUD');

    // .hero-meta block is not in the DOM on the homepage
    expect(await page.$$eval('.hero-meta', (els) => els.length)).toBe(0);
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

  test('reduced motion — 3 lines visible instantly, cursor static', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    // Wait past the longest ILI-717 rise delay (600ms on .hud-corner.br) so
    // the chrome has settled before the reference shot. ILI-730's own
    // reveal/cursor should already be at end state regardless.
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, 'hero-reduced-motion.png'), fullPage: false });

    // Lines are visible at their max-content width (no clip)
    const lineWidths = await page.$$eval('.type-line', (els) =>
      els.map((el) => el.getBoundingClientRect().width),
    );
    expect(lineWidths.length).toBe(3);
    for (const w of lineWidths) {
      expect(w).toBeGreaterThan(50);
    }

    // Cursor visible, no animation
    const cursor = await page.$eval('.cursor', (el) => {
      const cs = getComputedStyle(el);
      return { opacity: cs.opacity, animationName: cs.animationName };
    });
    expect(Number(cursor.opacity)).toBe(1);
    expect(cursor.animationName).toBe('none');

    // T+ should not tick under reduced motion
    const t1 = await page.textContent('#hud-t');
    await page.waitForTimeout(1200);
    const t2 = await page.textContent('#hud-t');
    expect(t1).toBe(t2);

    await context.close();
  });

  test('logo hover shifts bars', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(4500);

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
