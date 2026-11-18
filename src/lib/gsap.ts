import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText);
gsap.defaults({ ease: 'expo.out', duration: 1.1 });
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollSmoother, ScrollTrigger, SplitText, useGSAP };

/** Media query for visitors who asked the system to reduce motion. */
export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION).matches;

/**
 * Time (in seconds from now) at which a freshly mounted page may start its
 * entrance animations: after the intro on the first visit, or once the page
 * transition curtain has started to lift.
 */
let entryAt = 0;

export function setEntryDelay(seconds: number) {
  entryAt = performance.now() / 1000 + seconds;
}

export function entryDelay() {
  return Math.max(0, entryAt - performance.now() / 1000);
}
