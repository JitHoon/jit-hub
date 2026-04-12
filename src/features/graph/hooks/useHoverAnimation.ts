"use client";

import { useCallback, useRef, useState } from "react";
import * as THREE from "three";
import {
  easeInOut,
  resolveClusterColor,
  lightenHex,
} from "@/lib/graph-helpers";
import {
  NODE_COLOR_DARK,
  NODE_COLOR_LIGHT,
  CONNECTED_LIGHTEN,
  HOVER_COLOR_IN_MS,
  HOVER_COLOR_OUT_MS,
  getMeshFromGroup,
  getBasicMat,
} from "../utils/three-material";
import type { GraphNode } from "../types/graph";
import type { ForceGraph3DNode } from "../types/layout";

interface ConfigSnapshot {
  isDark: boolean;
  segments: number;
  degreeMap: Map<string, number>;
}

interface UseHoverAnimationDeps {
  groupCacheRef: React.RefObject<Map<string, THREE.Group>>;
  configRef: React.RefObject<ConfigSnapshot>;
  selectedNodeIdRef: React.RefObject<string | undefined>;
  adjacencyMap: Map<string, Set<string>>;
  nodeMap: Map<string, GraphNode>;
}

interface UseHoverAnimationReturn {
  onNodeHover: (
    node: ForceGraph3DNode | null,
    prevNode: ForceGraph3DNode | null,
  ) => void;
  hoveredNodeId: string | null;
  hoveredClusterColorRef: React.RefObject<string>;
}

function animateColorTransition(
  mat: THREE.MeshBasicMaterial,
  fromColor: THREE.Color,
  toColor: THREE.Color,
  durationMs: number,
  frameRef: React.MutableRefObject<number | null>,
): void {
  const startTime = performance.now();

  function tick(): void {
    const elapsed = performance.now() - startTime;
    const rawT = Math.min(elapsed / durationMs, 1);
    const t = easeInOut(rawT);
    mat.color.copy(fromColor).lerp(toColor, t);
    mat.needsUpdate = true;
    if (rawT < 1) {
      frameRef.current = requestAnimationFrame(tick);
    } else {
      frameRef.current = null;
      mat.color.copy(toColor);
      mat.needsUpdate = true;
    }
  }

  frameRef.current = requestAnimationFrame(tick);
}

export function useHoverAnimation(
  deps: UseHoverAnimationDeps,
): UseHoverAnimationReturn {
  const { groupCacheRef, configRef, selectedNodeIdRef, adjacencyMap, nodeMap } =
    deps;

  const hoverColorAnimFrameRef = useRef<number | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const hoveredClusterColorRef = useRef<string>("#888888");

  const onNodeHover = useCallback(
    (
      node: ForceGraph3DNode | null,
      prevNode: ForceGraph3DNode | null,
    ): void => {
      const cache = groupCacheRef.current;
      const defaultNodeColor = new THREE.Color(
        configRef.current.isDark ? NODE_COLOR_DARK : NODE_COLOR_LIGHT,
      );

      if (hoverColorAnimFrameRef.current !== null) {
        cancelAnimationFrame(hoverColorAnimFrameRef.current);
        hoverColorAnimFrameRef.current = null;
      }

      if (prevNode) {
        const prevGraphNode = prevNode as ForceGraph3DNode & GraphNode;
        const prevId = prevGraphNode.id ?? "";
        const prevGroup = cache.get(prevId);
        const isActive = selectedNodeIdRef.current === prevId;

        const connected = adjacencyMap.get(prevId) ?? new Set<string>();
        connected.forEach((connId) => {
          if (connId === selectedNodeIdRef.current) return;
          const connGroup = cache.get(connId);
          if (!connGroup) return;
          const connMesh = getMeshFromGroup(connGroup);
          if (!connMesh) return;
          const connMat = getBasicMat(connMesh);
          connMat.color.copy(defaultNodeColor);
          connMat.needsUpdate = true;
        });

        if (prevGroup) {
          const prevMesh = getMeshFromGroup(prevGroup);
          if (prevMesh) {
            const mat = getBasicMat(prevMesh);

            if (isActive) {
              const clusterColor = new THREE.Color(
                resolveClusterColor(prevGraphNode.cluster),
              );
              mat.color.copy(clusterColor);
              mat.needsUpdate = true;
            } else if (node !== null) {
              mat.color.copy(defaultNodeColor);
              mat.needsUpdate = true;
            } else {
              animateColorTransition(
                mat,
                mat.color.clone(),
                defaultNodeColor,
                HOVER_COLOR_OUT_MS,
                hoverColorAnimFrameRef,
              );
            }
          }
        }

        setHoveredNodeId(null);
      }

      if (node) {
        const graphNode = node as ForceGraph3DNode & GraphNode;
        const id = graphNode.id ?? "";
        const group = cache.get(id);
        const clusterColor = resolveClusterColor(graphNode.cluster);
        const clusterColorObj = new THREE.Color(clusterColor);

        hoveredClusterColorRef.current = clusterColor;
        setHoveredNodeId(id);

        const connected = adjacencyMap.get(id) ?? new Set<string>();
        connected.forEach((connId) => {
          if (connId === selectedNodeIdRef.current) return;
          const connGroup = cache.get(connId);
          if (!connGroup) return;
          const connMesh = getMeshFromGroup(connGroup);
          if (!connMesh) return;
          const connNode = nodeMap.get(connId);
          const connClusterColor = connNode
            ? resolveClusterColor(connNode.cluster)
            : "#888888";
          const lightenedColor = new THREE.Color(
            lightenHex(connClusterColor, CONNECTED_LIGHTEN),
          );
          const connMat = getBasicMat(connMesh);
          connMat.color.copy(lightenedColor);
          connMat.needsUpdate = true;
        });

        if (group) {
          const mesh = getMeshFromGroup(group);
          if (mesh) {
            animateColorTransition(
              getBasicMat(mesh),
              getBasicMat(mesh).color.clone(),
              clusterColorObj,
              HOVER_COLOR_IN_MS,
              hoverColorAnimFrameRef,
            );
          }
        }
      }
    },
    [adjacencyMap, nodeMap, groupCacheRef, configRef, selectedNodeIdRef],
  );

  return { onNodeHover, hoveredNodeId, hoveredClusterColorRef };
}
