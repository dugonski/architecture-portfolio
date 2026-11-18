import { useRef, type ReactNode } from 'react';
import { gsap, REDUCED_MOTION, useGSAP } from '../../lib/gsap';

interface MagneticProps {
  children: ReactNode;
  /** How far (0–1) the element follows the pointer. */
  strength?: number;
  className?: string;
}

/** Makes its content drift toward the pointer, then spring back. */
export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`(pointer: fine) and (not ${REDUCED_MOTION})`, () => {
        const el = ref.current!;
        const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        const move = (event: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          x((event.clientX - rect.left - rect.width / 2) * strength);
          y((event.clientY - rect.top - rect.height / 2) * strength);
        };
        const reset = () => {
          x(0);
          y(0);
        };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', reset);
        return () => {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerleave', reset);
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={className ? `magnetic ${className}` : 'magnetic'}>
      {children}
    </span>
  );
}
