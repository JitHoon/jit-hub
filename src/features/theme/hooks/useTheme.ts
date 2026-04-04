"use client";

import { useCallback, useSyncExternalStore } from "react";
import { type Theme, getEffectiveTheme, toggleTheme } from "../utils/store";

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
  const toggle = useCallback(() => {
    toggleTheme();
  }, []);

  return { theme, toggle };
}
