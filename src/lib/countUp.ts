export type CountUpEase = 'linear' | 'out' | ((t: number) => number);

export interface CountUpOptions {
  from: number;
  to: number;
  duration: number;
  ease?: CountUpEase;
  format?: (value: number) => string;
  onComplete?: () => void;
}

const EASING: Record<Exclude<CountUpEase, Function>, (t: number) => number> = {
  linear: (t) => t,
  out: (t) => 1 - Math.pow(1 - t, 3),
};

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const defaultFormat = (value: number): string =>
  Number.isInteger(value) ? value.toString() : value.toFixed(2);

export function countUp(
  el: Element,
  options: CountUpOptions,
): () => void {
  if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') {
    return () => {};
  }

  const { from, to, duration, ease = 'out', format = defaultFormat, onComplete } = options;

  if (duration <= 0 || prefersReducedMotion()) {
    el.textContent = format(to);
    onComplete?.();
    return () => {};
  }

  const easeFn = typeof ease === 'function' ? ease : EASING[ease];
  const start = performance.now();
  const delta = to - from;
  let frame = 0;
  let cancelled = false;

  const tick = (now: number) => {
    if (cancelled) return;
    const t = Math.min(1, (now - start) / duration);
    const value = from + delta * easeFn(t);
    el.textContent = format(value);
    if (t < 1) {
      frame = requestAnimationFrame(tick);
    } else {
      onComplete?.();
    }
  };

  frame = requestAnimationFrame(tick);

  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
  };
}
