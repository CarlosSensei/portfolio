import {
  AfterViewInit,
  Component,
  DOCUMENT,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Profile } from './profile/profile';
import { HeroVisual } from './hero/hero-visual';
import { setupPageMotion, setupPointerCursor } from './page-motion';
import { ExperienceShowcase } from './projects/experience-showcase';
import { ProjectDialog } from './projects/project-dialog';
import { PROJECTS, Project } from './projects/projects';

@Component({
  selector: 'app-root',
  imports: [HeroVisual, ExperienceShowcase, Profile, ProjectDialog],
  templateUrl: './app.html',
  host: { '(window:keydown.escape)': 'closeOverlays()' },
})
export class App implements AfterViewInit, OnDestroy {
  protected readonly menuOpen = signal(false);
  readonly selectedProject = signal<Project | null>(null);
  readonly projects = PROJECTS;
  protected readonly projectCount = PROJECTS.length.toString().padStart(2, '0');
  protected readonly year = new Date().getFullYear();

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly cursor = viewChild.required<ElementRef<HTMLElement>>('cursor');
  private stopMotion?: () => void;
  private stopCursor?: () => void;
  private returnFocus?: HTMLElement;

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  openProject(name: string): void {
    const project = this.projects.find((candidate) => candidate.name === name);
    if (!project) return;

    const activeElement = this.document.activeElement;
    this.returnFocus = activeElement instanceof HTMLElement ? activeElement : undefined;
    this.selectedProject.set(project);
  }

  closeProject(): void {
    this.selectedProject.set(null);
    this.returnFocus?.focus();
    this.returnFocus = undefined;
  }

  protected closeOverlays(): void {
    this.closeMenu();
    this.closeProject();
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.stopMotion = setupPageMotion(this.host.nativeElement);
      this.stopCursor = setupPointerCursor(this.cursor().nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.stopMotion?.();
    this.stopCursor?.();
  }
}
