#!/usr/bin/env node
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PORT = Number(process.env.PORT) || 4322;
const BASE = `http://localhost:${PORT}`;
const CHROME_PATH = process.env.CHROME_PATH || '/home/chadbercea/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome';

const routes = [
  { slug: 'home',          path: '/' },
  { slug: 'about',         path: '/about' },
  { slug: 'contact',       path: '/contact' },
  { slug: 'design-system', path: '/design-system' },
];

const REPORT_DIR = 'verification-screenshots/ili-726/reports';
mkdirSync(REPORT_DIR, { recursive: true });

const chrome = await launch({
  chromePath: CHROME_PATH,
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'],
});

const summary = [];

for (const r of routes) {
  const url = BASE + r.path;
  console.log(`Lighthouse: ${url}`);
  const result = await lighthouse(url, {
    port: chrome.port,
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttling: {
      rttMs: 40, throughputKbps: 10 * 1024, cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0,
    },
  });
  const lhr = result.lhr;
  const scores = {
    slug: r.slug,
    url: r.path,
    performance: Math.round((lhr.categories.performance?.score ?? 0) * 100),
    accessibility: Math.round((lhr.categories.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((lhr.categories['best-practices']?.score ?? 0) * 100),
    seo: Math.round((lhr.categories.seo?.score ?? 0) * 100),
  };
  writeFileSync(join(REPORT_DIR, `lighthouse-${r.slug}.json`), JSON.stringify(lhr, null, 2));
  summary.push(scores);
  console.log('  →', scores);
}

writeFileSync(join(REPORT_DIR, 'lighthouse-summary.json'), JSON.stringify(summary, null, 2));
await chrome.kill();
console.log('Done.');
