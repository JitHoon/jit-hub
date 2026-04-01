"use client";

import { useCallback, useEffect } from "react";
import * as THREE from "three";
import type { ForceGraphMethods } from "react-force-graph-3d";

import { getGraphGray } from "@/constants/tokens";
import { useTheme } from "@/features/theme/hooks/useTheme";

const AMBIENT_LIGHT_INTENSITY = 0.6;
const DIRECTIONAL_LIGHT_INTENSITY = 0.8;
const FOG_DENSITY = 0.002;

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

      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color = bgColor;
      }
    },
    [isDark],
  );

  const onEngineReady = useCallback((): void => {
    const fg = graphRef.current;
    if (!fg) return;

    const scene = fg.scene();

    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      AMBIENT_LIGHT_INTENSITY,
    );
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(
      0xffffff,
      DIRECTIONAL_LIGHT_INTENSITY,
    );
    dirLight.position.set(1, 1, 1);
    scene.add(dirLight);

    const gray = getGraphGray(isDark);
    const bgColor = new THREE.Color(gray.bg);
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2(bgColor, FOG_DENSITY);
  }, [graphRef, isDark]);

  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;

    const scene = fg.scene();
    applySceneTheme(scene);
  }, [graphRef, applySceneTheme]);

  return { onEngineReady };
}
