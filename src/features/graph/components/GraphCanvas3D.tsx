"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ForceGraphMethods, ForceGraphProps } from "react-force-graph-3d";

import type { GraphData, GraphEdge, GraphNode } from "../types/graph";
import type { ForceGraph3DNode } from "../types/layout";
import { useCameraControl } from "../hooks/useCameraControl";
import { useGraph3DRenderer } from "../hooks/useGraph3DRenderer";
import { useGraphLayout } from "../hooks/useGraphLayout";
import { useNodePerturbation } from "../hooks/useNodePerturbation";
import { useNodeSelection } from "../hooks/useNodeSelection";
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
const PANEL_CLOSE_CAMERA_DURATION_MS = 600;
const LAYOUT_TRANSITION_MS = 400;

interface GraphCanvas3DProps {
  graphData: GraphData;
  onEngineReady?: () => void;
  style?: React.CSSProperties;
}

export function GraphCanvas3D({
  graphData,
  onEngineReady: onEngineReadyProp,
  style,
}: GraphCanvas3DProps): React.ReactElement {
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const hasInitPhysics = useRef(false);
  const [engineReady, setEngineReady] = useState(false);

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
    onNodeHover,
    hoveredNodeId,
  } = useGraph3DRenderer(graphData, selectedNodeId ?? undefined);
  const { initCamera, setAutoRotate, focusNode, onInteractionEnd } =
    useCameraControl(graphRef);
  const { onEngineReady } = useScene3D(graphRef);
  const perturbationActive = engineReady && selectedNodeId === null;
  useNodePerturbation(
    fg3dData.nodes as ForceGraph3DNode[],
    perturbationActive,
    hoveredNodeId,
  );

  const prevSelectedNodeIdRef = useRef<string | null>(undefined);

  useEffect(() => {
    const prev = prevSelectedNodeIdRef.current;
    prevSelectedNodeIdRef.current = selectedNodeId;

    if (prev !== null && prev !== undefined && selectedNodeId === null) {
      initCamera(PANEL_CLOSE_CAMERA_DURATION_MS);
      onInteractionEnd();
    }
  }, [selectedNodeId, initCamera, onInteractionEnd]);

  const handleEngineStop = useCallback((): void => {
    if (hasInitPhysics.current) return;
    hasInitPhysics.current = true;

    const fg = graphRef.current;
    if (fg) {
      const chargeFn = fg.d3Force("charge");
      if (chargeFn) chargeFn.strength(CHARGE_STRENGTH);

      const linkFn = fg.d3Force("link");
      if (linkFn) linkFn.distance(LINK_DISTANCE);
    }

    setEngineReady(true);
    onEngineReady();
    onEngineReadyProp?.();
    initCamera();
    setAutoRotate(true);
  }, [onEngineReady, onEngineReadyProp, initCamera, setAutoRotate]);

  const handleNodeClick = useCallback(
    (node: ForceGraph3DNode): void => {
      const graphNode = node as ForceGraph3DNode & { id?: string };
      const id = graphNode.id;
      if (!id) return;
      const isFirstSelection = selectedNodeId === null;
      selectNode(id);
      if (isFirstSelection) {
        setTimeout(() => focusNode(node), LAYOUT_TRANSITION_MS);
      } else {
        focusNode(node);
      }
      onInteractionEnd();
    },
    [selectNode, focusNode, onInteractionEnd, selectedNodeId],
  );

  return (
    <div ref={containerRef} className="h-full w-full" style={style}>
      <ForceGraph3D
        ref={graphRef}
        graphData={fg3dData}
        width={graphWidth}
        height={graphHeight}
        numDimensions={3}
        warmupTicks={WARMUP_TICKS}
        cooldownTicks={COOLDOWN_TICKS}
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        linkColor={linkColor}
        linkOpacity={linkOpacity}
        linkWidth={1}
        onNodeClick={handleNodeClick}
        onNodeHover={onNodeHover}
        onEngineStop={handleEngineStop}
        showNavInfo={false}
      />
    </div>
  );
}
