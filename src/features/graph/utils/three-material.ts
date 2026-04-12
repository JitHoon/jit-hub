import * as THREE from "three";
import type { GraphNode } from "../types/graph";

export const HUB_RADIUS = 3.75;
export const LEAF_RADIUS = 2.25;
export const SEGMENTS_DESKTOP = 32;
export const SEGMENTS_MOBILE = 16;
export const HUB_DEGREE_THRESHOLD = 3;

export const NODE_COLOR_DARK = "#111111";
export const NODE_COLOR_LIGHT = "#FFFFFF";
export const EDGE_COLOR_DARK = "#111111";
export const EDGE_COLOR_LIGHT = "#FFFFFF";
export const CONNECTED_LIGHTEN = 0.45;

export const HOVER_COLOR_IN_MS = 150;
export const HOVER_COLOR_OUT_MS = 200;
export const DEFAULT_HUB_OPACITY = 1;
export const DEFAULT_LEAF_OPACITY = 0.6;
export const DEFAULT_LINK_OPACITY = 1;

export function getMeshFromGroup(group: THREE.Group): THREE.Mesh | null {
  const child = group.children[0];
  return child instanceof THREE.Mesh ? child : null;
}

export function getBasicMat(mesh: THREE.Mesh): THREE.MeshBasicMaterial {
  return mesh.material as THREE.MeshBasicMaterial;
}

export function createNodeGroup(
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

export function rebuildGroupChildren(
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

export function setGroupColor(group: THREE.Group, color: string): void {
  const mesh = getMeshFromGroup(group);
  if (!mesh) return;
  const mat = getBasicMat(mesh);
  mat.color.set(color);
  mat.needsUpdate = true;
}
