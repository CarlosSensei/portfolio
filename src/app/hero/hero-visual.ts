import {
  AfterViewInit,
  Component,
  DOCUMENT,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  viewChild,
} from '@angular/core';
import { HeroDots } from './hero-dots';

@Component({
  selector: 'app-hero-visual',
  template: '<canvas #canvas aria-hidden="true"></canvas>',
  styleUrl: './hero-visual.css',
  host: { 'aria-hidden': 'true' },
})
export class HeroVisual implements AfterViewInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private stop?: () => void;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.stop = this.startAnimation(this.canvasRef().nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.stop?.();
  }

  private startAnimation(canvas: HTMLCanvasElement): () => void {
    const hero = this.host.parentElement!;
    const context = canvas.getContext('2d');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = matchMedia('(pointer: fine)');
    const listeners = new AbortController();
    const dots = new HeroDots();
    let frame = 0;
    let lastTime = 0;
    let visible = true;

    const canAnimate = () => visible && !this.document.hidden && !reducedMotion.matches;

    const draw = () => {
      if (context) dots.draw(context);
    };

    const animate = (now: number): void => {
      frame = 0;
      const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 1 / 60;
      lastTime = now;
      dots.advance(delta);
      draw();
      if (canAnimate()) frame = requestAnimationFrame(animate);
    };

    const syncMotion = (): void => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      if (reducedMotion.matches) {
        dots.reset();
        draw();
      } else if (canAnimate()) {
        frame = requestAnimationFrame(animate);
      }
    };

    const resize = (): void => {
      const { width, height } = this.host.getBoundingClientRect();
      dots.resize(width, height);
      const pixelRatio = Math.min(devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      draw();
    };

    const movePointer = (event: PointerEvent): void => {
      if (!finePointer.matches || reducedMotion.matches || event.pointerType === 'touch') return;
      const { left, top } = this.host.getBoundingClientRect();
      dots.movePointer(event.clientX - left, event.clientY - top);
    };

    const leavePointer = () => dots.leavePointer();
    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncMotion();
    });

    resizeObserver.observe(this.host);
    intersectionObserver.observe(hero);
    const options = { signal: listeners.signal };
    hero.addEventListener('pointermove', movePointer, { ...options, passive: true });
    hero.addEventListener('pointerleave', leavePointer, options);
    hero.addEventListener('pointercancel', leavePointer, options);
    reducedMotion.addEventListener('change', syncMotion, options);
    this.document.addEventListener('visibilitychange', syncMotion, options);
    resize();
    syncMotion();

    return () => {
      visible = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      listeners.abort();
    };
  }
}
