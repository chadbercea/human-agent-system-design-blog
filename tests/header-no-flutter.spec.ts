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

// ILI-742 second-pass regression: on the homepage the document is barely
// taller than the viewport. Scrolling past 80px triggered condense, which
// shrunk the document by 40px so scrollY clamped back below the y < 8
// reset, the header expanded, the document grew, and the loop repeated —
// flutter that pushed scroll back to top. Condense now requires enough
// scrollable height to stay scrolled past the reset after the 40px shrink.
test('mobile header does not condense when page is too short to sustain it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  // Set up a page where scrollHeight is just past viewport+COLLAPSE_AFTER
  // but less than viewport+COLLAPSE_AFTER+40 — the unsafe band where
  // condensing would shrink the doc enough to clamp scroll back.
  await page.evaluate(() => {
    document.body.style.minHeight = '0';
    const s = document.createElement('div');
    // Total page height target: 844 + 100 = 944. With header at 80px,
    // maxScroll = 100. Condense would shrink doc to 904 → maxScroll = 60,
    // not enough to keep scrollY above the y<8 reset if user scrolled to
    // ~85. This is the homepage shape ILI-742 surfaced.
    s.style.height = `${window.innerHeight + 100 - document.body.getBoundingClientRect().height}px`;
    document.body.appendChild(s);
    (window as any).__transitions = [];
    new MutationObserver(() => {
      (window as any).__transitions.push(
        document.documentElement.classList.contains('sh-condensed'),
      );
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  });

  await page.evaluate(async () => {
    let y = 0;
    for (let i = 0; i < 20; i++) {
      y += 6;
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
    }
  });
  await page.waitForTimeout(200);

  const transitions: boolean[] = await page.evaluate(() => (window as any).__transitions);
  // No toggles at all — the condense path is gated off when the page
  // can't sustain the post-condense scrollY.
  expect(transitions).toEqual([]);
});
