import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const OUT = resolve('verification-screenshots/ili-760');
mkdirSync(OUT, { recursive: true });

const FILE = pathToFileURL(resolve('has-d-diagnostic.html')).href;

const browser = await chromium.launch();

async function shoot(name, viewport, opts = {}) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  page.on('pageerror', err => console.error(`[${name}] pageerror`, err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') console.error(`[${name}] console.error`, msg.text());
  });
  await page.goto(FILE, { waitUntil: 'networkidle' });

  if (opts.before) await opts.before(page);

  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: opts.full ?? true });
  await ctx.close();
}

// Desktop default — every slider at tick 3
await shoot('desktop-default-1440', { width: 1440, height: 900 });

// Desktop with mixed values to verify diagnosis logic
await shoot('desktop-mixed-1440', { width: 1440, height: 900 }, {
  before: async (page) => {
    // 1, 1, 2, 3, 3 = 10 → low diagnosis
    await page.evaluate(() => {
      const v = [1, 1, 2, 3, 3];
      v.forEach((x, i) => {
        const el = document.getElementById(`slider-${i}`);
        el.value = x;
        el.dispatchEvent(new Event('input'));
      });
    });
    await page.waitForTimeout(300);
  }
});

// Desktop all-high (5,5,5,5,5 = 25 → high diagnosis, glow on cards)
await shoot('desktop-all-high-1440', { width: 1440, height: 900 }, {
  before: async (page) => {
    await page.evaluate(() => {
      for (let i = 0; i < 5; i++) {
        const el = document.getElementById(`slider-${i}`);
        el.value = 5;
        el.dispatchEvent(new Event('input'));
      }
    });
    await page.waitForTimeout(800); // let glow animation start
  }
});

// Desktop all-low (1,1,1,1,1 = 5 → low diagnosis, wobble on cards)
await shoot('desktop-all-low-1440', { width: 1440, height: 900 }, {
  before: async (page) => {
    await page.evaluate(() => {
      for (let i = 0; i < 5; i++) {
        const el = document.getElementById(`slider-${i}`);
        el.value = 1;
        el.dispatchEvent(new Event('input'));
      }
    });
    await page.waitForTimeout(800); // wobble is brief — capture after settle
  }
});

// Mobile default
await shoot('mobile-default-375', { width: 375, height: 812 });

// Mobile narrow edge
await shoot('mobile-default-360', { width: 360, height: 780 });

// Tablet
await shoot('tablet-768', { width: 768, height: 1024 });

// Verify keyboard interaction works — focus first slider, arrow right twice → tick 5
await shoot('desktop-keyboard-1440', { width: 1440, height: 900 }, {
  before: async (page) => {
    await page.focus('#slider-0');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
  }
});

// Verify reset button — set to extreme, then click reset
await shoot('desktop-after-reset-1440', { width: 1440, height: 900 }, {
  before: async (page) => {
    await page.evaluate(() => {
      for (let i = 0; i < 5; i++) {
        const el = document.getElementById(`slider-${i}`);
        el.value = 1;
        el.dispatchEvent(new Event('input'));
      }
    });
    await page.waitForTimeout(200);
    await page.click('#btn-reset');
    await page.waitForTimeout(200);
  }
});

// Print preview emulation
await shoot('print-preview-1440', { width: 1440, height: 1600 }, {
  before: async (page) => {
    await page.evaluate(() => {
      const v = [2, 4, 3, 5, 1];
      v.forEach((x, i) => {
        const el = document.getElementById(`slider-${i}`);
        el.value = x;
        el.dispatchEvent(new Event('input'));
      });
    });
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(200);
  }
});

// Pull computed values to confirm score & diagnosis
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(FILE, { waitUntil: 'networkidle' });

  const checks = [
    { values: [3,3,3,3,3], expectedScore: 15, expectedHeadline: 'Halfway out of the chat trap.' },
    { values: [1,1,1,1,1], expectedScore: 5,  expectedHeadline: 'Read the article again.' },
    { values: [5,5,5,5,5], expectedScore: 25, expectedHeadline: 'You did not need this diagnostic.' },
    { values: [2,2,2,2,2], expectedScore: 10, expectedHeadline: 'Read the article again.' },
    { values: [3,3,3,1,1], expectedScore: 11, expectedHeadline: 'Halfway out of the chat trap.' },
    { values: [4,4,4,4,3], expectedScore: 19, expectedHeadline: 'Halfway out of the chat trap.' },
    { values: [4,4,4,4,4], expectedScore: 20, expectedHeadline: 'You did not need this diagnostic.' },
  ];

  for (const c of checks) {
    await page.evaluate((vals) => {
      vals.forEach((x, i) => {
        const el = document.getElementById(`slider-${i}`);
        el.value = x;
        el.dispatchEvent(new Event('input'));
      });
    }, c.values);
    const score = await page.locator('#score-value').innerText();
    const headline = await page.locator('#diagnosis-headline').innerText();
    const ok = score.startsWith(String(c.expectedScore)) && headline === c.expectedHeadline;
    console.log(
      ok ? 'PASS' : 'FAIL',
      `values=${c.values.join(',')} → score="${score.replace(/\s+/g, ' ')}" headline="${headline}" (expected ${c.expectedScore} / "${c.expectedHeadline}")`
    );
  }

  await ctx.close();
}

await browser.close();
console.log('done →', OUT);
