# Carlos Horrillo — Editorial Portfolio

Proyecto **independiente**, construido con Angular 22, componentes standalone, signals y GSAP ScrollTrigger. 

## Instalación local

- Clonar el repositorio:

git clone https://github.com/CarlosSensei/NOMBRE-REPOSITORIO.git

- Instalar dependencias:

npm install

- Ejecutar el proyecto:

npm start

- Compilación

npm run build

## Estructura

- `src/app/app.ts` y `app.html` componen la página y coordinan el menú y la ficha de proyecto.
- `src/app/page-motion.ts` configura las animaciones de entrada y scroll y el cursor.
- `src/app/hero/` contiene el lienzo de portada, la retícula de puntos y la simulación del fluido.
- `src/app/projects/` contiene el catálogo, la presentación en secciones apiladas y la ficha de cada proyecto.
- `src/app/career/` contiene los datos de trayectoria y su navegación horizontal.

## Personalización

- `src/app/projects/projects.ts`: proyectos, categorías, descripciones y enlaces.
- `src/app/app.html`: presentación, perfil y contacto.
- `src/styles/base.css`: tokens globales y tipografía compartida.
- `src/app/app.css`: composición de la página y puntos de ruptura.
- `public/assets/projects/`: imágenes conservadas del portfolio original.
- `public/assets/motion/editorial.mp4`: pieza gráfica original de demostración; no es una grabación de los proyectos. Reemplazar por un showreel propio si se desea.
- `public/assets/motion/poster.jpg`: imagen estática del vídeo.

## Movimiento

Entrada tipográfica y parallax con GSAP. El fondo de puntos de la portada reacciona al ratón con una estela que arrastra y curva la retícula, y se disipa al detener el movimiento. La animación se pausa cuando la portada queda fuera de pantalla o la pestaña está oculta. La preferencia de movimiento reducido muestra un fondo estático y desactiva las animaciones.

«Las ideas se prueban» y el catálogo se reúnen en una sección por proyecto, con índice de navegación, descripción, imagen, ficha y enlace directo a la demo o al código. Los proyectos se configuran en `src/app/projects/projects.ts`. Su presentación está en `src/app/projects/experience-showcase.*` y el efecto de portada en `src/app/hero/`.

Las demos enlazan a los proyectos existentes; su disponibilidad depende de sus propios despliegues. El contacto abre el cliente de correo. Las fuentes DM Sans y Manrope se cargan desde Google Fonts, con alternativas locales. Las imágenes proceden del repositorio original y no se presentan como nuevas capturas de OptiFlow.

La sección de perfil incluye seis etapas del [timeline original](https://github.com/CarlosSensei/Portfolio/blob/main/src/features/timeline/time-line.ts), configuradas en `CAREER_STEPS` en `src/app/career/career-steps.ts`. Una sección sticky ocupa la pantalla mientras el scroll vertical desplaza las etapas horizontalmente. Tras la última etapa hay una pausa de 0,3 alturas de pantalla antes de continuar. Los controles y el teclado también permiten navegar. Con movimiento reducido se utiliza desplazamiento horizontal nativo.

Los proyectos forman una pila de secciones sticky: cada proyecto queda detrás del siguiente hasta finalizar el catálogo. Los proyectos más altos que la pantalla se pueden leer completos antes de fijarse. El efecto se desactiva con movimiento reducido. Los estilos están en `src/app/projects/experience-showcase.css`.

## Dirección visual

«Mente de negocio. Alma de código.» Marfil, tinta y rojo; tipografía sans de gran formato con contraste serif, retícula asimétrica y fichas editoriales. 
