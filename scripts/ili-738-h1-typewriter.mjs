import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('verification-screenshots/ili-738');
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:4321';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

async function captureH1Frames(label, url, frames = [120, 240, 400, 700]) {
  await page.goto(`${BASE}${url}`, { waitUntil: 'load' });
  for (const ms of frames) {
    await page.waitForTimeout(ms);
    await page.screenshot({
      path: path.join(OUT, `h1-${label}-${ms}ms.png`),
      clip: { x: 240, y: 80, width: 700, height: 240 },
    });
  }
}

console.log('1. fresh /about');
await captureH1Frames('about-fresh', '/about');

console.log('2. revisit /about (via / and back)');
await page.click('a[href="/"]');
await page.waitForURL((u) => u.pathname === '/');
await page.waitForTimeout(900);
await page.click('a[href="/about"]');
await page.waitForURL('**/about');
for (const ms of [120, 240, 400, 700]) {
  await page.waitForTimeout(ms);
  await page.screenshot({
    path: path.join(OUT, `h1-about-revisit-${ms}ms.png`),
    clip: { x: 240, y: 80, width: 700, height: 240 },
  });
}

console.log('3. fresh /contact');
await captureH1Frames('contact-fresh', '/contact', [120, 280, 600]);

console.log('4. reduced motion /about');
const rmContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const rmPage = await rmContext.newPage();
await rmPage.goto(`${BASE}/about`, { waitUntil: 'load' });
await rmPage.waitForTimeout(500);
await rmPage.screenshot({
  path: path.join(OUT, 'h1-about-reduced-motion.png'),
  clip: { x: 240, y: 80, width: 700, height: 240 },
});

console.log('5. cursor blinking after settle (about)');
await page.goto(`${BASE}/about`, { waitUntil: 'load' });
await page.waitForTimeout(1100);
await page.screenshot({
  path: path.join(OUT, 'h1-cursor-on.png'),
  clip: { x: 240, y: 80, width: 700, height: 240 },
});
await page.waitForTimeout(425); // cursor in off phase
await page.screenshot({
  path: path.join(OUT, 'h1-cursor-off.png'),
  clip: { x: 240, y: 80, width: 700, height: 240 },
});

await browser.close();
