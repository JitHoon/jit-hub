"use client";

import { useCallback, useEffect } from "react";
import * as THREE from "three";
import type { ForceGraphMethods } from "react-force-graph-3d";

import { getGraphGray } from "@/constants/tokens";
import { useTheme } from "@/features/theme/hooks/useTheme";

interface UseScene3DReturn {
  onEngineReady: () => void;
}

export function useScene3D(
  graphRef: React.RefObject<ForceGraphMethods | undefined>,
): UseScene3DReturn {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const applySceneTheme = useCallback(
    (scene: THREE.Scene): void => {
      const gray = getGraphGray(isDark);
      const bgColor = new THREE.Color(gray.bg);

      scene.background = bgColor;
      scene.fog = null;
    },
    [isDark],
  );

  const onEngineReady = useCallback((): void => {
    const fg = graphRef.current;
    if (!fg) return;

    const scene = fg.scene();

    const gray = getGraphGray(isDark);
    const bgColor = new THREE.Color(gray.bg);
    scene.background = bgColor;
    scene.fog = null;
  }, [graphRef, isDark]);

  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;

    const scene = fg.scene();
    applySceneTheme(scene);
  }, [graphRef, applySceneTheme]);

  return { onEngineReady };
}
