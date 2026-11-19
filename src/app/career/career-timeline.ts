import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { CAREER_STEPS } from './career-steps';

const FINAL_PAUSE = 0.3;

@Component({
  selector: 'app-career-timeline',
  templateUrl: './career-timeline.html',
  styleUrl: './career-timeline.css',
})
export class CareerTimeline implements AfterViewInit, OnDestroy {
  readonly steps = CAREER_STEPS;
  readonly active = signal(0);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private readonly shellRef = viewChild.required<ElementRef<HTMLElement>>('shell');
  private readonly viewportRef = viewChild.required<ElementRef<HTMLElement>>('viewport');
  private readonly trackRef = viewChild.required<ElementRef<HTMLOListElement>>('track');
  private readonly panels = viewChildren<ElementRef<HTMLLIElement>>('panel');
  private readonly lastIndex = this.steps.length - 1;
  private reducedMotion?: MediaQueryList;
  private listeners?: AbortController;
  private distance = 0;
  private frame = 0;
  private pinned = false;

  private get viewport(): HTMLElement {
    return this.viewportRef().nativeElement;
  }

  private get track(): HTMLOListElement {
    return this.trackRef().nativeElement;
  }

  goTo(index: number): void {
    const target = this.clampIndex(index);
    const behavior = this.reducedMotion?.matches ? 'instant' : 'smooth';

    if (this.pinned) {
      const sectionTop = window.scrollY + this.host.getBoundingClientRect().top;
      window.scrollTo({ top: sectionTop + (this.distance * target) / this.lastIndex, behavior });
    } else {
      this.viewport.scrollTo({ left: this.viewport.clientWidth * target, behavior });
    }
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
      const listeners = new AbortController();
      const options = { passive: true, signal: listeners.signal };

      this.reducedMotion = reducedMotion;
      this.listeners = listeners;
      window.addEventListener('scroll', this.scheduleRender, options);
      window.addEventListener('resize', this.measure, options);
      this.viewport.addEventListener('scroll', this.syncNativeScroll, options);
      document.fonts?.addEventListener('loadingdone', this.measure, options);
      reducedMotion.addEventListener('change', this.measure, { signal: listeners.signal });
      this.measure();
    });
  }

  ngOnDestroy(): void {
    this.listeners?.abort();
    cancelAnimationFrame(this.frame);
  }

  private clampIndex(index: number): number {
    return Math.max(0, Math.min(this.lastIndex, index));
  }

  private setActive(index: number): void {
    if (this.active() !== index) {
      this.zone.run(() => this.active.set(index));
    }
  }

  private readonly scheduleRender = (): void => {
    if (this.pinned && !this.frame) {
      this.frame = requestAnimationFrame(this.render);
    }
  };

  private readonly render = (): void => {
    this.frame = 0;
    if (!this.pinned) return;

    const progress = Math.max(
      0,
      Math.min(1, -this.host.getBoundingClientRect().top / this.distance),
    );
    const currentStep = progress * this.lastIndex;
    this.track.style.transform = `translate3d(${-progress * this.distance}px, 0, 0)`;
    this.setActive(Math.round(currentStep));

    this.panels().forEach(({ nativeElement }, index) => {
      const incoming = Math.max(0, Math.min(1, index - currentStep));
      nativeElement.style.setProperty('--chapter-enter', String(incoming));
    });
  };

  private readonly measure = (): void => {
    this.pinned = !this.reducedMotion?.matches;
    this.host.classList.toggle('is-enhanced', this.pinned);
    // Use native scrolling whenever a stage would be clipped in the sticky viewport.
    if (this.pinned && this.viewport.scrollHeight > this.viewport.clientHeight) {
      this.pinned = false;
      this.host.classList.remove('is-enhanced');
    }
    this.distance = Math.max(1, this.viewport.clientWidth * this.lastIndex);
    cancelAnimationFrame(this.frame);

    if (this.pinned) {
      // Reserve the horizontal travel plus a pause after the last stage.
      const viewportHeight = this.shellRef().nativeElement.offsetHeight;
      this.host.style.height = `${viewportHeight + this.distance + viewportHeight * FINAL_PAUSE}px`;
      this.viewport.scrollLeft = 0;
    } else {
      this.host.style.removeProperty('height');
      this.track.style.removeProperty('transform');
      this.panels().forEach(({ nativeElement }) =>
        nativeElement.style.removeProperty('--chapter-enter'),
      );
      this.viewport.scrollLeft = this.active() * this.viewport.clientWidth;
    }

    this.frame = 0;
    this.render();
  };

  private readonly syncNativeScroll = (): void => {
    if (this.pinned) return;

    const index = Math.round(this.viewport.scrollLeft / (this.viewport.clientWidth || 1));
    this.setActive(this.clampIndex(index));
  };
}
