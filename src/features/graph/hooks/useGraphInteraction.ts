"use client";

import { useCallback, useEffect, useRef } from "react";

import type { GraphData, GraphNode } from "../types/graph";
import type { ForceGraph3DNode } from "../types/layout";
import { useGraph3DRenderer } from "./useGraph3DRenderer";
import { useNodeSelection } from "@/hooks/useNodeSelection";

interface UseGraphInteractionReturn {
  selectedNodeId: string | null;
  nodeThreeObject: ReturnType<typeof useGraph3DRenderer>["nodeThreeObject"];
  linkColor: ReturnType<typeof useGraph3DRenderer>["linkColor"];
  linkOpacity: number;
  handleNodeHover: (
    node: ForceGraph3DNode | null,
    prevNode: ForceGraph3DNode | null,
  ) => void;
  handleNodeClick: (node: ForceGraph3DNode) => void;
}

export function useGraphInteraction(
  graphData: GraphData,
  onNodeHoverChange?: (node: GraphNode | null) => void,
  setAutoRotate?: (enabled: boolean) => void,
): UseGraphInteractionReturn {
  const { selectedNodeId, selectNode } = useNodeSelection();
  const {
    nodeThreeObject,
    linkColor,
    linkOpacity,
    onNodeHover: rendererOnNodeHover,
  } = useGraph3DRenderer(graphData, selectedNodeId ?? undefined);

  const prevSelectedNodeIdRef = useRef<string | null>(undefined);

  useEffect(() => {
    const prev = prevSelectedNodeIdRef.current;
    prevSelectedNodeIdRef.current = selectedNodeId;

    if (prev !== null && prev !== undefined && selectedNodeId === null) {
      setAutoRotate?.(true);
    }
  }, [selectedNodeId, setAutoRotate]);

  const handleNodeHover = useCallback(
    (
      node: ForceGraph3DNode | null,
      prevNode: ForceGraph3DNode | null,
    ): void => {
      setAutoRotate?.(node === null);
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
      setAutoRotate?.(true);
    },
    [selectNode, setAutoRotate],
  );

  return {
    selectedNodeId,
    nodeThreeObject,
    linkColor,
    linkOpacity,
    handleNodeHover,
    handleNodeClick,
  };
}
