"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { GraphMode } from "../types/layout";

const SPLIT_RATIO = 0.38;

interface UseGraphLayoutReturn {
  mode: GraphMode;
  setMode: (mode: GraphMode) => void;
  graphWidth: number;
  graphHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useGraphLayout(): UseGraphLayoutReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<GraphMode>("fullscreen");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSetMode = useCallback((next: GraphMode): void => {
    setMode(next);
  }, []);

  const graphWidth =
    mode === "split" ? dimensions.width * SPLIT_RATIO : dimensions.width;
  const graphHeight = dimensions.height;

  return {
    mode,
    setMode: handleSetMode,
    graphWidth,
    graphHeight,
    containerRef,
  };
}
