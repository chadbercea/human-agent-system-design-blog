import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'screenshots', 'ili-771');
fs.mkdirSync(OUT, { recursive: true });

const BASE = process.env.E2E_BASE || 'http://localhost:4326';
const ARTICLE_TITLE = "We're Assuming the System";

async function openArticle(page) {
  await page.goto(BASE + '/');
  await page.getByText(ARTICLE_TITLE).first().click();
  await page.waitForTimeout(1500);
}

test.use({ baseURL: BASE });

test('ILI-771 — iframe re-fits when viewport resizes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/');
  await page.getByText(ARTICLE_TITLE).first().click();
  await page.waitForTimeout(1500);

  const iframeHandle = page.locator('#art-body .diag-embed iframe');
  await iframeHandle.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const before = await iframeHandle.boundingBox();
  if (!before) throw new Error('no box');

  // Resize down and verify the iframe height changes (mobile stacks taller).
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(1000);
  const after = await iframeHandle.boundingBox();
  if (!after) throw new Error('no box');

  // Mobile single-column will be substantially taller.
  expect(after.height).toBeGreaterThan(before.height + 100);
});

test.describe('ILI-771 — diagnostic iframe responsive (build + preview)', () => {
  for (const [w, h] of [[1920, 1080], [1440, 900], [900, 1100], [375, 812]] as const) {
    test(`${w}x${h} — iframe fits inner content (no clipping)`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await openArticle(page);

      const iframeHandle = page.locator('#art-body .diag-embed iframe');
      await iframeHandle.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500);

      const iframeBox = await iframeHandle.boundingBox();
      if (!iframeBox) throw new Error('no iframe box');

      const inner = await page.frameLocator('#art-body .diag-embed iframe').locator('body').evaluate(() => {
        return {
          docH: document.documentElement.getBoundingClientRect().height,
          bodyH: document.body.getBoundingClientRect().height,
          panelH: (document.querySelector('.diag-panel') as HTMLElement | null)?.getBoundingClientRect().height ?? 0,
          embedded: document.body.dataset.embedded || '',
          win: { w: window.innerWidth, h: window.innerHeight },
        };
      });

      // eslint-disable-next-line no-console
      console.log(`[${w}x${h}] iframe=${Math.round(iframeBox.width)}x${Math.round(iframeBox.height)} inner=${JSON.stringify(inner)}`);

      // Iframe should be tall enough to contain the inner panel without clipping.
      expect(iframeBox.height).toBeGreaterThanOrEqual(inner.panelH - 2);
      expect(inner.embedded).toBe('true');

      // Capture only the iframe + a margin in the article column. Use elementHandle
      // screenshot of the .diag-embed wrapper so it includes the full content area
      // even when taller than the viewport.
      const wrapper = page.locator('#art-body .diag-embed');
      await wrapper.screenshot({ path: path.join(OUT, `iframe-${w}x${h}.png`) });
    });
  }
});
