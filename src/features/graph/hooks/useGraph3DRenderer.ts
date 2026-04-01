"use client";

import { useCallback, useMemo, useRef } from "react";
import * as THREE from "three";

import { CLUSTERS, type ClusterId } from "@/constants/cluster";
import { getGraphGray } from "@/constants/tokens";
import { useTheme } from "@/features/theme/hooks/useTheme";
import type { GraphData, GraphNode } from "../types/graph";
import type { ForceGraph3DNode } from "../types/layout";

const HUB_RADIUS = 8;
const LEAF_RADIUS = 4;
const SEGMENTS = 32;
const EMISSIVE_INTENSITY_DARK = 0.4;
const EMISSIVE_INTENSITY_LIGHT = 0;
const HUB_DEGREE_THRESHOLD = 3;

const HOVER_SCALE = 1.3;
const ACTIVE_SCALE = 1.5;
const DEFAULT_SCALE = 1;
const HOVER_EMISSIVE_INTENSITY_DARK = 0.5;
const ACTIVE_EMISSIVE_INTENSITY_DARK = 0.8;
const HOVER_OPACITY = 0.9;
const DEFAULT_HUB_OPACITY = 1;
const DEFAULT_LEAF_OPACITY = 0.6;
const ACTIVE_LEAF_OPACITY = 0.8;

function buildDegreeMap(data: GraphData): Map<string, number> {
  const map = new Map<string, number>();
  for (const node of data.nodes) {
    map.set(node.id, 0);
  }
  for (const edge of data.edges) {
    const src =
      typeof edge.source === "string"
        ? edge.source
        : (edge.source as GraphNode).id;
    const tgt =
      typeof edge.target === "string"
        ? edge.target
        : (edge.target as GraphNode).id;
    map.set(src, (map.get(src) ?? 0) + 1);
    map.set(tgt, (map.get(tgt) ?? 0) + 1);
  }
  return map;
}

function resolveClusterColor(cluster: string): string {
  if (cluster in CLUSTERS) {
    return CLUSTERS[cluster as ClusterId].color;
  }
  return "#888888";
}

function createNodeMesh(
  graphNode: GraphNode,
  isHub: boolean,
  isDark: boolean,
): THREE.Mesh {
  const radius = isHub ? HUB_RADIUS : LEAF_RADIUS;
  const clusterColor = resolveClusterColor(graphNode.cluster);
  const color = new THREE.Color(clusterColor);
  const emissive = new THREE.Color(clusterColor);

  const geometry = new THREE.SphereGeometry(radius, SEGMENTS, SEGMENTS);
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: isDark
      ? EMISSIVE_INTENSITY_DARK
      : EMISSIVE_INTENSITY_LIGHT,
    metalness: 0.1,
    roughness: 0.7,
  });

  return new THREE.Mesh(geometry, material);
}

interface UseGraph3DRendererReturn {
  nodeThreeObject: (node: ForceGraph3DNode) => THREE.Mesh;
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

  const degreeMap = useMemo(() => buildDegreeMap(data), [data]);
  const meshCacheRef = useRef<Map<string, THREE.Mesh>>(new Map());

  const nodeThreeObject = useCallback(
    (node: ForceGraph3DNode): THREE.Mesh => {
      const graphNode = node as ForceGraph3DNode & GraphNode;
      const id = graphNode.id ?? "";
      const cache = meshCacheRef.current;

      const existing = cache.get(id);
      if (existing) {
        const mat = existing.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = isDark
          ? EMISSIVE_INTENSITY_DARK
          : EMISSIVE_INTENSITY_LIGHT;
        mat.needsUpdate = true;
        return existing;
      }

      const degree = degreeMap.get(id) ?? 0;
      const isHub = degree >= HUB_DEGREE_THRESHOLD;
      const mesh = createNodeMesh(graphNode, isHub, isDark);
      cache.set(id, mesh);
      return mesh;
    },
    [degreeMap, isDark],
  );

  const onNodeHover = useCallback(
    (
      node: ForceGraph3DNode | null,
      prevNode: ForceGraph3DNode | null,
    ): void => {
      const cache = meshCacheRef.current;
      const graphGray = getGraphGray(isDark);

      if (prevNode) {
        const prevGraphNode = prevNode as ForceGraph3DNode & GraphNode;
        const prevId = prevGraphNode.id ?? "";
        const prevMesh = cache.get(prevId);
        if (prevMesh) {
          const mat = prevMesh.material as THREE.MeshStandardMaterial;
          const isActive = selectedNodeId === prevId;
          const degree = degreeMap.get(prevId) ?? 0;
          const isHub = degree >= HUB_DEGREE_THRESHOLD;

          if (isActive) {
            mat.color.set(resolveClusterColor(prevGraphNode.cluster));
            mat.emissive.set(resolveClusterColor(prevGraphNode.cluster));
            mat.emissiveIntensity = isDark
              ? ACTIVE_EMISSIVE_INTENSITY_DARK
              : EMISSIVE_INTENSITY_LIGHT;
            mat.opacity = isHub ? DEFAULT_HUB_OPACITY : ACTIVE_LEAF_OPACITY;
            prevMesh.scale.setScalar(ACTIVE_SCALE);
          } else {
            const defaultColor = isHub ? graphGray.node : graphGray.nodeFaded;
            mat.color.set(defaultColor);
            mat.emissive.set(resolveClusterColor(prevGraphNode.cluster));
            mat.emissiveIntensity = isDark
              ? EMISSIVE_INTENSITY_DARK
              : EMISSIVE_INTENSITY_LIGHT;
            mat.opacity = isHub ? DEFAULT_HUB_OPACITY : DEFAULT_LEAF_OPACITY;
            prevMesh.scale.setScalar(DEFAULT_SCALE);
          }
          mat.needsUpdate = true;
        }
      }

      if (node) {
        const graphNode = node as ForceGraph3DNode & GraphNode;
        const id = graphNode.id ?? "";
        const mesh = cache.get(id);
        if (mesh) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          const degree = degreeMap.get(id) ?? 0;
          const isHub = degree >= HUB_DEGREE_THRESHOLD;

          mat.color.set(resolveClusterColor(graphNode.cluster));
          mat.emissive.set(resolveClusterColor(graphNode.cluster));
          mat.emissiveIntensity = isDark
            ? HOVER_EMISSIVE_INTENSITY_DARK
            : EMISSIVE_INTENSITY_LIGHT;
          mat.opacity = HOVER_OPACITY;
          mesh.scale.setScalar(isHub ? HOVER_SCALE : DEFAULT_SCALE);
          mat.needsUpdate = true;
        }
      }
    },
    [degreeMap, isDark, selectedNodeId],
  );

  return { nodeThreeObject, onNodeHover };
}
