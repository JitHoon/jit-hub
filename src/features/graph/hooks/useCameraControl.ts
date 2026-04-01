"use client";

import { useCallback, useRef } from "react";
import type { ForceGraphMethods } from "react-force-graph-3d";

import type { CameraState, ForceGraph3DNode } from "../types/layout";

const INITIAL_CAMERA: Pick<CameraState, "x" | "y" | "z"> = {
  x: 0,
  y: 150,
  z: 300,
};

const FOCUS_CAMERA_OFFSET = { x: 0, y: 50, z: 120 };
const FOCUS_TRANSITION_MS = 800;
const AUTO_ROTATE_RESUME_DELAY_MS = 3000;

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
  focusNode: (node: ForceGraph3DNode) => void;
  onInteractionEnd: () => void;
}

export function useCameraControl(
  graphRef: React.RefObject<ForceGraphMethods | undefined>,
): UseCameraControlReturn {
  const autoRotateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const focusNode = useCallback(
    (node: ForceGraph3DNode): void => {
      const fg = graphRef.current;
      if (!fg) return;
      const nx = (node.x ?? 0) + FOCUS_CAMERA_OFFSET.x;
      const ny = (node.y ?? 0) + FOCUS_CAMERA_OFFSET.y;
      const nz = (node.z ?? 0) + FOCUS_CAMERA_OFFSET.z;
      fg.cameraPosition(
        { x: nx, y: ny, z: nz },
        { x: node.x ?? 0, y: node.y ?? 0, z: node.z ?? 0 },
        FOCUS_TRANSITION_MS,
      );
    },
    [graphRef],
  );

  const onInteractionEnd = useCallback((): void => {
    if (autoRotateTimerRef.current !== null) {
      clearTimeout(autoRotateTimerRef.current);
    }
    autoRotateTimerRef.current = setTimeout(() => {
      autoRotateTimerRef.current = null;
      const fg = graphRef.current;
      if (!fg) return;
      const raw = fg.controls();
      const controls = resolveControls(raw);
      if (controls) {
        controls.autoRotate = true;
      }
    }, AUTO_ROTATE_RESUME_DELAY_MS);
  }, [graphRef]);

  return { initCamera, setAutoRotate, focusNode, onInteractionEnd };
}
