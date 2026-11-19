import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { CareerTimeline } from './career-timeline';

describe('Career timeline navigation', () => {
  it('keeps all six original stages and supports buttons, keyboard and manual scrolling', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const fixture = TestBed.configureTestingModule({ imports: [CareerTimeline] }).createComponent(
      CareerTimeline,
    );
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const viewport = root.querySelector<HTMLElement>('.career-viewport')!;
    Object.defineProperty(viewport, 'clientWidth', { value: 600 });
    const scrollTo = vi.fn();
    viewport.scrollTo = scrollTo;
    expect(root.querySelectorAll('.career-step').length).toBe(6);
    const companies = Array.from(root.querySelectorAll('.step-company')).map(
      (el) => el.textContent,
    );
    expect(companies).toEqual([
      'Óptica y Audiología Universitaria',
      'Angel Eyes Eyewear',
      'Leroy Merlin',
      'Grupo Ametller',
      'Prometeo FP',
      'Capgemini',
    ]);
    expect(root.querySelector<HTMLButtonElement>('[aria-label="Etapa anterior"]')!.disabled).toBe(
      true,
    );
    root.querySelector<HTMLButtonElement>('[aria-label="Etapa siguiente"]')!.click();
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 600, behavior: 'instant' });
    viewport.scrollLeft = 1800;
    viewport.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(fixture.componentInstance.active()).toBe(3);
    expect(root.querySelectorAll('[aria-current="step"]').length).toBe(1);
    viewport.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 2400, behavior: 'instant' });
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    fixture.componentInstance.goTo(100);
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 3000, behavior: 'instant' });
    fixture.componentInstance.goTo(-1);
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'instant' });
    fixture.destroy();
    vi.unstubAllGlobals();
  });
  it('holds the timeline through all horizontal stages and supports reverse scrolling', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('min-width'),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const fixture = TestBed.configureTestingModule({ imports: [CareerTimeline] }).createComponent(
      CareerTimeline,
    );
    const root: HTMLElement = fixture.nativeElement;
    const shell = root.querySelector<HTMLElement>('.career-shell')!;
    Object.defineProperty(shell, 'offsetHeight', { value: 740 });
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(600);
    let top = 100;
    vi.spyOn(root, 'getBoundingClientRect').mockImplementation(() => ({
      top,
      bottom: top + 4000,
      height: 4000,
      width: 600,
      x: 0,
      y: top,
      left: 0,
      right: 600,
      toJSON() {},
    }));
    await fixture.whenStable();
    expect(root.classList.contains('is-enhanced')).toBe(true);
    expect(parseFloat(root.style.height)).toBe(3000 + 740 * 1.3);
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    fixture.componentInstance.goTo(5);
    expect(scrollTo).toHaveBeenCalledWith({ top: window.scrollY + 3100, behavior: 'smooth' });
    let queued: FrameRequestCallback | undefined;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      queued = callback;
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    top = -3000;
    window.dispatchEvent(new Event('scroll'));
    queued!(0);
    expect(root.querySelector<HTMLElement>('.career-track')!.style.transform).toBe(
      'translate3d(-3000px, 0, 0)',
    );
    expect(fixture.componentInstance.active()).toBe(5);
    top = -1200;
    window.dispatchEvent(new Event('scroll'));
    queued!(16);
    expect(fixture.componentInstance.active()).toBe(2);
    fixture.destroy();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
});
