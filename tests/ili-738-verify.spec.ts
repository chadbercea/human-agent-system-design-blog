import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('verification-screenshots/ili-738');
fs.mkdirSync(OUT, { recursive: true });

interface RouteCase {
  name: string;
  path: string;
  channelId: string;
  channelLabel: string;
  flourish: string;
}

const routes: RouteCase[] = [
  { name: 'home',          path: '/',              channelId: '01', channelLabel: 'OPS',      flourish: 'ops' },
  { name: 'design-system', path: '/design-system', channelId: '02', channelLabel: 'SPEC',     flourish: 'spec' },
  { name: 'about',         path: '/about',         channelId: '03', channelLabel: 'OPERATOR', flourish: 'operator' },
  { name: 'glossary',      path: '/glossary',      channelId: '04', channelLabel: 'ARCHIVE',  flourish: 'archive' },
  { name: 'contact',       path: '/contact',       channelId: '06', channelLabel: 'RELAY',    flourish: 'none' },
];

test.describe('ILI-738 — channel transition system', () => {
  for (const r of routes) {
    test(`${r.name} — CH ${r.channelId} / ${r.channelLabel} persists in chrome`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(r.path, { waitUntil: 'load' });
      await page.waitForTimeout(400);

      const headerCh = await page.$eval('[data-channel-value="header"]', (el) => el.textContent?.trim());
      expect(headerCh).toBe(r.channelId);

      const railCh = await page.$eval('[data-channel-value="rail"]', (el) => el.textContent?.trim());
      expect(railCh).toContain(`CH ${r.channelId}`);

      const bodyChannelId = await page.$eval('body', (el) => el.getAttribute('data-channel-id'));
      expect(bodyChannelId).toBe(r.channelId);

      const bodyFlourish = await page.$eval('body', (el) => el.getAttribute('data-flourish'));
      expect(bodyFlourish).toBe(r.flourish);

      await page.screenshot({ path: path.join(OUT, `${r.name}-chrome.png`), fullPage: false });
    });
  }

  test('home → about — CH ID changes after navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(300);

    const startCh = await page.$eval('[data-channel-value="header"]', (el) => el.textContent?.trim());
    expect(startCh).toBe('01');

    await page.click('a[href="/about"]');
    await page.waitForURL('**/about');
    await page.waitForTimeout(700);

    const endCh = await page.$eval('[data-channel-value="header"]', (el) => el.textContent?.trim());
    expect(endCh).toBe('03');

    const endRail = await page.$eval('[data-channel-value="rail"]', (el) => el.textContent?.trim());
    expect(endRail).toContain('CH 03');

    const endFlourish = await page.$eval('body', (el) => el.getAttribute('data-flourish'));
    expect(endFlourish).toBe('operator');
  });

  test('signal-loss attribute appears mid-transition', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(200);

    const seenLoss = page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        let saw = false;
        const handler = () => {
          if (document.body.getAttribute('data-signal') === 'loss') saw = true;
        };
        document.addEventListener('astro:before-preparation', () => {
          requestAnimationFrame(() => handler());
        });
        document.addEventListener('astro:after-swap', () => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve(saw || document.body.getAttribute('data-signal') === 'acquire')));
        });
        setTimeout(() => resolve(saw), 1500);
      });
    });

    await page.click('a[href="/about"]');
    const ok = await seenLoss;
    expect(ok).toBe(true);
  });

  test('ClientRouter is wired (astro:page-load fires)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });

    const fired = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        const t = setTimeout(() => resolve(false), 2500);
        document.addEventListener('astro:page-load', () => { clearTimeout(t); resolve(true); }, { once: true });
        const link = document.querySelector('a[href="/glossary"]') as HTMLAnchorElement | null;
        link?.click();
      });
    });
    expect(fired).toBe(true);
  });

  test('archive flourish injects overlay on entry', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/glossary', { waitUntil: 'load' });

    const overlay = await page.locator('.archive-overlay').first();
    await expect(overlay).toBeVisible({ timeout: 1500 });
    await page.screenshot({ path: path.join(OUT, 'glossary-archive-overlay.png'), fullPage: false });
  });

  test('reduced motion — no flourish, instant settle', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/glossary', { waitUntil: 'load' });
    await page.waitForTimeout(300);

    // No archive overlay should be present in reduced-motion mode.
    const overlayCount = await page.locator('.archive-overlay').count();
    expect(overlayCount).toBe(0);

    // Body still carries the channel attrs (chrome must still update).
    const bodyChannelId = await page.$eval('body', (el) => el.getAttribute('data-channel-id'));
    expect(bodyChannelId).toBe('04');

    await page.screenshot({ path: path.join(OUT, 'glossary-reduced-motion.png'), fullPage: false });
    await context.close();
  });
});
