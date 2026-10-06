// Premium polish layered on top of site.ts: scroll progress, card spotlight + tilt, image parallax.
// Everything here is decorative: it is skipped for reduced motion and the page works without it.
import { animate, scroll } from 'motion';
import { reduceMotion } from './motion-presets';

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- Scroll progress bar ---------- */
const bar = document.querySelector<HTMLElement>('[data-scroll-progress]');
if (bar && !reduceMotion) {
  scroll(animate(bar, { scaleX: [0, 1] }, { ease: 'linear' }));
}

/* ---------- Card spotlight + tilt ----------
 * The glow follows the cursor via --mx/--my (CSS draws it in ::before). The tilt uses the
 * independent `rotate` property so it composes with the cards' existing hover `transform`. */
const MAX_TILT = 4; // degrees

if (finePointer && !reduceMotion) {
  document.querySelectorAll<HTMLElement>('[data-fx-card]').forEach((card) => {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

    const tick = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      const angle = Math.hypot(cx, cy);
      card.style.rotate = angle < 0.01 ? '' : `${-cy} ${cx} 0 ${angle.toFixed(3)}deg`;
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.01 ? requestAnimationFrame(tick) : 0;
      if (!raf && tx === 0 && ty === 0) card.style.rotate = '';
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      tx = (px - 0.5) * 2 * MAX_TILT;
      ty = (py - 0.5) * 2 * MAX_TILT;
      kick();
    });
    card.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  });
}

/* ---------- Scroll-linked parallax ---------- */
if (!reduceMotion) {
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const dist = Number(el.dataset.parallax) || 40;
    scroll(animate(el, { y: [-dist, dist] }, { ease: 'linear' }), {
      target: el.parentElement ?? el,
      offset: ['start end', 'end start'],
    });
  });
}
