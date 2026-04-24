import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('verification-screenshots/ili-737');
fs.mkdirSync(OUT, { recursive: true });

const SLUGS = [
  'different-not-lesser',
  'bilateral-non-reducibility',
  'asymmetry-of-choice',
  'entity-classification',
  'co-authored-epistemology',
  'gradient-descent-problem',
  'mirroring-constraint',
  'spiral-detection-problem',
  'agency-without-alternatives',
  'adversarial-interdependence',
  'availability-function',
  'self-editing-corrosion-prevention',
  'third-orientation',
];

test.describe('ILI-737 — glossary nav + redacted document UX', () => {
  test('Glossary nav item appears left of Design System on every route', async ({ page }) => {
    for (const route of ['/', '/glossary', '/about', '/contact', '/design-system']) {
      await page.goto(route, { waitUntil: 'load' });
      const links = await page.$$eval('.site-header .nav a', (els) =>
        els.map((el) => ({ text: (el.textContent || '').trim(), href: el.getAttribute('href') })),
      );
      const order = links.map((l) => l.href);
      const gIdx = order.indexOf('/glossary');
      const dsIdx = order.indexOf('/design-system');
      expect(gIdx).toBeGreaterThan(-1);
      expect(dsIdx).toBeGreaterThan(-1);
      expect(gIdx).toBeLessThan(dsIdx);
    }
  });

  test('fresh visit — all 13 entries fully redacted, progress 00 / 13', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/glossary');
    await page.evaluate(() => {
      localStorage.removeItem('has-glossary');
      localStorage.removeItem('has-glossary-seen');
    });
    await page.reload({ waitUntil: 'load' });

    await page.waitForSelector('.glossary-entry');
    // Direct main children rise from opacity 0; settle before screenshot.
    await page.waitForTimeout(900);
    const entries = await page.$$eval('.glossary-entry', (els) =>
      els.map((el) => ({
        slug: el.getAttribute('data-slug'),
        unlocked: el.getAttribute('data-unlocked'),
      })),
    );
    expect(entries).toHaveLength(13);
    for (const e of entries) {
      expect(e.unlocked).not.toBe('true');
      expect(SLUGS).toContain(e.slug);
    }

    const progress = await page.textContent('#glossary-progress');
    expect(progress).toMatch(/^00 \/ 13 UNLOCKED$/);

    // bars are visible (white) — sample one redact-bar's bg color
    const bg = await page.$eval(
      '.glossary-entry:first-of-type .redact-bar--name',
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe('rgb(255, 255, 255)');

    await page.screenshot({ path: path.join(OUT, 'fresh-fully-redacted.png'), fullPage: true });
  });

  test('partially unlocked — animates new entries, progress reflects count', async ({ page }) => {
    await page.goto('/glossary');
    await page.evaluate(() => {
      localStorage.setItem(
        'has-glossary',
        JSON.stringify(['gradient-descent-problem', 'mirroring-constraint', 'third-orientation']),
      );
      localStorage.removeItem('has-glossary-seen');
    });
    await page.reload({ waitUntil: 'load' });

    await page.waitForSelector('.glossary-entry');
    // Direct main children rise from opacity 0; settle before screenshot.
    await page.waitForTimeout(900);
    const states = await page.$$eval('.glossary-entry', (els) =>
      els.map((el) => ({
        slug: el.getAttribute('data-slug'),
        unlocked: el.getAttribute('data-unlocked'),
        justUnlocked: el.getAttribute('data-just-unlocked'),
      })),
    );
    const unlockedSlugs = states.filter((s) => s.unlocked === 'true').map((s) => s.slug);
    expect(new Set(unlockedSlugs)).toEqual(
      new Set(['gradient-descent-problem', 'mirroring-constraint', 'third-orientation']),
    );
    const justUnlockedSlugs = states.filter((s) => s.justUnlocked === 'true').map((s) => s.slug);
    expect(new Set(justUnlockedSlugs)).toEqual(
      new Set(['gradient-descent-problem', 'mirroring-constraint', 'third-orientation']),
    );

    const progress = await page.textContent('#glossary-progress');
    expect(progress).toMatch(/^03 \/ 13 UNLOCKED$/);

    // capture after wipe completes (1.2s + stagger)
    await page.waitForTimeout(1700);
    await page.screenshot({ path: path.join(OUT, 'partially-unlocked-settled.png'), fullPage: true });

    // After first paint, seen should be persisted matching unlocked
    const seen = await page.evaluate(() => localStorage.getItem('has-glossary-seen'));
    expect(seen).not.toBeNull();
    const seenSet = new Set(JSON.parse(seen!));
    expect(seenSet.size).toBe(3);
  });

  test('seen entries render statically — no just-unlocked attribute', async ({ page }) => {
    await page.goto('/glossary');
    await page.evaluate(() => {
      localStorage.setItem('has-glossary', JSON.stringify(['different-not-lesser']));
      localStorage.setItem('has-glossary-seen', JSON.stringify(['different-not-lesser']));
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForSelector('.glossary-entry[data-slug="different-not-lesser"]');
    const attrs = await page.$eval(
      '.glossary-entry[data-slug="different-not-lesser"]',
      (el) => ({
        unlocked: el.getAttribute('data-unlocked'),
        justUnlocked: el.getAttribute('data-just-unlocked'),
      }),
    );
    expect(attrs.unlocked).toBe('true');
    expect(attrs.justUnlocked).toBeNull();
    await page.screenshot({ path: path.join(OUT, 'seen-static.png'), fullPage: true });
  });

  test('?reset clears both keys and re-redacts', async ({ page }) => {
    await page.goto('/glossary');
    await page.evaluate(() => {
      localStorage.setItem('has-glossary', JSON.stringify(['different-not-lesser', 'third-orientation']));
      localStorage.setItem('has-glossary-seen', JSON.stringify(['different-not-lesser']));
    });
    await page.goto('/glossary?reset', { waitUntil: 'load' });
    await page.waitForSelector('.glossary-entry');
    // Direct main children rise from opacity 0; settle before screenshot.
    await page.waitForTimeout(900);

    const stored = await page.evaluate(() => ({
      g: localStorage.getItem('has-glossary'),
      s: localStorage.getItem('has-glossary-seen'),
    }));
    expect(stored.g).toBeNull();
    expect(stored.s).not.toBeNull();
    // (?reset clears both, then the page's after-paint logic re-writes seen to []; the unlocked set is empty.)
    expect(JSON.parse(stored.s!)).toEqual([]);

    const progress = await page.textContent('#glossary-progress');
    expect(progress).toMatch(/^00 \/ 13 UNLOCKED$/);

    // URL no longer carries ?reset
    expect(page.url()).not.toContain('reset');

    await page.screenshot({ path: path.join(OUT, 'after-reset.png'), fullPage: true });
  });

  test('screen readers can read the full content even when redacted', async ({ page }) => {
    await page.goto('/glossary', { waitUntil: 'load' });
    await page.evaluate(() => {
      localStorage.removeItem('has-glossary');
      localStorage.removeItem('has-glossary-seen');
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForSelector('.glossary-entry');
    // Direct main children rise from opacity 0; settle before screenshot.
    await page.waitForTimeout(900);

    // visibility:hidden — text occupies layout space and is read by AT,
    // but is not visually shown. aria-hidden must NOT be set on reveal-text.
    const sample = await page.$eval(
      '.glossary-entry:first-of-type .entry-name .reveal-text',
      (el) => ({
        text: (el.textContent || '').trim(),
        ariaHidden: el.getAttribute('aria-hidden'),
        visibility: getComputedStyle(el).visibility,
      }),
    );
    expect(sample.text.length).toBeGreaterThan(0);
    expect(sample.ariaHidden).toBeNull();
    expect(sample.visibility).toBe('hidden');

    // bars are decorative
    const barAria = await page.$eval(
      '.glossary-entry:first-of-type .redact-bar--name',
      (el) => el.getAttribute('aria-hidden'),
    );
    expect(barAria).toBe('true');
  });

  test('reduced motion — bars hide instantly, no wipe', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/glossary');
    await page.evaluate(() => {
      localStorage.setItem('has-glossary', JSON.stringify(['different-not-lesser']));
      localStorage.removeItem('has-glossary-seen');
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForSelector('.glossary-entry[data-slug="different-not-lesser"]');

    // Reduced motion: even on the just-unlocked entry, the bar should render display:none
    const display = await page.$eval(
      '.glossary-entry[data-slug="different-not-lesser"] .redact-bar--name',
      (el) => getComputedStyle(el).display,
    );
    expect(display).toBe('none');

    await page.screenshot({ path: path.join(OUT, 'reduced-motion.png'), fullPage: true });
    await context.close();
  });

  test('mobile viewport — entries stack cleanly, no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/glossary', { waitUntil: 'load' });
    await page.waitForSelector('.glossary-entry');
    // Direct main children rise from opacity 0; settle before screenshot.
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(OUT, 'mobile-fully-redacted.png'), fullPage: true });

    // unlocked + settled
    await page.evaluate(() => {
      localStorage.setItem(
        'has-glossary',
        JSON.stringify(['different-not-lesser', 'third-orientation']),
      );
      localStorage.setItem(
        'has-glossary-seen',
        JSON.stringify(['different-not-lesser', 'third-orientation']),
      );
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForSelector('.glossary-entry');
    // Direct main children rise from opacity 0; settle before screenshot.
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(OUT, 'mobile-partially-unlocked.png'), fullPage: true });
  });

  test('canonical slugs in source match the spec', async ({ page }) => {
    await page.goto('/glossary', { waitUntil: 'load' });
    const rendered = await page.$$eval('.glossary-entry', (els) =>
      els.map((el) => el.getAttribute('data-slug')),
    );
    expect(rendered).toEqual(SLUGS);
  });
});
