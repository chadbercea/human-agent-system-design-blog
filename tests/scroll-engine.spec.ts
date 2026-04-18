import { test, expect } from '@playwright/test';

const VP = { width: 1440, height: 900 };
const CARD_GAP = 32;

function tx(transform: string): number {
  const m = transform.match(/matrix\(([^)]+)\)/);
  if (!m) return 0;
  const parts = m[1].split(',').map((n) => parseFloat(n));
  return parts[4];
}

async function getStep(page): Promise<number> {
  const w = await page.locator('.card').first().evaluate((el: HTMLElement) => el.offsetWidth);
  return w + CARD_GAP;
}

async function activeIndex(page): Promise<number> {
  const v = await page.locator('#track').getAttribute('data-active-index');
  return v == null ? -1 : parseInt(v, 10);
}

test.describe('scroll engine', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VP);
  });

  test('six cards rendered, first is active', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    await expect(page.locator('.card')).toHaveCount(6);
    expect(await activeIndex(page)).toBe(0);
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
    const STEP = await getStep(page);
    await page.locator('#btn-next').click();
    await page.waitForTimeout(650);
    const t = await page.locator('#track').evaluate((el) => getComputedStyle(el as HTMLElement).transform);
    expect(Math.round(tx(t))).toBe(-STEP);
    expect(await activeIndex(page)).toBe(1);
  });

  test('next to last, next disabled; prev works back', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    for (let i = 0; i < 5; i++) {
      await page.locator('#btn-next').click();
      await page.waitForTimeout(620);
    }
    await expect(page.locator('#btn-next')).toBeDisabled();
    expect(await activeIndex(page)).toBe(5);
    await page.locator('#btn-prev').click();
    await page.waitForTimeout(620);
    await expect(page.locator('#btn-next')).toBeEnabled();
    expect(await activeIndex(page)).toBe(4);
  });

  test('ArrowRight and ArrowLeft navigate', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(700);
    expect(await activeIndex(page)).toBe(1);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(700);
    expect(await activeIndex(page)).toBe(2);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(700);
    expect(await activeIndex(page)).toBe(1);
  });

  test('mouse drag snaps to nearest card', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    const STEP = await getStep(page);
    const trackBox = await page.locator('#track').boundingBox();
    if (!trackBox) throw new Error('no track box');
    const startX = trackBox.x + 200;
    const y = trackBox.y + 300;
    const drag = STEP;
    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(startX - drag / 2, y, { steps: 5 });
    await page.mouse.move(startX - drag, y, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(650);
    const t = await page.locator('#track').evaluate((el) => getComputedStyle(el as HTMLElement).transform);
    expect(Math.round(tx(t))).toBe(-STEP);
    expect(await activeIndex(page)).toBe(1);
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
    const STEP = await getStep(page);
    await page.locator('#track-wrap').hover();
    await page.mouse.wheel(300, 0);
    await page.waitForTimeout(250);
    await page.waitForTimeout(650);
    const t = await page.locator('#track').evaluate((el) => getComputedStyle(el as HTMLElement).transform);
    expect(Math.round(tx(t))).toBeLessThanOrEqual(-STEP + 2);
    expect(await activeIndex(page)).toBeGreaterThanOrEqual(1);
  });

  test('track still uses cursor grab style', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#track');
    const cursor = await page.locator('#track').evaluate((el) => getComputedStyle(el as HTMLElement).cursor);
    expect(cursor).toBe('grab');
  });
});
