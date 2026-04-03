"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import SpriteText from "three-spritetext";

import { CLUSTERS, type ClusterId } from "@/constants/cluster";
import { getGraphGray } from "@/constants/tokens";
import { useTheme } from "@/features/theme/hooks/useTheme";
import type { GraphData, GraphNode } from "../types/graph";
import type { ForceGraph3DLink, ForceGraph3DNode } from "../types/layout";

const HUB_RADIUS = 2.5;
const LEAF_RADIUS = 1.5;
const SEGMENTS = 32;
const HUB_DEGREE_THRESHOLD = 3;

const NODE_COLOR_DARK = "#FFFFFF";
const NODE_COLOR_LIGHT = "#111111";
const EDGE_COLOR_DARK = "#FFFFFF";
const EDGE_COLOR_LIGHT = "#111111";
const CONNECTED_LIGHTEN = 0.45;

const HOVER_SCALE = 1.1;
const ACTIVE_SCALE = 1.5;
const DEFAULT_SCALE = 1;
const SCALE_ANIM_DURATION_MS = 200;
const HOVER_COLOR_IN_MS = 500;
const HOVER_COLOR_OUT_MS = 400;
const DEFAULT_HUB_OPACITY = 1;
const DEFAULT_LEAF_OPACITY = 0.6;
const ACTIVE_LEAF_OPACITY = 0.8;

const GLOW_EMISSIVE_INTENSITY = 0.6;
const GLOW_IN_MS = 300;

const LABEL_TEXT_HEIGHT = 3;
const LABEL_OFFSET_Y_HUB = 5.5;
const LABEL_OFFSET_Y_LEAF = 3.5;
const LABEL_OPACITY_DEFAULT = 0;
const LABEL_OPACITY_HOVER = 1;
const LABEL_FADE_IN_MS = 200;
const LABEL_FADE_OUT_MS = 150;

function easeIn(t: number): number {
  return t * t * t;
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

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

function getMeshFromGroup(group: THREE.Group): THREE.Mesh {
  return group.children[0] as THREE.Mesh;
}

function getStandardMat(mesh: THREE.Mesh): THREE.MeshStandardMaterial {
  return mesh.material as THREE.MeshStandardMaterial;
}

function getLabelFromGroup(group: THREE.Group): SpriteText {
  return group.children[1] as SpriteText;
}

function getLabelOpacity(label: SpriteText): number {
  return (label.material as THREE.SpriteMaterial).opacity;
}

function setLabelOpacity(label: SpriteText, value: number): void {
  const mat = label.material as THREE.SpriteMaterial;
  mat.transparent = true;
  mat.opacity = value;
  mat.needsUpdate = true;
}

function rebuildGroupChildren(
  group: THREE.Group,
  graphNode: GraphNode,
  isHub: boolean,
  isDark: boolean,
): void {
  group.children.forEach((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      (child.material as THREE.Material).dispose();
    }
  });
  group.clear();

  const tempGroup = createNodeGroup(graphNode, isHub, isDark);
  tempGroup.children.slice().forEach((child) => {
    group.add(child);
  });
}

function createNodeGroup(
  graphNode: GraphNode,
  isHub: boolean,
  isDark: boolean,
): THREE.Group {
  const radius = isHub ? HUB_RADIUS : LEAF_RADIUS;
  const nodeColor = isDark ? NODE_COLOR_DARK : NODE_COLOR_LIGHT;

  const geometry = new THREE.SphereGeometry(radius, SEGMENTS, SEGMENTS);
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(nodeColor),
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
    roughness: 0.4,
    metalness: 0.1,
    transparent: true,
    opacity: 1,
  });
  const mesh = new THREE.Mesh(geometry, material);

  const gray = getGraphGray(isDark);
  const label = new SpriteText(graphNode.title, LABEL_TEXT_HEIGHT, gray.label);
  label.position.y = isHub ? LABEL_OFFSET_Y_HUB : LABEL_OFFSET_Y_LEAF;
  setLabelOpacity(label, LABEL_OPACITY_DEFAULT);
  label.raycast = () => undefined;

  const group = new THREE.Group();
  group.add(mesh);
  group.add(label);
  return group;
}

interface UseGraph3DRendererReturn {
  nodeThreeObject: (node: ForceGraph3DNode) => THREE.Group;
  linkColor: (link: ForceGraph3DLink) => string;
  onNodeHover: (
    node: ForceGraph3DNode | null,
    prevNode: ForceGraph3DNode | null,
  ) => void;
  hoveredNodeId: string | null;
}

export function useGraph3DRenderer(
  data: GraphData,
  selectedNodeId?: string,
): UseGraph3DRendererReturn {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const degreeMap = useMemo(() => buildDegreeMap(data), [data]);
  const adjacencyMap = useMemo(() => buildAdjacencyMap(data), [data]);
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    for (const node of data.nodes) map.set(node.id, node);
    return map;
  }, [data]);

  const groupCacheRef = useRef<Map<string, THREE.Group>>(new Map());
  const isDarkRef = useRef(isDark);
  const prevSelectedNodeIdRef = useRef<string | undefined>(undefined);
  const animationFrameRef = useRef<number | null>(null);
  const hoverScaleAnimFrameRef = useRef<number | null>(null);
  const hoverColorAnimFrameRef = useRef<number | null>(null);
  const hoverGlowAnimFrameRef = useRef<number | null>(null);
  const labelFadeAnimFrameRef = useRef<number | null>(null);
  const hoveredClusterColorRef = useRef<string>("#888888");

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  // Sync theme changes to cached node materials
  useEffect(() => {
    const cache = groupCacheRef.current;
    const gray = getGraphGray(isDark);
    const nodeColor = isDark ? NODE_COLOR_DARK : NODE_COLOR_LIGHT;
    cache.forEach((group) => {
      const mesh = getMeshFromGroup(group);
      if (!mesh) return;
      const mat = getStandardMat(mesh);
      mat.color.set(nodeColor);
      mat.needsUpdate = true;
      const label = getLabelFromGroup(group);
      label.color = gray.label;
    });
  }, [isDark]);

  // Selected node scale animation
  useEffect(() => {
    const prevId = prevSelectedNodeIdRef.current;
    const nextId = selectedNodeId;
    prevSelectedNodeIdRef.current = nextId;

    if (prevId === nextId) return;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const startTime = performance.now();
    const cache = groupCacheRef.current;

    const prevGroup = prevId !== undefined ? cache.get(prevId) : undefined;
    const nextGroup = nextId !== undefined ? cache.get(nextId) : undefined;

    const prevStartScale = prevGroup ? prevGroup.scale.x : ACTIVE_SCALE;
    const nextStartScale = nextGroup ? nextGroup.scale.x : DEFAULT_SCALE;

    function tick(): void {
      const elapsed = performance.now() - startTime;
      const rawT = Math.min(elapsed / SCALE_ANIM_DURATION_MS, 1);

      if (prevGroup) {
        const t = easeIn(rawT);
        prevGroup.scale.setScalar(
          prevStartScale + (DEFAULT_SCALE - prevStartScale) * t,
        );
      }

      if (nextGroup) {
        const t = easeOutBack(rawT);
        nextGroup.scale.setScalar(
          nextStartScale + (ACTIVE_SCALE - nextStartScale) * t,
        );
      }

      if (rawT < 1) {
        animationFrameRef.current = requestAnimationFrame(tick);
      } else {
        animationFrameRef.current = null;
        if (prevGroup) prevGroup.scale.setScalar(DEFAULT_SCALE);
        if (nextGroup) nextGroup.scale.setScalar(ACTIVE_SCALE);
      }
    }

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [selectedNodeId]);

  const nodeThreeObject = useCallback(
    (node: ForceGraph3DNode): THREE.Group => {
      const graphNode = node as ForceGraph3DNode & GraphNode;
      const id = graphNode.id ?? "";
      const cache = groupCacheRef.current;

      const existing = cache.get(id);
      const degree = degreeMap.get(id) ?? 0;
      const isHub = degree >= HUB_DEGREE_THRESHOLD;

      if (existing) {
        const mesh = getMeshFromGroup(existing);
        if (!mesh) {
          rebuildGroupChildren(existing, graphNode, isHub, isDarkRef.current);
          return existing;
        }
        return existing;
      }

      const group = createNodeGroup(graphNode, isHub, isDarkRef.current);
      cache.set(id, group);
      return group;
    },
    [degreeMap],
  );

  const linkColor = useCallback(
    (link: ForceGraph3DLink): string => {
      const edge = link as ForceGraph3DLink & {
        source: string | GraphNode;
        target: string | GraphNode;
      };
      const srcId = resolveNodeId(edge.source);
      const tgtId = resolveNodeId(edge.target);

      if (
        hoveredNodeId !== null &&
        (srcId === hoveredNodeId || tgtId === hoveredNodeId)
      ) {
        return lightenHex(hoveredClusterColorRef.current, CONNECTED_LIGHTEN);
      }

      return isDark ? EDGE_COLOR_DARK : EDGE_COLOR_LIGHT;
    },
    [isDark, hoveredNodeId],
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

      if (hoverScaleAnimFrameRef.current !== null) {
        cancelAnimationFrame(hoverScaleAnimFrameRef.current);
        hoverScaleAnimFrameRef.current = null;
      }
      if (hoverColorAnimFrameRef.current !== null) {
        cancelAnimationFrame(hoverColorAnimFrameRef.current);
        hoverColorAnimFrameRef.current = null;
      }
      if (hoverGlowAnimFrameRef.current !== null) {
        cancelAnimationFrame(hoverGlowAnimFrameRef.current);
        hoverGlowAnimFrameRef.current = null;
      }
      if (labelFadeAnimFrameRef.current !== null) {
        cancelAnimationFrame(labelFadeAnimFrameRef.current);
        labelFadeAnimFrameRef.current = null;
      }

      // Restore previous hovered node
      if (prevNode) {
        const prevGraphNode = prevNode as ForceGraph3DNode & GraphNode;
        const prevId = prevGraphNode.id ?? "";
        const prevGroup = cache.get(prevId);
        const isActive = selectedNodeId === prevId;
        const degree = degreeMap.get(prevId) ?? 0;
        const isHub = degree >= HUB_DEGREE_THRESHOLD;

        // Restore connected nodes instantly
        const connected = adjacencyMap.get(prevId) ?? new Set<string>();
        connected.forEach((connId) => {
          const connGroup = cache.get(connId);
          if (!connGroup) return;
          const connMat = getStandardMat(getMeshFromGroup(connGroup));
          connMat.color.copy(defaultNodeColor);
          connMat.needsUpdate = true;
        });

        if (prevGroup) {
          const prevMesh = getMeshFromGroup(prevGroup);
          const mat = getStandardMat(prevMesh);

          if (isActive) {
            const clusterColor = new THREE.Color(
              resolveClusterColor(prevGraphNode.cluster),
            );
            mat.color.copy(clusterColor);
            mat.opacity = isHub ? DEFAULT_HUB_OPACITY : ACTIVE_LEAF_OPACITY;
            mat.emissiveIntensity = 0;
            prevGroup.scale.setScalar(ACTIVE_SCALE);
            mat.needsUpdate = true;
          } else if (node !== null) {
            // Moving to another node: instant reset
            mat.color.copy(defaultNodeColor);
            mat.opacity = isHub ? DEFAULT_HUB_OPACITY : DEFAULT_LEAF_OPACITY;
            mat.emissiveIntensity = 0;
            prevGroup.scale.setScalar(DEFAULT_SCALE);
            mat.needsUpdate = true;
          } else {
            // Leaving all nodes: animate color and glow back to default
            const fromColor = mat.color.clone();
            const fromIntensity = mat.emissiveIntensity;
            const startTime = performance.now();

            function tickRestore(): void {
              const elapsed = performance.now() - startTime;
              const rawT = Math.min(elapsed / HOVER_COLOR_OUT_MS, 1);
              const t = easeInOut(rawT);
              mat.color.copy(fromColor).lerp(defaultNodeColor, t);
              mat.emissiveIntensity = fromIntensity * (1 - t);
              mat.opacity = isHub ? DEFAULT_HUB_OPACITY : DEFAULT_LEAF_OPACITY;
              mat.needsUpdate = true;
              if (rawT < 1) {
                hoverColorAnimFrameRef.current =
                  requestAnimationFrame(tickRestore);
              } else {
                hoverColorAnimFrameRef.current = null;
                mat.emissiveIntensity = 0;
                mat.needsUpdate = true;
              }
            }

            prevGroup.scale.setScalar(DEFAULT_SCALE);
            hoverColorAnimFrameRef.current = requestAnimationFrame(tickRestore);
          }

          // Fade out label
          const prevLabel = getLabelFromGroup(prevGroup);
          const fromLabelOpacity = getLabelOpacity(prevLabel);
          const fadeOutStart = performance.now();

          function tickLabelFadeOut(): void {
            const elapsed = performance.now() - fadeOutStart;
            const rawT = Math.min(elapsed / LABEL_FADE_OUT_MS, 1);
            const t = easeInOut(rawT);
            setLabelOpacity(
              prevLabel,
              fromLabelOpacity + (LABEL_OPACITY_DEFAULT - fromLabelOpacity) * t,
            );
            if (rawT < 1) {
              labelFadeAnimFrameRef.current =
                requestAnimationFrame(tickLabelFadeOut);
            } else {
              labelFadeAnimFrameRef.current = null;
              setLabelOpacity(prevLabel, LABEL_OPACITY_DEFAULT);
            }
          }

          labelFadeAnimFrameRef.current =
            requestAnimationFrame(tickLabelFadeOut);
        }

        setHoveredNodeId(null);
      }

      // Apply new hover state
      if (node) {
        const graphNode = node as ForceGraph3DNode & GraphNode;
        const id = graphNode.id ?? "";
        const group = cache.get(id);
        const clusterColor = resolveClusterColor(graphNode.cluster);
        const clusterColorObj = new THREE.Color(clusterColor);

        hoveredClusterColorRef.current = clusterColor;
        setHoveredNodeId(id);

        // Apply lighter cluster color to connected nodes instantly
        const connected = adjacencyMap.get(id) ?? new Set<string>();
        connected.forEach((connId) => {
          const connGroup = cache.get(connId);
          if (!connGroup) return;
          const connNode = nodeMap.get(connId);
          const connClusterColor = connNode
            ? resolveClusterColor(connNode.cluster)
            : "#888888";
          const lightenedColor = new THREE.Color(
            lightenHex(connClusterColor, CONNECTED_LIGHTEN),
          );
          const connMat = getStandardMat(getMeshFromGroup(connGroup));
          connMat.color.copy(lightenedColor);
          connMat.needsUpdate = true;
        });

        if (group) {
          const mesh = getMeshFromGroup(group);
          const mat = getStandardMat(mesh);
          // Animate node color from default to cluster color
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

          // Glow in: emissive → cluster color, intensity 0 → GLOW_EMISSIVE_INTENSITY
          mat.emissive.copy(clusterColorObj);
          const glowStartTime = performance.now();

          function tickGlowIn(): void {
            const elapsed = performance.now() - glowStartTime;
            const rawT = Math.min(elapsed / GLOW_IN_MS, 1);
            const t = easeInOut(rawT);
            mat.emissiveIntensity = GLOW_EMISSIVE_INTENSITY * t;
            mat.needsUpdate = true;
            if (rawT < 1) {
              hoverGlowAnimFrameRef.current = requestAnimationFrame(tickGlowIn);
            } else {
              hoverGlowAnimFrameRef.current = null;
              mat.emissiveIntensity = GLOW_EMISSIVE_INTENSITY;
              mat.needsUpdate = true;
            }
          }

          hoverGlowAnimFrameRef.current = requestAnimationFrame(tickGlowIn);

          // Scale animation
          const targetScale = HOVER_SCALE;
          const startScale = group.scale.x;
          const startTime2 = performance.now();

          function tickHoverScale(): void {
            const elapsed = performance.now() - startTime2;
            const rawT = Math.min(elapsed / SCALE_ANIM_DURATION_MS, 1);
            const t = easeOutBack(rawT);
            group!.scale.setScalar(startScale + (targetScale - startScale) * t);
            if (rawT < 1) {
              hoverScaleAnimFrameRef.current =
                requestAnimationFrame(tickHoverScale);
            } else {
              hoverScaleAnimFrameRef.current = null;
              group!.scale.setScalar(targetScale);
            }
          }

          hoverScaleAnimFrameRef.current =
            requestAnimationFrame(tickHoverScale);

          // Fade in label
          const label = getLabelFromGroup(group);
          const fromLabelOpacity = getLabelOpacity(label);
          const fadeInStart = performance.now();

          function tickLabelFadeIn(): void {
            const elapsed = performance.now() - fadeInStart;
            const rawT = Math.min(elapsed / LABEL_FADE_IN_MS, 1);
            const t = easeInOut(rawT);
            setLabelOpacity(
              label,
              fromLabelOpacity + (LABEL_OPACITY_HOVER - fromLabelOpacity) * t,
            );
            if (rawT < 1) {
              labelFadeAnimFrameRef.current =
                requestAnimationFrame(tickLabelFadeIn);
            } else {
              labelFadeAnimFrameRef.current = null;
              setLabelOpacity(label, LABEL_OPACITY_HOVER);
            }
          }

          labelFadeAnimFrameRef.current =
            requestAnimationFrame(tickLabelFadeIn);
        }
      }
    },
    [degreeMap, adjacencyMap, nodeMap, selectedNodeId],
  );

  return { nodeThreeObject, linkColor, onNodeHover, hoveredNodeId };
}
