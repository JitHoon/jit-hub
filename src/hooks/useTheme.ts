"use client";

import { useCallback, useLayoutEffect, useSyncExternalStore } from "react";
import {
  type Theme,
  applyThemeToDOM,
  getEffectiveTheme,
  toggleTheme,
} from "@/features/theme/utils/store";

function subscribe(callback: () => void): () => void {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  window.addEventListener("storage", callback);
  return () => {
    mq.removeEventListener("change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): Theme {
  return getEffectiveTheme();
}

function getServerSnapshot(): Theme {
  return "light";
}

interface UseThemeReturn {
  theme: Theme;
  toggle: () => void;
}

export function useTheme(): UseThemeReturn {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useLayoutEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const toggle = useCallback(() => {
    toggleTheme();
  }, []);

  return { theme, toggle };
}
