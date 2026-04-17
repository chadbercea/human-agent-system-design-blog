import { test, expect } from '@playwright/test';

const VP = { width: 1440, height: 900 };
const PUSH = 10;

function parseTranslate(transform: string): { x: number; y: number } {
  if (!transform || transform === 'none') return { x: 0, y: 0 };
  const m = transform.match(/matrix\(([^)]+)\)/);
  if (!m) return { x: 0, y: 0 };
  const parts = m[1].split(',').map((n) => parseFloat(n));
  return { x: parts[4], y: parts[5] };
}

test.describe('hover repulsion in horizontal track', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VP);
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.textContent = 'astro-dev-toolbar{display:none!important;pointer-events:none!important}';
      document.documentElement.appendChild(style);
    });
  });

  test('hover card 0 pushes other visible cards ~10px omnidirectionally', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    const source = page.locator('.card').nth(0);
    await source.hover();
    await page.waitForTimeout(500);

    const sourceT = parseTranslate(
      await source.evaluate((el) => getComputedStyle(el as HTMLElement).transform)
    );
    expect(Math.abs(sourceT.x)).toBeLessThan(0.5);
    expect(Math.abs(sourceT.y)).toBeLessThan(0.5);

    const others = page.locator('.card.repelled');
    const repelledCount = await others.count();
    expect(repelledCount).toBeGreaterThan(0);

    for (let i = 0; i < repelledCount; i++) {
      const t = parseTranslate(
        await others.nth(i).evaluate((el) => getComputedStyle(el as HTMLElement).transform)
      );
      const mag = Math.sqrt(t.x * t.x + t.y * t.y);
      expect(mag).toBeGreaterThan(PUSH - 1);
      expect(mag).toBeLessThan(PUSH + 1);
      const opacity = await others.nth(i).evaluate((el) => getComputedStyle(el as HTMLElement).opacity);
      expect(parseFloat(opacity)).toBeCloseTo(0.45, 1);
    }
  });

  test('mouseleave resets all cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    const source = page.locator('.card').nth(1);
    await source.hover();
    await page.waitForTimeout(300);
    await page.mouse.move(10, 10);
    await page.waitForTimeout(600);

    const count = await page.locator('.card').count();
    for (let i = 0; i < count; i++) {
      const card = page.locator('.card').nth(i);
      const t = parseTranslate(
        await card.evaluate((el) => getComputedStyle(el as HTMLElement).transform)
      );
      expect(Math.abs(t.x)).toBeLessThan(0.5);
      expect(Math.abs(t.y)).toBeLessThan(0.5);
      await expect(card).not.toHaveClass(/repelled/);
    }
  });

  test('repulsion does not fire during drag', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    const box = await page.locator('.card').nth(0).boundingBox();
    if (!box) throw new Error('no card box');
    const startX = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(startX, y);
    await page.mouse.down();
    // mid-drag, move over card 1
    const c1 = await page.locator('.card').nth(1).boundingBox();
    if (!c1) throw new Error('no card 1');
    await page.mouse.move(c1.x + c1.width / 2, c1.y + c1.height / 2, { steps: 5 });
    // No cards should have .repelled while dragging
    const repelledDuringDrag = await page.locator('.card.repelled').count();
    expect(repelledDuringDrag).toBe(0);
    await page.mouse.up();
  });

  test('horizontal layout: repulsion vectors are primarily horizontal for neighbors on the same row', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    const source = page.locator('.card').nth(0);
    await source.hover();
    await page.waitForTimeout(500);

    // Card 1 is the immediate right neighbor — should translate +x
    const neighbor = page.locator('.card').nth(1);
    const t = parseTranslate(
      await neighbor.evaluate((el) => getComputedStyle(el as HTMLElement).transform)
    );
    expect(t.x).toBeGreaterThan(PUSH - 1);
    expect(Math.abs(t.y)).toBeLessThan(1);
  });
});
