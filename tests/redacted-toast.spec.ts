import { test, expect } from '@playwright/test';

test('click on redacted bar shows toast with [Intel currently REDACTED]', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/glossary?reset=1');

  // Wait for the archive flourish overlay to clear before interacting.
  await page.waitForTimeout(1500);

  const toastExists = await page.evaluate(() => !!document.getElementById('redacted-toast'));
  expect(toastExists).toBe(true);

  const initialVisible = await page.evaluate(() =>
    document.getElementById('redacted-toast')!.getAttribute('data-visible')
  );
  expect(initialVisible).toBe('false');

  // Scroll a redacted bar into view, then click it.
  const firstBar = page.locator('.glossary-entry .redact-bar').first();
  await firstBar.scrollIntoViewIfNeeded();
  await firstBar.click();

  const afterClick = await page.evaluate(() =>
    document.getElementById('redacted-toast')!.getAttribute('data-visible')
  );
  expect(afterClick).toBe('true');

  const text = await page.evaluate(() =>
    document.getElementById('redacted-toast')!.textContent
  );
  expect(text).toContain('Intel currently REDACTED');

  await page.screenshot({ path: 'test-results/redacted-toast-click.png', fullPage: false });

  await page.waitForTimeout(2200);
  const afterTimeout = await page.evaluate(() =>
    document.getElementById('redacted-toast')!.getAttribute('data-visible')
  );
  expect(afterTimeout).toBe('false');
});

test('hover on redacted bar shows toast', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/glossary?reset=1');

  await page.locator('.glossary-entry .redact-bar').first().hover();

  const afterHover = await page.evaluate(() =>
    document.getElementById('redacted-toast')!.getAttribute('data-visible')
  );
  expect(afterHover).toBe('true');
});

test('toast does not fire on unlocked entries', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('/glossary');
  await page.evaluate(() => {
    localStorage.setItem('has-glossary', JSON.stringify(['different-not-lesser']));
    localStorage.setItem('has-glossary-seen', JSON.stringify(['different-not-lesser']));
  });
  await page.goto('/glossary');

  const unlocked = await page.evaluate(() =>
    document.querySelector('.glossary-entry[data-slug="different-not-lesser"]')!.getAttribute('data-unlocked')
  );
  expect(unlocked).toBe('true');

  await page.locator('.glossary-entry[data-slug="different-not-lesser"] .entry-name').click();

  const visible = await page.evaluate(() =>
    document.getElementById('redacted-toast')!.getAttribute('data-visible')
  );
  expect(visible).toBe('false');
});
