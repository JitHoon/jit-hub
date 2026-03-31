import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { NodeFrontmatter } from "@/types/node";
import { nodeFrontmatterSchema } from "../types/schema";

const NODES_DIR = path.join(process.cwd(), "contents", "nodes");

export interface ParsedNode {
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
