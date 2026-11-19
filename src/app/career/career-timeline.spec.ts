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
  it('pins a landscape tablet when the stages fit and supports reverse scrolling', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const fixture = TestBed.configureTestingModule({ imports: [CareerTimeline] }).createComponent(
      CareerTimeline,
    );
    const root: HTMLElement = fixture.nativeElement;
    const shell = root.querySelector<HTMLElement>('.career-shell')!;
    Object.defineProperty(shell, 'offsetHeight', { value: 600 });
    const viewport = root.querySelector<HTMLElement>('.career-viewport')!;
    Object.defineProperties(viewport, {
      clientWidth: { value: 768 },
      clientHeight: { value: 400 },
      scrollHeight: { value: 400 },
    });
    let top = 100;
    vi.spyOn(root, 'getBoundingClientRect').mockImplementation(() => ({
      top,
      bottom: top + 4000,
      height: 4000,
      width: 768,
      x: 0,
      y: top,
      left: 0,
      right: 768,
      toJSON() {},
    }));
    await fixture.whenStable();
    expect(root.classList.contains('is-enhanced')).toBe(true);
    expect(parseFloat(root.style.height)).toBe(3840 + 600 * 1.3);
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    fixture.componentInstance.goTo(5);
    expect(scrollTo).toHaveBeenCalledWith({ top: window.scrollY + 3940, behavior: 'smooth' });
    let queued: FrameRequestCallback | undefined;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      queued = callback;
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    top = -3840;
    window.dispatchEvent(new Event('scroll'));
    queued!(0);
    expect(root.querySelector<HTMLElement>('.career-track')!.style.transform).toBe(
      'translate3d(-3840px, 0, 0)',
    );
    expect(fixture.componentInstance.active()).toBe(5);
    top = -1536;
    window.dispatchEvent(new Event('scroll'));
    queued!(16);
    expect(fixture.componentInstance.active()).toBe(2);
    fixture.destroy();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
});
