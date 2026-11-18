import { useRef } from 'react';
import { gsap, REDUCED_MOTION, ScrollTrigger, useGSAP } from '../../lib/gsap';

interface MarqueeProps {
  items: string[];
  /** Seconds for one full loop at rest. */
  duration?: number;
}

/**
 * An endless band of words that speeds up with the scroll and turns around
 * when scrolling up.
 */
export function Marquee({ items, duration = 40 }: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED_MOTION}`, () => {
        const loop = gsap.to('.marquee__track', { xPercent: -50, ease: 'none', duration, repeat: -1 });
        let direction = 1;
        const trigger = ScrollTrigger.create({
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate(self) {
            if (self.direction !== direction) direction = self.direction;
            const boost = Math.min(Math.abs(self.getVelocity()) / 300, 6);
            gsap.to(loop, { timeScale: direction * (1 + boost), duration: 0.2, overwrite: true });
            gsap.to(loop, { timeScale: direction, duration: 1.2, delay: 0.2 });
          },
        });
        return () => {
          trigger.kill();
          loop.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [items.join('|')] },
  );

  const sequence = items.map((item) => (
    <span key={item} className="marquee__item">
      {item}
      <span className="marquee__dot" aria-hidden="true">
        ✦
      </span>
    </span>
  ));

  return (
    <div ref={ref} className="marquee" aria-label={items.join(', ')}>
      <div className="marquee__track" aria-hidden="true">
        <div className="marquee__group">{sequence}</div>
        <div className="marquee__group">{sequence}</div>
      </div>
    </div>
  );
}
