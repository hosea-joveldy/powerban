// Single source of truth for available themes: id (matches [data-theme] in
// themes.css and the value stored in users.theme), a label, and three swatch
// colors for the settings picker.
export const THEMES = [
  { id: "stone-light", label: "Stone Light", swatch: ["#E5E7E2", "#EFF1EC", "#1B2818"] },
  { id: "forest-dark", label: "Forest Dark", swatch: ["#121C0E", "#1B2916", "#C8DB57"] },
];

export const DEFAULT_THEME = "stone-light";

export function isValidTheme(id) {
  return THEMES.some((t) => t.id === id);
}
