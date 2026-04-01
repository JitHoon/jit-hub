"use client";

import { useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import type { ForceGraphMethods, ForceGraphProps } from "react-force-graph-3d";

import type { GraphData, GraphEdge, GraphNode } from "../types/graph";
import type { ForceGraph3DNode } from "../types/layout";
import { useCameraControl } from "../hooks/useCameraControl";
import { useGraph3DRenderer } from "../hooks/useGraph3DRenderer";
import { useGraphLayout } from "../hooks/useGraphLayout";
import { useNodeSelection } from "../hooks/useNodeSelection";
import { useScene3D } from "../hooks/useScene3D";

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
}

export function GraphCanvas3D({
  graphData,
}: GraphCanvas3DProps): React.ReactElement {
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const hasInitPhysics = useRef(false);

  const fg3dData = useMemo(
    () => ({
      nodes: graphData.nodes,
      links: graphData.edges,
    }),
    [graphData],
  );

  const { selectedNodeId, selectNode } = useNodeSelection();
  const { graphWidth, graphHeight, containerRef } = useGraphLayout();
  const { nodeThreeObject, linkColor, onNodeHover } = useGraph3DRenderer(
    graphData,
    selectedNodeId ?? undefined,
  );
  const { initCamera, setAutoRotate, focusNode, onInteractionEnd } =
    useCameraControl(graphRef);
  const { onEngineReady } = useScene3D(graphRef);

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

    onEngineReady();
    initCamera();
    setAutoRotate(true);
  }, [onEngineReady, initCamera, setAutoRotate]);

  const handleNodeClick = useCallback(
    (node: ForceGraph3DNode): void => {
      const graphNode = node as ForceGraph3DNode & { id?: string };
      const id = graphNode.id;
      if (!id) return;
      selectNode(id);
      focusNode(node);
      onInteractionEnd();
    },
    [selectNode, focusNode, onInteractionEnd],
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
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        linkColor={linkColor}
        onNodeClick={handleNodeClick}
        onNodeHover={onNodeHover}
        onEngineStop={handleEngineStop}
      />
    </div>
  );
}
