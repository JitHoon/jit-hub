import type { NodeFrontmatter } from "@/types/node";
import { CLUSTERS } from "@/constants/cluster";
import type { GraphData, GraphEdge, GraphCluster } from "../types/graph";

interface ParsedNodeInput {
  frontmatter: NodeFrontmatter;
}

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

  return edges;
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

export function generateGraphData(nodes: ParsedNodeInput[]): GraphData {
  return {
    nodes: nodes.map((n) => ({
      id: n.frontmatter.slug,
      title: n.frontmatter.title,
      cluster: n.frontmatter.cluster,
      difficulty: n.frontmatter.difficulty,
      tags: n.frontmatter.tags,
    })),
    edges: buildEdges(nodes),
    clusters: buildClusters(nodes),
  };
}
