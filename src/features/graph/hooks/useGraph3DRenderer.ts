"use client";

import { useCallback, useMemo, useRef } from "react";
import * as THREE from "three";

import { CLUSTERS, type ClusterId } from "@/constants/cluster";
import { useTheme } from "@/features/theme/hooks/useTheme";
import type { GraphData, GraphNode } from "../types/graph";
import type { ForceGraph3DNode } from "../types/layout";

const HUB_RADIUS = 8;
const LEAF_RADIUS = 4;
const SEGMENTS = 32;
const EMISSIVE_INTENSITY_DARK = 0.4;
const EMISSIVE_INTENSITY_LIGHT = 0;
const HUB_DEGREE_THRESHOLD = 3;

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
}

export function useGraph3DRenderer(data: GraphData): UseGraph3DRendererReturn {
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

  return { nodeThreeObject };
}
