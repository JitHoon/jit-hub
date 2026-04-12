import { CLUSTERS, type ClusterId } from "@/constants/cluster";
import type { GraphData, GraphNode } from "@/types/graph";

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function resolveEndpointId(
  ref: string | { id?: string },
): string | undefined {
  if (typeof ref === "string") return ref;
  return ref.id;
}

export function resolveClusterColor(cluster: string): string {
  if (cluster in CLUSTERS) {
    return CLUSTERS[cluster as ClusterId].color;
  }
  return "#888888";
}

export function lightenHex(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

export function buildDegreeMap(data: GraphData): Map<string, number> {
  const map = new Map<string, number>();
  for (const node of data.nodes) {
    map.set(node.id, 0);
  }
  for (const edge of data.edges) {
    const src = resolveEndpointId(edge.source as string | GraphNode) ?? "";
    const tgt = resolveEndpointId(edge.target as string | GraphNode) ?? "";
    map.set(src, (map.get(src) ?? 0) + 1);
    map.set(tgt, (map.get(tgt) ?? 0) + 1);
  }
  return map;
}

export function buildAdjacencyMap(data: GraphData): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const node of data.nodes) {
    map.set(node.id, new Set());
  }
  for (const edge of data.edges) {
    const src = resolveEndpointId(edge.source as string | GraphNode) ?? "";
    const tgt = resolveEndpointId(edge.target as string | GraphNode) ?? "";
    map.get(src)?.add(tgt);
    map.get(tgt)?.add(src);
  }
  return map;
}
