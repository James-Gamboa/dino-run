"use client";

import { CactusSprite } from "@/components/atoms/CactusSprite";
import { CloudSprite } from "@/components/atoms/CloudSprite";
import { DinoSprite } from "@/components/atoms/DinoSprite";
import {
  PterodactylSprite,
  type PterodactylPose,
} from "@/components/atoms/PterodactylSprite";
import { PixelText } from "@/components/atoms/PixelText";
import { Ground } from "@/components/molecules/Ground";
import { GameControls } from "@/components/molecules/GameControls";
import { GameHUD } from "@/components/organisms/GameHUD";
import { GameOverPanel } from "@/components/organisms/GameOverPanel";
import { useDinoGame } from "@/hooks/useDinoGame";
import {
  DINO_DUCK_H,
  DINO_DUCK_W,
  DINO_H,
  DINO_W,
  PTERODACTYL_FLAP_MS,
} from "@/lib/game/constants";

/**
 * The central game organism: owns the engine hook and renders the world
 * (ground, clouds, cacti, pterodactyls, dino), HUD, game-over overlay and
 * mobile controls. All motion is driven by the per-frame snapshot via CSS
 * transforms for smooth 60fps rendering. The scene palette comes from
 * .game-world custom properties, so the day/night cycle cross-fades it.
 */
export function DinoGame() {
  const { worldRef, snapshot, onWorldPointerDown, actions } = useDinoGame();
  const phase = snapshot?.phase ?? "idle";

  const hint =
    phase === "idle"
      ? "PRESS SPACE OR TAP TO START"
      : "PRESS SPACE OR TAP TO RESTART";

  const ducking = snapshot?.dino.ducking ?? false;
  const dinoW = ducking ? DINO_DUCK_W : DINO_W;
  const dinoH = ducking ? DINO_DUCK_H : DINO_H;

  // Shared wing-flap animation for every pterodactyl (always-ticking clock).
  const flapPose: PterodactylPose =
    Math.floor((snapshot?.clockMs ?? 0) / PTERODACTYL_FLAP_MS) % 2 === 0
      ? "flap-up"
      : "flap-down";

  return (
    <section className="w-full max-w-2xl" aria-label="Chrome Dino game">
      <GameHUD
        phase={phase}
        score={snapshot?.score ?? 0}
        bestScore={snapshot?.bestScore ?? 0}
      />

      <div
        ref={worldRef}
        data-testid="game-world"
        data-phase={phase}
        data-theme={snapshot?.isNight ? "night" : "day"}
        role="application"
        aria-label="Chrome Dino game world"
        className="game-world relative h-[172px] w-full touch-none select-none overflow-hidden rounded-lg border-2 shadow-[0_10px_30px_-12px_rgba(31,29,26,0.35)]"
        onPointerDown={onWorldPointerDown}
      >
        {snapshot ? (
          <>
            <Ground offset={snapshot.groundOffset} />

            {/* Decor */}
            {snapshot.clouds.map((cloud) => (
              <div
                key={cloud.id}
                aria-hidden="true"
                className="pointer-events-none absolute opacity-30"
                style={{
                  transform: `translate3d(${cloud.x}px, ${cloud.y}px, 0) scale(${cloud.scale})`,
                }}
              >
                <CloudSprite className="h-5 w-12" />
              </div>
            ))}

            {/* Obstacles: grounded cacti + flying pterodactyls */}
            {snapshot.obstacles.map((obstacle) => (
              <div
                key={obstacle.id}
                data-testid="obstacle"
                data-kind={obstacle.kind}
                data-altitude={obstacle.altitude ?? undefined}
                aria-hidden="true"
                className="pointer-events-none absolute"
                style={{
                  transform: `translate3d(${obstacle.x}px, ${obstacle.y}px, 0)`,
                  width: obstacle.w,
                  height: obstacle.h,
                }}
              >
                {obstacle.kind === "pterodactyl" ? (
                  <PterodactylSprite
                    pose={flapPose}
                    className="h-full w-full"
                  />
                ) : (
                  <CactusSprite kind={obstacle.kind} className="h-full w-full" />
                )}
              </div>
            ))}

            {/* Dino */}
            <div
              data-testid="dino"
              data-pose={snapshot.dino.pose}
              data-ducking={String(snapshot.dino.ducking)}
              data-jumping={String(!snapshot.dino.onGround)}
              className="pointer-events-none absolute"
              style={{
                transform: `translate3d(${snapshot.dino.x}px, ${snapshot.dino.y}px, 0)`,
                width: dinoW,
                height: dinoH,
              }}
            >
              <DinoSprite pose={snapshot.dino.pose} className="h-full w-full" />
            </div>

            {/* Empty-state / restart hint */}
            {phase !== "playing" && (
              <div
                data-testid="start-hint"
                className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center"
              >
                <PixelText className="text-[10px] text-[color:var(--world-muted)]">
                  {hint}
                </PixelText>
              </div>
            )}
          </>
        ) : null}

        {phase === "gameover" && snapshot && (
          <GameOverPanel
            score={snapshot.score}
            bestScore={snapshot.bestScore}
            onRestart={actions.restart}
          />
        )}
      </div>

      <GameControls
        phase={phase}
        onJump={actions.jump}
        onRestart={actions.restart}
        onDuck={actions.duck}
        className="mt-4"
      />
    </section>
  );
}