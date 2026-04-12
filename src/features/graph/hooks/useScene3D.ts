"use client";

import { useCallback, useLayoutEffect } from "react";
import * as THREE from "three";
import type { ForceGraphMethods } from "react-force-graph-3d";

import { getGraphGray } from "@/constants/tokens";
import { useTheme } from "@/hooks/useTheme";

function applySceneTheme(scene: THREE.Scene, isDark: boolean): void {
  scene.background = new THREE.Color(getGraphGray(isDark).bg);
  scene.fog = null;
}

interface UseScene3DReturn {
  onEngineReady: () => void;
}

export function useScene3D(
  graphRef: React.RefObject<ForceGraphMethods | undefined>,
): UseScene3DReturn {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const onEngineReady = useCallback((): void => {
    const fg = graphRef.current;
    if (!fg) return;
    applySceneTheme(fg.scene(), isDark);
  }, [graphRef, isDark]);

  useLayoutEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;
    applySceneTheme(fg.scene(), isDark);
  }, [graphRef, isDark]);

  return { onEngineReady };
}
