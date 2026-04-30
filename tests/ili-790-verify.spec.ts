import { test, expect } from '@playwright/test';

const ROOT = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4321';

test.describe('ILI-790 — hero v3 gray boot, CTA, /blog defaults to latest', () => {
  test('index hero — H1 white, eyebrow / dek / audience / signal-strip gray', async ({ page }) => {
    await page.goto(`${ROOT}/`);
    await page.evaluate(() => sessionStorage.setItem('has_index_booted', '1'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    const h1Color = await page.locator('.frame-h1').evaluate((el) =>
      getComputedStyle(el).color
    );
    expect(h1Color).toBe('rgb(255, 255, 255)');

    const eyebrowColor = await page.locator('.frame-eyebrow').evaluate((el) =>
      getComputedStyle(el).color
    );
    expect(eyebrowColor).toBe('rgb(136, 136, 136)');

    const dekColor = await page.locator('.frame-dek').evaluate((el) =>
      getComputedStyle(el).color
    );
    expect(dekColor).toBe('rgb(136, 136, 136)');

    const audienceColor = await page.locator('.frame-audience').evaluate((el) =>
      getComputedStyle(el).color
    );
    expect(audienceColor).toBe('rgb(136, 136, 136)');

    const signalColor = await page.locator('.signal-strip').evaluate((el) =>
      getComputedStyle(el).color
    );
    expect(signalColor).toBe('rgb(136, 136, 136)');

    await page.screenshot({
      path: 'verification-screenshots/ili-790-index-hero.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    });
  });

  test('CTA — solid white fill, black text, routes to /blog', async ({ page }) => {
    await page.goto(`${ROOT}/`);
    await page.evaluate(() => sessionStorage.setItem('has_index_booted', '1'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    const cta = page.locator('.frame-cta').first();
    await expect(cta).toBeVisible();

    const bg = await cta.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(255, 255, 255)');

    const color = await cta.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(0, 0, 0)');

    const href = await cta.getAttribute('href');
    expect(href).toBe('/blog');
  });

  test('CTA hover — both arrow and sweep loops fire at 1.4s', async ({ page }) => {
    await page.goto(`${ROOT}/`);
    await page.evaluate(() => sessionStorage.setItem('has_index_booted', '1'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('.frame-cta').first().hover();

    const arrowAnim = await page.locator('.frame-cta-arrow').evaluate((el) => {
      const cs = getComputedStyle(el);
      return { name: cs.animationName, duration: cs.animationDuration, timing: cs.animationTimingFunction };
    });
    expect(arrowAnim.name).toBe('frame-cta-arrow');
    expect(arrowAnim.duration).toBe('1.4s');
    expect(arrowAnim.timing).toBe('ease-in-out');

    const sweepAnim = await page.locator('.frame-cta').first().evaluate((el) => {
      const cs = getComputedStyle(el, '::after');
      return { name: cs.animationName, duration: cs.animationDuration, timing: cs.animationTimingFunction, opacity: cs.opacity };
    });
    expect(sweepAnim.name).toBe('frame-cta-sweep');
    expect(sweepAnim.duration).toBe('1.4s');
    expect(sweepAnim.timing).toBe('linear');
    expect(sweepAnim.opacity).toBe('1');

    await page.screenshot({
      path: 'verification-screenshots/ili-790-cta-hover.png',
      fullPage: false,
      clip: { x: 0, y: 400, width: 1280, height: 400 },
    });
  });

  test('/blog renders article-selected with latest article', async ({ page }) => {
    await page.goto(`${ROOT}/blog/`);
    await page.waitForLoadState('networkidle');

    const stageClass = await page.locator('#stage').getAttribute('class');
    expect(stageClass).toContain('open');

    const defaultIdx = await page.locator('#stage').getAttribute('data-default-open-idx');
    expect(defaultIdx).toBe('0');

    await expect(page.locator('#art-h1')).toHaveText("We're Assuming the System");

    const activeCard = await page.locator('.post-card.active').count();
    expect(activeCard).toBe(1);

    const bodyHasArticleOpen = await page.evaluate(() =>
      document.body.classList.contains('article-open')
    );
    expect(bodyHasArticleOpen).toBe(true);

    await page.screenshot({
      path: 'verification-screenshots/ili-790-blog-default-open.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    });
  });

  test('header Articles link routes to /blog', async ({ page }) => {
    await page.goto(`${ROOT}/about/`);
    await page.waitForLoadState('networkidle');

    const articlesHref = await page.locator('header.site-header a', { hasText: 'Articles' }).first().getAttribute('href');
    expect(articlesHref).toBe('/blog');
  });
});
