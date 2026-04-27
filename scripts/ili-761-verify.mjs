import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const OUT = resolve('verification-screenshots/ili-761');
mkdirSync(OUT, { recursive: true });

const FILE = pathToFileURL(resolve('has-d-diagnostic.html')).href;

const browser = await chromium.launch();

async function setSliders(page, values) {
  await page.evaluate((vals) => {
    vals.forEach((x, i) => {
      const el = document.getElementById(`slider-${i}`);
      el.value = x;
      el.dispatchEvent(new Event('input'));
    });
  }, values);
  await page.waitForTimeout(150);
}

async function capturePrint(name, values) {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 1600 } });
  const page = await ctx.newPage();
  page.on('pageerror', err => console.error(`[${name}] pageerror`, err.message));
  await page.goto(FILE, { waitUntil: 'networkidle' });
  await setSliders(page, values);
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  await page.pdf({
    path: `${OUT}/${name}.pdf`,
    format: 'Letter',
    margin: { top: '0.5in', right: '0.55in', bottom: '0.6in', left: '0.55in' },
    printBackground: true,
    preferCSSPageSize: true,
  });
  // A4 confirmation render
  await page.pdf({
    path: `${OUT}/${name}-a4.pdf`,
    format: 'A4',
    margin: { top: '0.5in', right: '0.55in', bottom: '0.6in', left: '0.55in' },
    printBackground: true,
    preferCSSPageSize: true,
  });
  await ctx.close();
}

async function captureScreen(name, values) {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 1400 } });
  const page = await ctx.newPage();
  await page.goto(FILE, { waitUntil: 'networkidle' });
  await setSliders(page, values);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  await ctx.close();
}

// Screen view should still look like Part 1 (interactive, paper grid, etc.)
await captureScreen('screen-default', [3, 3, 3, 3, 3]);
await captureScreen('screen-mixed', [2, 4, 3, 5, 1]);

// Print preview at multiple slider configurations
await capturePrint('print-default', [3, 3, 3, 3, 3]);             // 15 / 25 — middle band
await capturePrint('print-all-low', [1, 1, 1, 1, 1]);             //  5 / 25 — low band
await capturePrint('print-all-high', [5, 5, 5, 5, 5]);            // 25 / 25 — high band
await capturePrint('print-mixed', [2, 4, 3, 5, 1]);               // 15 / 25 — mixed colors
await capturePrint('print-borderline-low', [3, 3, 3, 1, 1]);      // 11 / 25 — band edge
await capturePrint('print-borderline-high', [4, 4, 4, 4, 4]);     // 20 / 25 — band edge

// Confirm document.title is rewritten on beforeprint
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(FILE, { waitUntil: 'networkidle' });
  await setSliders(page, [4, 4, 4, 4, 3]);
  const before = await page.title();
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  const during = await page.title();
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  const after = await page.title();
  console.log(`title.before  = "${before}"`);
  console.log(`title.during  = "${during}"`);
  console.log(`title.after   = "${after}"`);
  const ok =
    before === after &&
    /HAS-D Diagnostic/.test(during) &&
    /Score 19 of 25/.test(during) &&
    /\d{4}-\d{2}-\d{2}/.test(during);
  console.log(ok ? 'PASS title rewrite' : 'FAIL title rewrite');
  await ctx.close();
}

// Confirm print-only DOM exists & matches state for one config
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(FILE, { waitUntil: 'networkidle' });
  await setSliders(page, [5, 1, 3, 2, 4]); // score 15
  const printState = await page.evaluate(() => {
    const ticks = [...document.querySelectorAll('.print-track')].map(t =>
      [...t.querySelectorAll('.print-track-tick')]
        .find(x => x.dataset.active === 'true')?.dataset.n
    );
    return {
      score: document.getElementById('print-score').textContent.trim(),
      headline: document.getElementById('print-diag-headline').textContent,
      ticks,
      copies: [...document.querySelectorAll('.print-copy')].map(p => p.textContent.length > 0),
    };
  });
  console.log('print state:', JSON.stringify(printState, null, 2));
  const ok =
    printState.score.startsWith('15') &&
    printState.ticks.join(',') === '5,1,3,2,4' &&
    printState.copies.every(Boolean);
  console.log(ok ? 'PASS print state' : 'FAIL print state');
  await ctx.close();
}

await browser.close();
console.log('done →', OUT);
