import { expect, test } from '@playwright/test';

const PORT = Number(process.env.VERIFY_PORT) || 4322;
const BASE = `http://127.0.0.1:${PORT}`;

// ILI-742 regression: a downward fling with a two-frame momentum recoil dip
// (e.g. dy deltas like +5,+5,-12,-15 repeating) used to push cumulative
// upAccum past EXPAND_BY across two frames, expand the header, then the
// next +5 re-condensed it — flutter on every cycle. The handler now requires
// sustained upward motion across 3+ frames (or a single decisive ≥20px
// delta) before honoring upAccum, so two-frame dips no longer expand.
test('mobile header does not flutter during downward scroll with 2-frame recoil dips', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const s = document.createElement('div');
    s.style.height = '4000px';
    document.body.appendChild(s);
    (window as any).__transitions = [];
    const obs = new MutationObserver(() => {
      const condensed = document.documentElement.classList.contains('sh-condensed');
      (window as any).__transitions.push(condensed);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  });

  // Drive scroll one frame at a time with a 2-frame downward+dip pattern.
  // This is the synthetic shape of touch-driven momentum jitter; with the
  // pre-fix handler this produced 10+ class-flips during the run.
  await page.evaluate(async () => {
    let y = 0;
    for (let i = 0; i < 30; i++) {
      y += 30;
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
    }
    const pattern = [+5, +5, -12, -15];
    for (let i = 0; i < 40; i++) {
      const dy = pattern[i % pattern.length];
      y = Math.max(0, y + dy);
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
    }
  });
  await page.waitForTimeout(200);

  const transitions: boolean[] = await page.evaluate(() => (window as any).__transitions);
  // After the initial condense the class must not flip back to false at any
  // point during the jitter run.
  const expandsAfterCondense = transitions.filter((c) => c === false).length;
  expect(expandsAfterCondense).toBe(0);
});
