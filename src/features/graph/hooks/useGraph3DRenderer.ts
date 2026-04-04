"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { CLUSTERS, type ClusterId } from "@/constants/cluster";
import { useTheme } from "@/hooks/useTheme";
import type { GraphData, GraphNode } from "../types/graph";
import type { ForceGraph3DLink, ForceGraph3DNode } from "../types/layout";

const HUB_RADIUS = 3.75;
const LEAF_RADIUS = 2.25;
const SEGMENTS_DESKTOP = 32;
const SEGMENTS_MOBILE = 16;
const HUB_DEGREE_THRESHOLD = 3;

const NODE_COLOR_DARK = "#111111";
const NODE_COLOR_LIGHT = "#FFFFFF";
const EDGE_COLOR_DARK = "#111111";
const EDGE_COLOR_LIGHT = "#FFFFFF";
const CONNECTED_LIGHTEN = 0.45;

const HOVER_COLOR_IN_MS = 150;
const HOVER_COLOR_OUT_MS = 200;
const DEFAULT_HUB_OPACITY = 1;
const DEFAULT_LEAF_OPACITY = 0.6;
const DEFAULT_LINK_OPACITY = 1;

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

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

function buildAdjacencyMap(data: GraphData): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const node of data.nodes) {
    map.set(node.id, new Set());
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
    map.get(src)?.add(tgt);
    map.get(tgt)?.add(src);
  }
  return map;
}

function resolveClusterColor(cluster: string): string {
  if (cluster in CLUSTERS) {
    return CLUSTERS[cluster as ClusterId].color;
  }
  return "#888888";
}

function resolveNodeId(endpoint: string | GraphNode): string {
  return typeof endpoint === "string" ? endpoint : endpoint.id;
}

function lightenHex(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

function getMeshFromGroup(group: THREE.Group): THREE.Mesh | null {
  const child = group.children[0];
  return child instanceof THREE.Mesh ? child : null;
}

function getBasicMat(mesh: THREE.Mesh): THREE.MeshBasicMaterial {
  return mesh.material as THREE.MeshBasicMaterial;
}

function rebuildGroupChildren(
  group: THREE.Group,
  graphNode: GraphNode,
  isHub: boolean,
  isDark: boolean,
  segments: number,
): void {
  group.children.forEach((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      (child.material as THREE.Material).dispose();
    }
  });
  group.clear();

  const tempGroup = createNodeGroup(graphNode, isHub, isDark, segments);
  tempGroup.children.slice().forEach((child) => {
    group.add(child);
  });
}

function createNodeGroup(
  graphNode: GraphNode,
  isHub: boolean,
  isDark: boolean,
  segments: number,
): THREE.Group {
  const radius = isHub ? HUB_RADIUS : LEAF_RADIUS;
  const nodeColor = isDark ? NODE_COLOR_DARK : NODE_COLOR_LIGHT;

  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(nodeColor),
    transparent: true,
    opacity: 1,
  });
  const mesh = new THREE.Mesh(geometry, material);

  const group = new THREE.Group();
  group.add(mesh);
  return group;
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
  const isDarkRef = useRef(isDark);
  const segmentsRef = useRef(segments);
  const degreeMapRef = useRef(degreeMap);
  const prevSelectedNodeIdRef = useRef<string | undefined>(undefined);
  const selectedNodeIdRef = useRef<string | undefined>(selectedNodeId);
  const animationFrameRef = useRef<number | null>(null);

  const hoverColorAnimFrameRef = useRef<number | null>(null);

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const hoveredClusterColorRef = useRef<string>("#888888");

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    degreeMapRef.current = degreeMap;
  }, [degreeMap]);

  useEffect(() => {
    if (segmentsRef.current === segments) return;
    segmentsRef.current = segments;
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
  }, [segments]);

  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId;
  }, [selectedNodeId]);

  // Sync theme changes to cached node materials
  useEffect(() => {
    const cache = groupCacheRef.current;
    const nodeColor = isDark ? NODE_COLOR_DARK : NODE_COLOR_LIGHT;
    const currentSelectedId = selectedNodeIdRef.current;
    cache.forEach((group, id) => {
      const mesh = getMeshFromGroup(group);
      if (!mesh) return;
      const mat = getBasicMat(mesh);
      if (id === currentSelectedId) {
        const selectedNode = nodeMap.get(id);
        if (selectedNode) {
          mat.color.set(resolveClusterColor(selectedNode.cluster));
        }
      } else {
        mat.color.set(nodeColor);
      }
      mat.needsUpdate = true;
    });
  }, [isDark, nodeMap]);

  // Selected node: apply cluster color + fade out others
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
    const currentIsDark = isDarkRef.current;
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

  const nodeThreeObject = useCallback((node: ForceGraph3DNode): THREE.Group => {
    const graphNode = node as ForceGraph3DNode & GraphNode;
    const id = graphNode.id ?? "";
    const cache = groupCacheRef.current;

    const existing = cache.get(id);
    const degree = degreeMapRef.current.get(id) ?? 0;
    const isHub = degree >= HUB_DEGREE_THRESHOLD;

    if (existing) {
      const mesh = getMeshFromGroup(existing);
      if (!mesh) {
        rebuildGroupChildren(
          existing,
          graphNode,
          isHub,
          isDarkRef.current,
          segmentsRef.current,
        );
        // Apply selected node color after rebuild to stay consistent with cache state
        if (
          selectedNodeIdRef.current !== undefined &&
          id === selectedNodeIdRef.current
        ) {
          const rebuiltMesh = getMeshFromGroup(existing);
          if (rebuiltMesh) {
            const mat = getBasicMat(rebuiltMesh);
            mat.color.set(resolveClusterColor(graphNode.cluster));
            mat.needsUpdate = true;
          }
        }
        return existing;
      }
      return existing;
    }

    const group = createNodeGroup(
      graphNode,
      isHub,
      isDarkRef.current,
      segmentsRef.current,
    );

    if (
      selectedNodeIdRef.current !== undefined &&
      id === selectedNodeIdRef.current
    ) {
      const mesh = getMeshFromGroup(group);
      if (mesh) {
        const mat = getBasicMat(mesh);
        mat.color.set(resolveClusterColor(graphNode.cluster));
        mat.needsUpdate = true;
      }
    }

    cache.set(id, group);
    return group;
  }, []);

  const selectedClusterColor = useMemo(() => {
    if (selectedNodeId === undefined) return null;
    const node = nodeMap.get(selectedNodeId);
    return node ? resolveClusterColor(node.cluster) : null;
  }, [selectedNodeId, nodeMap]);

  const selectedClusterColorRef = useRef<string | null>(selectedClusterColor);
  useEffect(() => {
    selectedClusterColorRef.current = selectedClusterColor;
  }, [selectedClusterColor]);

  const linkColor = useCallback(
    (link: ForceGraph3DLink): string => {
      const edge = link as ForceGraph3DLink & {
        source: string | GraphNode;
        target: string | GraphNode;
      };
      const srcId = resolveNodeId(edge.source);
      const tgtId = resolveNodeId(edge.target);

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
    [isDark, hoveredNodeId, selectedNodeId, selectedClusterColor],
  );

  const onNodeHover = useCallback(
    (
      node: ForceGraph3DNode | null,
      prevNode: ForceGraph3DNode | null,
    ): void => {
      const cache = groupCacheRef.current;
      const currentIsDark = isDarkRef.current;
      const defaultNodeColor = new THREE.Color(
        currentIsDark ? NODE_COLOR_DARK : NODE_COLOR_LIGHT,
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
              const fromColor = mat.color.clone();
              const startTime = performance.now();

              function tickRestore(): void {
                const elapsed = performance.now() - startTime;
                const rawT = Math.min(elapsed / HOVER_COLOR_OUT_MS, 1);
                const t = easeInOut(rawT);
                mat.color.copy(fromColor).lerp(defaultNodeColor, t);
                mat.needsUpdate = true;
                if (rawT < 1) {
                  hoverColorAnimFrameRef.current =
                    requestAnimationFrame(tickRestore);
                } else {
                  hoverColorAnimFrameRef.current = null;
                }
              }

              hoverColorAnimFrameRef.current =
                requestAnimationFrame(tickRestore);
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
            const mat = getBasicMat(mesh);
            const fromColor = mat.color.clone();
            const startTime = performance.now();

            function tickHoverColor(): void {
              const elapsed = performance.now() - startTime;
              const rawT = Math.min(elapsed / HOVER_COLOR_IN_MS, 1);
              const t = easeInOut(rawT);
              mat.color.copy(fromColor).lerp(clusterColorObj, t);
              mat.needsUpdate = true;
              if (rawT < 1) {
                hoverColorAnimFrameRef.current =
                  requestAnimationFrame(tickHoverColor);
              } else {
                hoverColorAnimFrameRef.current = null;
                mat.color.copy(clusterColorObj);
                mat.needsUpdate = true;
              }
            }

            hoverColorAnimFrameRef.current =
              requestAnimationFrame(tickHoverColor);
          }
        }
      }
    },
    [adjacencyMap, nodeMap],
  );

  const linkOpacity = DEFAULT_LINK_OPACITY;

  return {
    nodeThreeObject,
    linkColor,
    linkOpacity,
    onNodeHover,
  };
}
