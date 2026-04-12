"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ForceGraphMethods, ForceGraphProps } from "react-force-graph-3d";

import "@/features/graph/utils/suppress-three-warnings";
import { getGraphGray } from "@/constants/tokens";
import { useTheme } from "@/hooks/useTheme";
import type { GraphData, GraphEdge, GraphNode } from "../types/graph";
import { useForceEngine } from "../hooks/useForceEngine";
import { useGraphInteraction } from "../hooks/useGraphInteraction";
import { useGraphLayout } from "../hooks/useGraphLayout";

type TypedForceGraph3DProps = ForceGraphProps<GraphNode, GraphEdge> & {
  ref?: React.MutableRefObject<ForceGraphMethods | undefined>;
};

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
}) as unknown as React.ComponentType<TypedForceGraph3DProps>;

const WARMUP_TICKS = 100;
const COOLDOWN_TICKS = 0;

interface GraphCanvas3DProps {
  graphData: GraphData;
  onNodeHoverChange?: (node: GraphNode | null) => void;
  onReady?: () => void;
}

export function GraphCanvas3D({
  graphData,
  onNodeHoverChange,
  onReady,
}: GraphCanvas3DProps): React.ReactElement {
  const { theme } = useTheme();
  const bgColor = getGraphGray(theme === "dark").bg;

  const fg3dData = useMemo(
    () => ({
      nodes: graphData.nodes,
      links: graphData.edges,
    }),
    [graphData],
  );

  const { graphWidth, graphHeight, containerRef } = useGraphLayout();
  const { graphRef, setAutoRotate, handleEngineStop } = useForceEngine(onReady);
  const {
    nodeThreeObject,
    linkColor,
    linkOpacity,
    handleNodeHover,
    handleNodeClick,
  } = useGraphInteraction(graphData, onNodeHoverChange, setAutoRotate);

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
