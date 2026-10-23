import { test, expect } from "@playwright/test";

if (!process.env.VITEST) {
  test.describe("Existing Card & Board Picker (T16)", () => {
  test("allows selecting existing card with board attribution and existing board", async ({ page }) => {
    // 1. Register test user with unique username and email
    const rand = Math.floor(Math.random() * 1000000);
    const uniqueEmail = `picker_${Date.now()}_${rand}@powerban.test`;
    const uniqueUsername = `p_${Date.now().toString().slice(-6)}_${rand}`.slice(0, 16);
    await page.goto("/register");
    await page.locator("#register-username").fill(uniqueUsername);
    await page.locator("#register-email").fill(uniqueEmail);
    await page.locator("#register-password").fill("pass12345");
    await page.locator(".btn-split-pill").click();
    await expect(page).toHaveURL("/");

    // 2. Create Board A ("Alpha Board")
    await page.getByRole("button", { name: "+ board" }).first().click();
    let prompt = page.getByRole("dialog");
    await prompt.locator(".modal-input").fill("Alpha Board");
    await prompt.getByRole("button", { name: "Create Board" }).click();
    await expect(prompt).not.toBeVisible();

    // 3. Create Board B ("Beta Board")
    await page.getByRole("button", { name: "+ board" }).first().click();
    prompt = page.getByRole("dialog");
    await prompt.locator(".modal-input").fill("Beta Board");
    await prompt.getByRole("button", { name: "Create Board" }).click();
    await expect(prompt).not.toBeVisible();

    // 4. Open Alpha Board
    await page.getByRole("link", { name: "Alpha Board" }).click();
    await expect(page).toHaveURL(/\/boards\/\d+/);

    // Open options menu on Normal column
    const normalCol = page.locator(".card-column", { hasText: "NORMAL" });
    await normalCol.locator(".three-dots-btn").click();

    // Click "+ Add Task as a Card"
    await page.getByRole("menuitem", { name: "+ Add Task as a Card" }).click();

    // Entity Picker modal should open
    const pickerModal = page.getByRole("dialog");
    await expect(pickerModal).toBeVisible();
    await expect(pickerModal.getByText("Add Task as Existing Card")).toBeVisible();

    // Verify board attribution is displayed for matching cards (e.g. from board: Beta Board)
    const betaBoardCard = pickerModal.locator(".picker-item-row", { hasText: "from board: Beta Board" });
    await expect(betaBoardCard.first()).toBeVisible();

    // Search for "Normal"
    const searchInput = pickerModal.locator(".modal-input");
    await searchInput.fill("Normal");

    // Select the card from Beta Board
    await betaBoardCard.first().click();
    await pickerModal.getByRole("button", { name: "Add as Task" }).click();
    await expect(pickerModal).not.toBeVisible();

    // Verify task is added with nested card styling
    await expect(normalCol.locator(".task-card", { hasText: "Normal" })).toBeVisible();
    await expect(normalCol.locator(".card-badge")).toBeVisible();

    // Now test "+ Add Task as a Board"
    await normalCol.locator(".three-dots-btn").click();
    await page.getByRole("menuitem", { name: "+ Add Task as a Board" }).click();

    const boardPickerModal = page.getByRole("dialog");
    await expect(boardPickerModal).toBeVisible();
    await expect(boardPickerModal.getByText("Add Task as Existing Board")).toBeVisible();

    // Select Beta Board
    const betaBoardOption = boardPickerModal.locator(".picker-item-row", { hasText: "Beta Board" });
    await expect(betaBoardOption).toBeVisible();
    await betaBoardOption.click();
    await boardPickerModal.getByRole("button", { name: "Add as Task" }).click();
    await expect(boardPickerModal).not.toBeVisible();

    // Verify task is added with board badge
    await expect(normalCol.locator(".task-card", { hasText: "Beta Board" })).toBeVisible();
    await expect(normalCol.locator(".board-badge")).toBeVisible();
  });
});
}
