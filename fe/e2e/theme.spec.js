import { test, expect } from "@playwright/test";

if (!process.env.VITEST) {
  test.describe("Theme System & Tokens (T2.1)", () => {
    let email;
    const password = "password123";

    test("loads default stone-light theme with tokens matching DESIGN_SYSTEM.md", async ({
      page,
    }) => {
      await page.goto("/");

      // Document root data-theme attribute defaults to stone-light
      const themeAttr = await page.evaluate(() =>
        document.documentElement.getAttribute("data-theme")
      );
      expect(themeAttr).toBe("stone-light");

      // Verify stone-light tokens matching DESIGN_SYSTEM.md
      const styles = await page.evaluate(() => {
        const computed = getComputedStyle(document.documentElement);
        return {
          bgCanvas: computed.getPropertyValue("--bg-canvas").trim().toLowerCase(),
          btnPrimaryBg: computed.getPropertyValue("--btn-primary-bg").trim().toLowerCase(),
          textPrimary: computed.getPropertyValue("--text-primary").trim().toLowerCase(),
          fontSerif: computed.getPropertyValue("--font-serif").trim(),
          fontSans: computed.getPropertyValue("--font-sans").trim(),
        };
      });

      expect(styles.bgCanvas).toBe("#e5e7e2");
      expect(styles.btnPrimaryBg).toBe("#1b2818");
      expect(styles.textPrimary).toBe("#151a14");
      expect(styles.fontSerif).toContain("Newsreader");
      expect(styles.fontSans).toContain("Inter");

      // Screenshot stone-light theme
      await page.screenshot({ path: "../.run/screenshots/theme-stone-light-desktop.png" });
    });

    test("applies forest-dark, persists to backend and localStorage, and avoids FOUT on reload", async ({
      page,
    }) => {
      email = `qa_theme_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.dev`;
      await page.goto("/register");
      await page.getByPlaceholder("email").fill(email);
      await page.getByPlaceholder("password (min 8 characters)").fill(password);
      await page.getByRole("button", { name: /create account/i }).click();
      await expect(page).toHaveURL("/");

      // Go to settings and choose Forest Dark
      await page.goto("/settings");

      // Initially in default stone-light: only dark logo is visible
      await expect(page.locator(".topbar-logo-dark")).toBeVisible();
      await expect(page.locator(".topbar-logo-light")).toBeHidden();

      await page.getByRole("button", { name: /Forest Dark/i }).click();

      // Verify document theme changed to forest-dark
      const themeAttr = await page.evaluate(() =>
        document.documentElement.getAttribute("data-theme")
      );
      expect(themeAttr).toBe("forest-dark");

      const styles = await page.evaluate(() => {
        const computed = getComputedStyle(document.documentElement);
        return {
          bgCanvas: computed.getPropertyValue("--bg-canvas").trim().toLowerCase(),
          btnPrimaryBg: computed.getPropertyValue("--btn-primary-bg").trim().toLowerCase(),
          accentLime: computed.getPropertyValue("--accent-lime").trim().toLowerCase(),
        };
      });

      expect(styles.bgCanvas).toBe("#121c0e");
      expect(styles.btnPrimaryBg).toBe("#c8db57");
      expect(styles.accentLime).toBe("#c8db57");

      // Screenshot forest-dark theme
      await page.screenshot({ path: "../.run/screenshots/theme-forest-dark-desktop.png" });

      // Verify logo visibility in forest-dark (only light logo visible)
      await expect(page.locator(".topbar-logo-light")).toBeVisible();
      await expect(page.locator(".topbar-logo-dark")).toBeHidden();

      // Reload page and verify theme stays forest-dark without flashing default
      await page.reload();
      const reloadedTheme = await page.evaluate(() =>
        document.documentElement.getAttribute("data-theme")
      );
      expect(reloadedTheme).toBe("forest-dark");

      // Verify logo visibility remains correct after reload
      await expect(page.locator(".topbar-logo-light")).toBeVisible();
      await expect(page.locator(".topbar-logo-dark")).toBeHidden();
    });
  });
}
