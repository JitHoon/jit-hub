"use client";

import { useTheme } from "@/hooks/useTheme";
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
      className="relative flex h-6 w-11 cursor-pointer items-center rounded-full p-0.5 transition-colors bg-neutral-800 dark:bg-white"
    >
      <SunIcon
        size={12}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 text-neutral-800 hidden dark:block"
      />
      <span className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full shadow transition-transform duration-200 ease-in-out translate-x-1 bg-white dark:translate-x-5.5 dark:bg-neutral-800" />
      <MoonIcon
        size={12}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white block dark:hidden"
      />
    </button>
  );
}
