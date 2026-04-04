"use client";

import { useCallback } from "react";
import type { ForceGraphMethods } from "react-force-graph-3d";

import type { CameraState, ForceGraph3DNode } from "../types/layout";

const INITIAL_CAMERA: Pick<CameraState, "x" | "y" | "z"> = {
  x: 0,
  y: 100,
  z: 200,
};

const FOCUS_CAMERA_OFFSET = { x: 0, y: 50, z: 120 };
const FOCUS_TRANSITION_MS = 800;

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
  setCameraImmediate: () => void;
  setAutoRotate: (enabled: boolean) => void;
  enableDamping: () => void;
  focusNode: (node: ForceGraph3DNode) => void;
  onInteractionEnd: () => void;
}

export function useCameraControl(
  graphRef: React.RefObject<ForceGraphMethods | undefined>,
): UseCameraControlReturn {
  const initCamera = useCallback(
    (duration?: number): void => {
      const fg = graphRef.current;
      if (!fg) return;
      fg.cameraPosition(
        { x: INITIAL_CAMERA.x, y: INITIAL_CAMERA.y, z: INITIAL_CAMERA.z },
        { x: 0, y: 0, z: 0 },
        duration,
      );
    },
    [graphRef],
  );

  const setCameraImmediate = useCallback((): void => {
    const fg = graphRef.current;
    if (!fg) return;
    const camera = fg.camera();
    camera.position.set(INITIAL_CAMERA.x, INITIAL_CAMERA.y, INITIAL_CAMERA.z);
    camera.lookAt(0, 0, 0);
  }, [graphRef]);

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
    setAutoRotate(true);
  }, [setAutoRotate]);

  return {
    initCamera,
    setCameraImmediate,
    setAutoRotate,
    enableDamping,
    focusNode,
    onInteractionEnd,
  };
}
