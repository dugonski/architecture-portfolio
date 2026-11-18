import type { RefObject } from 'react';
import { entryDelay, gsap, REDUCED_MOTION, ScrollTrigger, SplitText, useGSAP } from './gsap';

/**
 * Declarative scroll animations for a page. Elements opt in with attributes:
 *
 * - `data-split="lines" | "chars" | "words"`: text revealed from a mask.
 * - `data-reveal="image"`: clip-path wipe with the inner image settling in.
 * - `data-reveal="fade"`: rises and fades in.
 * - `data-reveal="stagger"`: its children rise in one after another.
 * - `data-reveal="rule"`: a line drawn from left to right.
 * - `data-parallax`: taller than its frame, rises while scrolling past it.
 * - `data-hero`: animated on page entry instead of on scroll.
 * - `data-delay="0.2"`: extra delay in seconds.
 *
 * Everything is skipped when the visitor prefers reduced motion.
 */
export function usePageAnimations(scope: RefObject<HTMLElement | null>, dependencies: unknown[] = []) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add(`not ${REDUCED_MOTION}`, () => {
        const start = entryDelay();
        const trigger = (el: Element) =>
          el.hasAttribute('data-hero')
            ? undefined
            : // Plays once and stays. Not `once: true`: a trigger that kills itself while
              // another is being created (elements already in view) breaks ScrollTrigger.
              { trigger: el, start: 'top 88%', toggleActions: 'play none none none' };
        const delay = (el: Element) =>
          (el.hasAttribute('data-hero') ? start : 0) + Number(el.getAttribute('data-delay') ?? 0);

        root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
          const type = el.dataset.split as 'lines' | 'chars' | 'words';
          SplitText.create(el, {
            type: type === 'lines' ? 'lines' : `lines,${type}`,
            mask: 'lines',
            linesClass: 'split-line',
            autoSplit: true,
            onSplit(self) {
              const targets = type === 'chars' ? self.chars : type === 'words' ? self.words : self.lines;
              return gsap.from(targets, {
                yPercent: 115,
                rotate: type === 'chars' ? 4 : 0,
                duration: type === 'chars' ? 1.25 : 1.1,
                stagger: type === 'chars' ? 0.035 : type === 'words' ? 0.05 : 0.09,
                delay: delay(el),
                scrollTrigger: trigger(el),
              });
            },
          });
        });

        root.querySelectorAll<HTMLElement>('[data-reveal="image"]').forEach((el) => {
          const media = el.querySelector('[data-media]') ?? el.querySelector('img, video');
          const tl = gsap.timeline({ delay: delay(el), scrollTrigger: trigger(el) });
          tl.fromTo(
            el,
            { clipPath: 'inset(100% 0% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' },
          );
          if (media) tl.from(media, { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0.1);
        });

        // Parallax: an element taller than its frame (aligned to the frame's top)
        // rises by its extra height while the frame crosses the screen.
        root.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
          const frame = el.parentElement!;
          gsap.fromTo(
            el,
            { y: 0 },
            {
              y: () => frame.offsetHeight - el.offsetHeight,
              ease: 'none',
              scrollTrigger: {
                trigger: frame,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        });

        root.querySelectorAll<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
          gsap.from(el, { y: 40, autoAlpha: 0, delay: delay(el), scrollTrigger: trigger(el) });
        });

        root.querySelectorAll<HTMLElement>('[data-reveal="stagger"]').forEach((el) => {
          gsap.from(el.children, {
            y: 40,
            autoAlpha: 0,
            stagger: 0.08,
            delay: delay(el),
            scrollTrigger: trigger(el),
          });
        });

        root.querySelectorAll<HTMLElement>('[data-reveal="rule"]').forEach((el) => {
          gsap.from(el, {
            scaleX: 0,
            transformOrigin: 'left center',
            duration: 1.6,
            ease: 'expo.inOut',
            delay: delay(el),
            scrollTrigger: trigger(el),
          });
        });
      });

      // Images that load later change the page height.
      const refresh = () => ScrollTrigger.refresh();
      const images = [...root.querySelectorAll('img')].filter((img) => !img.complete);
      images.forEach((img) => img.addEventListener('load', refresh, { once: true }));

      return () => {
        images.forEach((img) => img.removeEventListener('load', refresh));
        mm.revert();
      };
    },
    { scope, dependencies },
  );
}
