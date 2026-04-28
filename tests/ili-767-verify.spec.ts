import { test, expect } from '@playwright/test';

test('ILI-767 — logo.svg renders at /brand/logo.svg', async ({ page }) => {
  // Land on an HTML page first so setContent has an HTML document to write into.
  await page.goto('/');
  await page.setContent(`
    <!doctype html><meta charset="utf-8"><title>logo</title>
    <style>
      html,body{margin:0;background:#fff;}
      .row{display:flex;gap:32px;padding:32px;align-items:center;}
      .swatch{padding:24px;}
      .light{background:#fff;}
      .dark{background:#0b0b0b;}
      img{height:120px;display:block;}
    </style>
    <div class="row">
      <div class="swatch light"><img src="/brand/logo.svg" alt="logo dark"></div>
      <div class="swatch dark"><img src="/brand/logo-light.svg" alt="logo light"></div>
    </div>
  `);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'verification-screenshots/ili-767-logo-resource.png', fullPage: true });

  // Sanity-check: both files return 200.
  const r1 = await page.request.get('/brand/logo.svg');
  expect(r1.status()).toBe(200);
  expect(r1.headers()['content-type']).toContain('svg');

  const r2 = await page.request.get('/brand/logo-light.svg');
  expect(r2.status()).toBe(200);
  expect(r2.headers()['content-type']).toContain('svg');
});
