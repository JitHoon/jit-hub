/**
 * 다크 모드 토글 유틸리티
 *
 * <html> 요소의 `dark` 클래스와 localStorage를 동기화한다.
 * globals.css의 .dark 선택자와 연동된다.
 */

const STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return null;
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getEffectiveTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(STORAGE_KEY, theme);
  // useSyncExternalStore의 subscribe 콜백을 트리거
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
}

export function toggleTheme(): Theme {
  const next = getEffectiveTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
