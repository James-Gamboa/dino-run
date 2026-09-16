import { test, expect, type Page } from "@playwright/test";

/**
 * Collects browser console errors + uncaught page errors for one test.
 * Call `assertNoErrors()` at the end of each test to enforce check #10.
 */
function watchConsole(page: Page): () => void {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  page.on("pageerror", (err) => {
    errors.push(`pageerror: ${err.message}`);
  });
  return () => expect(errors, "browser console must stay clean").toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("game-world")).toBeVisible();
  // Wait for hydration: the dino only renders after the engine mounts on
  // the client, which is exactly when the keyboard listener is registered.
  await expect(page.getByTestId("dino")).toBeVisible();
});

test.describe("Chrome Dino game", () => {
  test("1. app starts: game world renders", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "DINO RUN" }),
    ).toBeVisible();
    await expect(page.getByTestId("hud")).toBeVisible();
    await expect(page.getByTestId("start-hint")).toBeVisible();
  });

  test("2. page loads without errors", async ({ page }) => {
    const assertNoErrors = watchConsole(page);
    await expect(page).toHaveTitle(/Dino Run/);
    await expect(page.getByTestId("game-world")).toHaveAttribute(
      "data-phase",
      "idle",
    );
    assertNoErrors();
  });

  test("3. dino appears in idle with run pose", async ({ page }) => {
    const dino = page.getByTestId("dino");
    await expect(dino).toBeVisible();
    await expect(dino).toHaveAttribute("data-pose", "run-1");
    await expect(dino).toHaveAttribute("data-jumping", "false");
  });

  test("4. game can start with Space", async ({ page }) => {
    await page.keyboard.press("Space");
    await expect(page.getByTestId("game-world")).toHaveAttribute(
      "data-phase",
      "playing",
    );
  });

  test("5. jump input works (Space) and lands back", async ({ page }) => {
    await page.keyboard.press("Space"); // start
    const dino = page.getByTestId("dino");
    await page.keyboard.press("Space"); // jump
    await expect(dino).toHaveAttribute("data-jumping", "true");
    await expect(dino).toHaveAttribute("data-pose", "jump");
    // lands back on the ground
    await expect(dino).toHaveAttribute("data-jumping", "false", {
      timeout: 3_000,
    });
  });

  test("6. obstacles appear and scroll left", async ({ page }) => {
    await page.keyboard.press("Space"); // start
    const obstacle = page.getByTestId("obstacle").first();
    await expect(obstacle).toBeVisible({ timeout: 10_000 });

    const first = await obstacle.boundingBox();
    expect(first).not.toBeNull();
    await page.waitForTimeout(600);
    const second = await obstacle.boundingBox();
    expect(second).not.toBeNull();
    expect(second!.x).toBeLessThan(first!.x);
  });

  test("7. score increases while running", async ({ page }) => {
    await page.keyboard.press("Space"); // start
    const score = page.getByTestId("score");
    const read = async () => Number.parseInt((await score.textContent()) ?? "0", 10);

    const before = await read();
    await page.waitForTimeout(1_200);
    const after = await read();
    expect(after).toBeGreaterThan(before);
  });

  test("8. collision triggers game over", async ({ page }) => {
    await page.keyboard.press("Space"); // start — then do NOT jump
    await expect(page.getByTestId("game-world")).toHaveAttribute(
      "data-phase",
      "gameover",
      { timeout: 15_000 },
    );
    await expect(page.getByTestId("game-over-panel")).toBeVisible();
  });

  test("9. restart works from game over", async ({ page }) => {
    await page.keyboard.press("Space"); // start
    await expect(page.getByTestId("game-world")).toHaveAttribute(
      "data-phase",
      "gameover",
      { timeout: 15_000 },
    );

    const scoreBefore = await page.getByTestId("score").textContent();
    await page.keyboard.press("Space"); // restart
    await expect(page.getByTestId("game-world")).toHaveAttribute(
      "data-phase",
      "playing",
    );
    // fresh run: score reset to 00000 (lower than the previous run)
    const scoreAfter = await page.getByTestId("score").textContent();
    expect(scoreAfter).toBe("00000");
    expect(scoreBefore).not.toBe(scoreAfter);
  });

  test("10. console stays clean through a full play session", async ({ page }) => {
    const assertNoErrors = watchConsole(page);
    await page.keyboard.press("Space"); // start
    await page.keyboard.press("Space"); // jump
    await expect(page.getByTestId("game-world")).toHaveAttribute(
      "data-phase",
      "gameover",
      { timeout: 15_000 },
    );
    await page.keyboard.press("Space"); // restart
    await expect(page.getByTestId("game-world")).toHaveAttribute(
      "data-phase",
      "playing",
    );
    assertNoErrors();
  });

  test("11. desktop viewport renders a wide world", async ({ page }) => {
    test.skip(!(await isDesktopViewport(page)), "desktop-only check");
    const box = await page.getByTestId("game-world").boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(500);
  });

  test("12. mobile: tap to start/jump, touch controls work", async ({ page }) => {
    test.skip((await isDesktopViewport(page)), "mobile-only check");

    const world = page.getByTestId("game-world");
    const dino = page.getByTestId("dino");

    // Tap once: idle -> playing
    await world.tap();
    await expect(world).toHaveAttribute("data-phase", "playing");

    // Touch controls visible on this viewport
    await expect(page.getByTestId("jump-button")).toBeVisible();
    await expect(page.getByTestId("jump-button")).toBeEnabled();

    // Tap again while airborne-free: dino jumps
    await world.tap();
    await expect(dino).toHaveAttribute("data-jumping", "true");

    // Wait for a crash without further jumps
    await expect(world).toHaveAttribute("data-phase", "gameover", {
      timeout: 15_000,
    });
    await expect(page.getByTestId("restart-button")).toBeEnabled();
    await page.getByTestId("restart-button").tap();
    await expect(world).toHaveAttribute("data-phase", "playing");
  });
});

/** True when the viewport is desktop-sized (>= 768px wide). */
async function isDesktopViewport(page: Page): Promise<boolean> {
  const viewport = page.viewportSize();
  return (viewport?.width ?? 0) >= 768;
}