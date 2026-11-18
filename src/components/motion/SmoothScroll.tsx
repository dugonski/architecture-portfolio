import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, REDUCED_MOTION, ScrollSmoother, ScrollTrigger, useGSAP } from '../../lib/gsap';

interface SmoothScrollProps {
  children: ReactNode;
  /** Fixed header that hides on scroll down and returns on scroll up. */
  header: React.RefObject<HTMLElement | null>;
  /** Thin bar showing how far the page has been read. */
  progress: React.RefObject<HTMLElement | null>;
}

/**
 * Smooths scrolling (desktop, motion allowed) and enables `data-speed` /
 * `data-lag` parallax on any element of the page.
 */
export function SmoothScroll({ children, header, progress }: SmoothScrollProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const { pathname, hash } = useLocation();

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(`(pointer: fine) and (not ${REDUCED_MOTION})`, () => {
      ScrollSmoother.create({
        wrapper: wrapper.current!,
        content: content.current!,
        smooth: 1.15,
        effects: true,
        smoothTouch: false,
      });
    });

    // Header: hidden while scrolling down past the top, shown on the way up.
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        const hide = self.direction === 1 && self.scroll() > 120;
        gsap.to(header.current, { yPercent: hide ? -100 : 0, duration: 0.6, ease: 'power3.out', overwrite: true });
        header.current?.toggleAttribute('data-scrolled', self.scroll() > 40);
      },
    });

    gsap.to(progress.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
    });

    return () => mm.revert();
  });

  // On navigation: back to the top (or to the hash target). The new page's
  // triggers are measured right after, and that refresh restores the previous
  // scroll position, so the jump is repeated once it has run (the page
  // transition curtain still covers the screen).
  useEffect(() => {
    const go = () => {
      const smoother = ScrollSmoother.get();
      const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      if (smoother) smoother.scrollTo(target ?? 0, false, target ? 'top 80px' : undefined);
      else if (target) target.scrollIntoView();
      else window.scrollTo(0, 0);
    };
    go();
    gsap.set(header.current, { yPercent: 0 });
    const id = window.setTimeout(() => {
      ScrollTrigger.refresh();
      go();
    }, 120);
    return () => window.clearTimeout(id);
  }, [pathname, hash, header]);

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content" ref={content}>
        {children}
      </div>
    </div>
  );
}
