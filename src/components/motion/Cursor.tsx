import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, REDUCED_MOTION, useGSAP } from '../../lib/gsap';

/**
 * A soft circle that trails the pointer and grows with a label over elements
 * marked `data-cursor="Label"` (projects, images). Desktop only; the native
 * cursor stays visible.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  const { pathname } = useLocation();
  const reset = useRef<() => void>(() => {});

  // A new page may not have anything under the pointer: drop the label.
  useEffect(() => {
    reset.current();
  }, [pathname]);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(`(pointer: fine) and (not ${REDUCED_MOTION})`, () => {
      const el = ref.current!;
      const x = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' });
      const y = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' });
      let current: Element | null = null;

      const move = (event: PointerEvent) => {
        x(event.clientX);
        y(event.clientY);
        gsap.to(el, { autoAlpha: 1, duration: 0.3, overwrite: 'auto' });
        const target = (event.target as Element | null)?.closest('[data-cursor]') ?? null;
        if (target === current) return;
        current = target;
        const text = target?.getAttribute('data-cursor') ?? '';
        if (label.current) label.current.textContent = text;
        el.toggleAttribute('data-active', Boolean(text));
        gsap.to(el, { scale: text ? 1 : 0.18, duration: 0.5, ease: 'expo.out' });
      };
      const leave = () => gsap.to(el, { autoAlpha: 0, duration: 0.3 });
      reset.current = () => {
        current = null;
        if (label.current) label.current.textContent = '';
        el.removeAttribute('data-active');
        gsap.to(el, { scale: 0.18, duration: 0.4 });
      };

      gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0.18, autoAlpha: 0 });
      window.addEventListener('pointermove', move);
      document.documentElement.addEventListener('pointerleave', leave);
      return () => {
        window.removeEventListener('pointermove', move);
        document.documentElement.removeEventListener('pointerleave', leave);
      };
    });
    return () => mm.revert();
  });

  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <span ref={label} className="cursor__label" />
    </div>
  );
}
