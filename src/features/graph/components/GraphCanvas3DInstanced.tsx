"use client";

import { useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import type { ForceGraphMethods, ForceGraphProps } from "react-force-graph-3d";

import "@/features/graph/utils/suppress-three-warnings";
import { getGraphGray } from "@/constants/tokens";
import { useTheme } from "@/hooks/useTheme";
import { useNodeSelection } from "@/hooks/useNodeSelection";
import type { GraphData, GraphEdge, GraphNode } from "../types/graph";
import type { ForceGraph3DNode } from "../types/layout";
import { useForceEngine } from "../hooks/useForceEngine";
import { useGraphLayout } from "../hooks/useGraphLayout";
import { useInstancedNodes } from "../hooks/useInstancedNodes";

type TypedForceGraph3DProps = ForceGraphProps<GraphNode, GraphEdge> & {
  ref?: React.MutableRefObject<ForceGraphMethods | undefined>;
};

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
}) as unknown as React.ComponentType<TypedForceGraph3DProps>;

const WARMUP_TICKS = 100;
const COOLDOWN_TICKS = 0;

const EDGE_COLOR_DARK = "#111111";
const EDGE_COLOR_LIGHT = "#FFFFFF";

interface GraphCanvas3DInstancedProps {
  graphData: GraphData;
  onNodeHoverChange?: (node: GraphNode | null) => void;
  onReady?: () => void;
}

export function GraphCanvas3DInstanced({
  graphData,
  onNodeHoverChange,
  onReady,
}: GraphCanvas3DInstancedProps): React.ReactElement {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const bgColor = getGraphGray(isDark).bg;

  const fg3dData = useMemo(
    () => ({
      nodes: graphData.nodes,
      links: graphData.edges,
    }),
    [graphData],
  );

  const { graphWidth, graphHeight, containerRef } = useGraphLayout();
  const { graphRef, setAutoRotate, onInteractionEnd, handleEngineStop } =
    useForceEngine(onReady);

  const { selectedNodeId, selectNode } = useNodeSelection();

  const { nodeThreeObject, onEngineTick, setHoveredId, setSelectedId } =
    useInstancedNodes(graphRef, graphData);

  const handleNodeHover = useCallback(
    (node: ForceGraph3DNode | null): void => {
      setAutoRotate(node === null);
      if (node) {
        const id = (node as ForceGraph3DNode & { id?: string }).id;
        setHoveredId(id ?? null);
        const graphNode = id
          ? (graphData.nodes.find((n) => n.id === id) ?? null)
          : null;
        onNodeHoverChange?.(graphNode);
      } else {
        setHoveredId(null);
        onNodeHoverChange?.(null);
      }
    },
    [setAutoRotate, setHoveredId, graphData.nodes, onNodeHoverChange],
  );

  const handleNodeClick = useCallback(
    (node: ForceGraph3DNode): void => {
      const id = (node as ForceGraph3DNode & { id?: string }).id;
      if (!id) return;
      selectNode(id);
      setSelectedId(id);
      onInteractionEnd();
    },
    [selectNode, setSelectedId, onInteractionEnd],
  );

  const linkColor = useCallback(
    (): string => (isDark ? EDGE_COLOR_DARK : EDGE_COLOR_LIGHT),
    [isDark],
  );

  // 선택 변경 시 InstancedMesh 색상 동기화
  useEffect(() => {
    setSelectedId(selectedNodeId ?? undefined);
  }, [selectedNodeId, setSelectedId]);

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
        linkOpacity={1}
        linkWidth={1}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onEngineStop={handleEngineStop}
        onEngineTick={onEngineTick}
        backgroundColor={bgColor}
        showNavInfo={false}
      />
    </div>
  );
}
