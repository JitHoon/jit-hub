"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ForceGraphMethods } from "react-force-graph-3d";

import { CLUSTERS, type ClusterId } from "@/constants/cluster";
import { useTheme } from "@/hooks/useTheme";
import type { GraphData, GraphNode } from "../types/graph";
import type { ForceGraph3DNode } from "../types/layout";

const HUB_RADIUS = 3.75;
const LEAF_RADIUS = 2.25;
const SEGMENTS_DESKTOP = 32;
const SEGMENTS_MOBILE = 16;
const HUB_DEGREE_THRESHOLD = 3;

const NODE_COLOR_DARK = "#111111";
const NODE_COLOR_LIGHT = "#FFFFFF";

const HITBOX_RADIUS = 4;

function resolveClusterColor(cluster: string): string {
  if (cluster in CLUSTERS) {
    return CLUSTERS[cluster as ClusterId].color;
  }
  return "#888888";
}

function buildDegreeMap(data: GraphData): Map<string, number> {
  const map = new Map<string, number>();
  for (const node of data.nodes) map.set(node.id, 0);
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

interface InstancedGroup {
  mesh: THREE.InstancedMesh;
  nodeIds: string[];
  indexMap: Map<string, number>;
}

interface UseInstancedNodesReturn {
  nodeThreeObject: (node: ForceGraph3DNode) => THREE.Object3D;
  onEngineTick: () => void;
  setHoveredId: (id: string | null) => void;
  setSelectedId: (id: string | undefined) => void;
  dispose: () => void;
}

export function useInstancedNodes(
  graphRef: React.RefObject<ForceGraphMethods | undefined>,
  data: GraphData,
): UseInstancedNodesReturn {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;
  const segments = isMobile ? SEGMENTS_MOBILE : SEGMENTS_DESKTOP;

  const degreeMap = useMemo(() => buildDegreeMap(data), [data]);

  const hubNodesRef = useRef<string[]>([]);
  const leafNodesRef = useRef<string[]>([]);
  const hubGroupRef = useRef<InstancedGroup | null>(null);
  const leafGroupRef = useRef<InstancedGroup | null>(null);
  const addedToSceneRef = useRef(false);
  const hoveredIdRef = useRef<string | null>(null);
  const selectedIdRef = useRef<string | undefined>(undefined);
  const isDarkRef = useRef(isDark);
  const hitboxCacheRef = useRef<Map<string, THREE.Object3D>>(new Map());

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  // 허브/리프 분류
  useEffect(() => {
    const hubs: string[] = [];
    const leaves: string[] = [];
    for (const node of data.nodes) {
      const degree = degreeMap.get(node.id) ?? 0;
      if (degree >= HUB_DEGREE_THRESHOLD) {
        hubs.push(node.id);
      } else {
        leaves.push(node.id);
      }
    }
    hubNodesRef.current = hubs;
    leafNodesRef.current = leaves;
  }, [data.nodes, degreeMap]);

  // InstancedMesh 생성
  useEffect(() => {
    const hubIds = hubNodesRef.current;
    const leafIds = leafNodesRef.current;

    if (hubIds.length === 0 && leafIds.length === 0) return;

    const createGroup = (
      ids: string[],
      radius: number,
    ): InstancedGroup | null => {
      if (ids.length === 0) return null;
      const geometry = new THREE.SphereGeometry(radius, segments, segments);
      const material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.InstancedMesh(geometry, material, ids.length);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      const colors = new Float32Array(ids.length * 3);
      const defaultColor = new THREE.Color(
        isDark ? NODE_COLOR_DARK : NODE_COLOR_LIGHT,
      );
      for (let i = 0; i < ids.length; i++) {
        colors[i * 3] = defaultColor.r;
        colors[i * 3 + 1] = defaultColor.g;
        colors[i * 3 + 2] = defaultColor.b;
      }
      mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);

      const indexMap = new Map<string, number>();
      ids.forEach((id, i) => indexMap.set(id, i));

      return { mesh, nodeIds: ids, indexMap };
    };

    const hubGroup = createGroup(hubIds, HUB_RADIUS);
    const leafGroup = createGroup(leafIds, LEAF_RADIUS);

    hubGroupRef.current = hubGroup;
    leafGroupRef.current = leafGroup;
    addedToSceneRef.current = false;

    return () => {
      [hubGroup, leafGroup].forEach((g) => {
        if (!g) return;
        g.mesh.geometry.dispose();
        (g.mesh.material as THREE.Material).dispose();
        g.mesh.dispose();
      });
    };
  }, [data.nodes, degreeMap, segments, isDark]);

  // 씬에 InstancedMesh 추가
  const addToScene = useCallback((): void => {
    if (addedToSceneRef.current) return;
    const fg = graphRef.current;
    if (!fg) return;
    const scene = fg.scene();

    if (hubGroupRef.current) scene.add(hubGroupRef.current.mesh);
    if (leafGroupRef.current) scene.add(leafGroupRef.current.mesh);
    addedToSceneRef.current = true;
  }, [graphRef]);

  // nodeThreeObject에서 캐싱한 노드 참조 (위치가 force simulation에 의해 in-place 변경됨)
  const nodeObjectsRef = useRef<Map<string, ForceGraph3DNode>>(new Map());

  // 매 틱: 노드 위치 → 인스턴스 행렬 동기화
  const onEngineTick = useCallback((): void => {
    addToScene();

    const nodeObjects = nodeObjectsRef.current;
    const dummy = new THREE.Object3D();

    const syncGroup = (group: InstancedGroup | null): void => {
      if (!group) return;
      const { mesh, nodeIds } = group;
      for (let i = 0; i < nodeIds.length; i++) {
        const node = nodeObjects.get(nodeIds[i]!);
        if (node) {
          dummy.position.set(node.x ?? 0, node.y ?? 0, node.z ?? 0);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
    };

    syncGroup(hubGroupRef.current);
    syncGroup(leafGroupRef.current);
  }, [addToScene]);

  // 색상 업데이트
  const updateColors = useCallback((): void => {
    const currentIsDark = isDarkRef.current;
    const defaultColor = new THREE.Color(
      currentIsDark ? NODE_COLOR_DARK : NODE_COLOR_LIGHT,
    );
    const hoveredId = hoveredIdRef.current;
    const selectedId = selectedIdRef.current;

    const nodeMap = new Map<string, GraphNode>();
    for (const node of data.nodes) nodeMap.set(node.id, node);

    const updateGroup = (group: InstancedGroup | null): void => {
      if (!group) return;
      const { mesh, nodeIds } = group;
      if (!mesh.instanceColor) return;
      const colors = mesh.instanceColor;

      for (let i = 0; i < nodeIds.length; i++) {
        const id = nodeIds[i]!;
        let color = defaultColor;

        if (id === selectedId || id === hoveredId) {
          const node = nodeMap.get(id);
          if (node) {
            color = new THREE.Color(resolveClusterColor(node.cluster));
          }
        }

        colors.setXYZ(i, color.r, color.g, color.b);
      }
      colors.needsUpdate = true;
    };

    updateGroup(hubGroupRef.current);
    updateGroup(leafGroupRef.current);
  }, [data.nodes]);

  const setHoveredId = useCallback(
    (id: string | null): void => {
      hoveredIdRef.current = id;
      updateColors();
    },
    [updateColors],
  );

  const setSelectedId = useCallback(
    (id: string | undefined): void => {
      selectedIdRef.current = id;
      updateColors();
    },
    [updateColors],
  );

  // 테마 변경 시 색상 재적용
  useEffect(() => {
    updateColors();
  }, [isDark, updateColors]);

  // 레이캐스팅용 투명 히트박스
  const hitboxGeometry = useMemo(
    () => new THREE.SphereGeometry(HITBOX_RADIUS, 8, 8),
    [],
  );
  const hitboxMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        visible: false,
        transparent: true,
        opacity: 0,
      }),
    [],
  );

  const nodeThreeObject = useCallback(
    (node: ForceGraph3DNode): THREE.Object3D => {
      const id = (node as ForceGraph3DNode & { id?: string }).id ?? "";

      // force simulation이 위치를 in-place로 갱신하므로 노드 참조를 캐싱
      nodeObjectsRef.current.set(id, node);

      const cached = hitboxCacheRef.current.get(id);
      if (cached) return cached;

      const mesh = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
      hitboxCacheRef.current.set(id, mesh);
      return mesh;
    },
    [hitboxGeometry, hitboxMaterial],
  );

  const dispose = useCallback((): void => {
    hitboxGeometry.dispose();
    hitboxMaterial.dispose();
    hitboxCacheRef.current.clear();
  }, [hitboxGeometry, hitboxMaterial]);

  return {
    nodeThreeObject,
    onEngineTick,
    setHoveredId,
    setSelectedId,
    dispose,
  };
}
