"use client";

import { useCallback } from "react";
import type { ForceGraphMethods } from "react-force-graph-3d";

import type { CameraState } from "../types/layout";

const INITIAL_CAMERA: Pick<CameraState, "x" | "y" | "z"> = {
  x: 0,
  y: 150,
  z: 300,
};

interface OrbitControlsLike {
  autoRotate: boolean;
}

function resolveControls(raw: object): OrbitControlsLike | null {
  const candidate = raw as Record<string, unknown>;
  if (typeof candidate["autoRotate"] === "boolean") {
    return candidate as OrbitControlsLike;
  }
  return null;
}

interface UseCameraControlReturn {
  initCamera: () => void;
  setAutoRotate: (enabled: boolean) => void;
}

export function useCameraControl(
  graphRef: React.RefObject<ForceGraphMethods | undefined>,
): UseCameraControlReturn {
  const initCamera = useCallback((): void => {
    const fg = graphRef.current;
    if (!fg) return;
    fg.cameraPosition(
      { x: INITIAL_CAMERA.x, y: INITIAL_CAMERA.y, z: INITIAL_CAMERA.z },
      { x: 0, y: 0, z: 0 },
    );
  }, [graphRef]);

  const setAutoRotate = useCallback(
    (enabled: boolean): void => {
      const fg = graphRef.current;
      if (!fg) return;
      const raw = fg.controls();
      const controls = resolveControls(raw);
      if (controls) {
        controls.autoRotate = enabled;
      }
    },
    [graphRef],
  );

  return { initCamera, setAutoRotate };
}
