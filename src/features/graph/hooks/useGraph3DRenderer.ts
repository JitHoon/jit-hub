"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "@/hooks/useTheme";
import {
  resolveEndpointId,
  resolveClusterColor,
  lightenHex,
  buildDegreeMap,
  buildAdjacencyMap,
} from "@/lib/graph-helpers";
import {
  HUB_DEGREE_THRESHOLD,
  SEGMENTS_DESKTOP,
  SEGMENTS_MOBILE,
  NODE_COLOR_DARK,
  NODE_COLOR_LIGHT,
  EDGE_COLOR_DARK,
  EDGE_COLOR_LIGHT,
  CONNECTED_LIGHTEN,
  DEFAULT_HUB_OPACITY,
  DEFAULT_LEAF_OPACITY,
  DEFAULT_LINK_OPACITY,
  getMeshFromGroup,
  getBasicMat,
  createNodeGroup,
  rebuildGroupChildren,
  setGroupColor,
} from "../utils/three-material";
import { useHoverAnimation } from "./useHoverAnimation";
import type { GraphData, GraphNode } from "../types/graph";
import type { ForceGraph3DLink, ForceGraph3DNode } from "../types/layout";

interface ConfigSnapshot {
  isDark: boolean;
  segments: number;
  degreeMap: Map<string, number>;
}

interface UseGraph3DRendererReturn {
  nodeThreeObject: (node: ForceGraph3DNode) => THREE.Group;
  linkColor: (link: ForceGraph3DLink) => string;
  linkOpacity: number;
  onNodeHover: (
    node: ForceGraph3DNode | null,
    prevNode: ForceGraph3DNode | null,
  ) => void;
}

export function useGraph3DRenderer(
  data: GraphData,
  selectedNodeId?: string,
): UseGraph3DRendererReturn {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [isMobile, setIsMobile] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 768px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent): void => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const segments = isMobile ? SEGMENTS_MOBILE : SEGMENTS_DESKTOP;

  const degreeMap = useMemo(() => buildDegreeMap(data), [data]);
  const adjacencyMap = useMemo(() => buildAdjacencyMap(data), [data]);
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    for (const node of data.nodes) map.set(node.id, node);
    return map;
  }, [data]);

  const groupCacheRef = useRef<Map<string, THREE.Group>>(new Map());
  const configRef = useRef<ConfigSnapshot>({
    isDark,
    segments,
    degreeMap,
  });
  const prevSelectedNodeIdRef = useRef<string | undefined>(undefined);
  const selectedNodeIdRef = useRef<string | undefined>(selectedNodeId);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = configRef.current;
    const segmentsChanged = prev.segments !== segments;
    configRef.current = { isDark, segments, degreeMap };

    if (segmentsChanged) {
      const cache = groupCacheRef.current;
      cache.forEach((group) => {
        group.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
      });
      cache.clear();
    }
  }, [isDark, segments, degreeMap]);

  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId;
  }, [selectedNodeId]);

  useEffect(() => {
    const cache = groupCacheRef.current;
    const nodeColor = isDark ? NODE_COLOR_DARK : NODE_COLOR_LIGHT;
    const currentSelectedId = selectedNodeIdRef.current;
    cache.forEach((group, id) => {
      if (id === currentSelectedId) {
        const selectedNode = nodeMap.get(id);
        if (selectedNode) {
          setGroupColor(group, resolveClusterColor(selectedNode.cluster));
        }
      } else {
        setGroupColor(group, nodeColor);
      }
    });
  }, [isDark, nodeMap]);

  useEffect(() => {
    const prevId = prevSelectedNodeIdRef.current;
    const nextId = selectedNodeId;
    prevSelectedNodeIdRef.current = nextId;

    if (prevId === nextId) return;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const cache = groupCacheRef.current;
    const currentIsDark = configRef.current.isDark;
    const defaultNodeColor = new THREE.Color(
      currentIsDark ? NODE_COLOR_DARK : NODE_COLOR_LIGHT,
    );

    if (nextId !== undefined) {
      const selectedNode = nodeMap.get(nextId);
      const clusterColor = new THREE.Color(
        selectedNode ? resolveClusterColor(selectedNode.cluster) : "#888888",
      );

      cache.forEach((group, id) => {
        const mesh = getMeshFromGroup(group);
        if (!mesh) return;
        const mat = getBasicMat(mesh);

        if (id === nextId) {
          mat.color.copy(clusterColor);
        } else {
          mat.color.copy(defaultNodeColor);
        }
        mat.needsUpdate = true;
      });
    } else {
      cache.forEach((group, id) => {
        const mesh = getMeshFromGroup(group);
        if (!mesh) return;
        const mat = getBasicMat(mesh);
        const degree = degreeMap.get(id) ?? 0;
        const isHub = degree >= HUB_DEGREE_THRESHOLD;

        mat.color.copy(defaultNodeColor);
        mat.opacity = isHub ? DEFAULT_HUB_OPACITY : DEFAULT_LEAF_OPACITY;
        mat.needsUpdate = true;
      });
    }
  }, [selectedNodeId, nodeMap, degreeMap]);

  const { onNodeHover, hoveredNodeId, hoveredClusterColorRef } =
    useHoverAnimation({
      groupCacheRef,
      configRef,
      selectedNodeIdRef,
      adjacencyMap,
      nodeMap,
    });

  const nodeThreeObject = useCallback((node: ForceGraph3DNode): THREE.Group => {
    const graphNode = node as ForceGraph3DNode & GraphNode;
    const id = graphNode.id ?? "";
    const cache = groupCacheRef.current;

    const existing = cache.get(id);
    const degree = configRef.current.degreeMap.get(id) ?? 0;
    const isHub = degree >= HUB_DEGREE_THRESHOLD;

    if (existing) {
      const mesh = getMeshFromGroup(existing);
      if (!mesh) {
        rebuildGroupChildren(
          existing,
          graphNode,
          isHub,
          configRef.current.isDark,
          configRef.current.segments,
        );
        if (
          selectedNodeIdRef.current !== undefined &&
          id === selectedNodeIdRef.current
        ) {
          setGroupColor(existing, resolveClusterColor(graphNode.cluster));
        }
        return existing;
      }
      return existing;
    }

    const group = createNodeGroup(
      graphNode,
      isHub,
      configRef.current.isDark,
      configRef.current.segments,
    );

    if (
      selectedNodeIdRef.current !== undefined &&
      id === selectedNodeIdRef.current
    ) {
      setGroupColor(group, resolveClusterColor(graphNode.cluster));
    }

    cache.set(id, group);
    return group;
  }, []);

  const selectedClusterColor = useMemo(() => {
    if (selectedNodeId === undefined) return null;
    const node = nodeMap.get(selectedNodeId);
    return node ? resolveClusterColor(node.cluster) : null;
  }, [selectedNodeId, nodeMap]);

  const linkColor = useCallback(
    (link: ForceGraph3DLink): string => {
      const edge = link as ForceGraph3DLink & {
        source: string | GraphNode;
        target: string | GraphNode;
      };
      const srcId = resolveEndpointId(edge.source)!;
      const tgtId = resolveEndpointId(edge.target)!;

      if (
        selectedClusterColor !== null &&
        (srcId === selectedNodeId || tgtId === selectedNodeId)
      ) {
        return lightenHex(selectedClusterColor, CONNECTED_LIGHTEN);
      }

      if (
        hoveredNodeId !== null &&
        (srcId === hoveredNodeId || tgtId === hoveredNodeId)
      ) {
        return lightenHex(hoveredClusterColorRef.current, CONNECTED_LIGHTEN);
      }

      return isDark ? EDGE_COLOR_DARK : EDGE_COLOR_LIGHT;
    },
    [
      isDark,
      hoveredNodeId,
      selectedNodeId,
      selectedClusterColor,
      hoveredClusterColorRef,
    ],
  );

  const linkOpacity = DEFAULT_LINK_OPACITY;

  return {
    nodeThreeObject,
    linkColor,
    linkOpacity,
    onNodeHover,
  };
}
