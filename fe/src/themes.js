// Single source of truth for available themes: id (matches [data-theme] in
// themes.css and the value stored in users.theme), a label, and three swatch
// colors for the settings picker.
export const THEMES = [
  { id: "gruvbox-dark", label: "Gruvbox Dark", swatch: ["#1d2021", "#282828", "#fe8019"] },
  { id: "catppuccin-mocha", label: "Catppuccin Mocha", swatch: ["#1e1e2e", "#181825", "#cba6f7"] },
  { id: "nord", label: "Nord", swatch: ["#2e3440", "#3b4252", "#88c0d0"] },
  { id: "ayu-dark", label: "Ayu Dark", swatch: ["#0a0e14", "#0d1017", "#ffb454"] },
  { id: "everforest-dark", label: "Everforest Dark", swatch: ["#2d353b", "#343f44", "#a7c080"] },
];

export const DEFAULT_THEME = "gruvbox-dark";

export function isValidTheme(id) {
  return THEMES.some((t) => t.id === id);
}
