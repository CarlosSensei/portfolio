import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { Project } from './projects';

@Component({
  selector: 'app-experience-showcase',
  templateUrl: './experience-showcase.html',
  styleUrl: './experience-showcase.css',
})
export class ExperienceShowcase implements AfterViewInit, OnDestroy {
  readonly projects = input.required<readonly Project[]>();
  readonly projectOpened = output<string>();
  protected readonly projectCount = computed(() =>
    this.projects().length.toString().padStart(2, '0'),
  );

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private stopStack?: () => void;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      const chapters = this.host.querySelectorAll<HTMLElement>('.project-chapter');
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
      const listeners = new AbortController();

      const measure = (): void => {
        this.host.classList.toggle('has-stack', !reducedMotion.matches);
        chapters.forEach((chapter) => {
          // Tall chapters scroll fully before sticking, including on mobile.
          const stickyTop = Math.min(0, window.innerHeight - chapter.offsetHeight);
          chapter.style.setProperty('--stack-top', `${stickyTop}px`);
        });
      };

      window.addEventListener('resize', measure, { passive: true, signal: listeners.signal });
      reducedMotion.addEventListener('change', measure, { signal: listeners.signal });
      const observer =
        typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
      chapters.forEach((chapter) => observer?.observe(chapter));
      measure();

      this.stopStack = () => {
        listeners.abort();
        observer?.disconnect();
        this.host.classList.remove('has-stack');
        chapters.forEach((chapter) => chapter.style.removeProperty('--stack-top'));
      };
    });
  }

  ngOnDestroy(): void {
    this.stopStack?.();
  }
}
