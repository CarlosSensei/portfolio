import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { App } from './app';

describe('Portfolio project navigation', () => {
  it('opens the requested project and closes it without losing its identity', () => {
    const app = TestBed.configureTestingModule({ imports: [App] }).createComponent(
      App,
    ).componentInstance;
    for (const project of app.projects) {
      app.openProject(project.name);
      expect(app.selectedProject()).toBe(project);
      app.closeProject();
      expect(app.selectedProject()).toBeNull();
    }
  });

  it('keeps focus inside the project dialog and returns it to the opener on Escape', async () => {
    const fixture = TestBed.configureTestingModule({ imports: [App] }).createComponent(App);
    const root: HTMLElement = fixture.nativeElement;
    class ObserverStub {
      observe() {}
      disconnect() {}
    }

    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal('ResizeObserver', ObserverStub);
    vi.stubGlobal('IntersectionObserver', ObserverStub);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    try {
      await fixture.whenStable();
      const opener = root.querySelector<HTMLButtonElement>('#proyecto-02 .chapter-art')!;
      opener.focus();
      opener.click();
      await fixture.whenStable();

      const dialog = root.querySelector<HTMLElement>('[role="dialog"]')!;
      const closeButton = dialog.querySelector('button')!;
      const demo = dialog.querySelector<HTMLAnchorElement>('.dialog-links a:last-child')!;
      expect(dialog.querySelector('h2')?.textContent).toBe('NOVA');
      expect(document.activeElement).toBe(closeButton);

      closeButton.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
      );
      expect(document.activeElement).toBe(demo);

      demo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await fixture.whenStable();
      expect(root.querySelector('[role="dialog"]')).toBeNull();
      expect(document.activeElement).toBe(opener);
    } finally {
      fixture.destroy();
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    }
  });
});
