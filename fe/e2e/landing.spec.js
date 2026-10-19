import { test, expect } from "@playwright/test";

if (!process.env.VITEST) {
  test.describe("Landing Page Entry Route & Hero (T3)", () => {
    test("renders landing page matching references at desktop width", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto("/");

      // Brand mark and navigation
      const brand = page.getByRole("link", { name: /Powerban/i });
      await expect(brand).toBeVisible();

      // Top CTA
      const topCta = page.locator(".nav-cta").getByRole("link", { name: /Get started/i });
      await expect(topCta).toBeVisible();
      await expect(topCta).toHaveAttribute("href", "/login");

      // Hero section
      const heroTitle = page.locator(".hero-title");
      await expect(heroTitle).toBeVisible();
      await expect(heroTitle).toContainText("Powerban");

      // Hero canvas
      const canvas = page.locator(".hero-orbit-container canvas");
      await expect(canvas).toBeVisible();

      // Hero CTA buttons
      const tryItNowBtn = page.locator(".hero-actions").getByRole("link", { name: /Try it now/i });
      await expect(tryItNowBtn).toBeVisible();
      await expect(tryItNowBtn).toHaveAttribute("href", "/login");

      // Section 2 feature showcase cards
      const showcaseSection = page.locator(".landing-section-2");
      await expect(showcaseSection).toBeVisible();
      await expect(page.getByRole("heading", { name: /Workspaces & Groups/i })).toBeVisible();
      await expect(page.getByRole("heading", { name: /Linked Boards & Progress/i })).toBeVisible();

      // Section 2 spotlight
      await expect(page.getByRole("heading", { name: /Build with Powerban/i })).toBeVisible();
      const openBoardBtn = page.getByRole("link", { name: /Open Board/i });
      await expect(openBoardBtn).toBeVisible();

      // Section 3 dark showcase banner
      const darkBanner = page.locator(".dark-banner");
      await expect(darkBanner).toBeVisible();
      await expect(darkBanner.getByRole("heading", { name: /Build the future of/i })).toBeVisible();

      // Section 3 lime CTA
      const limeCta = darkBanner.getByRole("link", { name: /Get started/i });
      await expect(limeCta).toBeVisible();
      await expect(limeCta).toHaveClass(/btn-pill-lime/);
      await expect(limeCta).toHaveAttribute("href", "/login");

      // Save desktop screenshot for visual comparison
      await page.screenshot({
        path: ".run/screenshots/landing-desktop.png",
        fullPage: true,
      });

      // Test navigation to login
      await tryItNowBtn.click();
      await expect(page).toHaveURL("/login");
    });

    test("renders responsive landing page at phone width (375px)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      // Brand and CTA remain accessible
      const brand = page.getByRole("link", { name: /Powerban/i });
      await expect(brand).toBeVisible();

      const topCta = page.locator(".nav-cta").getByRole("link", { name: /Get started/i });
      await expect(topCta).toBeVisible();

      // Hero heading wraps responsively
      const heroTitle = page.locator(".hero-title");
      await expect(heroTitle).toBeVisible();

      // Save phone screenshot
      await page.screenshot({
        path: ".run/screenshots/landing-phone.png",
        fullPage: true,
      });
    });
  });
}
