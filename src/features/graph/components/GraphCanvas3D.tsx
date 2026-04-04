"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ForceGraphMethods, ForceGraphProps } from "react-force-graph-3d";

import { getGraphGray } from "@/constants/tokens";
import { useTheme } from "@/hooks/useTheme";
import type { GraphData, GraphEdge, GraphNode } from "../types/graph";
import type { ForceGraph3DNode } from "../types/layout";
import { useCameraControl } from "../hooks/useCameraControl";
import { useGraph3DRenderer } from "../hooks/useGraph3DRenderer";
import { useGraphLayout } from "../hooks/useGraphLayout";
import { useNodeSelection } from "@/hooks/useNodeSelection";
import { useScene3D } from "../hooks/useScene3D";

// three-render-objects, 3d-force-graph 내부에서 사용하는 THREE.Clock이
// three.js r183에서 deprecated되어 발생하는 경고를 억제
const _warn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].includes("THREE.Clock")) return;
  _warn(...args);
};

type TypedForceGraph3DProps = ForceGraphProps<GraphNode, GraphEdge> & {
  ref?: React.MutableRefObject<ForceGraphMethods | undefined>;
};

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
}) as unknown as React.ComponentType<TypedForceGraph3DProps>;

const CHARGE_STRENGTH = -120;
const LINK_DISTANCE = 80;
const WARMUP_TICKS = 100;
const COOLDOWN_TICKS = 0;

interface GraphCanvas3DProps {
  graphData: GraphData;
  onNodeHoverChange?: (node: GraphNode | null) => void;
}

export function GraphCanvas3D({
  graphData,
  onNodeHoverChange,
}: GraphCanvas3DProps): React.ReactElement {
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const hasInitPhysics = useRef(false);
  const hasForcesConfigured = useRef(false);
  const [engineReady, setEngineReady] = useState(false);
  const { theme } = useTheme();
  const bgColor = getGraphGray(theme === "dark").bg;

  const fg3dData = useMemo(
    () => ({
      nodes: graphData.nodes,
      links: graphData.edges,
    }),
    [graphData],
  );

  const { selectedNodeId, selectNode } = useNodeSelection();
  const { graphWidth, graphHeight, containerRef } = useGraphLayout();
  const {
    nodeThreeObject,
    linkColor,
    linkOpacity,
    onNodeHover: rendererOnNodeHover,
  } = useGraph3DRenderer(graphData, selectedNodeId ?? undefined);
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

  const prevSelectedNodeIdRef = useRef<string | null>(undefined);

  useEffect(() => {
    const prev = prevSelectedNodeIdRef.current;
    prevSelectedNodeIdRef.current = selectedNodeId;

    if (prev !== null && prev !== undefined && selectedNodeId === null) {
      onInteractionEnd();
    }
  }, [selectedNodeId, onInteractionEnd]);

  const handleEngineStop = useCallback((): void => {
    if (hasInitPhysics.current) return;
    hasInitPhysics.current = true;

    setEngineReady(true);
    onEngineReady();
  }, [onEngineReady]);

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

  const handleNodeHover = useCallback(
    (
      node: ForceGraph3DNode | null,
      prevNode: ForceGraph3DNode | null,
    ): void => {
      setAutoRotate(node === null);
      rendererOnNodeHover(node, prevNode);

      if (node) {
        const id = (node as ForceGraph3DNode & { id?: string }).id;
        const graphNode = id
          ? (graphData.nodes.find((n) => n.id === id) ?? null)
          : null;
        onNodeHoverChange?.(graphNode);
      } else {
        onNodeHoverChange?.(null);
      }
    },
    [rendererOnNodeHover, setAutoRotate, graphData.nodes, onNodeHoverChange],
  );

  const handleNodeClick = useCallback(
    (node: ForceGraph3DNode): void => {
      const graphNode = node as ForceGraph3DNode & { id?: string };
      const id = graphNode.id;
      if (!id) return;
      selectNode(id);
      onInteractionEnd();
    },
    [selectNode, onInteractionEnd],
  );

  return (
    <div ref={containerRef} className="h-full w-full">
      <ForceGraph3D
        ref={graphRef}
        graphData={fg3dData}
        width={graphWidth}
        height={graphHeight}
        numDimensions={3}
        warmupTicks={WARMUP_TICKS}
        cooldownTicks={COOLDOWN_TICKS}
        controlType="orbit"
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        linkColor={linkColor}
        linkOpacity={linkOpacity}
        linkWidth={1}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onEngineStop={handleEngineStop}
        backgroundColor={bgColor}
        showNavInfo={false}
      />
    </div>
  );
}
