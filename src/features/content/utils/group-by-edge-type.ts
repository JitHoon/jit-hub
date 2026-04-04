import type { EdgeType } from "@/types/graph";

interface HasEdgeType {
  edgeType: EdgeType;
}

export function groupByEdgeType<T extends HasEdgeType>(
  items: T[],
): Map<EdgeType, T[]> {
  const groups = new Map<EdgeType, T[]>();
  for (const item of items) {
    const list = groups.get(item.edgeType) ?? [];
    list.push(item);
    groups.set(item.edgeType, list);
  }
  return groups;
}
