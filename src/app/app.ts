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
import { setupFloatingMenuTone, setupPageMotion, setupPointerCursor } from './page-motion';
import { ExperienceShowcase } from './projects/experience-showcase';
import { ProjectDialog } from './projects/project-dialog';
import { PROJECTS, Project } from './projects/projects';

@Component({
  selector: 'app-root',
  imports: [HeroVisual, ExperienceShowcase, Profile, ProjectDialog],
  templateUrl: './app.html',
  host: { '(window:keydown.escape)': 'closeProject()' },
})
export class App implements AfterViewInit, OnDestroy {
  protected readonly menuOpen = signal(false);
  protected readonly headerPassed = signal(false);
  readonly selectedProject = signal<Project | null>(null);
  readonly projects = PROJECTS;
  protected readonly projectCount = PROJECTS.length.toString().padStart(2, '0');
  protected readonly year = new Date().getFullYear();
  protected readonly sections = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'trabajo', label: 'Trabajo' },
    { id: 'perfil', label: 'Perfil' },
    { id: 'enfoque', label: 'Cómo pienso' },
    { id: 'contacto', label: 'Contacto' },
  ];
  protected readonly contactLinks = [
    { label: 'hola@carloshorrillo.com', href: 'mailto:hola@carloshorrillo.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/carlos-horrillo', external: true },
    { label: 'GitHub', href: 'https://github.com/CarlosSensei', external: true },
  ];

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly cursor = viewChild.required<ElementRef<HTMLElement>>('cursor');
  private readonly header = viewChild.required<ElementRef<HTMLElement>>('header');
  private readonly headerToggle = viewChild.required<ElementRef<HTMLButtonElement>>('headerToggle');
  private readonly menu = viewChild.required<ElementRef<HTMLDialogElement>>('menu');
  private readonly menuPanel = viewChild.required<ElementRef<HTMLElement>>('menuPanel');
  private readonly floatingToggle =
    viewChild.required<ElementRef<HTMLButtonElement>>('floatingToggle');
  private headerObserver?: IntersectionObserver;
  private stopMenuTone?: () => void;
  private stopMotion?: () => void;
  private stopCursor?: () => void;
  private returnFocus?: HTMLElement;

  protected openMenu(opener: HTMLButtonElement): void {
    const menu = this.menu().nativeElement;
    opener.focus({ preventScroll: true });
    menu.showModal();
    this.menuPanel().nativeElement.scrollTop = 0;
    this.menuOpen.set(true);
  }

  protected closeMenu(event?: Event): void {
    event?.preventDefault();
    this.menu().nativeElement.close();
    this.menuOpen.set(false);
  }

  protected followMenuLink(event: MouseEvent, id: string): void {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    this.closeMenu();
    this.document.getElementById(id)?.focus({ preventScroll: true });
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

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.headerObserver = new IntersectionObserver(([entry]) => {
        this.headerPassed.set(entry.boundingClientRect.bottom <= 0);
      });
      this.headerObserver.observe(this.header().nativeElement);
      this.stopMenuTone = setupFloatingMenuTone(
        this.host.nativeElement,
        this.floatingToggle().nativeElement,
        this.headerToggle().nativeElement,
      );
      this.stopMotion = setupPageMotion(this.host.nativeElement);
      this.stopCursor = setupPointerCursor(this.cursor().nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.headerObserver?.disconnect();
    this.stopMenuTone?.();
    this.stopMotion?.();
    this.stopCursor?.();
  }
}
