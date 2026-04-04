"use client";

import { useTheme } from "@/features/theme/hooks/useTheme";
import SunIcon from "@/components/icons/SunIcon";
import MoonIcon from "@/components/icons/MoonIcon";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="다크 모드 전환"
      data-theme-toggle
      onClick={toggle}
      className={`relative flex h-6 w-11 cursor-pointer items-center rounded-full p-0.5 transition-colors ${isDark ? "bg-white" : "bg-neutral-800"}`}
    >
      {isDark && (
        <SunIcon
          size={12}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 text-neutral-800"
        />
      )}
      <span
        className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full shadow transition-transform duration-200 ease-in-out ${isDark ? "translate-x-5.5 bg-neutral-800" : "translate-x-1 bg-white"}`}
      />
      {!isDark && (
        <MoonIcon
          size={12}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white"
        />
      )}
    </button>
  );
}
