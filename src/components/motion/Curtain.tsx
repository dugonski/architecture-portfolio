import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { site } from '../../data/site';
import { useI18n } from '../../i18n/context';
import { gsap, prefersReducedMotion, setEntryDelay, SplitText } from '../../lib/gsap';

const INTRO_KEY = 'portfolio.intro-seen';

/**
 * Intro on the first visit (a counter and the signature, like the cover of the
 * PDF) and a curtain that lifts between pages.
 */
export function Curtain() {
  const { l } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const name = useRef<HTMLParagraphElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const { pathname } = useLocation();
  const first = useRef(true);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 0 });
      return;
    }

    if (first.current) {
      first.current = false;
      let seen = false;
      try {
        seen = sessionStorage.getItem(INTRO_KEY) === '1';
        sessionStorage.setItem(INTRO_KEY, '1');
      } catch {
        // Storage unavailable: show the intro every time.
      }
      if (seen) {
        gsap.set(el, { autoAlpha: 0 });
        setEntryDelay(0.1);
        return;
      }

      // First visit: count to 100 while the signature rises, then lift.
      setEntryDelay(2.3);
      const split = SplitText.create(name.current!, { type: 'chars', mask: 'chars' });
      const count = { value: 0 };
      const tl = gsap.timeline();
      tl.set(el, { autoAlpha: 1, yPercent: 0 })
        .from(split.chars, { yPercent: 110, stagger: 0.05, duration: 1.1 }, 0.1)
        .to(
          count,
          {
            value: 100,
            duration: 1.6,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (counter.current) counter.current.textContent = String(Math.round(count.value)).padStart(3, '0');
            },
          },
          0,
        )
        .to(split.chars, { yPercent: -110, stagger: 0.03, duration: 0.6, ease: 'expo.in' }, 1.55)
        .to(el, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, 1.75)
        .set(el, { autoAlpha: 0 });
      return () => {
        tl.kill();
        split.revert();
      };
    }

    // Navigation: the curtain already covers the new page and lifts away.
    setEntryDelay(0.35);
    const tl = gsap.timeline();
    tl.set(el, { autoAlpha: 1, yPercent: 0 })
      .to(el, { yPercent: -100, duration: 0.9, ease: 'expo.inOut', delay: 0.05 })
      .set(el, { autoAlpha: 0 });
    return () => {
      tl.kill();
    };
  }, [pathname]);

  return (
    <div ref={ref} className="curtain" aria-hidden="true">
      <p ref={name} className="curtain__name display">
        {site.brand}
      </p>
      <p className="curtain__meta">
        <span>{l(site.role)}</span>
        <span ref={counter}>000</span>
      </p>
    </div>
  );
}
