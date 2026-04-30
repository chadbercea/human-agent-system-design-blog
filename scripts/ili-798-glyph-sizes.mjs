import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const OUT = 'verification-screenshots/ili-798';
await mkdir(OUT, { recursive: true });

const glyphs = {
  axioms: '<g><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="14" x2="20" y2="14" /><line x1="4" y1="21" x2="20" y2="21" /></g>',
  constraints: '<g><line x1="3" y1="12" x2="10" y2="12" /><polyline points="7 9 10 12 7 15" /><line x1="21" y1="12" x2="14" y2="12" /><polyline points="17 9 14 12 17 15" /></g>',
  'design-requirements': '<g><line x1="6" y1="18" x2="18" y2="6" /><polyline points="11 6 18 6 18 13" /></g>',
};

const colors = {
  axioms: '#8fc88f',
  constraints: '#d99a4f',
  'design-requirements': '#5fb3c8',
};

const sizes = [16, 20, 24, 32, 48];

const cells = Object.entries(glyphs).map(([cat, body]) => `
  <div class="row">
    <div class="label">${cat}</div>
    <div class="sizes">
      ${sizes.map((s) => `
        <div class="size-cell">
          <svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${colors[cat]}" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">${body}</svg>
          <span class="size-label">${s}px</span>
        </div>
      `).join('')}
    </div>
  </div>
`).join('');

const html = `<!doctype html><html><head><style>
  body { background: #0a0a0b; color: #c4c4c6; font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; padding: 40px; margin: 0; }
  .grid { display: grid; gap: 32px; }
  .row { display: grid; grid-template-columns: 200px 1fr; gap: 24px; align-items: center; padding: 16px 0; border-top: 1px solid rgba(255,255,255,0.08); }
  .label { font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #8a8a8c; }
  .sizes { display: flex; gap: 32px; align-items: flex-end; }
  .size-cell { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .size-label { font-size: 9px; letter-spacing: 0.2em; color: #5a5a5c; }
</style></head><body><div class="grid">${cells}</div></body></html>`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 900, height: 600 } });
const page = await ctx.newPage();
await page.setContent(html);
await page.waitForTimeout(200);
await page.screenshot({ path: `${OUT}/glyph-sizes.png`, fullPage: true });
await browser.close();
console.log('done');
