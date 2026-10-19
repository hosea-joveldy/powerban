import { test, expect } from "@playwright/test";

if (!process.env.VITEST) {
  test.describe("Elimination of Native Browser Dialogs (T2.3)", () => {
    let email;
    const password = "password123";

    test.beforeEach(async ({ page }) => {
      // Disallow any native alert, confirm, or prompt
      page.on("dialog", (dialog) => {
        throw new Error(
          `Unexpected native dialog triggered: [${dialog.type()}] "${dialog.message()}"`
        );
      });

      email = `qa_dialogs_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.dev`;
      await page.goto("/register");
      await page.getByPlaceholder("email").fill(email);
      await page.getByPlaceholder("password (min 8 characters)").fill(password);
      await page.getByRole("button", { name: /create account/i }).click();
      await expect(page).toHaveURL("/");
    });

    test("Dashboard and Board workflows trigger in-app modals and never native dialogs", async ({
      page,
    }) => {
      // 1. New Group via prompt modal
      await page.getByRole("button", { name: "+ group" }).click();
      let dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();

      // Screenshot PromptModal on desktop
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.screenshot({ path: ".run/screenshots/modal-prompt-desktop.png" });

      // Screenshot PromptModal on phone
      await page.setViewportSize({ width: 375, height: 667 });
      await page.screenshot({ path: ".run/screenshots/modal-prompt-phone.png" });

      // Reset to desktop viewport and submit
      await page.setViewportSize({ width: 1280, height: 800 });
      await dialog.locator(".modal-input").fill("Product Squad");
      await dialog.getByRole("button", { name: "Create Group" }).click();
      await expect(dialog).not.toBeVisible();
      await expect(page.getByText("Product Squad")).toBeVisible();

      // 2. New Board via prompt modal
      await page.getByRole("button", { name: "+ board here" }).click();
      dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await dialog.locator(".modal-input").fill("Roadmap 2026");
      await dialog.getByRole("button", { name: "Create Board" }).click();
      await expect(dialog).not.toBeVisible();
      await expect(page.getByRole("link", { name: "Roadmap 2026" })).toBeVisible();

      // 3. Save as Template via prompt modal
      const boardTile = page.locator("div", {
        has: page.getByRole("link", { name: "Roadmap 2026" }),
      });
      await boardTile.getByRole("button", { name: "save as template" }).click();
      dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: "Save Template" }).click();
      await expect(dialog).not.toBeVisible();

      // 4. Navigate into Roadmap 2026 board
      await page.getByRole("link", { name: "Roadmap 2026" }).click();
      await expect(page).toHaveURL(/\/boards\/\d+/);

      // 5. Create new Card Column via prompt modal
      await page.getByRole("button", { name: "+ Add Card" }).click();
      dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await dialog.locator(".modal-input").fill("QA Verification");
      await dialog.getByRole("button", { name: "Create Card" }).click();
      await expect(dialog).not.toBeVisible();
      await expect(page.getByText("QA Verification")).toBeVisible();

      // 6. Add task into QA Verification card
      const cardHeader = page.getByText("QA Verification", { exact: true });
      const cardCol = page.locator("div").filter({ has: cardHeader }).filter({
        has: page.getByRole("button", { name: "+ add task" }),
      }).last();

      await cardCol.getByRole("button", { name: "+ add task" }).click();
      await cardCol.locator("form input").fill("Check accessibility");
      await cardCol.locator("form input").press("Enter");
      await expect(page.getByText("Check accessibility")).toBeVisible();

      // 7. Delete QA Verification card with tasks -> triggers 409 conflict
      // Initial delete confirmation
      await cardCol.locator("button.icon-btn").first().click();
      dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText('Delete "QA Verification"?')).toBeVisible();

      // Screenshot ConfirmModal on desktop & phone
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.screenshot({ path: ".run/screenshots/modal-confirm-desktop.png" });
      await page.setViewportSize({ width: 375, height: 667 });
      await page.screenshot({ path: ".run/screenshots/modal-confirm-phone.png" });

      // Click Delete Card in initial confirmation
      await page.setViewportSize({ width: 1280, height: 800 });
      await dialog.getByRole("button", { name: "Delete Card" }).click();

      // 409 Conflict triggers Force Delete in-app confirm dialog!
      dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText("Card Has Tasks")).toBeVisible();
      await expect(dialog.getByText("Delete it and all its tasks?")).toBeVisible();

      // Confirm force deletion
      const forceDeleteBtn = dialog.getByRole("button", { name: "Force Delete" });
      await expect(forceDeleteBtn).toBeVisible();
      await forceDeleteBtn.click();
      await expect(dialog).not.toBeVisible();

      // Card is now deleted
      await expect(page.getByText("QA Verification")).not.toBeVisible();
    });
  });
}
