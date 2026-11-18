import { vi, afterEach, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ExperienceShowcase } from './experience-showcase';

describe('Project chapters', () => {
  let changePreference: () => void;
  let reduced: boolean;
  beforeEach(() => {
    reduced = false;
    vi.stubGlobal('matchMedia', () => ({
      get matches() {
        return reduced;
      },
      addEventListener: (_: string, callback: () => void) => {
        changePreference = callback;
      },
      removeEventListener: vi.fn(),
    }));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  it('shows each project once, with working index, next-project links and the correct preview action', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [ExperienceShowcase],
    }).createComponent(ExperienceShowcase);
    const projects = [
      {
        name: 'OptiFlow',
        number: '01',
        type: 'Producto',
        image: 'crm-project.jpg',
        tags: 'Angular / Spring Boot',
        color: '#cbd2b5',
        description: 'CRM de óptica',
        github: 'https://github.com/example/crm',
        demo: '',
      },
      {
        name: 'NOVA',
        number: '02',
        type: 'Experiencia',
        image: 'ecommerce.jpg',
        tags: 'Angular / GSAP',
        color: '#c2b7d5',
        description: 'E-commerce',
        github: 'https://github.com/example/nova',
        demo: 'https://example.com/nova',
      },
    ];
    fixture.componentRef.setInput('projects', projects);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const opened: string[] = [];
    fixture.componentInstance.projectOpened.subscribe((name) => opened.push(name));
    expect(root.querySelectorAll('.project-chapter').length).toBe(projects.length);
    for (const project of projects) {
      expect(
        root.querySelector('.project-index a[href="#proyecto-' + project.number + '"]'),
      ).not.toBeNull();
      const chapter = root.querySelector<HTMLElement>('#proyecto-' + project.number)!;
      expect(chapter.querySelector('h3')?.textContent).toBe(project.name);
      chapter.querySelector<HTMLButtonElement>('.chapter-art')!.click();
      chapter.querySelector<HTMLButtonElement>('.chapter-links button')!.click();
    }
    expect(opened).toEqual(['OptiFlow', 'OptiFlow', 'NOVA', 'NOVA']);
    expect(root.querySelector('#proyecto-01 .chapter-footer a')?.getAttribute('href')).toBe(
      '#proyecto-02',
    );
    expect(root.querySelector('#proyecto-02 .chapter-footer a')?.getAttribute('href')).toBe(
      '#contacto',
    );
    expect(root.querySelector('#proyecto-01 .chapter-links a')?.getAttribute('href')).toBe(
      projects[0].github,
    );
    expect(root.querySelector('#proyecto-02 .chapter-links a')?.getAttribute('href')).toBe(
      projects[1].demo,
    );
    expect(root.classList.contains('has-stack')).toBe(true);
    const chapter = root.querySelector<HTMLElement>('.project-chapter')!;
    Object.defineProperty(chapter, 'offsetHeight', { value: window.innerHeight + 200 });
    window.dispatchEvent(new Event('resize'));
    expect(chapter.style.getPropertyValue('--stack-top')).toBe('-200px');
    reduced = true;
    changePreference();
    expect(root.classList.contains('has-stack')).toBe(false);
    fixture.destroy();
  });
});
