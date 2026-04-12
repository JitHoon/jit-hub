"use client";

import { useCallback } from "react";
import type { ForceGraphMethods } from "react-force-graph-3d";

const INITIAL_CAMERA = { x: 0, y: 100, z: 200 };
const DAMPING_FACTOR = 0.08;
const AUTO_ROTATE_SPEED = 0.5;

interface OrbitControlsLike {
  autoRotate: boolean;
  autoRotateSpeed: number;
  enableDamping: boolean;
  dampingFactor: number;
}

function resolveControls(raw: object): OrbitControlsLike | null {
  const candidate = raw as Record<string, unknown>;
  if (typeof candidate["enableDamping"] === "boolean") {
    return candidate as unknown as OrbitControlsLike;
  }
  return null;
}

interface UseCameraControlReturn {
  initCamera: (duration?: number) => void;
  setAutoRotate: (enabled: boolean) => void;
  enableDamping: () => void;
}

export function useCameraControl(
  graphRef: React.RefObject<ForceGraphMethods | undefined>,
): UseCameraControlReturn {
  const initCamera = useCallback(
    (duration = 0): void => {
      const fg = graphRef.current;
      if (!fg) return;
      if (duration === 0) {
        const camera = fg.camera();
        camera.position.set(
          INITIAL_CAMERA.x,
          INITIAL_CAMERA.y,
          INITIAL_CAMERA.z,
        );
        camera.lookAt(0, 0, 0);
      } else {
        fg.cameraPosition(
          { x: INITIAL_CAMERA.x, y: INITIAL_CAMERA.y, z: INITIAL_CAMERA.z },
          { x: 0, y: 0, z: 0 },
          duration,
        );
      }
    },
    [graphRef],
  );

  const setAutoRotate = useCallback(
    (enabled: boolean): void => {
      const fg = graphRef.current;
      if (!fg) return;
      const raw = fg.controls();
      const controls = resolveControls(raw);
      if (controls) {
        controls.autoRotate = enabled;
        controls.autoRotateSpeed = AUTO_ROTATE_SPEED;
      }
    },
    [graphRef],
  );

  const enableDamping = useCallback((): void => {
    const fg = graphRef.current;
    if (!fg) return;
    const raw = fg.controls();
    const controls = resolveControls(raw);
    if (controls) {
      controls.enableDamping = true;
      controls.dampingFactor = DAMPING_FACTOR;
    }
  }, [graphRef]);

  return { initCamera, setAutoRotate, enableDamping };
}
