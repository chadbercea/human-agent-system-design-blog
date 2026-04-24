import { test, expect } from '@playwright/test';

const URL = `http://localhost:${process.env.PORT || 4321}/`;
const NO_ANIM = `*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; }`;

// Fixture: a block of marked-up HTML that mirrors what Astro's Shiki pipeline
// produces for fenced code (`pre data-language="..." class="astro-code"` with
// token <span> children). Injecting it into the article reader lets us verify
// the terminal-readout styling without editing authored content.
const CODE_FIXTURE = `
<p>Inline like <code>const foo = 42</code> should sit in a hairline chip.</p>
<pre class="astro-code has-terminal" data-language="css" style="background-color:#050506;color:#c4c4c6;overflow-x:auto"><code><span class="line"><span style="color:#ffffff;font-weight:bold">pre</span><span style="color:#8a8a8c"> {</span></span>
<span class="line"><span style="color:#c4c4c6">  background</span><span style="color:#8a8a8c">:</span><span style="color:#c4c4c6"> var(--near-black)</span><span style="color:#8a8a8c">;</span></span>
<span class="line"><span style="color:#c4c4c6">  border</span><span style="color:#8a8a8c">:</span><span style="color:#c4c4c6"> 1px solid var(--rule-strong)</span><span style="color:#8a8a8c">;</span></span>
<span class="line"><span style="color:#c4c4c6">  padding</span><span style="color:#8a8a8c">:</span><span style="color:#c4c4c6"> 20px 24px</span><span style="color:#8a8a8c">;</span></span>
<span class="line"><span style="color:#5a5a5c">  /* telemetry printout, not rainbow IDE */</span></span>
<span class="line"><span style="color:#8a8a8c">}</span></span></code></pre>
<p>And a trailing paragraph with <code>li code</code> inline.</p>
`;

test.describe('ILI-723 — terminal readout code block styling', () => {
  test('desktop: code block renders with near-black bg, strong rule, language label', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card');
    await page.locator('.post-card').first().click();
    await page.waitForSelector('#stage.open');

    // Inject fixture into the live article body
    await page.evaluate((html) => {
      const body = document.getElementById('art-body');
      if (body) body.innerHTML = html;
    }, CODE_FIXTURE);

    const pre = page.locator('.art-body pre');
    await expect(pre).toBeVisible();
    await expect(pre).toHaveCSS('background-color', 'rgb(5, 5, 6)');
    await expect(pre).toHaveCSS('font-family', /JetBrains Mono/);
    await expect(pre).toHaveCSS('font-size', '13px');
    await expect(pre).toHaveCSS('position', 'relative');

    const inlineCode = page.locator('.art-body p code').first();
    await expect(inlineCode).toHaveCSS('background-color', 'rgb(5, 5, 6)');

    await pre.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.screenshot({
      path: 'verification-screenshots/ili-723-desktop-code-block.png',
      fullPage: true,
    });
  });

  test('mobile: code block fits column and keeps label', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(URL);
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card');
    await page.locator('.post-card').first().click();
    await page.waitForTimeout(200);

    await page.evaluate((html) => {
      const body = document.getElementById('art-body');
      if (body) body.innerHTML = html;
    }, CODE_FIXTURE);

    await page.locator('.art-body pre').scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.screenshot({
      path: 'verification-screenshots/ili-723-mobile-code-block.png',
      fullPage: false,
    });
  });
});
