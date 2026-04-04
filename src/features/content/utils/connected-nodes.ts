import type { ClusterId } from "@/constants/cluster";
import type { NodeFrontmatter } from "@/types/node";
import type { GraphData, EdgeType } from "@/features/graph/types/graph";

export interface ConnectedNodeInfo {
  slug: string;
  title: string;
  cluster: ClusterId;
  edgeType: "prerequisite" | "related" | "child";
  relationship?: string;
}

const EDGE_PRIORITY: Record<EdgeType, number> = {
  prerequisite: 0,
  child: 1,
  related: 2,
};

function deduplicateByPriority(
  nodes: ConnectedNodeInfo[],
): ConnectedNodeInfo[] {
  const best = new Map<string, ConnectedNodeInfo>();
  for (const node of nodes) {
    const existing = best.get(node.slug);
    if (
      !existing ||
      EDGE_PRIORITY[node.edgeType] < EDGE_PRIORITY[existing.edgeType]
    ) {
      best.set(node.slug, node);
    }
  }
  return nodes.filter((n) => best.get(n.slug) === n);
}

interface NodeMeta {
  title: string;
  cluster: string;
}

export function buildConnectedNodes(
  frontmatter: NodeFrontmatter,
  nodeMap: Map<string, NodeMeta>,
): ConnectedNodeInfo[] {
  const result: ConnectedNodeInfo[] = [];

  for (const slug of frontmatter.prerequisites) {
    const meta = nodeMap.get(slug);
    if (!meta) continue;
    result.push({
      slug,
      title: meta.title,
      cluster: meta.cluster as ClusterId,
      edgeType: "prerequisite",
    });
  }

  for (const concept of frontmatter.relatedConcepts) {
    const meta = nodeMap.get(concept.slug);
    if (!meta) continue;
    result.push({
      slug: concept.slug,
      title: meta.title,
      cluster: meta.cluster as ClusterId,
      edgeType: "related",
      relationship: concept.relationship,
    });
  }

  for (const slug of frontmatter.childConcepts) {
    const meta = nodeMap.get(slug);
    if (!meta) continue;
    result.push({
      slug,
      title: meta.title,
      cluster: meta.cluster as ClusterId,
      edgeType: "child",
    });
  }

  return deduplicateByPriority(result);
}

function resolveEdgeId(ref: string | { id?: string }): string | undefined {
  if (typeof ref === "string") return ref;
  return ref.id;
}

export function buildConnectedNodesFromGraph(
  nodeId: string,
  graphData: GraphData,
): ConnectedNodeInfo[] {
  const nodeMap = new Map(
    graphData.nodes.map((n) => [n.id, { title: n.title, cluster: n.cluster }]),
  );

  const result: ConnectedNodeInfo[] = [];
  const seen = new Set<string>();

  for (const edge of graphData.edges) {
    const sourceId = resolveEdgeId(edge.source as string | { id?: string });
    if (sourceId !== nodeId) continue;

    const targetId = resolveEdgeId(edge.target as string | { id?: string });
    if (!targetId) continue;

    const targetMeta = nodeMap.get(targetId);
    if (!targetMeta) continue;

    const key = `${targetId}-${edge.type}`;
    if (seen.has(key)) continue;
    seen.add(key);

    result.push({
      slug: targetId,
      title: targetMeta.title,
      cluster: targetMeta.cluster as ClusterId,
      edgeType: edge.type,
      relationship: edge.relationship,
    });
  }

  return deduplicateByPriority(result);
}
