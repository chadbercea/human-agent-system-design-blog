import { test, expect } from '@playwright/test';

const PORT = process.env.PORT || 4322;
const BASE = `http://localhost:${PORT}`;

const NO_ANIM = `*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; }`;

const NAV_LABELS = ['Articles', 'Design System', 'About', 'Contact'];

test('nav — every item uses the mono caps pattern', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`);
  await page.addStyleTag({ content: NO_ANIM });

  const links = page.locator('.site-header .nav a');
  await expect(links).toHaveCount(NAV_LABELS.length);

  for (const label of NAV_LABELS) {
    const link = links.filter({ hasText: label });
    await expect(link).toHaveCount(1);

    const styles = await link.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        letterSpacing: cs.letterSpacing,
        textTransform: cs.textTransform,
        paddingTop: cs.paddingTop,
        paddingBottom: cs.paddingBottom,
        borderBottomStyle: cs.borderBottomStyle,
        borderBottomWidth: cs.borderBottomWidth,
      };
    });

    expect(styles.fontFamily.toLowerCase()).toContain('jetbrains mono');
    expect(styles.fontSize).toBe('11px');
    expect(styles.fontWeight).toBe('500');
    // 0.3em of 11px = 3.3px
    expect(parseFloat(styles.letterSpacing)).toBeCloseTo(3.3, 1);
    expect(styles.textTransform).toBe('uppercase');
    expect(styles.paddingTop).toBe('6px');
    expect(styles.paddingBottom).toBe('6px');
    expect(styles.borderBottomStyle).toBe('solid');
    expect(styles.borderBottomWidth).toBe('1px');
  }
});

test('nav — active route has white underline, others are transparent', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/about`);
  await page.addStyleTag({ content: NO_ANIM });

  const active = page.locator('.site-header .nav a[aria-current="page"]');
  await expect(active).toHaveCount(1);
  await expect(active).toHaveText('About');

  const activeStyles = await active.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { color: cs.color, borderBottomColor: cs.borderBottomColor };
  });
  expect(activeStyles.color).toBe('rgb(255, 255, 255)');
  expect(activeStyles.borderBottomColor).toBe('rgb(255, 255, 255)');

  const inactive = page.locator('.site-header .nav a:not([aria-current="page"])').first();
  const inactiveStyles = await inactive.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { color: cs.color, borderBottomColor: cs.borderBottomColor };
  });
  // transparent resolves to rgba(0, 0, 0, 0) — alpha 0
  expect(inactiveStyles.borderBottomColor).toMatch(/rgba\(.+,\s*0\)|transparent/);
  expect(inactiveStyles.color).not.toBe('rgb(255, 255, 255)');
});

test('nav — Design System stays immediately left of About', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`);
  await page.addStyleTag({ content: NO_ANIM });

  const labels = await page.locator('.site-header .nav a').evaluateAll((els) =>
    els.map((el) => (el.textContent || '').trim())
  );
  const ds = labels.indexOf('Design System');
  const about = labels.indexOf('About');
  expect(ds).toBeGreaterThan(-1);
  expect(about).toBe(ds + 1);
});

test('nav — hover transitions color to white', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`);
  // keep transitions off so hover reads final state instantly
  await page.addStyleTag({ content: NO_ANIM });

  const contact = page.locator('.site-header .nav a', { hasText: 'Contact' });
  const before = await contact.evaluate((el) => getComputedStyle(el).color);
  expect(before).not.toBe('rgb(255, 255, 255)');

  await contact.hover();
  const after = await contact.evaluate((el) => getComputedStyle(el).color);
  expect(after).toBe('rgb(255, 255, 255)');
});

test('nav — keyboard focus renders a visible outline', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`);
  await page.addStyleTag({ content: NO_ANIM });

  const firstLink = page.locator('.site-header .nav a').first();
  await firstLink.focus();

  const focus = await firstLink.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor };
  });
  expect(focus.outlineStyle).not.toBe('none');
  expect(parseFloat(focus.outlineWidth)).toBeGreaterThan(0);
});

for (const [route, label, activeSlug] of [
  ['/', 'articles', 'articles'],
  ['/design-system', 'design-system', 'design-system'],
  ['/about', 'about', 'about'],
  ['/contact', 'contact', 'contact'],
] as const) {
  test(`nav — screenshot active=${activeSlug}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}${route}`);
    await page.addStyleTag({ content: NO_ANIM });
    const header = page.locator('.site-header');
    await expect(header).toBeVisible();
    await page.waitForTimeout(300);
    await header.screenshot({ path: `verification-screenshots/ili-720-nav-${activeSlug}.png` });
  });
}

test('nav — mobile preserves mono caps', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/`);
  await page.addStyleTag({ content: NO_ANIM });
  const link = page.locator('.site-header .nav a').first();
  const styles = await link.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { fontFamily: cs.fontFamily, textTransform: cs.textTransform };
  });
  expect(styles.fontFamily.toLowerCase()).toContain('jetbrains mono');
  expect(styles.textTransform).toBe('uppercase');
  await page.locator('.site-header').screenshot({ path: 'verification-screenshots/ili-720-nav-mobile.png' });
});
