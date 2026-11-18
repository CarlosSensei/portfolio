import { HERO_FLUID, HeroFluid } from './hero-fluid';

type Dot = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  highlight: number;
};

const BASE_COLOR = [190, 66, 43] as const;
const FRAME_STEP = 1 / 60;

export class HeroDots {
  private readonly dots: Dot[] = [];
  private fluid = new HeroFluid(0, 0);
  private width = 0;
  private height = 0;
  private time = 0;
  private hovering = false;
  private pointerX = 0;
  private pointerY = 0;
  private smoothX = 0;
  private smoothY = 0;

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.dots.length = 0;
    this.fluid = new HeroFluid(width, height);
    const spacing = width < 600 ? 22 : 27;
    for (let y = spacing / 2; y < height; y += spacing) {
      for (let x = spacing / 2; x < width; x += spacing) {
        this.dots.push({ x, y, dx: 0, dy: 0, highlight: 0 });
      }
    }
  }

  movePointer(x: number, y: number): void {
    this.pointerX = Math.max(0, Math.min(this.width, x));
    this.pointerY = Math.max(0, Math.min(this.height, y));
    if (!this.hovering) {
      this.smoothX = this.pointerX;
      this.smoothY = this.pointerY;
    }
    this.hovering = true;
  }

  leavePointer(): void {
    this.hovering = false;
  }

  reset(): void {
    this.time = 0;
    this.hovering = false;
    this.fluid = new HeroFluid(this.width, this.height);
    for (const dot of this.dots) {
      dot.dx = 0;
      dot.dy = 0;
      dot.highlight = 0;
    }
  }

  advance(delta: number): void {
    this.time += delta;
    // Substeps keep motion stable across display refresh rates.
    const steps = Math.ceil(delta / FRAME_STEP);
    for (let step = 0; step < steps; step++) {
      this.advanceStep(delta / steps);
    }
  }

  private advanceStep(dt: number): void {
    const previousX = this.smoothX;
    const previousY = this.smoothY;
    const easing = 1 - Math.exp(-dt * HERO_FLUID.pointerSmoothing);
    this.smoothX += (this.pointerX - this.smoothX) * easing;
    this.smoothY += (this.pointerY - this.smoothY) * easing;

    const segmentX = this.smoothX - previousX;
    const segmentY = this.smoothY - previousY;
    if (this.hovering) {
      this.stirAlongPointer(previousX, previousY, segmentX, segmentY, dt);
    }
    this.fluid.step(dt);

    const relax = Math.exp(-HERO_FLUID.returnSpeed * dt);
    const segmentLengthSquared = segmentX * segmentX + segmentY * segmentY;
    for (const dot of this.dots) {
      const [vx, vy] = this.fluid.velocity(dot.x + dot.dx, dot.y + dot.dy);
      const dx = dot.dx * relax + vx * dt;
      const dy = dot.dy * relax + vy * dt;
      const displacement = Math.hypot(dx, dy);
      const maximum = HERO_FLUID.maxDisplacement;
      // Limit the displacement smoothly so the grid has no hard edges.
      const limit = displacement ? (maximum * Math.tanh(displacement / maximum)) / displacement : 1;
      dot.dx = dx * limit;
      dot.dy = dy * limit;

      // Highlight dots along the entire path, including during quick movement.
      const relativeX = dot.x + dot.dx - previousX;
      const relativeY = dot.y + dot.dy - previousY;
      const along = segmentLengthSquared
        ? Math.max(
            0,
            Math.min(1, (relativeX * segmentX + relativeY * segmentY) / segmentLengthSquared),
          )
        : 0;
      const distanceX = dot.x + dot.dx - (previousX + segmentX * along);
      const distanceY = dot.y + dot.dy - (previousY + segmentY * along);
      const target = this.hovering
        ? Math.exp(-(distanceX ** 2 + distanceY ** 2) / HERO_FLUID.hoverRadius ** 2)
        : 0;
      const fade = target > dot.highlight ? 18 : HERO_FLUID.hoverFade;
      dot.highlight += (target - dot.highlight) * (1 - Math.exp(-fade * dt));
    }
  }

  private stirAlongPointer(
    x: number,
    y: number,
    segmentX: number,
    segmentY: number,
    dt: number,
  ): void {
    const vx = segmentX / dt;
    const vy = segmentY / dt;
    const limit = Math.min(1, HERO_FLUID.maxPointerSpeed / (Math.hypot(vx, vy) || 1));
    const samples = Math.max(
      1,
      Math.ceil(Math.hypot(segmentX, segmentY) / (HERO_FLUID.radius * 0.4)),
    );
    for (let sample = 1; sample <= samples; sample++) {
      this.fluid.stir(
        x + (segmentX * sample) / samples,
        y + (segmentY * sample) / samples,
        vx * limit,
        vy * limit,
        dt / samples,
      );
    }
  }

  draw(context: CanvasRenderingContext2D): void {
    const { width, height, time } = this;
    if (!width || !height) return;

    context.clearRect(0, 0, width, height);
    const spread = Math.min(width, height) * 0.28;
    // Three drifting centres control the density of the grid.
    const lobes = [
      [
        width * (0.69 + 0.14 * Math.sin(time * 0.32)),
        height * (0.39 + 0.15 * Math.cos(time * 0.27)),
      ],
      [
        width * (0.48 + 0.17 * Math.cos(time * 0.23)),
        height * (0.56 + 0.16 * Math.sin(time * 0.35)),
      ],
      [
        width * (0.83 + 0.08 * Math.sin(time * 0.41)),
        height * (0.65 + 0.13 * Math.cos(time * 0.31)),
      ],
    ];

    for (const { x, y, dx, dy, highlight } of this.dots) {
      let density = 0;
      for (const [centerX, centerY] of lobes) {
        density += Math.exp(-((x - centerX) ** 2 + (y - centerY) ** 2) / (2 * spread ** 2)) * 0.46;
      }
      density = Math.min(1, density);

      const energy = Math.min(1, Math.hypot(dx, dy) / HERO_FLUID.maxDisplacement);
      const radius =
        0.55 +
        density ** 2 * 2.7 +
        energy * HERO_FLUID.pointGrowth +
        highlight * HERO_FLUID.hoverGrowth;
      const color = BASE_COLOR.map((channel, index) =>
        Math.round(channel + (HERO_FLUID.hoverColor[index] - channel) * highlight),
      );
      const opacity = Math.min(
        0.95,
        0.09 + density * 0.29 + energy * 0.12 + highlight * HERO_FLUID.hoverIntensity,
      );
      context.beginPath();
      context.arc(x + dx, y + dy, radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${color.join(',')}, ${opacity})`;
      context.fill();
    }
  }
}
