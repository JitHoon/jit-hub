const STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return null;
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getEffectiveTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

export function applyThemeToDOM(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function applyTheme(theme: Theme): void {
  applyThemeToDOM(theme);
  localStorage.setItem(STORAGE_KEY, theme);
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
}

export function toggleTheme(): Theme {
  const next = getEffectiveTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
