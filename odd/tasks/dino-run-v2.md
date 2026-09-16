# Feature: dino-run v2 — duck, pterodáctilos, day/night y flechas

Evolución del clon del Chrome Dino ya publicado (`chrome-dino` / repo `dino-run`).

## Alcance acordado con el usuario

1. **Flechas del teclado completas**
   - `↑` salta (ya existía), `↓` agacha al dino, `←`/`→` frenan / aceleran la carrera.
2. **Modo noche automático** — el juego alterna día/noche cada ~700 puntos, con transición suave.
3. **Pterodáctilos** — enemigo volador con 3 alturas y animación de aleteo, desbloqueado a partir de cierto puntaje.

## Decisiones de diseño

- **Duck**: sprite propio más ancho y bajo (60x30), hitbox recalculada. Agachado solo en el suelo;
  `↓` en el aire = caída rápida (fast fall). Se puede saltar desde agachado.
- **Throttle**: `←` = ×0.75, `→` = ×1.4 de velocidad, interpolado (no instantáneo). Afecta el ritmo
  y por lo tanto la puntuación (correr más rápido puntúa más, pero deja menos tiempo de reacción).
- **Noche**: `cycle = floor(score / 700)`, noche cuando `cycle` es impar. Transición por CSS
  (900 ms) sobre variables de color del mundo → sin saltos bruscos.
- **Pterodáctilos**: 3 alturas (baja = saltar, media = agacharse, alta = no molesta salvo si saltás),
  +70 px/s extra respecto al scroll, sin spawnear por debajo de 350 puntos.
- **Mobile**: se agrega botón `Duck` (sin él, los pterodáctilos medios serían inevitables en táctil).
  `←`/`→` quedan como control de teclado y se documenta en la leyenda.

## Tasks

1. [x] Modelo: tipos nuevos (pose duck, kind pterodactyl, tema día/noche, throttle) + constantes
2. [x] Motor: duck + fast fall, throttle con interpolación, spawn/alturas de pterodáctilos, ciclo día/noche
3. [x] Sprites: pose duck del dino + PterodactylSprite con aleteo
4. [x] Hook: estado de teclas mantenidas (↓/←/→), acciones duck/throttle
5. [x] UI: render de pterodáctilos, tema noche, botón Duck en mobile, leyenda de teclas
6. [x] Tests E2E de las 3 features (deterministas vía hook de test en dev)
7. [x] Verificación completa: E2E viejos + nuevos, lint, typecheck, build

## Non-goals

- No se toca el modo de juego (sigue siendo endless runner de una sola vida).
- No hay sonido ni puntaje por tipo de obstáculo.
- `←`/`→` no se exponen como controles táctiles (solo teclado).

## Verificación

- Los 12 checks originales deben seguir pasando (desktop + mobile). ✅
- Tests nuevos: agacharse cambia pose/hitbox, el dino agachado sobrevive un pterodáctilo medio,
  el pterodáctilo aparece y se mueve, noche se activa al pasar el umbral, `←`/`→` cambian la velocidad. ✅

Resultado: `eslint` limpio · `tsc --noEmit` limpio · `next build` OK · **Playwright 38 passed, 2 skipped**
(desktop 1280x720 + mobile 390x844).

## Notas de implementación

- El hitbox del pterodáctilo usa insets propios (x 20 %, y 32 %) para que las alas no cuenten.
- La altitud `mid` (offset 26) fue recalibrada: con los hitboxes reales, un pterodáctilo más alto
  pasaba por encima de la cabeza parada y no obligaba a agacharse.
- El puente `window.__dinoTest` solo existe cuando `NODE_ENV !== "production"`; los tests lo usan
  para aislar obstáculos y llegar a estados raros (noche, pterodáctilos) sin esperar minutos.
- El modo noche afecta el interior del mundo (fondo, suelo, sprites, hints). El HUD y el marco de
  la página mantienen el tema del sitio.
