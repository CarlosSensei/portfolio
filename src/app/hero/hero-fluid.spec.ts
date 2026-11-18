import { HeroFluid } from './hero-fluid';

function energy(fluid: HeroFluid) {
  let total = 0;
  for (let y = 0; y <= fluid.height; y += 18) {
    for (let x = 0; x <= fluid.width; x += 18) {
      const [u, v] = fluid.velocity(x, y);
      expect(Number.isFinite(u) && Number.isFinite(v)).toBe(true);
      total += u * u + v * v;
    }
  }
  return total;
}

describe('Hero fluid', () => {
  it('stays still without mouse movement', () => {
    const fluid = new HeroFluid(360, 240);
    fluid.stir(180, 120, 0, 0, 1 / 60);
    for (let i = 0; i < 60; i++) fluid.step(1 / 60);
    expect(energy(fluid)).toBe(0);
  });

  it('keeps the initial impulse local and dissipates it after the mouse stops', () => {
    const fluid = new HeroFluid(720, 480);
    fluid.stir(360, 240, 800, 150, 1 / 60);
    expect(Math.hypot(...fluid.velocity(360, 240))).toBeGreaterThan(1);
    expect(Math.hypot(...fluid.velocity(36, 36))).toBeLessThan(0.01);
    fluid.step(1 / 60);
    const initial = energy(fluid);
    for (let i = 0; i < 240; i++) fluid.step(1 / 60);
    expect(energy(fluid)).toBeLessThan(initial * 0.01);
  });

  it('remains finite under repeated fast changes of direction and at the edges', () => {
    const fluid = new HeroFluid(360, 240);
    for (let i = 0; i < 180; i++) {
      fluid.stir(i % 2 ? 10 : 350, 120, i % 2 ? -1400 : 1400, 600, 1 / 60);
      fluid.step(1 / 60);
    }
    expect(energy(fluid)).toBeGreaterThan(0);
    expect(fluid.velocity(-100, -100).every(Number.isFinite)).toBe(true);
    expect(fluid.velocity(1000, 1000).every(Number.isFinite)).toBe(true);
  });
});
