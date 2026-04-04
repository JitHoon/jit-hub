import type { ClusterId } from "@/constants/cluster";
import type { GraphNode } from "@/types/graph";

export function groupByCluster(
  nodes: GraphNode[],
): Map<ClusterId, GraphNode[]> {
  const groups = new Map<ClusterId, GraphNode[]>();
  for (const node of nodes) {
    const cluster = node.cluster as ClusterId;
    const list = groups.get(cluster) ?? [];
    list.push(node);
    groups.set(cluster, list);
  }
  return groups;
}
