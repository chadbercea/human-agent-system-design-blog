import { onVisible } from './onVisible';

export interface ApplyRevealsOptions {
  selectors: string;
  staggerStart?: number;
  stagger?: boolean;
}

function observeOne(el: Element): void {
  onVisible(el, { threshold: 0.2, once: true }, () => el.classList.add('in'));
}

export function mountReveals(root: ParentNode = document): void {
  root.querySelectorAll('.reveal:not(.in)').forEach(observeOne);
}

export function applyReveals(root: Element, options: ApplyRevealsOptions): void {
  const { selectors, staggerStart = 0, stagger = true } = options;
  const matches = root.querySelectorAll(selectors);
  matches.forEach((el, i) => {
    el.classList.add('reveal');
    if (stagger) {
      (el as HTMLElement).style.setProperty('--reveal-i', String(staggerStart + i));
    }
    observeOne(el);
  });
}

declare global {
  interface Window {
    HASReveal?: {
      mount: typeof mountReveals;
      apply: typeof applyReveals;
    };
  }
}

if (typeof window !== 'undefined') {
  window.HASReveal = { mount: mountReveals, apply: applyReveals };
}
