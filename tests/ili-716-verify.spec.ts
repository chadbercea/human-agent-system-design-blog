import { test, expect } from '@playwright/test';

const PORT = process.env.PORT || 4321;
const BASE = `http://localhost:${PORT}`;

const pages = [
  { path: '/', name: 'homepage' },
  { path: '/about/', name: 'about' },
  { path: '/contact/', name: 'contact' },
  { path: '/design-system/', name: 'design-system' },
];

for (const { path, name } of pages) {
  test(`${name} — desktop typography`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}${path}`);
    // Let web fonts settle so screenshots render with Lato/JetBrains Mono.
    await page.evaluate(() => (document as any).fonts?.ready);
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `verification-screenshots/ili-716-${name}-desktop.png`,
      fullPage: true,
    });

    const bodyFont = await page.evaluate(
      () => getComputedStyle(document.body).fontFamily,
    );
    expect(bodyFont.toLowerCase()).toContain('lato');
    expect(bodyFont.toLowerCase()).not.toContain('source serif');
    expect(bodyFont.toLowerCase()).not.toContain('montserrat');
  });

  test(`${name} — mobile typography`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}${path}`);
    await page.evaluate(() => (document as any).fonts?.ready);
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `verification-screenshots/ili-716-${name}-mobile.png`,
      fullPage: true,
    });
  });
}
