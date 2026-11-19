export type Project = {
  name: string;
  number: string;
  type: string;
  image: string;
  tags: string;
  color: string;
  description: string;
  github: string;
  demo: string;
};

export const PROJECTS: readonly Project[] = [
  {
    name: 'CRM Intro',
    type: 'Producto',
    tags: 'Angular / Spring Boot / CRM',
    image: 'crm-project.jpg',
    number: '01',
    description:
      'Una herramienta de gestión diaria en cualquier empresa. Clientes, presupuestos, pedidos y seguimiento en una misma aplicación. Mock de frontend para testear propuestas de UX/UI',
    github: 'https://github.com/CarlosSensei/CRM-PLAYGROUND',
    demo: 'https://carlossensei.github.io/CRM-PLAYGROUND/',
    color: '#cbd2b5',
  },
  {
    name: 'NOVA',
    type: 'Experiencia',
    tags: 'Angular / GSAP / E-commerce',
    image: 'ecommerce.jpg',
    number: '02',
    description:
      'Exploración de un e-commerce de gadgets donde la narrativa visual y el movimiento guían la navegación. Prototipo de interfaz sin pasarela de pago.',
    github: 'https://github.com/CarlosSensei/mecommerce',
    demo: 'https://carlossensei.github.io/mecommerce/',
    color: '#c2b7d5',
  },
  {
    name: 'FastRead',
    type: 'Producto',
    tags: 'Angular / TypeScript / Lectura',
    image: 'ojo.jpg',
    number: '03',
    description:
      'Un entrenador de lectura palabra a palabra, con velocidad configurable y carga de archivos. Una interfaz diseñada para mantener el foco.',
    github: 'https://github.com/CarlosSensei/fastread',
    demo: 'https://carlossensei.github.io/fastread/',
    color: '#dbcbb3',
  },
  {
    name: 'Flappy Fish',
    type: 'Experiencia',
    tags: 'Angular / Signals / Game loop',
    image: 'shark.jpg',
    number: '04',
    description:
      'Un pequeño laboratorio de interacción: colisiones, física y dificultad progresiva en un juego construido con Angular.',
    github: 'https://github.com/CarlosSensei/flappyfish',
    demo: 'https://carlossensei.github.io/flappyfish/',
    color: '#b4cdd2',
  },
  {
    name: 'Ronin UI',
    type: 'Producto',
    tags: 'Angular / Componentes / UI',
    image: 'code.jpg',
    number: '05',
    description:
      'Librería de componentes en desarrollo para explorar reutilización, consistencia visual y patrones de interacción.',
    github: 'https://github.com/CarlosSensei/ronin-ui',
    demo: 'https://carlossensei.github.io/ronin-ui/',
    color: '#d1cfc6',
  },
  {
    name: 'My Table',
    type: 'Producto',
    tags: 'Angular / Reservas / En desarrollo',
    image: 'dashboard.jpg',
    number: '06',
    description:
      'Aplicación de reservas de restaurantes. El modo cliente es la primera pieza; la gestión del restaurante y el backend siguen en desarrollo. Usuarios: admin@test.com, user@test.com y owner@test.com Contraseña: 12345678',
    github: 'https://github.com/CarlosSensei/my-table-app',
    demo: 'https://carlossensei.github.io/my-table-app/',
    color: '#c9c2b7',
  },
  {
    name: 'El faro',
    type: 'Experiencia',
    tags: 'Angular / Three.js / Game',
    image: 'faro.jpg',
    number: '07',
    description:
      'Mini juego 3d de rpg hecho con Three.js. Pequeña intro ilustrada y mini juego en 3d',
    github: 'https://github.com/CarlosSensei/el-faro',
    demo: 'https://carlossensei.github.io/el-faro/',
    color: '#b5c9d3',
  },
];
