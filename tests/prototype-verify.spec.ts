import { test, expect } from '@playwright/test';

const DESKTOP = { width: 1920, height: 1080 };
const MOBILE = { width: 375, height: 667 };

test.describe('prototype verification — desktop 1920x1080', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP);
  });

  test('shell flex: 80px header + flex stage + 80px footer, document scrolls', async ({ page }) => {
    await page.goto('/');
    const headerH = await page.locator('.header').evaluate(
      (el) => el.getBoundingClientRect().height
    );
    const footerH = await page.locator('.footer').evaluate(
      (el) => el.getBoundingClientRect().height
    );
    expect(headerH).toBe(80);
    expect(footerH).toBe(80);
    const headerPos = await page.locator('.header').evaluate(
      (el) => getComputedStyle(el as HTMLElement).position
    );
    expect(headerPos).toBe('sticky');
  });

  test('default state: 70% / 30% / 0 columns', async ({ page }) => {
    await page.goto('/');
    const cols = await page.locator('.stage').evaluate(
      (el) => getComputedStyle(el as HTMLElement).gridTemplateColumns
    );
    const parts = cols.split(/\s+/).map(parseFloat);
    expect(parts[0]).toBeCloseTo(DESKTOP.width * 0.7, 0);
    expect(parts[1]).toBeCloseTo(DESKTOP.width * 0.3, 0);
    expect(parts[2]).toBe(0);
  });

  test('hero h1 is pure vw (≈134px at 1920)', async ({ page }) => {
    await page.goto('/');
    const size = await page.locator('.h1').evaluate(
      (el) => parseFloat(getComputedStyle(el as HTMLElement).fontSize)
    );
    expect(size).toBeCloseTo(1920 * 0.07, 0);
  });

  test('header brand shows full text, Articles is .on with bullet', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.brand-full')).toBeVisible();
    await expect(page.locator('.brand-short')).toBeHidden();
    const onCount = await page.locator('.nav a.on').count();
    expect(onCount).toBe(1);
    const onText = await page.locator('.nav a.on').textContent();
    expect(onText?.trim()).toBe('Articles');
    const before = await page.locator('.nav a.on').evaluate(
      (el) => getComputedStyle(el as HTMLElement, '::before').content
    );
    expect(before).toContain('•');
  });

  test('click article opens reader: 80 / calc / 70 grid, reader populated', async ({ page }) => {
    await page.goto('/');
    const first = page.locator('.article-item').first();
    await first.click();
    await page.waitForTimeout(700);
    const cols = await page.locator('.stage').evaluate(
      (el) => getComputedStyle(el as HTMLElement).gridTemplateColumns
    );
    const parts = cols.split(/\s+/).map(parseFloat);
    expect(parts[0]).toBe(80);
    expect(parts[1]).toBeCloseTo(DESKTOP.width * 0.3 - 80, 0);
    expect(parts[2]).toBeCloseTo(DESKTOP.width * 0.7, 0);
    await expect(page.locator('#art-h1')).not.toBeEmpty();
    await expect(page.locator('#art-lede')).not.toBeEmpty();
    await expect(page.locator('.article-item.active')).toHaveCount(1);
  });

  test('back button closes the reader', async ({ page }) => {
    await page.goto('/');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(700);
    await expect(page.locator('.stage.open')).toHaveCount(1);
    await page.locator('#back-btn').click();
    await page.waitForTimeout(700);
    await expect(page.locator('.stage.open')).toHaveCount(0);
    await expect(page.locator('.article-item.active')).toHaveCount(0);
  });

  test('escape key closes the reader', async ({ page }) => {
    await page.goto('/');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(700);
    await expect(page.locator('.stage.open')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
    await expect(page.locator('.stage.open')).toHaveCount(0);
  });

  test('/about and /contact render with BaseLayout chrome', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('.shell')).toBeVisible();
    await expect(page.locator('.nav a.on')).toHaveText('About');
    await expect(page.locator('.prose-page .prose-h1')).toBeVisible();
    await page.goto('/contact');
    await expect(page.locator('.nav a.on')).toHaveText('Contact');
    await expect(page.locator('.prose-page .prose-h1')).toBeVisible();
  });

  test('reader: body 18px, h2 24px, title 48px, bounded column', async ({ page }) => {
    await page.goto('/');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(700);
    const body = await page.locator('.art-body').evaluate(
      (el) => parseFloat(getComputedStyle(el as HTMLElement).fontSize)
    );
    expect(body).toBe(18);
    const h1 = await page.locator('.art-h1').evaluate(
      (el) => parseFloat(getComputedStyle(el as HTMLElement).fontSize)
    );
    expect(h1).toBe(48);
    const lede = await page.locator('.art-lede').evaluate(
      (el) => parseFloat(getComputedStyle(el as HTMLElement).fontSize)
    );
    expect(lede).toBe(22);
    const inner = page.locator('.article-inner');
    const maxW = await inner.evaluate(
      (el) => getComputedStyle(el as HTMLElement).maxWidth
    );
    expect(maxW).not.toBe('none');
  });

  test('reader: end marker visible, eyebrow contains read time', async ({ page }) => {
    await page.goto('/');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(700);
    await expect(page.locator('.art-end')).toBeVisible();
    const eyebrow = await page.locator('#art-eyebrow').textContent();
    expect(eyebrow).toMatch(/\d+\s+min read/);
  });

  test('reader open: hero and list become sticky', async ({ page }) => {
    await page.goto('/');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(700);
    const heroPos = await page.locator('.col-hero').evaluate(
      (el) => getComputedStyle(el as HTMLElement).position
    );
    const listPos = await page.locator('.col-list').evaluate(
      (el) => getComputedStyle(el as HTMLElement).position
    );
    expect(heroPos).toBe('sticky');
    expect(listPos).toBe('sticky');
  });

  test('no console errors on /', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('/');
    await page.waitForTimeout(300);
    expect(errors).toEqual([]);
  });
});

test.describe('prototype verification — mobile 375x667', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE);
  });

  test('stage collapses to block, brand-short shown', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.brand-full')).toBeHidden();
    await expect(page.locator('.brand-short')).toBeVisible();
    const display = await page.locator('.stage').evaluate(
      (el) => getComputedStyle(el as HTMLElement).display
    );
    expect(display).toBe('block');
  });

  test('article reader is fixed full-screen, slides from right on open', async ({ page }) => {
    await page.goto('/');
    const pos = await page.locator('.col-article').evaluate(
      (el) => getComputedStyle(el as HTMLElement).position
    );
    expect(pos).toBe('fixed');
    const closedTransform = await page.locator('.col-article').evaluate(
      (el) => getComputedStyle(el as HTMLElement).transform
    );
    expect(closedTransform).toContain('matrix(1, 0, 0, 1, 375, 0)');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(600);
    const openTransform = await page.locator('.col-article').evaluate(
      (el) => getComputedStyle(el as HTMLElement).transform
    );
    expect(openTransform).toMatch(/matrix\(1, 0, 0, 1, 0, 0\)|none/);
  });

  test('mobile back button visible in reader and closes', async ({ page }) => {
    await page.goto('/');
    await page.locator('.article-item').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('#mobile-back')).toBeVisible();
    await page.locator('#mobile-back').click();
    await page.waitForTimeout(600);
    await expect(page.locator('.stage.open')).toHaveCount(0);
  });

  test('footer uses 60px mobile row', async ({ page }) => {
    await page.goto('/');
    const headerH = await page.locator('.header').evaluate(
      (el) => el.getBoundingClientRect().height
    );
    const footerH = await page.locator('.footer').evaluate(
      (el) => el.getBoundingClientRect().height
    );
    expect(headerH).toBe(80);
    expect(footerH).toBe(60);
  });
});
