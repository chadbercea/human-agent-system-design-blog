import { test, expect } from '@playwright/test';

const VP = { width: 1440, height: 900 };
const STEP = 260 + 32; // CARD_W + CARD_GAP

function tx(transform: string): number {
  const m = transform.match(/matrix\(([^)]+)\)/);
  if (!m) return 0;
  const parts = m[1].split(',').map((n) => parseFloat(n));
  return parts[4];
}

test.describe('scroll engine', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VP);
  });

  test('dots are rendered, one per article, first is active', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    const dots = page.locator('#dots .dot');
    await expect(dots).toHaveCount(6);
    await expect(dots.nth(0)).toHaveClass(/on/);
  });

  test('prev button disabled at start, next enabled', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    await expect(page.locator('#btn-prev')).toBeDisabled();
    await expect(page.locator('#btn-next')).toBeEnabled();
  });

  test('next button advances index and translates track by -STEP', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    await page.locator('#btn-next').click();
    await page.waitForTimeout(650);
    const t = await page.locator('#track').evaluate((el) => getComputedStyle(el as HTMLElement).transform);
    expect(Math.round(tx(t))).toBe(-STEP);
    await expect(page.locator('#dots .dot').nth(1)).toHaveClass(/on/);
  });

  test('next to last, next disabled; prev works back', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    for (let i = 0; i < 5; i++) {
      await page.locator('#btn-next').click();
      await page.waitForTimeout(620);
    }
    await expect(page.locator('#btn-next')).toBeDisabled();
    await expect(page.locator('#dots .dot').nth(5)).toHaveClass(/on/);
    await page.locator('#btn-prev').click();
    await page.waitForTimeout(620);
    await expect(page.locator('#btn-next')).toBeEnabled();
    await expect(page.locator('#dots .dot').nth(4)).toHaveClass(/on/);
  });

  test('dot click jumps directly to that index', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    await page.locator('#dots .dot').nth(3).click({ force: true });
    await page.waitForTimeout(650);
    await expect(page.locator('#dots .dot').nth(3)).toHaveClass(/on/);
    const t = await page.locator('#track').evaluate((el) => getComputedStyle(el as HTMLElement).transform);
    // Track moved negatively (may clamp at maxOffset on wide viewports — logical index is the source of truth)
    expect(tx(t)).toBeLessThan(0);
  });

  test('ArrowRight and ArrowLeft navigate', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(700);
    await expect(page.locator('#dots .dot').nth(1)).toHaveClass(/on/);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(700);
    await expect(page.locator('#dots .dot').nth(2)).toHaveClass(/on/);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(700);
    await expect(page.locator('#dots .dot').nth(1)).toHaveClass(/on/);
  });

  test('mouse drag snaps to nearest card', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    const trackBox = await page.locator('#track').boundingBox();
    if (!trackBox) throw new Error('no track box');
    const startX = trackBox.x + 200;
    const y = trackBox.y + 300;
    // Drag leftward by ~200px (more than half a step → snap to index 1)
    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(startX - 100, y, { steps: 5 });
    await page.mouse.move(startX - 200, y, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(650);
    const t = await page.locator('#track').evaluate((el) => getComputedStyle(el as HTMLElement).transform);
    expect(Math.round(tx(t))).toBe(-STEP);
    await expect(page.locator('#dots .dot').nth(1)).toHaveClass(/on/);
  });

  test('drag does not open article (drag threshold guards click)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    const card = await page.locator('.card').nth(0).boundingBox();
    if (!card) throw new Error('no card box');
    const startX = card.x + card.width / 2;
    const y = card.y + card.height / 2;
    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(startX - 100, y, { steps: 5 });
    await page.mouse.move(startX - 200, y, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(700);
    await expect(page.locator('#article-view')).not.toHaveClass(/visible/);
  });

  test('wheel scroll debounces and snaps', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    // Emit wheel events on the track-wrap
    await page.locator('#track-wrap').hover();
    await page.mouse.wheel(300, 0);
    await page.waitForTimeout(250);
    await page.waitForTimeout(650);
    const t = await page.locator('#track').evaluate((el) => getComputedStyle(el as HTMLElement).transform);
    // Should have snapped to at least index 1
    expect(Math.round(tx(t))).toBeLessThanOrEqual(-STEP + 2);
    const activeDots = await page.locator('#dots .dot.on').count();
    expect(activeDots).toBe(1);
  });

  test('track still uses cursor grab style', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#track');
    const cursor = await page.locator('#track').evaluate((el) => getComputedStyle(el as HTMLElement).cursor);
    expect(cursor).toBe('grab');
  });
});
