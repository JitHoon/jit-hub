import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { nodeFrontmatterSchema, type NodeFrontmatter } from "./schema";
import { CLUSTERS, type ClusterId } from "./clusters";

const NODES_DIR = path.join(process.cwd(), "contents", "nodes");

interface ParsedNode {
  frontmatter: NodeFrontmatter;
  content: string;
}

function parseNode(filePath: string): ParsedNode {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const result = nodeFrontmatterSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`프론트매터 검증 실패: ${filePath}\n${errors}`);
  }

  return { frontmatter: result.data, content };
}

function validateSlugReferences(nodes: ParsedNode[]): void {
  const slugSet = new Set(nodes.map((n) => n.frontmatter.slug));

  const duplicates = nodes
    .map((n) => n.frontmatter.slug)
    .filter((slug, i, arr) => arr.indexOf(slug) !== i);

  if (duplicates.length > 0) {
    throw new Error(`중복 slug 발견: ${duplicates.join(", ")}`);
  }

  for (const node of nodes) {
    const { slug, prerequisites, relatedConcepts, childConcepts } =
      node.frontmatter;

    for (const prereq of prerequisites) {
      if (!slugSet.has(prereq)) {
        throw new Error(
          `[${slug}] prerequisites에 존재하지 않는 slug: "${prereq}"`,
        );
      }
    }

    for (const related of relatedConcepts) {
      if (!slugSet.has(related.slug)) {
        throw new Error(
          `[${slug}] relatedConcepts에 존재하지 않는 slug: "${related.slug}"`,
        );
      }
    }

    for (const child of childConcepts) {
      if (!slugSet.has(child)) {
        throw new Error(
          `[${slug}] childConcepts에 존재하지 않는 slug: "${child}"`,
        );
      }
    }
  }
}

export function loadAllNodes(): ParsedNode[] {
  const files = fs
    .readdirSync(NODES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(NODES_DIR, f));

  const nodes = files.map(parseNode);
  validateSlugReferences(nodes);

  return nodes;
}

export function getNodeBySlug(slug: string): ParsedNode | undefined {
  const filePath = path.join(NODES_DIR, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  return parseNode(filePath);
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(NODES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export type { ParsedNode };

interface GraphNode {
  id: string;
  title: string;
  cluster: string;
  difficulty: string;
  tags: string[];
}

type EdgeType = "prerequisite" | "related" | "child";

interface GraphEdge {
  source: string;
  target: string;
  type: EdgeType;
  relationship?: string;
}

interface GraphCluster {
  id: string;
  label: string;
  color: string;
  nodeCount: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: GraphCluster[];
}

function buildEdges(nodes: ParsedNode[]): GraphEdge[] {
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

function buildClusters(nodes: ParsedNode[]): GraphCluster[] {
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

export function generateGraphData(nodes: ParsedNode[]): GraphData {
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

export function writeGraphData(outputPath: string): void {
  const nodes = loadAllNodes();
  const data = generateGraphData(nodes);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
  const clusterIds = data.clusters
    .filter((c) => c.nodeCount > 0)
    .map((c) => c.id as ClusterId);
  console.log(
    `graph-data.json 생성 완료: ${data.nodes.length}개 노드, ${data.edges.length}개 엣지, ${clusterIds.length}개 활성 클러스터`,
  );
}

export type { GraphData, GraphNode, GraphEdge, GraphCluster };
