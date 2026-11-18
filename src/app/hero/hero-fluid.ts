/** Ajustes del agua de la portada. Distancias en píxeles, tiempos en segundos. */
export const HERO_FLUID = {
  radius: 46, // Radio del pincel: menor = remolino más localizado.
  force: 0.28, // Impulso del ratón sobre el agua.
  swirl: 0.65, // Giro a ambos lados de la estela.
  pointerSmoothing: 16, // Seguimiento: menor = más inercia del ratón.
  damping: 1.8, // Pérdida de velocidad: mayor = se calma antes.
  returnSpeed: 2.6, // Rapidez con la que los puntos vuelven a la retícula.
  maxDisplacement: 24, // Desplazamiento máximo, sin cortes bruscos.
  maxPointerSpeed: 1400, // Limita el impulso de movimientos rápidos.
  cellSize: 18, // Resolución: menor = más detalle y más coste.
  pressureIterations: 18, // Iteraciones que mantienen el flujo sin compresión.
  hoverRadius: 72, // Alcance del rojo alrededor del ratón, en píxeles.
  hoverIntensity: 0.55, // Opacidad adicional de los puntos iluminados.
  hoverColor: [245, 40, 24] as const, // Rojo vivo en RGB.
  hoverGrowth: 0.7, // Crecimiento adicional durante el hover, en píxeles.
  hoverFade: 3.2, // Mayor = la estela de color se desvanece antes.
  pointGrowth: 0.45, // Aumento sutil del tamaño de los puntos en movimiento.
};

/** Campo de velocidad: advección semi-lagrangiana y proyección de presión. */
export class HeroFluid {
  readonly columns: number;
  readonly rows: number;
  private u: Float32Array;
  private v: Float32Array;
  private nextU: Float32Array;
  private nextV: Float32Array;
  private pressure: Float32Array;
  private nextPressure: Float32Array;
  private divergence: Float32Array;

  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.columns = Math.max(3, Math.ceil(width / HERO_FLUID.cellSize) + 1);
    this.rows = Math.max(3, Math.ceil(height / HERO_FLUID.cellSize) + 1);
    const size = this.columns * this.rows;
    this.u = new Float32Array(size);
    this.v = new Float32Array(size);
    this.nextU = new Float32Array(size);
    this.nextV = new Float32Array(size);
    this.pressure = new Float32Array(size);
    this.nextPressure = new Float32Array(size);
    this.divergence = new Float32Array(size);
  }

  private sample(field: Float32Array, x: number, y: number) {
    x = Math.max(0, Math.min(this.columns - 1.001, x));
    y = Math.max(0, Math.min(this.rows - 1.001, y));
    const left = Math.floor(x),
      top = Math.floor(y),
      tx = x - left,
      ty = y - top;
    const i = top * this.columns + left;
    return (
      (field[i] * (1 - tx) + field[i + 1] * tx) * (1 - ty) +
      (field[i + this.columns] * (1 - tx) + field[i + this.columns + 1] * tx) * ty
    );
  }

  velocity(x: number, y: number): [number, number] {
    return [
      this.sample(this.u, x / HERO_FLUID.cellSize, y / HERO_FLUID.cellSize),
      this.sample(this.v, x / HERO_FLUID.cellSize, y / HERO_FLUID.cellSize),
    ];
  }

  stir(x: number, y: number, vx: number, vy: number, dt: number) {
    const { radius, cellSize, force, swirl } = HERO_FLUID;
    const blend = 1 - Math.exp(-18 * dt);
    const speed = Math.hypot(vx, vy);
    if (speed < 1) return;
    const nx = -vy / speed,
      ny = vx / speed;
    const extent = Math.ceil((radius * 2.5) / cellSize);
    const cx = Math.round(x / cellSize),
      cy = Math.round(y / cellSize);
    for (let row = Math.max(1, cy - extent); row < Math.min(this.rows - 1, cy + extent); row++) {
      for (
        let col = Math.max(1, cx - extent);
        col < Math.min(this.columns - 1, cx + extent);
        col++
      ) {
        const dx = col * cellSize - x,
          dy = row * cellSize - y;
        const weight = Math.exp(-(dx * dx + dy * dy) / (radius * radius));
        // Opposite rotation on each side produces a pair of trailing eddies.
        const side = (dx * nx + dy * ny) / radius;
        const curl = side * swirl;
        const i = row * this.columns + col;
        this.u[i] += (vx - (dy / radius) * speed * curl) * force * weight * blend;
        this.v[i] += (vy + (dx / radius) * speed * curl) * force * weight * blend;
      }
    }
  }

  step(dt: number): void {
    this.advect(dt);
    this.projectPressure();
  }

  private advect(dt: number): void {
    const stride = this.columns,
      cell = HERO_FLUID.cellSize;
    const decay = Math.exp(-HERO_FLUID.damping * dt);
    this.nextU.fill(0);
    this.nextV.fill(0);
    for (let y = 1; y < this.rows - 1; y++) {
      for (let x = 1; x < stride - 1; x++) {
        const i = y * stride + x;
        const backX = x - (this.u[i] * dt) / cell,
          backY = y - (this.v[i] * dt) / cell;
        this.nextU[i] = this.sample(this.u, backX, backY) * decay;
        this.nextV[i] = this.sample(this.v, backX, backY) * decay;
      }
    }
    [this.u, this.nextU] = [this.nextU, this.u];
    [this.v, this.nextV] = [this.nextV, this.v];
  }

  private projectPressure(): void {
    const stride = this.columns;
    this.pressure.fill(0);
    this.nextPressure.fill(0);
    for (let y = 1; y < this.rows - 1; y++) {
      for (let x = 1; x < stride - 1; x++) {
        const i = y * stride + x;
        this.divergence[i] =
          (this.u[i + 1] - this.u[i - 1] + this.v[i + stride] - this.v[i - stride]) * 0.5;
      }
    }
    for (let iteration = 0; iteration < HERO_FLUID.pressureIterations; iteration++) {
      for (let y = 1; y < this.rows - 1; y++) {
        for (let x = 1; x < stride - 1; x++) {
          const i = y * stride + x;
          this.nextPressure[i] =
            (this.pressure[i - 1] +
              this.pressure[i + 1] +
              this.pressure[i - stride] +
              this.pressure[i + stride] -
              this.divergence[i]) *
            0.25;
        }
      }
      [this.pressure, this.nextPressure] = [this.nextPressure, this.pressure];
    }
    for (let y = 1; y < this.rows - 1; y++) {
      for (let x = 1; x < stride - 1; x++) {
        const i = y * stride + x;
        this.u[i] -= (this.pressure[i + 1] - this.pressure[i - 1]) * 0.5;
        this.v[i] -= (this.pressure[i + stride] - this.pressure[i - stride]) * 0.5;
      }
    }
  }
}
