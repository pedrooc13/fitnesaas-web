export type ThemePref = "system" | "light" | "dark";

export const THEME_LABELS: Record<ThemePref, string> = {
  system: "Sistema",
  light: "Claro",
  dark: "Escuro",
};

export function parseTheme(value: string | undefined): ThemePref {
  return value === "light" || value === "dark" ? value : "system";
}
