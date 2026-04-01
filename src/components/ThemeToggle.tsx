"use client";

import { useTheme } from "@/features/theme/hooks/useTheme";
import SunIcon from "@/components/icons/SunIcon";
import MoonIcon from "@/components/icons/MoonIcon";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      data-theme-toggle
      onClick={toggle}
      aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="fixed top-4 right-4 z-[100] rounded-lg border border-border bg-surface p-2 text-foreground transition-colors hover:bg-background"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
