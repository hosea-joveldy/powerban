import { describe, it, expect } from "vitest";
import { progressBar } from "./progress.js";

describe("progressBar", () => {
  it("renders an empty bar when percent is 0", () => {
    expect(progressBar(0, 5)).toBe("░░░░░");
  });

  it("renders a full bar when percent is 100", () => {
    expect(progressBar(100, 5)).toBe("▓▓▓▓▓");
  });

  it("renders correct filled blocks for 50 percent with default width 5", () => {
    expect(progressBar(50)).toBe("▓▓▓░░");
  });

  it("handles custom width correctly", () => {
    expect(progressBar(60, 10)).toBe("▓▓▓▓▓▓░░░░");
  });
});
