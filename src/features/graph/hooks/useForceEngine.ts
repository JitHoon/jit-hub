"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ForceGraphMethods } from "react-force-graph-3d";

import { useCameraControl } from "./useCameraControl";
import { useScene3D } from "./useScene3D";

const CHARGE_STRENGTH = -120;
const LINK_DISTANCE = 80;

interface UseForceEngineReturn {
  graphRef: React.RefObject<ForceGraphMethods | undefined>;
  engineReady: boolean;
  setAutoRotate: (enabled: boolean) => void;
  onInteractionEnd: () => void;
  handleEngineStop: () => void;
}

export function useForceEngine(onReady?: () => void): UseForceEngineReturn {
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const hasInitPhysics = useRef(false);
  const hasForcesConfigured = useRef(false);
  const [engineReady, setEngineReady] = useState(false);

  const { setCameraImmediate, setAutoRotate, enableDamping, onInteractionEnd } =
    useCameraControl(graphRef);
  const { onEngineReady } = useScene3D(graphRef);

  useEffect(() => {
    if (hasForcesConfigured.current) return;
    const fg = graphRef.current;
    if (!fg) return;
    hasForcesConfigured.current = true;

    const chargeFn = fg.d3Force("charge");
    if (chargeFn) chargeFn.strength(CHARGE_STRENGTH);

    const linkFn = fg.d3Force("link");
    if (linkFn) linkFn.distance(LINK_DISTANCE);

    setCameraImmediate();
    enableDamping();
  });

  const handleEngineStop = useCallback((): void => {
    if (hasInitPhysics.current) return;
    hasInitPhysics.current = true;

    setEngineReady(true);
    onEngineReady();
    onReady?.();
  }, [onEngineReady, onReady]);

  useEffect(() => {
    if (!engineReady) return;
    const raf = requestAnimationFrame(() => {
      setAutoRotate(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [engineReady, setAutoRotate]);

  useEffect(() => {
    if (!engineReady) return;
    const fg = graphRef.current;
    if (!fg) return;
    const doc = fg.renderer().domElement.ownerDocument;

    const guardSyntheticPointerUp = (e: PointerEvent): void => {
      if (!e.isTrusted && e.pointerType === "touch") {
        e.stopImmediatePropagation();
      }
    };

    doc.addEventListener("pointerup", guardSyntheticPointerUp, {
      capture: true,
    });
    return () => {
      doc.removeEventListener("pointerup", guardSyntheticPointerUp, {
        capture: true,
      });
    };
  }, [engineReady]);

  return {
    graphRef,
    engineReady,
    setAutoRotate,
    onInteractionEnd,
    handleEngineStop,
  };
}
