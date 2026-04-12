import type { NodeFrontmatter } from "@/types/node";
import { CLUSTERS } from "@/constants/cluster";
import type {
  GraphData,
  GraphEdge,
  GraphCluster,
  GraphNode,
} from "../types/graph";
import { EDGE_PRIORITY } from "@/constants/edge";

interface ParsedNodeInput {
  frontmatter: NodeFrontmatter;
}

const CLUSTER_LAYOUT_RADIUS = 80;
const NODE_JITTER = 15;

export function buildEdges(nodes: ParsedNodeInput[]): GraphEdge[] {
  const edges: GraphEdge[] = [];

  for (const node of nodes) {
    const { slug, prerequisites, relatedConcepts, childConcepts } =
      node.frontmatter;

    for (const prereq of prerequisites) {
      edges.push({ source: slug, target: prereq, type: "prerequisite" });
    }

    for (const related of relatedConcepts) {
      edges.push({
        source: slug,
        target: related.slug,
        type: "related",
        relationship: related.relationship,
      });
    }

    for (const child of childConcepts) {
      edges.push({ source: slug, target: child, type: "child" });
    }
  }

  const best = new Map<string, GraphEdge>();
  for (const edge of edges) {
    const key = `${edge.source}->${edge.target}`;
    const existing = best.get(key);
    if (!existing || EDGE_PRIORITY[edge.type] < EDGE_PRIORITY[existing.type]) {
      best.set(key, edge);
    }
  }

  return [...best.values()];
}

export function buildClusters(nodes: ParsedNodeInput[]): GraphCluster[] {
  const countMap = new Map<string, number>();
  for (const node of nodes) {
    const c = node.frontmatter.cluster;
    countMap.set(c, (countMap.get(c) ?? 0) + 1);
  }

  return Object.entries(CLUSTERS).map(([id, meta]) => ({
    id,
    label: meta.label,
    color: meta.color,
    nodeCount: countMap.get(id) ?? 0,
  }));
}

function seedClusterPositions(nodes: GraphNode[]): void {
  const clusterIds = [...new Set(nodes.map((n) => n.cluster))];
  const centers = new Map<string, { x: number; y: number; z: number }>();

  clusterIds.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / clusterIds.length;
    centers.set(id, {
      x: Math.cos(angle) * CLUSTER_LAYOUT_RADIUS,
      y: 0,
      z: Math.sin(angle) * CLUSTER_LAYOUT_RADIUS,
    });
  });

  const counters = new Map<string, number>();
  for (const node of nodes) {
    const center = centers.get(node.cluster)!;
    const idx = counters.get(node.cluster) ?? 0;
    counters.set(node.cluster, idx + 1);

    const phi = idx * 2.399;
    const r = NODE_JITTER * Math.sqrt(idx + 1);
    node.x = center.x + Math.cos(phi) * r;
    node.y = center.y + (idx - 1) * 5;
    node.z = center.z + Math.sin(phi) * r;
  }
}

export function generateGraphData(nodes: ParsedNodeInput[]): GraphData {
  const graphNodes: GraphNode[] = nodes.map((n) => ({
    id: n.frontmatter.slug,
    title: n.frontmatter.title,
    cluster: n.frontmatter.cluster,
    difficulty: n.frontmatter.difficulty,
    tags: n.frontmatter.tags,
  }));

  seedClusterPositions(graphNodes);

  return {
    nodes: graphNodes,
    edges: buildEdges(nodes),
    clusters: buildClusters(nodes),
  };
}
