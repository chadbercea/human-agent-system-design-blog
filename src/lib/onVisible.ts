export interface OnVisibleOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | Document | null;
  once?: boolean;
}

export type OnVisibleCallback = (entry: IntersectionObserverEntry) => void;

export function onVisible(
  el: Element,
  options: OnVisibleOptions,
  callback: OnVisibleCallback,
): () => void {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return () => {};
  }

  const { threshold = 0, rootMargin, root = null, once = false } = options;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callback(entry);
        if (once) {
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold, rootMargin, root },
  );

  observer.observe(el);

  return () => observer.disconnect();
}
