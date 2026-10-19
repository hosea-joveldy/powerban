import { describe, it, expect } from "vitest";
import { THEMES, DEFAULT_THEME, isValidTheme } from "./themes.js";

describe("themes", () => {
  it("provides non-empty themes list", () => {
    expect(THEMES.length).toBeGreaterThan(0);
  });

  it("has a valid default theme", () => {
    expect(isValidTheme(DEFAULT_THEME)).toBe(true);
  });

  it("correctly identifies valid theme IDs", () => {
    for (const theme of THEMES) {
      expect(isValidTheme(theme.id)).toBe(true);
    }
  });

  it("rejects unknown theme IDs", () => {
    expect(isValidTheme("nonexistent-theme")).toBe(false);
    expect(isValidTheme("")).toBe(false);
  });
});
