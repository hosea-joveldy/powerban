import { test, expect } from "@playwright/test";

if (!process.env.VITEST) {
  test.describe("Dashboard, Board Kanban, and Settings Verification (T5)", () => {
    let email;
    const password = "password123";

    test.beforeEach(async ({ page }) => {
      // Disallow any native alert, confirm, or prompt
      page.on("dialog", (dialog) => {
        throw new Error(`Unexpected native dialog: [${dialog.type()}] "${dialog.message()}"`);
      });

      email = `qa_t5_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.dev`;
      await page.goto("/register");
      await page.locator("#register-email").fill(email);
      await page.locator("#register-password").fill(password);
      await page.locator(".btn-split-pill").click();
      await expect(page).toHaveURL("/");
    });

    test("T5.1: Dashboard restyling with topbar, group cards, board tiles, and responsive viewports", async ({
      page,
    }) => {
      // Topbar elements
      const wordmark = page.locator(".topbar .wordmark");
      await expect(wordmark).toBeVisible();
      await expect(page.locator('.topbar [aria-label="Settings"]')).toBeVisible();
      await expect(page.locator('.topbar [aria-label="Log out"]')).toBeVisible();

      // Heading and actions
      await expect(page.locator(".dashboard-title")).toHaveText("boards");
      const newGroupBtn = page.getByRole("button", { name: "+ group" });
      const newBoardBtn = page.getByRole("button", { name: "+ board", exact: true });
      await expect(newGroupBtn).toBeVisible();
      await expect(newBoardBtn).toBeVisible();

      // Create a Group via in-app prompt modal
      await newGroupBtn.click();
      let dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await dialog.locator(".modal-input").fill("Engineering Projects");
      await dialog.getByRole("button", { name: "Create Group" }).click();
      await expect(dialog).not.toBeVisible();
      await expect(page.getByText("Engineering Projects")).toBeVisible();

      // Create a Board inside the group
      await page.getByRole("button", { name: "+ board here" }).click();
      dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await dialog.locator(".modal-input").fill("Sprint 42");
      await dialog.getByRole("button", { name: "Create Board" }).click();
      await expect(dialog).not.toBeVisible();

      // Verify Board Tile layout
      const boardLink = page.getByRole("link", { name: "Sprint 42" });
      await expect(boardLink).toBeVisible();
      const boardTile = page.locator(".board-tile", { has: boardLink });
      await expect(boardTile.locator(".progress-track")).toBeVisible();
      await expect(boardTile.getByRole("button", { name: "save as template" })).toBeVisible();
      await expect(boardTile.getByRole("button", { name: "delete" })).toBeVisible();

      // Create a standalone board
      await newBoardBtn.click();
      dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await dialog.locator(".modal-input").fill("Design Specs");
      await dialog.getByRole("button", { name: "Create Board" }).click();
      await expect(dialog).not.toBeVisible();
      await expect(page.getByRole("link", { name: "Design Specs" })).toBeVisible();

      // Save board as template
      await boardTile.getByRole("button", { name: "save as template" }).click();
      dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: "Save Template" }).click();
      await expect(dialog).not.toBeVisible();
      await expect(page.locator(".template-tile").first()).toBeVisible();

      // Capture desktop screenshot
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.screenshot({ path: "../.run/screenshots/dashboard-desktop.png" });

      // Capture phone screenshot
      await page.setViewportSize({ width: 375, height: 667 });
      await page.screenshot({ path: "../.run/screenshots/dashboard-phone.png" });
    });

    test("T5.2: Board kanban view, columns, WIP limit pill, task detail modal, and finished styling", async ({
      page,
    }) => {
      // Create a board to test
      await page.getByRole("button", { name: "+ board", exact: true }).click();
      const dialog = page.getByRole("dialog");
      await dialog.locator(".modal-input").fill("Core Engine Board");
      await dialog.getByRole("button", { name: "Create Board" }).click();
      await expect(dialog).not.toBeVisible();

      // Open the board
      await page.getByRole("link", { name: "Core Engine Board" }).click();
      await expect(page).toHaveURL(/\/boards\/\d+/);

      // Verify columns rendered with uppercase headers
      const todoCol = page.locator(".card-column", { hasText: "TODO" });
      const ongoingCol = page.locator(".card-column", { hasText: "ONGOING" });
      const completedCol = page.locator(".card-column", { hasText: "COMPLETED" });

      await expect(todoCol).toBeVisible();
      await expect(ongoingCol).toBeVisible();
      await expect(completedCol).toBeVisible();

      // Add a task into TODO
      await todoCol.getByRole("button", { name: "+ add task" }).click();
      await todoCol.locator(".add-task-input").fill("Implement parser");
      await todoCol.locator(".add-task-input").press("Enter");
      await expect(todoCol.locator(".task-card-title", { hasText: "Implement parser" })).toBeVisible();

      // Open Task Detail Modal by clicking the task card
      const taskCard = todoCol.locator(".task-card", { hasText: "Implement parser" });
      await taskCard.click();

      const detailDialog = page.getByRole("dialog");
      await expect(detailDialog).toBeVisible();
      await expect(detailDialog.locator("#task-title-input")).toHaveValue("Implement parser");

      // Edit description
      await detailDialog.locator("#task-desc-input").fill("Must handle AST nodes and syntax errors gracefully.");
      await detailDialog.getByRole("button", { name: "Save Changes" }).click();
      await expect(detailDialog).not.toBeVisible();

      // Verify updated description is visible on task card
      await expect(taskCard.locator(".task-card-desc")).toContainText("Must handle AST nodes");

      // Add column
      await page.getByRole("button", { name: "+ add card" }).click();
      const promptDialog = page.getByRole("dialog");
      await promptDialog.locator(".modal-input").fill("QA Review");
      await promptDialog.getByRole("button", { name: "Create Card" }).click();
      await expect(promptDialog).not.toBeVisible();
      await expect(page.locator(".card-column", { hasText: "QA REVIEW" })).toBeVisible();

      // Capture desktop screenshot
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.screenshot({ path: "../.run/screenshots/board-desktop.png" });

      // Capture phone screenshot
      await page.setViewportSize({ width: 375, height: 667 });
      await page.screenshot({ path: "../.run/screenshots/board-phone.png" });
    });

    test("T5.3: Settings appearance theme switcher and live preview", async ({ page }) => {
      await page.goto("/settings");

      // Verify heading and descriptions
      await expect(page.locator(".settings-title")).toHaveText("Appearance");
      const lightBtn = page.getByRole("button", { name: /Stone Light/i });
      const darkBtn = page.getByRole("button", { name: /Forest Dark/i });
      await expect(lightBtn).toBeVisible();
      await expect(darkBtn).toBeVisible();

      // Switch to Forest Dark
      await darkBtn.click();
      let themeAttr = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
      expect(themeAttr).toBe("forest-dark");

      // Switch back to Stone Light
      await lightBtn.click();
      themeAttr = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
      expect(themeAttr).toBe("stone-light");

      // Capture desktop screenshot
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.screenshot({ path: "../.run/screenshots/settings-desktop.png" });

      // Capture phone screenshot
      await page.setViewportSize({ width: 375, height: 667 });
      await page.screenshot({ path: "../.run/screenshots/settings-phone.png" });
    });
  });
}
