import { describe, it, expect } from "vitest";
import { buildEdges, buildClusters, generateGraphData } from "./builder";
import type { NodeFrontmatter } from "@/types/node";

function makeParsedNode(overrides: Partial<NodeFrontmatter> = {}): {
  frontmatter: NodeFrontmatter;
} {
  return {
    frontmatter: {
      slug: "test-node",
      title: "테스트",
      cluster: "geodesy",
      difficulty: "beginner",
      tags: ["test"],
      prerequisites: [],
      relatedConcepts: [],
      childConcepts: [],
      ...overrides,
    },
  };
}

describe("buildEdges", () => {
  it("prerequisites에서 prerequisite 타입 엣지를 생성한다", () => {
    const nodes = [
      makeParsedNode({ slug: "a", prerequisites: ["b"] }),
      makeParsedNode({ slug: "b" }),
    ];
    const edges = buildEdges(nodes);
    expect(edges).toContainEqual({
      source: "a",
      target: "b",
      type: "prerequisite",
    });
  });

  it("relatedConcepts에서 related 타입 엣지를 생성한다", () => {
    const nodes = [
      makeParsedNode({
        slug: "a",
        relatedConcepts: [{ slug: "b", relationship: "appliedIn" }],
      }),
      makeParsedNode({ slug: "b" }),
    ];
    const edges = buildEdges(nodes);
    expect(edges).toContainEqual({
      source: "a",
      target: "b",
      type: "related",
      relationship: "appliedIn",
    });
  });

  it("childConcepts에서 child 타입 엣지를 생성한다", () => {
    const nodes = [
      makeParsedNode({ slug: "a", childConcepts: ["b"] }),
      makeParsedNode({ slug: "b" }),
    ];
    const edges = buildEdges(nodes);
    expect(edges).toContainEqual({
      source: "a",
      target: "b",
      type: "child",
    });
  });

  it("관계가 없으면 빈 배열을 반환한다", () => {
    const nodes = [makeParsedNode({ slug: "a" })];
    expect(buildEdges(nodes)).toEqual([]);
  });
});

describe("buildClusters", () => {
  it("각 클러스터의 노드 수를 정확히 계산한다", () => {
    const nodes = [
      makeParsedNode({ slug: "a", cluster: "geodesy" }),
      makeParsedNode({ slug: "b", cluster: "geodesy" }),
      makeParsedNode({ slug: "c", cluster: "graphics" }),
    ];
    const clusters = buildClusters(nodes);
    const geodesy = clusters.find((c) => c.id === "geodesy");
    const graphics = clusters.find((c) => c.id === "graphics");
    expect(geodesy?.nodeCount).toBe(2);
    expect(graphics?.nodeCount).toBe(1);
  });
});

describe("generateGraphData", () => {
  it("nodes, edges, clusters를 모두 포함한 GraphData를 반환한다", () => {
    const nodes = [makeParsedNode({ slug: "a" })];
    const data = generateGraphData(nodes);
    expect(data.nodes).toHaveLength(1);
    expect(data.nodes[0]?.id).toBe("a");
    expect(Array.isArray(data.edges)).toBe(true);
    expect(Array.isArray(data.clusters)).toBe(true);
  });
});
