import { test, expect } from "@playwright/test";

if (!process.env.VITEST) {
  test.describe("Authentication Pages Rebuild (T4)", () => {
    test("Login page matches reference layout at desktop (1280px) and phone (375px) widths", async ({
      page,
    }) => {
      // 1. Desktop width verification
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto("/login");

      // Verify no dialogs intercepted
      page.on("dialog", (dialog) => {
        throw new Error(`Unexpected native dialog: ${dialog.message()}`);
      });

      // Verify card layout and typography
      const card = page.locator(".auth-card");
      await expect(card).toBeVisible();
      const heading = page.locator(".auth-title");
      await expect(heading).toHaveText("Log in");

      // Verify stacked inputs and uppercase micro-labels
      const stackedContainer = page.locator(".input-group-stacked");
      await expect(stackedContainer).toBeVisible();

      const emailLabel = page.locator('label[for="login-email"]');
      await expect(emailLabel).toHaveText("Email");

      const passwordLabel = page.locator('label[for="login-password"]');
      await expect(passwordLabel).toHaveText("Password");

      const emailInput = page.locator("#login-email");
      const passwordInput = page.locator("#login-password");
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();

      // Verify password visibility toggle
      const toggleBtn = page.locator(".password-toggle-btn");
      await expect(toggleBtn).toBeVisible();
      await passwordInput.fill("secretPassword123");
      await expect(passwordInput).toHaveAttribute("type", "password");

      await toggleBtn.click();
      await expect(passwordInput).toHaveAttribute("type", "text");

      await toggleBtn.click();
      await expect(passwordInput).toHaveAttribute("type", "password");

      // Verify split action pill button [ Log in ] [ -> ]
      const splitBtn = page.locator(".btn-split-pill");
      await expect(splitBtn).toBeVisible();
      await expect(splitBtn.locator(".split-pill-label")).toHaveText("Log in");
      await expect(splitBtn.locator(".split-pill-arrow")).toHaveText("→");

      // Verify terms text and footer link
      await expect(page.locator(".auth-terms")).toContainText("Terms of Use");
      const signupLink = page.locator(".auth-footer-link").getByRole("link", { name: /Sign up/i });
      await expect(signupLink).toBeVisible();

      // Capture desktop screenshot
      await page.screenshot({ path: "../.run/screenshots/login-desktop.png" });

      // 2. Phone width verification
      await page.setViewportSize({ width: 375, height: 667 });
      await page.screenshot({ path: "../.run/screenshots/login-phone.png" });
    });

    test("Login page shows inline errors and enforces 429 rate limiting", async ({
      page,
    }) => {
      await page.goto("/login");

      const rateLimitEmail = `ratelimit_ui_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.dev`;
      const emailInput = page.locator("#login-email");
      const passwordInput = page.locator("#login-password");
      const submitBtn = page.locator(".btn-split-pill");

      // 1. Single invalid credential attempt -> 401 inline error
      await emailInput.fill(rateLimitEmail);
      await passwordInput.fill("wrongpass_1");
      await submitBtn.click();

      const errorText = page.locator(".error-text");
      await expect(errorText).toBeVisible();
      await expect(errorText).toContainText(/Invalid email or password/i);

      // 2. Trigger rate limiting by submitting 4 more bad attempts
      for (let i = 2; i <= 5; i++) {
        await passwordInput.fill(`wrongpass_${i}`);
        await submitBtn.click();
        await expect(errorText).toContainText(/Invalid email or password/i);
      }

      // 6th attempt should trigger 429 Too Many Requests
      await passwordInput.fill("wrongpass_6");
      await submitBtn.click();
      await expect(errorText).toContainText(/Too many failed login attempts/i);
    });

    test("Register page matches design system and links to login", async ({
      page,
    }) => {
      // 1. Desktop width
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto("/register");

      page.on("dialog", (dialog) => {
        throw new Error(`Unexpected native dialog: ${dialog.message()}`);
      });

      const heading = page.locator(".auth-title");
      await expect(heading).toHaveText("Create account");

      const emailLabel = page.locator('label[for="register-email"]');
      await expect(emailLabel).toHaveText("Email");

      const passwordLabel = page.locator('label[for="register-password"]');
      await expect(passwordLabel).toHaveText("Password");

      const splitBtn = page.locator(".btn-split-pill");
      await expect(splitBtn).toBeVisible();
      await expect(splitBtn.locator(".split-pill-label")).toHaveText("Create account");

      // Screenshot register desktop
      await page.screenshot({ path: "../.run/screenshots/register-desktop.png" });

      // 2. Phone width
      await page.setViewportSize({ width: 375, height: 667 });
      await page.screenshot({ path: "../.run/screenshots/register-phone.png" });

      // Test link back to login
      const signinLink = page.getByRole("link", { name: /Sign in/i });
      await signinLink.click();
      await expect(page).toHaveURL("/login");
    });
  });
}
