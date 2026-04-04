import type { EdgeType, GraphData } from "@/features/graph/types/graph";

export interface NodeConnection {
  slug: string;
  title: string;
  cluster: string;
  edgeType: EdgeType;
  relationship?: string;
}

function resolveEdgeId(ref: string | { id?: string }): string | undefined {
  if (typeof ref === "string") return ref;
  return ref.id;
}

export function buildNodeConnectionMap(
  graphData: GraphData,
): Map<string, NodeConnection[]> {
  const nodeTitleMap = new Map(graphData.nodes.map((n) => [n.id, n.title]));
  const nodeClusterMap = new Map(graphData.nodes.map((n) => [n.id, n.cluster]));

  const result = new Map<string, NodeConnection[]>();
  const seen = new Set<string>();

  for (const edge of graphData.edges) {
    const sourceId = resolveEdgeId(edge.source as string | { id?: string });
    const targetId = resolveEdgeId(edge.target as string | { id?: string });
    if (!sourceId || !targetId) continue;

    const dedupeKey = `${sourceId}->${targetId}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const targetCluster = nodeClusterMap.get(targetId);
    const targetTitle = nodeTitleMap.get(targetId);
    if (!targetCluster || !targetTitle) continue;

    const list = result.get(sourceId) ?? [];
    list.push({
      slug: targetId,
      title: targetTitle,
      cluster: targetCluster,
      edgeType: edge.type,
      relationship: edge.relationship,
    });
    result.set(sourceId, list);
  }

  return result;
}
