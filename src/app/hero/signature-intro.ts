import { gsap } from 'gsap';

const sessionKey = 'carlos-editorial:signature-v1';
let played = false;

// Tiempos en segundos.
const fadeIn = 0.25;
const nameHold = 1.4;
const tailDuration = 0.3;
const flightDuration = 2;
const titleDelay = 0.08;

const tailStart = fadeIn + nameHold;
const flightStart = tailStart + tailDuration;
const landing = flightStart + flightDuration;
const titleReveal = landing + titleDelay;

export function playSignatureIntro(root: HTMLElement): (() => void) | undefined {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (played || motion.matches || window.scrollY > 0 || window.location.hash) {
    return;
  }

  try {
    if (sessionStorage.getItem(sessionKey)) return;
  } catch {
    // La variable played evita repetir la intro si el almacenamiento está bloqueado.
  }

  const overlay = root.querySelector<HTMLElement>('.signature-intro');
  const logo = root.querySelector<HTMLElement>('.brand-initials');
  const heading = root.querySelector<HTMLElement>('.hero h1');

  if (!overlay || !logo || !heading) return;

  const initials = Array.from(overlay.querySelectorAll<HTMLElement>('.signature-letter'));
  const targets = Array.from(logo.querySelectorAll<HTMLElement>('i'));
  const tails = Array.from(overlay.querySelectorAll<HTMLElement>('.signature-tail'));

  if (initials.length !== 2 || targets.length !== 2) return;

  overlay.hidden = false;

  played = true;

  try {
    sessionStorage.setItem(sessionKey, '1');
  } catch {
    // La intro puede continuar sin almacenamiento.
  }

  const listeners = new AbortController();
  const options = { passive: true, signal: listeners.signal };
  const initialWidth = window.innerWidth;
  const animation = gsap.timeline({ paused: true });
  const destinations: { x: number; y: number; scale: number }[] = [];
  let flightStarted = false;
  let finished = false;

  const showLogo = (): void => {
    overlay.hidden = true;
    logo.classList.remove('signature-in-flight');
  };

  const showTitle = (): void => {
    heading.classList.remove('signature-title-waiting');
  };

  const finish = (): void => {
    if (finished) return;

    finished = true;
    listeners.abort();
    animation.kill();

    showLogo();
    showTitle();

    gsap.set([overlay, ...initials, ...tails], {
      clearProps: 'transform,transformOrigin,opacity,color',
    });
  };

  logo.classList.add('signature-in-flight');
  heading.classList.add('signature-title-waiting');

  const measureFlight = (): void => {
    // La tipografía puede terminar de cargar mientras se muestra el nombre.
    const scale =
      parseFloat(getComputedStyle(logo).fontSize) /
      parseFloat(getComputedStyle(initials[0]).fontSize);
    for (const [index, letter] of initials.entries()) {
      const from = letter.getBoundingClientRect();
      const to = targets[index].getBoundingClientRect();
      if (!Number.isFinite(scale) || scale <= 0 || !from.width || !to.width) {
        finish();
        return;
      }

      destinations[index] = {
        x: to.left + (to.width - from.width) / 2 - from.left,
        y: to.top + (to.height - from.height) / 2 - from.top,
        scale,
      };
    }
    flightStarted = true;
  };

  animation
    .from(overlay, {
      opacity: 0,
      duration: fadeIn,
      ease: 'power1.out',
    })
    .to(
      tails,
      {
        yPercent: -105,
        opacity: 0,
        duration: tailDuration,
        ease: 'power2.in',
      },
      tailStart,
    )
    .call(measureFlight, [], flightStart)
    .to(
      initials,
      {
        x: (index: number) => destinations[index]?.x ?? 0,
        y: (index: number) => destinations[index]?.y ?? 0,
        scale: (index: number) => destinations[index]?.scale ?? 1,
        transformOrigin: '50% 50%',
        duration: flightDuration,
        ease: 'sine.inOut',
      },
      flightStart,
    )
    .to(
      initials,
      { color: getComputedStyle(logo).color, duration: 0.55, ease: 'sine.inOut' },
      landing - 0.55,
    )
    .call(showLogo, [], landing)
    .call(showTitle, [], titleReveal);

  animation.eventCallback('onComplete', finish);

  window.addEventListener(
    'scroll',
    () => {
      if (window.scrollY !== 0) finish();
    },
    options,
  );

  window.addEventListener(
    'resize',
    () => {
      if (window.innerWidth !== initialWidth || flightStarted) finish();
    },
    options,
  );

  window.addEventListener('pointerdown', finish, options);
  window.addEventListener('keydown', finish, options);
  root.ownerDocument.fonts?.addEventListener(
    'loadingdone',
    (event) => {
      if (flightStarted && event.fontfaces.some(({ family }) => family === 'Manrope')) finish();
    },
    options,
  );
  motion.addEventListener('change', finish, options);

  animation.play();
  return finish;
}
