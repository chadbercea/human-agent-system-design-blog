import { test, expect } from '@playwright/test';

const VP = { width: 1440, height: 900 };

test.describe('verification pass', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VP);
  });

  test('Grid: 6 cards, horizontal row, uniform #111 thumb backgrounds, numbers straddle', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });

    await page.goto('/');
    await page.waitForSelector('.card');
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(6);

    // Horizontal track: all 6 cards share the same Y, sequential ascending X
    const boxes = await cards.evaluateAll((els) =>
      els.map((el) => (el as HTMLElement).getBoundingClientRect()).map((r) => ({ x: r.left, y: r.top, w: r.width, h: r.height }))
    );
    for (let i = 1; i < boxes.length; i++) {
      expect(boxes[i].y).toBeCloseTo(boxes[0].y, 0);
      expect(boxes[i].x).toBeGreaterThan(boxes[i - 1].x);
    }

    // Each card has a c1..c6 class for graphic selection
    for (let i = 1; i <= 6; i++) {
      await expect(page.locator(`.card.c${i}`)).toHaveCount(1);
    }

    // All 6 thumb backgrounds are uniform #111111 (per article-graphics prototype)
    const bgs = await page.evaluate(() =>
      Array.from({ length: 6 }, (_, i) => {
        const el = document.querySelector(`.card.c${i + 1} .thumb`);
        return el ? getComputedStyle(el as HTMLElement).backgroundColor : null;
      })
    );
    for (const bg of bgs) expect(bg).toBe('rgb(17, 17, 17)');

    // Numbers straddle top edge of graphic (num center ≈ graphic top)
    for (let i = 0; i < 6; i++) {
      const num = cards.nth(i).locator('.num');
      const graphic = cards.nth(i).locator('.graphic');
      const nb = await num.boundingBox();
      const gb = await graphic.boundingBox();
      if (!nb || !gb) throw new Error('missing box');
      const numCenter = nb.y + nb.height / 2;
      expect(Math.abs(numCenter - gb.y)).toBeLessThan(4);
    }

    // No inline onclick in DOM
    const inline = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[onclick]')).length
    );
    expect(inline).toBe(0);

    expect(errors).toEqual([]);
  });

  test('Grid hover: non-hovered push 10px away + dim 45%; mouseleave resets', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    const first = page.locator('.card').nth(0);
    const second = page.locator('.card').nth(1);
    await first.hover();
    // Wait for transform to settle
    await page.waitForTimeout(360);
    const res = await second.evaluate((el) => {
      const s = getComputedStyle(el as HTMLElement);
      return { opacity: s.opacity, transform: s.transform };
    });
    expect(parseFloat(res.opacity)).toBeCloseTo(0.45, 1);
    // parse translate magnitude
    const m = res.transform.match(/matrix\(([^)]+)\)/);
    if (!m) throw new Error('no transform matrix');
    const parts = m[1].split(',').map((n) => parseFloat(n));
    const tx = parts[4], ty = parts[5];
    const mag = Math.sqrt(tx * tx + ty * ty);
    expect(mag).toBeGreaterThan(8);
    expect(mag).toBeLessThan(12);

    // Mouseleave resets
    await page.mouse.move(0, 0);
    await page.waitForTimeout(360);
    const reset = await second.evaluate((el) => {
      const s = getComputedStyle(el as HTMLElement);
      return { opacity: s.opacity, transform: s.transform };
    });
    expect(parseFloat(reset.opacity)).toBeCloseTo(1, 1);
    // transform should be identity or near zero
    const m2 = reset.transform.match(/matrix\(([^)]+)\)/);
    if (m2) {
      const p2 = m2[1].split(',').map((n) => parseFloat(n));
      expect(Math.abs(p2[4])).toBeLessThan(0.5);
      expect(Math.abs(p2[5])).toBeLessThan(0.5);
    }
  });

  test('Card click: other cards exit off-screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    await page.locator('.card').nth(0).click();
    await page.waitForTimeout(800);
    const others = await page.locator('.card').evaluateAll((els) =>
      els.slice(1).map((el) => ({
        opacity: parseFloat(getComputedStyle(el as HTMLElement).opacity),
      }))
    );
    for (const o of others) expect(o.opacity).toBeLessThan(0.1);
  });

  test('Article view: FLIP, portrait header, sidebar, body, next/prev', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });

    await page.goto('/');
    await page.waitForSelector('.card');
    await page.locator('.card').nth(2).click(); // middle article to get both prev + next
    await page.waitForTimeout(900);
    await expect(page.locator('#article-view')).toHaveClass(/visible/);

    // Portrait header image 9:16
    const hb = await page.locator('.article-header-img').boundingBox();
    expect(hb).toBeTruthy();
    if (hb) {
      const ratio = hb.width / hb.height;
      expect(ratio).toBeGreaterThan(9 / 16 - 0.05);
      expect(ratio).toBeLessThan(9 / 16 + 0.05);
    }

    // header image is left of meta block
    const imgB = await page.locator('.article-header-img').boundingBox();
    const metaB = await page.locator('.article-meta-block').boundingBox();
    expect(imgB!.x).toBeLessThan(metaB!.x);

    // sidebar visible with items
    await expect(page.locator('#article-view')).toHaveClass(/sidebar-in/);
    const sidebarItems = page.locator('.sidebar-item');
    await expect(sidebarItems).toHaveCount(6);
    // at least one visible
    await expect(sidebarItems.first()).toHaveClass(/visible/);

    // back button present
    await expect(page.locator('#back-btn')).toBeVisible();

    // body has content
    const bodyTxt = await page.locator('#article-body').textContent();
    expect((bodyTxt || '').length).toBeGreaterThan(50);

    // footer prev + next (middle article)
    await expect(page.locator('.article-nav-item.prev')).toHaveCount(1);
    await expect(page.locator('.article-nav-item.next')).toHaveCount(1);

    expect(errors).toEqual([]);
  });

  test('First article has no Previous; last has no Next', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    // first = index 0 (newest)
    await page.locator('.card').nth(0).click();
    await page.waitForTimeout(900);
    await expect(page.locator('.article-nav-item.prev')).toHaveCount(0);
    await expect(page.locator('.article-nav-item.next')).toHaveCount(1);

    // Go to last (oldest) — click the last sidebar item
    await page.locator('.sidebar-item').last().click();
    await page.waitForTimeout(500);
    await expect(page.locator('.article-nav-item.prev')).toHaveCount(1);
    await expect(page.locator('.article-nav-item.next')).toHaveCount(0);
  });

  test('Next/prev click switches in place', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    await page.locator('.card').nth(2).click();
    await page.waitForTimeout(900);
    const title1 = await page.locator('#art-title').textContent();
    await page.locator('.article-nav-item.next').click();
    await page.waitForTimeout(550);
    const title2 = await page.locator('#art-title').textContent();
    expect(title2).not.toBe(title1);
    await expect(page.locator('#article-view')).toHaveClass(/visible/);
  });

  test('Back button, Articles link, brand all return to grid with animation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    // Via back button
    await page.locator('.card').nth(0).click();
    await page.waitForTimeout(900);
    await page.locator('#back-btn').click();
    await page.waitForTimeout(1200);
    await expect(page.locator('#article-view')).not.toHaveClass(/visible/);
    await expect(page.locator('#grid-view')).not.toHaveClass(/hidden/);
    await expect(page.locator('#hn-articles')).toHaveClass(/on/);

    // Via Articles nav
    await page.locator('.card').nth(0).click();
    await page.waitForTimeout(900);
    await page.locator('#hn-articles').click();
    await page.waitForTimeout(1200);
    await expect(page.locator('#article-view')).not.toHaveClass(/visible/);

    // Via brand
    await page.locator('.card').nth(0).click();
    await page.waitForTimeout(900);
    await page.locator('#brandBtn').click();
    await page.waitForTimeout(1200);
    await expect(page.locator('#article-view')).not.toHaveClass(/visible/);
  });

  test('About view: opens, fields stagger, closes', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    await page.locator('#hn-about').click();
    await page.waitForTimeout(900);
    await expect(page.locator('#about-view')).toHaveClass(/visible/);
    await expect(page.locator('#about-view .meta-field')).toHaveCount(6);
    // fields should be `.in`
    const inCount = await page.locator('#about-view .meta-field.in').count();
    expect(inCount).toBe(6);
    // title + bio
    await expect(page.locator('#about-view .meta-title')).toBeVisible();
    await expect(page.locator('#about-view .meta-bio')).toBeVisible();

    // From about → contact
    await page.locator('#hn-contact').click();
    await page.waitForTimeout(900);
    await expect(page.locator('#about-view')).not.toHaveClass(/visible/);
    await expect(page.locator('#contact-view')).toHaveClass(/visible/);

    // From contact → about
    await page.locator('#hn-about').click();
    await page.waitForTimeout(900);
    await expect(page.locator('#about-view')).toHaveClass(/visible/);

    // Close about via Articles
    await page.locator('#hn-articles').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('#about-view')).not.toHaveClass(/visible/);
    await expect(page.locator('#hn-articles')).toHaveClass(/on/);
  });

  test('Contact view: 2-col, Tue/Thu slots, slot selection, gcal URL', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    await page.locator('#hn-contact').click();
    await page.waitForTimeout(900);
    await expect(page.locator('#contact-view')).toHaveClass(/visible/);

    const cols = page.locator('#contact-view .contact-col');
    await expect(cols).toHaveCount(2);
    const colBoxes = await cols.evaluateAll((els) =>
      els.map((el) => (el as HTMLElement).getBoundingClientRect())
    );
    expect(colBoxes[0].top).toBeCloseTo(colBoxes[1].top, 0);
    expect(colBoxes[0].left).toBeLessThan(colBoxes[1].left);
    // both in
    const inCols = await page.locator('#contact-view .contact-col.in').count();
    expect(inCols).toBe(2);

    // Slots exist and are Tue/Thu
    const slotLabels = await page.locator('.slot-label').allTextContents();
    expect(slotLabels.length).toBeGreaterThan(0);
    for (const l of slotLabels) {
      expect(l.slice(0, 3)).toMatch(/Tue|Thu/);
    }

    // Slot selection
    await page.locator('.sched-slot').nth(0).click();
    await expect(page.locator('.sched-slot').nth(0)).toHaveClass(/selected/);

    // Book URL built correctly (intercept window.open)
    await page.evaluate(() => {
      (window as any).__opened = null;
      (window as any).open = (url: string) => { (window as any).__opened = url; return null; };
    });
    await page.fill('#sched-email', 'invitee@example.com');
    await page.locator('#cf-book').click();
    const opened = await page.evaluate(() => (window as any).__opened);
    expect(opened).toContain('calendar.google.com');
    expect(opened).toContain('invitee%40example.com');
    expect(opened).toContain('action=TEMPLATE');
    expect(opened).toContain('dates=');
  });

  test('Contact mailto form', async ({ page }) => {
    // Capture mailto by listening for external-protocol navigation via CDP.
    const client = await page.context().newCDPSession(page);
    const opened: string[] = [];
    await client.send('Page.enable');
    client.on('Page.frameRequestedNavigation', (e) => {
      if (e.url && e.url.startsWith('mailto:')) opened.push(e.url);
    });
    client.on('Page.navigatedWithinDocument' as any, (e: any) => {
      if (e.url && e.url.startsWith('mailto:')) opened.push(e.url);
    });

    await page.goto('/');
    await page.waitForSelector('.card');
    await page.locator('#hn-contact').click();
    await page.waitForTimeout(900);

    await page.fill('#cf-subject', 'Hi there');
    await page.fill('#cf-message', 'Hello body');
    await page.fill('#cf-reply', 'reply@example.com');
    await page.locator('#cf-submit').click();
    await page.waitForTimeout(400);

    // success state always appears when handler runs
    await expect(page.locator('#cf-success')).toHaveClass(/in/);

    // URL assertion: verify we captured at least one mailto URL with correct fields
    expect(opened.length).toBeGreaterThan(0);
    const mt = opened[0];
    expect(mt).toContain('mailto:chad@hasdesign.io');
    expect(mt).toContain('subject=Hi%20there');
    expect(mt).toContain('reply%40example.com');
  });

  test('About: opens from grid, article, contact', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    // From grid
    await page.locator('#hn-about').click();
    await page.waitForTimeout(800);
    await expect(page.locator('#about-view')).toHaveClass(/visible/);

    await page.locator('#hn-articles').click();
    await page.waitForTimeout(1000);
    await page.locator('.card').nth(0).click();
    await page.waitForTimeout(900);
    // From article
    await page.locator('#hn-about').click();
    await page.waitForTimeout(900);
    await expect(page.locator('#about-view')).toHaveClass(/visible/);
    await expect(page.locator('#article-view')).not.toHaveClass(/visible/);

    // From contact to about
    await page.locator('#hn-contact').click();
    await page.waitForTimeout(800);
    await page.locator('#hn-about').click();
    await page.waitForTimeout(800);
    await expect(page.locator('#about-view')).toHaveClass(/visible/);
  });

  test('No stuck busy state — rapid nav does not freeze', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');
    // Walk through everything
    await page.locator('#hn-about').click();
    await page.waitForTimeout(800);
    await page.locator('#hn-contact').click();
    await page.waitForTimeout(800);
    await page.locator('#hn-articles').click();
    await page.waitForTimeout(1000);
    await page.locator('.card').nth(0).click();
    await page.waitForTimeout(900);
    await page.locator('#back-btn').click();
    await page.waitForTimeout(1200);
    // Should respond
    await expect(page.locator('.card').nth(0)).toBeVisible();
    const opac = await page.locator('.card').nth(1).evaluate((el) => getComputedStyle(el).opacity);
    expect(parseFloat(opac)).toBeCloseTo(1, 1);
  });
});
