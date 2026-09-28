// Site-wide behaviour: navigation, scroll reveal, number counters, press feedback.
import { inView, press } from 'motion';
import { enter, countTo, pressSpring, reduceMotion } from './motion-presets';

/* ---------- Navigation ---------- */
const nav = document.querySelector<HTMLElement>('[data-nav]');
const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
const menu = document.getElementById('navMenu');

function setMenu(open: boolean) {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
  document.body.classList.toggle('nav-open', open);
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

document.querySelectorAll<HTMLButtonElement>('.nav-dd-toggle').forEach((btn) => {
  const li = btn.closest('li')!;
  const set = (open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    li.classList.toggle('is-open', open);
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  li.addEventListener('mouseenter', () => window.matchMedia('(hover: hover) and (min-width: 1140px)').matches && set(true));
  li.addEventListener('mouseleave', () => window.matchMedia('(hover: hover) and (min-width: 1140px)').matches && set(false));
  li.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { set(false); btn.focus(); }
  });
  document.addEventListener('click', (e) => { if (!li.contains(e.target as Node)) set(false); });
});

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// Elevate the nav once the page scrolls past the utility bar (no scroll listener).
if (nav && 'IntersectionObserver' in window) {
  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;';
  document.body.prepend(sentinel);
  new IntersectionObserver(([entry]) => nav.classList.toggle('is-stuck', !entry.isIntersecting), {
    rootMargin: '48px 0px 0px 0px',
  }).observe(sentinel);
}

/* ---------- Scroll reveal (Motion) ---------- */
// CSS hides .reveal / .reveal-stagger children until they get .in; Motion then springs them in.
const revealEls = document.querySelectorAll<HTMLElement>('.reveal, .reveal-stagger');
if (reduceMotion) {
  revealEls.forEach((el) => el.classList.add('in'));
} else {
  revealEls.forEach((el) => {
    inView(el, () => {
      el.classList.add('in');
      if (el.classList.contains('reveal-stagger')) enter(el.children, { y: 20 });
      else enter(el);
    }, { margin: '0px 0px -40px 0px', amount: 0.12 });
  });
}

/* ---------- Counters (Motion) ---------- */
// Markup ships the final value (SEO / no-JS); we count up from zero when it enters view.
const fmt = (n: number) => (n >= 1000 ? n.toLocaleString('tr-TR') : String(n));
document.querySelectorAll<HTMLElement>('[data-count] [data-target]').forEach((el) => {
  const target = Number(el.dataset.target);
  if (!Number.isFinite(target) || reduceMotion) return;
  el.textContent = '0';
  inView(el, () => { countTo(el, target, fmt); }, { amount: 0.5 });
});

/* ---------- Tactile buttons (Motion) ---------- */
press('.btn, .hero-arrow, .mods-tab, .ref-tab, .tab-btn', (el) => pressSpring(el as HTMLElement));
