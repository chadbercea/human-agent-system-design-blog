/* HAS Design — channel transition runtime (ILI-738).
   Wires Astro's View Transitions lifecycle into the
   signal-loss → swap → signal-acquire envelope, scrambles
   the CH XX values in the chrome around the swap, and runs
   per-route flourishes after acquire settles. The CSS lives
   in src/styles/transitions.css.

   The new page HTML already contains the correct CH values
   in the chrome (the layouts inject them server-side). We
   scramble the OLD chrome during signal-loss, then on
   signal-acquire scramble-converge from random → the value
   that's already in the new DOM. */

import { getChannelForPath } from './channels';

const SCRAMBLE_CHARS = 'ABCDEF0123456789';
const ACQUIRE_MS = 200;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function ensureNoiseElement(): HTMLDivElement {
  let el = document.querySelector<HTMLDivElement>('.signal-noise');
  if (!el) {
    el = document.createElement('div');
    el.className = 'signal-noise';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
  }
  return el;
}

function scrambleConverge(el: HTMLElement, target: string, durationMs: number): void {
  if (!el) return;
  if (prefersReducedMotion()) {
    el.textContent = target;
    return;
  }
  const start = performance.now();
  const tick = () => {
    const elapsed = performance.now() - start;
    if (elapsed >= durationMs) {
      el.textContent = target;
      return;
    }
    const lockedChars = Math.floor((elapsed / durationMs) * target.length);
    let out = '';
    for (let i = 0; i < target.length; i++) {
      const ch = target[i];
      if (ch === ' ' || ch === '·' || ch === '/') {
        out += ch;
      } else if (i < lockedChars) {
        out += ch;
      } else {
        out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
    }
    el.textContent = out;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function startScrambleHold(el: HTMLElement | null): () => void {
  if (!el || prefersReducedMotion()) return () => {};
  const original = el.textContent || '';
  let active = true;
  const tick = () => {
    if (!active) return;
    let out = '';
    for (let i = 0; i < original.length; i++) {
      const ch = original[i];
      if (ch === ' ' || ch === '·' || ch === '/') {
        out += ch;
      } else {
        out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
    }
    el.textContent = out;
    setTimeout(tick, 50);
  };
  tick();
  return () => { active = false; el.textContent = original; };
}

function runFlourish(): void {
  const path = window.location.pathname;
  const channel = getChannelForPath(path);
  document.body.setAttribute('data-channel-id', channel.id);
  document.body.setAttribute('data-channel-label', channel.label);
  document.body.setAttribute('data-flourish', channel.flourish || 'none');

  if (channel.flourish === 'archive' && !prefersReducedMotion()) {
    showArchiveOverlay();
  }

  primePageH1Typewriter();
}

const H1_STEP_MS = 45;
const h1Runners: WeakMap<HTMLElement, () => void> = new WeakMap();

function primePageH1Typewriter(): void {
  const h1s = document.querySelectorAll<HTMLElement>('h1.prose-h1');
  h1s.forEach((h1) => {
    const original = (h1.dataset.h1Original || h1.textContent || '').trim();
    if (!original) return;

    // Cache the original once so subsequent re-runs (revisits) don't
    // pick up the per-frame typed text as the new "original".
    if (!h1.dataset.h1Original) h1.dataset.h1Original = original;

    if (prefersReducedMotion()) {
      h1.classList.remove('h1-pending');
      h1.classList.add('h1-typing');
      h1.textContent = original;
      return;
    }

    // Build the typing structure: <span class="h1-typed"></span><span class="h1-cursor"></span>.
    const typed = document.createElement('span');
    typed.className = 'h1-typed';
    const cursor = document.createElement('span');
    cursor.className = 'h1-cursor';
    cursor.setAttribute('aria-hidden', 'true');

    h1.textContent = '';
    h1.appendChild(typed);
    h1.appendChild(cursor);
    h1.classList.remove('h1-pending');
    h1.classList.add('h1-typing');

    // Cancel any prior in-flight typing run.
    const prev = h1Runners.get(h1);
    if (prev) prev();

    let i = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (i >= original.length) return;
      i += 1;
      typed.textContent = original.slice(0, i);
      window.setTimeout(tick, H1_STEP_MS);
    };
    window.setTimeout(tick, 60);

    h1Runners.set(h1, () => { cancelled = true; });
  });
}

function showArchiveOverlay(): void {
  const existing = document.querySelector('.archive-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'archive-overlay in';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="archive-overlay-inner">
      <span class="ao-line">&gt; ACCESSING ARCHIVE</span>
      <span class="ao-line">&gt; HAS-D / CONCEPTS / SESSION-DERIVED.MAIN</span>
      <span class="ao-line">&gt; 13 ENTRIES · 03 CATEGORIES</span>
      <span class="ao-line">&gt; ACCESS GRANTED</span>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('animationend', (e) => {
    if ((e as AnimationEvent).animationName === 'archive-overlay-in') overlay.remove();
  });
}

let stopHolds: (() => void) | null = null;

function onBeforePreparation(): void {
  ensureNoiseElement();
  if (prefersReducedMotion()) return;

  document.body.setAttribute('data-signal', 'loss');

  const headerEl = document.querySelector<HTMLElement>('[data-channel-value="header"]');
  const railEl = document.querySelector<HTMLElement>('[data-channel-value="rail"]');
  const tagEl = document.querySelector<HTMLElement>('[data-channel-tag]');

  const a = startScrambleHold(headerEl);
  const b = startScrambleHold(railEl);
  const c = startScrambleHold(tagEl);
  stopHolds = () => { a(); b(); c(); };
}

function onAfterSwap(): void {
  if (stopHolds) {
    stopHolds();
    stopHolds = null;
  }
  ensureNoiseElement();

  if (prefersReducedMotion()) {
    document.body.removeAttribute('data-signal');
    return;
  }

  document.body.setAttribute('data-signal', 'acquire');

  const headerEl = document.querySelector<HTMLElement>('[data-channel-value="header"]');
  const railEl = document.querySelector<HTMLElement>('[data-channel-value="rail"]');
  const tagEl = document.querySelector<HTMLElement>('[data-channel-tag]');

  if (headerEl) scrambleConverge(headerEl, headerEl.textContent || '', ACQUIRE_MS);
  if (railEl) scrambleConverge(railEl, railEl.textContent || '', ACQUIRE_MS + 80);
  if (tagEl) scrambleConverge(tagEl, tagEl.textContent || '', ACQUIRE_MS);

  window.setTimeout(() => {
    document.body.removeAttribute('data-signal');
  }, ACQUIRE_MS + 120);
}

function onPageLoad(): void {
  runFlourish();
}

export function mountChannelTransitions(): void {
  if (typeof document === 'undefined') return;
  ensureNoiseElement();
  runFlourish();

  document.addEventListener('astro:before-preparation', onBeforePreparation);
  document.addEventListener('astro:after-swap', onAfterSwap);
  document.addEventListener('astro:page-load', onPageLoad);
}
