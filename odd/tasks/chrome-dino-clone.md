# Feature: chrome-dino-clone

Réplica funcional del Dinosaurio de Chrome (Chrome Dino) como proyecto web.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Atomic Design real (atoms / molecules / organisms / templates / pages)
- Playwright E2E obligatorio (verificación en navegador real, desktop + mobile)

## Entorno

- CWD: `C:/Users/jjgue` (home Windows, sin proyecto previo)
- Node v22.23.2, npm 10.8.2
- Proyecto nuevo en `C:\Users\jjgue\chrome-dino` (decisión del usuario)

## Acceptance criteria

1. Next.js + TS + Tailwind andando sin errores de lint/build/hidratación.
2. Componentes organizados por Atomic Design real (no solo carpetas).
3. Separación clara: UI / estado del juego / física / colisiones / input / puntuación / dificultad.
4. Estados: idle, playing, game over; reinicio sin recargar.
5. Dino que corre, salta (Space/Arriba), agacharse no requerido (fuera de alcance inicial).
6. Suelo desplazándose, cactus/obstáculos, nubes decorativas, velocidad creciente.
7. Detección de colisiones por bounding box (con margen de tolerancia).
8. Puntuación con high score persistente (localStorage).
9. Input: teclado + táctil (tap para saltar; botones en mobile si aplica).
10. Sin assets propietarios: todo visual es SVG/CSS propio.
11. Playwright E2E: los 12 checks del pedido pasan en desktop y mobile.
12. Responsive: funciona en viewport de escritorio y móvil.

## Tasks

1. [x] Scaffold Next.js + TS + Tailwind en chrome-dino
2. [x] Arquitectura Atomic Design y estructura de carpetas
3. [x] Motor del juego (estado, física, colisiones, dificultad, puntuación)
4. [x] UI con Atomic Design (Dino, obstáculos, suelo, HUD, game over)
5. [x] Input teclado + táctil + accesibilidad
6. [x] Playwright E2E completo (12 checks) — 22/22 verde, 2 skips cross-viewport esperados
7. [x] Verificación final: Playwright, lint, typecheck, build, consola — todo verde

## Non-goals

- No copiar assets ni código de Chrome.
- No multiplayer, no niveles, no sonido (fuera de alcance inicial).
- No modo noche (se puede agregar después; arquitectura debe permitirlo).

## Notas técnicas

- Lógica del juego en módulos puros (types + engine class) para testear sin DOM.
- Game loop con `requestAnimationFrame` en un hook `useGameLoop`.
- Canvas vs DOM: se evalúa; DOM+CSS transform da animaciones fluidas y accesibilidad mejor.
- High score en localStorage con guard para SSR/hidratación.