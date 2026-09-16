"use client";

import { PixelText } from "@/components/atoms/PixelText";
import { DinoGame } from "@/components/organisms/DinoGame";

/**
 * Page template: decorated header, the game card, and a controls legend.
 * Layouts of other pages could reuse this template structure.
 */
export function GamePageLayout() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <header className="text-center">
        <PixelText as="h1" className="text-3xl text-dino-ink sm:text-4xl">
          DINO RUN
        </PixelText>
        <p className="mt-2 text-sm text-dino-muted">
          A Chrome-Dino-style endless runner, built from scratch.
        </p>
      </header>

      <DinoGame />

      <footer className="text-center text-xs leading-relaxed text-dino-muted">
        <p>
          <kbd className="font-pixel text-dino-ink/70">SPACE</kbd> /{" "}
          <kbd className="font-pixel text-dino-ink/70">↑</kbd> /{" "}
          <kbd className="font-pixel text-dino-ink/70">ENTER</kbd> — jump ·{" "}
          <kbd className="font-pixel text-dino-ink/70">↓</kbd> — duck (hold)
        </p>
        <p className="mt-1">
          <kbd className="font-pixel text-dino-ink/70">←</kbd> /{" "}
          <kbd className="font-pixel text-dino-ink/70">→</kbd> — brake / accelerate ·{" "}
          night falls every 700 pts
        </p>
        <p className="mt-1">
          Tap (mobile) — start · jump · restart · avoid the cacti and the
          pterodactyls
        </p>
      </footer>
    </main>
  );
}