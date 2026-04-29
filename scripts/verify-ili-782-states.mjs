import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:4337/contact', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// 1. Submit empty
await page.click('#cf-submit');
await page.waitForTimeout(200);
await page.screenshot({ path: './verification-screenshots/ili-782/state_empty.png', fullPage: true });

// 2. Bad email
await page.fill('#cf-name', 'Test User');
await page.fill('#cf-email', 'not-an-email');
await page.fill('#cf-message', 'short');
await page.click('#cf-submit');
await page.waitForTimeout(200);
await page.screenshot({ path: './verification-screenshots/ili-782/state_bad_email.png', fullPage: true });

// 3. Short message
await page.fill('#cf-email', 'test@example.com');
await page.click('#cf-submit');
await page.waitForTimeout(200);
await page.screenshot({ path: './verification-screenshots/ili-782/state_short_msg.png', fullPage: true });

// 4. Valid form - intercept formspree call to confirm it would fire
await page.route('https://formspree.io/**', (route) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
);
await page.fill('#cf-message', 'This is a valid message that is over twenty characters long.');
const navPromise = page.waitForURL('**/thanks', { timeout: 5000 }).catch(() => null);
await page.click('#cf-submit');
await navPromise;
await page.waitForTimeout(800);
await page.screenshot({ path: './verification-screenshots/ili-782/state_after_submit.png', fullPage: true });
console.log('after submit URL:', page.url());

await browser.close();
