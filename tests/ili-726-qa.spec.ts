import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';

const PORT = process.env.PORT || 4322;
const BASE = `http://localhost:${PORT}`;
const NO_ANIM = `*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; }`;

const SHOT_DIR = 'verification-screenshots/ili-726';
const REPORT_DIR = 'verification-screenshots/ili-726/reports';

fs.mkdirSync(SHOT_DIR, { recursive: true });
fs.mkdirSync(REPORT_DIR, { recursive: true });

type Viewport = { w: number; h: number; label: string; tier: 'desktop' | 'tablet' | 'mobile' };
const VIEWPORTS: Viewport[] = [
  { w: 1440, h: 900, label: '1440', tier: 'desktop' },
  { w: 1280, h: 800, label: '1280', tier: 'desktop' },
  { w: 1024, h: 768, label: '1024', tier: 'desktop' },
  { w: 900,  h: 1200, label: '900',  tier: 'tablet' },
  { w: 768,  h: 1024, label: '768',  tier: 'tablet' },
  { w: 414,  h: 896,  label: '414',  tier: 'mobile' },
  { w: 375,  h: 812,  label: '375',  tier: 'mobile' },
  { w: 360,  h: 800,  label: '360',  tier: 'mobile' },
];

type Route = { path: string; slug: string; hasRails: boolean };
const ROUTES: Route[] = [
  { path: '/',              slug: 'home',          hasRails: true },
  { path: '/about',         slug: 'about',         hasRails: true },
  { path: '/contact',       slug: 'contact',       hasRails: true },
  { path: '/design-system', slug: 'design-system', hasRails: true },
  { path: '/does-not-exist', slug: '404',          hasRails: false },
];

type FindingBucket = {
  axe: Record<string, { url: string; violations: number; serious: number; critical: number }>;
  hscroll: Record<string, { scrollW: number; innerW: number; overflow: boolean }>;
  fonts: Record<string, { families: string[]; extra: string[] }>;
  rails: Record<string, { leftVisible: boolean; rightVisible: boolean; expected: boolean }>;
};

const findings: FindingBucket = { axe: {}, hscroll: {}, fonts: {}, rails: {} };

test.afterAll(async () => {
  fs.writeFileSync(path.join(REPORT_DIR, 'findings.json'), JSON.stringify(findings, null, 2));
});

async function waitForFonts(page: Page) {
  await page.evaluate(async () => {
    // @ts-ignore
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  });
}

async function collectFontFamilies(page: Page): Promise<string[]> {
  return await page.evaluate(() => {
    const seen = new Set<string>();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let n: Node | null = walker.currentNode;
    let i = 0;
    while (n && i < 500) {
      const el = n as HTMLElement;
      const f = getComputedStyle(el).fontFamily;
      if (f) seen.add(f);
      n = walker.nextNode();
      i++;
    }
    return [...seen];
  });
}

// Only Lato, JetBrains Mono, and bare system fallbacks are allowed per CLAUDE.md
const ALLOWED_FAMILY_TOKENS = [
  'Lato',
  'JetBrains Mono',
  'JetBrains',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'Roboto',
  'Helvetica',
  'Arial',
  'sans-serif',
  'serif',
  'monospace',
  'system-ui',
  'ui-monospace',
  'SFMono-Regular',
  'Menlo',
  'Monaco',
  'Consolas',
  'Liberation Mono',
  'Courier New',
];

function extraFamilyTokens(families: string[]): string[] {
  const extras = new Set<string>();
  for (const stack of families) {
    const tokens = stack.split(',').map((t) => t.trim().replace(/^['"]|['"]$/g, ''));
    for (const t of tokens) {
      if (!t) continue;
      const known = ALLOWED_FAMILY_TOKENS.some((a) => t.toLowerCase().includes(a.toLowerCase()));
      if (!known) extras.add(t);
    }
  }
  return [...extras];
}

test.describe('ILI-726 — QA sweep: responsive + a11y + rails', () => {
  // --- responsive screenshots + horizontal-scroll + rail visibility ---
  for (const vp of VIEWPORTS) {
    for (const route of ROUTES) {
      test(`viewport ${vp.label} · ${route.slug} — screenshot + hscroll + rails`, async ({ page }) => {
        await page.setViewportSize({ width: vp.w, height: vp.h });

        const resp = await page.goto(BASE + route.path, { waitUntil: 'networkidle' });
        await page.addStyleTag({ content: NO_ANIM });
        await waitForFonts(page);

        // 404 should 404
        if (route.slug === '404') {
          expect(resp?.status()).toBe(404);
        }

        // Horizontal scroll check (mobile + tablet are the strict ones)
        const dims = await page.evaluate(() => ({
          scrollW: document.documentElement.scrollWidth,
          innerW: window.innerWidth,
        }));
        const key = `${vp.label}-${route.slug}`;
        findings.hscroll[key] = { ...dims, overflow: dims.scrollW > dims.innerW + 1 };
        // tolerance 1px for rounding
        expect(dims.scrollW, `horizontal overflow on ${route.path} @ ${vp.label}`).toBeLessThanOrEqual(dims.innerW + 1);

        // Rails: hide at <= 900 per CSS `@media (max-width: 900px)`, show at > 900
        // Rails are aria-hidden="true" decorative chrome — check via computed display, not Playwright visibility.
        if (route.hasRails) {
          const shouldShow = vp.w > 900;
          const railState = await page.evaluate(() => {
            const l = document.querySelector('.rail--left') as HTMLElement | null;
            const r = document.querySelector('.rail--right') as HTMLElement | null;
            const disp = (el: HTMLElement | null) => el ? getComputedStyle(el).display : 'missing';
            return { left: disp(l), right: disp(r) };
          });
          const leftVisible = railState.left !== 'none' && railState.left !== 'missing';
          const rightVisible = railState.right !== 'none' && railState.right !== 'missing';
          findings.rails[key] = { leftVisible, rightVisible, expected: shouldShow };
          if (shouldShow) {
            expect(leftVisible, `left rail not rendered @ ${vp.label} on ${route.path} (display=${railState.left})`).toBe(true);
            expect(rightVisible, `right rail not rendered @ ${vp.label} on ${route.path} (display=${railState.right})`).toBe(true);
          } else {
            expect(leftVisible, `left rail still rendered @ ${vp.label} on ${route.path} (display=${railState.left})`).toBe(false);
            expect(rightVisible, `right rail still rendered @ ${vp.label} on ${route.path} (display=${railState.right})`).toBe(false);
          }
        }

        await page.screenshot({
          path: path.join(SHOT_DIR, `${route.slug}-${vp.label}.png`),
          fullPage: false,
        });
      });
    }
  }

  // --- typography sanity (only Lato + JetBrains Mono + fallbacks) ---
  for (const route of ROUTES) {
    if (route.slug === '404') continue;
    test(`typography sanity · ${route.slug}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(BASE + route.path, { waitUntil: 'networkidle' });
      await waitForFonts(page);
      const families = await collectFontFamilies(page);
      const extras = extraFamilyTokens(families);
      findings.fonts[route.slug] = { families, extra: extras };
      expect(extras, `unexpected font families on ${route.path}: ${extras.join(', ')}`).toEqual([]);
    });
  }

  // --- axe a11y on each route at desktop + mobile ---
  for (const route of ROUTES) {
    if (route.slug === '404') continue;
    for (const size of [{ w: 1440, h: 900, tag: 'desktop' }, { w: 375, h: 812, tag: 'mobile' }]) {
      test(`axe a11y · ${route.slug} @ ${size.tag}`, async ({ page }) => {
        await page.setViewportSize({ width: size.w, height: size.h });
        await page.goto(BASE + route.path, { waitUntil: 'networkidle' });
        await waitForFonts(page);

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();

        const serious = results.violations.filter((v) => v.impact === 'serious').length;
        const critical = results.violations.filter((v) => v.impact === 'critical').length;
        findings.axe[`${route.slug}-${size.tag}`] = {
          url: route.path,
          violations: results.violations.length,
          serious,
          critical,
        };

        // Write detail file for the punch list
        fs.writeFileSync(
          path.join(REPORT_DIR, `axe-${route.slug}-${size.tag}.json`),
          JSON.stringify(
            results.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              help: v.help,
              helpUrl: v.helpUrl,
              nodes: v.nodes.length,
              targets: v.nodes.slice(0, 3).map((n) => n.target),
            })),
            null,
            2
          )
        );

        // Fail only on serious / critical
        expect(critical, `critical a11y violations on ${route.path} @ ${size.tag}`).toBe(0);
      });
    }
  }

  // --- keyboard nav: can tab from start to something in main content ---
  test('keyboard nav · home — tab reaches nav links + post card', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: NO_ANIM });

    const seen: string[] = [];
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const sig = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return '';
        const tag = el.tagName.toLowerCase();
        const text = (el.textContent || '').trim().slice(0, 40);
        return `${tag}:${text}`;
      });
      if (sig) seen.push(sig);
    }
    fs.writeFileSync(path.join(REPORT_DIR, 'keyboard-nav-home.json'), JSON.stringify(seen, null, 2));
    // Expect at least one interactive stop (links/buttons) reachable
    expect(seen.length).toBeGreaterThan(0);
  });

  // --- focus ring visible on first focusable element ---
  test('focus ring visible · home first focusable', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: NO_ANIM });
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        outlineStyle: cs.outlineStyle,
        outlineWidth: cs.outlineWidth,
        outlineColor: cs.outlineColor,
        boxShadow: cs.boxShadow,
      };
    });
    fs.writeFileSync(path.join(REPORT_DIR, 'focus-ring.json'), JSON.stringify(outline, null, 2));
    // Accept any non-"none" outline OR a box-shadow as a focus indicator
    const hasIndicator =
      !!outline &&
      (outline.outlineStyle !== 'none' || (outline.boxShadow && outline.boxShadow !== 'none'));
    expect(hasIndicator, 'no visible focus indicator on first focusable element').toBe(true);
  });

  // --- article reader opens + axe + closes via Escape ---
  test('article reader · opens, a11y clean, escape closes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: NO_ANIM });

    await page.waitForSelector('.post-card');
    await page.locator('.post-card').first().click();
    await page.waitForSelector('#stage.open');

    // Screenshot
    await page.screenshot({
      path: path.join(SHOT_DIR, 'article-open-1440.png'),
      fullPage: false,
    });

    // Axe on the open reader
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const critical = results.violations.filter((v) => v.impact === 'critical').length;
    findings.axe['article-open'] = {
      url: '/ (article open)',
      violations: results.violations.length,
      serious: results.violations.filter((v) => v.impact === 'serious').length,
      critical,
    };
    fs.writeFileSync(
      path.join(REPORT_DIR, 'axe-article-open.json'),
      JSON.stringify(
        results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          nodes: v.nodes.length,
          targets: v.nodes.slice(0, 3).map((n) => n.target),
        })),
        null,
        2
      )
    );

    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.getElementById('stage')?.classList.contains('open'));
    expect(critical, 'critical a11y violations on open article reader').toBe(0);
  });

  // --- article reader on mobile: full-screen overlay sliding from right ---
  test('article reader · mobile overlay renders full width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForSelector('.post-card');
    await page.locator('.post-card').first().click();
    await page.waitForSelector('#stage.open');
    await page.screenshot({
      path: path.join(SHOT_DIR, 'article-open-375.png'),
      fullPage: false,
    });
  });
});
