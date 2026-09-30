// Renders the flat progress ratio as a fixed-width block bar, e.g. "▓▓▓░░ 60%".
// Kept to one place since the design intentionally limits this motif to the
// dashboard tiles and the board header, not every progress reference.
export function progressBar(percent, width = 5) {
  const filled = Math.round((percent / 100) * width);
  return "▓".repeat(filled) + "░".repeat(width - filled);
}
