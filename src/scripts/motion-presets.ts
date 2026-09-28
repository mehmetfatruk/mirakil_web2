// Shared Motion (motion.dev, vanilla DOM API) presets so every entrance feels the same.
import { animate, type DOMKeyframesDefinition } from 'motion';

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Soft, low-bounce spring for position; eased fade for opacity (a spring would overshoot it).
const spring = { type: 'spring', visualDuration: 0.6, bounce: 0.16 } as const;
const fade = { duration: 0.5, ease: [0.16, 1, 0.3, 1] } as const;

type Targets = Element | Element[] | NodeListOf<Element>;

/** Fade + rise into place, optionally staggered. Inline styles are cleared afterwards so CSS hover transforms keep working. */
export function enter(targets: Targets, { y = 24, gap = 0.06, delay = 0 } = {}) {
  const els = (targets instanceof Element ? [targets] : Array.from(targets)) as HTMLElement[];
  if (!els.length) return Promise.resolve();
  if (reduceMotion) return Promise.resolve();
  const keyframes: DOMKeyframesDefinition = { opacity: [0, 1], y: [y, 0] };
  // Per-element numeric delays: stagger() is not resolved inside per-value transitions
  // (animations stalled at 0.875 opacity), so the cascade is computed here instead.
  return Promise.all(
    els.map((el, i) => {
      const d = delay + i * gap;
      return animate(el, keyframes, { y: { ...spring, delay: d }, opacity: { ...fade, delay: d } })
        .then(() => { el.style.opacity = ''; el.style.transform = ''; });
    }),
  );
}

/** Count a number up from zero with an ease-out curve. */
export function countTo(el: HTMLElement, target: number, format: (n: number) => string) {
  if (reduceMotion) { el.textContent = format(target); return; }
  animate(0, target, {
    duration: 1.6,
    ease: [0.16, 1, 0.3, 1],
    onUpdate: (v) => { el.textContent = format(Math.round(v)); },
  });
}

/** Tactile press feedback: springs down while held, back on release. */
export function pressSpring(el: HTMLElement) {
  if (reduceMotion) return;
  animate(el, { scale: 0.97 }, { type: 'spring', stiffness: 600, damping: 30 });
  return () => animate(el, { scale: 1 }, { type: 'spring', stiffness: 400, damping: 18 }).then(() => { el.style.transform = ''; });
}
