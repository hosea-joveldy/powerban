import { test, expect } from "@playwright/test";

if (!process.env.VITEST) {
  test.describe("Accessible In-App Modal System (T2.2)", () => {
    let email;
    const password = "password123";

    test.beforeEach(async ({ page }) => {
      email = `qa_modal_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.dev`;
      await page.goto("/register");
      await page.getByPlaceholder("email").fill(email);
      await page.getByPlaceholder("password (min 8 characters)").fill(password);
      await page.getByRole("button", { name: /create account/i }).click();
      await expect(page).toHaveURL("/");
    });

    test("PromptModal has role=dialog, aria-modal, traps focus, closes on Esc/backdrop, and submits value", async ({
      page,
    }) => {
      // Find and focus '+ group' trigger button
      const newGroupBtn = page.getByRole("button", { name: "+ group" });
      await expect(newGroupBtn).toBeVisible();
      await newGroupBtn.focus();
      await newGroupBtn.click();

      // Verify modal container and accessibility attributes
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAttribute("aria-modal", "true");

      // Verify focus is captured inside modal
      await expect(async () => {
        const focusedInside = await page.evaluate(() => {
          const dialogEl = document.querySelector('[role="dialog"]');
          return dialogEl?.contains(document.activeElement) ?? false;
        });
        expect(focusedInside).toBe(true);
      }).toPass();

      // Test Escape key closes modal and returns focus to trigger
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(newGroupBtn).toBeFocused();

      // Open again to test backdrop click outside
      await newGroupBtn.click();
      await expect(dialog).toBeVisible();
      // Click at top-left corner of the viewport (backdrop)
      await page.mouse.click(15, 15);
      await expect(dialog).not.toBeVisible();

      // Open again to test focus trap with Tab key
      await newGroupBtn.click();
      await expect(dialog).toBeVisible();
      // Tab multiple times
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      // Focus must remain inside the dialog
      const focusedInside = await page.evaluate(() => {
        const dialogEl = document.querySelector('[role="dialog"]');
        return dialogEl?.contains(document.activeElement) ?? false;
      });
      expect(focusedInside).toBe(true);

      // Fill value and submit
      const input = dialog.locator(".modal-input");
      await input.fill("Core Engineering");
      await dialog.getByRole("button", { name: "Create Group" }).click();
      await expect(dialog).not.toBeVisible();

      // Verify group appears on dashboard
      await expect(page.getByText("Core Engineering")).toBeVisible();
    });

    test("ConfirmModal operates accessibly, supports danger styling, and respects cancel/backdrop", async ({
      page,
    }) => {
      // Create a standalone board first via '+ board'
      await page.getByRole("button", { name: "+ board" }).first().click();
      const promptDialog = page.getByRole("dialog");
      await promptDialog.locator(".modal-input").fill("Temporary Board");
      await promptDialog.getByRole("button", { name: "Create Board" }).click();
      await expect(promptDialog).not.toBeVisible();
      await expect(page.getByRole("link", { name: "Temporary Board" })).toBeVisible();

      // Locate board tile containing Temporary Board
      const boardTile = page.locator("div", {
        has: page.getByRole("link", { name: "Temporary Board" }),
      });
      const deleteBtn = boardTile.getByRole("button", { name: "delete" });
      await deleteBtn.click();

      // Confirm modal opens
      const confirmDialog = page.getByRole("dialog");
      await expect(confirmDialog).toBeVisible();
      await expect(confirmDialog).toHaveAttribute("aria-modal", "true");
      await expect(confirmDialog.getByText('Delete "Temporary Board"?')).toBeVisible();

      const confirmBtn = confirmDialog.getByRole("button", { name: "Delete Board" });
      await expect(confirmBtn).toHaveClass(/danger/);

      // Cancel button -> board remains
      await confirmDialog.getByRole("button", { name: "Cancel" }).click();
      await expect(confirmDialog).not.toBeVisible();
      await expect(page.getByRole("link", { name: "Temporary Board" })).toBeVisible();

      // Open confirm modal again and click backdrop -> board remains
      await deleteBtn.click();
      await expect(confirmDialog).toBeVisible();
      await page.mouse.click(15, 15);
      await expect(confirmDialog).not.toBeVisible();
      await expect(page.getByRole("link", { name: "Temporary Board" })).toBeVisible();

      // Open confirm modal again and confirm deletion
      await deleteBtn.click();
      await expect(confirmDialog).toBeVisible();
      await confirmBtn.click();
      await expect(confirmDialog).not.toBeVisible();
      await expect(page.getByRole("link", { name: "Temporary Board" })).not.toBeVisible();
    });

    test("TaskDetailModal allows editing title, description, linked board, and is responsive across viewports", async ({
      page,
    }) => {
      // Create target board for linking
      await page.getByRole("button", { name: "+ board" }).first().click();
      let prompt = page.getByRole("dialog");
      await prompt.locator(".modal-input").fill("Target Board");
      await prompt.getByRole("button", { name: "Create Board" }).click();
      await expect(prompt).not.toBeVisible();

      // Create main board
      await page.getByRole("button", { name: "+ board" }).first().click();
      prompt = page.getByRole("dialog");
      await prompt.locator(".modal-input").fill("Main Project");
      await prompt.getByRole("button", { name: "Create Board" }).click();
      await expect(prompt).not.toBeVisible();

      // Open Main Project board
      await page.getByRole("link", { name: "Main Project" }).click();
      await expect(page).toHaveURL(/\/boards\/\d+/);

      // Locate innermost Todo column
      const todoHeader = page.getByText("Todo", { exact: true });
      const todoCard = page.locator("div").filter({ has: todoHeader }).filter({
        has: page.getByRole("button", { name: "+ add task" }),
      }).last();

      await todoCard.getByRole("button", { name: "+ add task" }).click();
      await todoCard.locator("form input").fill("Build Accessible Navigation");
      await todoCard.locator("form input").press("Enter");
      await expect(page.getByText("Build Accessible Navigation")).toBeVisible();

      // Click task to open TaskDetailModal
      await page.getByText("Build Accessible Navigation").click();

      const taskModal = page.getByRole("dialog");
      await expect(taskModal).toBeVisible();
      await expect(taskModal.getByText("Task Details")).toBeVisible();

      // Verify form elements
      const titleInput = taskModal.locator("#task-title-input");
      const descInput = taskModal.locator("#task-desc-input");
      const linkedSelect = taskModal.locator("#task-linked-board");

      await expect(titleInput).toHaveValue("Build Accessible Navigation");

      // Edit description and link to Target Board
      await descInput.fill("Implement WCAG compliant modal keyboard navigation.");
      await linkedSelect.selectOption({ label: "Target Board" });

      // Verify linked board preview
      await expect(taskModal.locator(".linked-board-preview")).toBeVisible();
      await expect(taskModal.locator(".linked-board-preview")).toContainText("Target Board");

      // Capture desktop screenshot (1280px)
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.screenshot({
        path: ".run/screenshots/modal-task-detail-desktop.png",
      });

      // Capture phone screenshot (375px)
      await page.setViewportSize({ width: 375, height: 667 });
      await page.screenshot({
        path: ".run/screenshots/modal-task-detail-phone.png",
      });

      // Save changes
      await taskModal.getByRole("button", { name: "Save Changes" }).click();
      await expect(taskModal).not.toBeVisible();

      // Verify task displays linked board badge in card column
      await expect(page.getByText("→ Target Board")).toBeVisible();
    });
  });
}
