import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { playSignatureIntro } from './hero/signature-intro';

export function setupPageMotion(root: HTMLElement): () => void {
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia(root);

  const stopSignature = playSignatureIntro(root);

  media.add('(prefers-reduced-motion: no-preference)', () => {
    if (!stopSignature) {
      gsap.from('.hero h1 > span', {
        yPercent: 110,
        stagger: 0.12,
        duration: 1.2,
        ease: 'power4.out',
      });
    }
    gsap.to('.hero-bottom', {
      y: -60,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    });
    root.querySelectorAll('.reveal').forEach((element) => {
      gsap.from(element, {
        y: 55,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: { trigger: element, start: 'top 92%', once: true },
      });
    });
  });

  return () => {
    stopSignature?.();
    media.revert();
  };
}

export function setupPointerCursor(cursor: HTMLElement): () => void {
  const listeners = new AbortController();
  if (matchMedia('(pointer: fine)').matches) {
    window.addEventListener(
      'pointermove',
      (event) => {
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
        const target = event.target;
        cursor.classList.toggle(
          'active',
          target instanceof Element && !!target.closest('a, button'),
        );
      },
      { signal: listeners.signal },
    );
  }
  return () => listeners.abort();
}
