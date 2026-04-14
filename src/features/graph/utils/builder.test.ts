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
      cluster: "coordinate",
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

  it("순환 참조(A→B, B→A)를 양방향 엣지로 생성한다", () => {
    const nodes = [
      makeParsedNode({ slug: "a", prerequisites: ["b"] }),
      makeParsedNode({ slug: "b", prerequisites: ["a"] }),
    ];
    const edges = buildEdges(nodes);
    expect(edges).toContainEqual({
      source: "a",
      target: "b",
      type: "prerequisite",
    });
    expect(edges).toContainEqual({
      source: "b",
      target: "a",
      type: "prerequisite",
    });
    expect(edges).toHaveLength(2);
  });

  it("같은 소스→타겟에 prerequisite과 related가 있으면 prerequisite을 유지한다", () => {
    const nodes = [
      makeParsedNode({
        slug: "a",
        prerequisites: ["b"],
        relatedConcepts: [{ slug: "b", relationship: "uses" }],
      }),
      makeParsedNode({ slug: "b" }),
    ];
    const edges = buildEdges(nodes);
    const aToB = edges.filter((e) => e.source === "a" && e.target === "b");
    expect(aToB).toHaveLength(1);
    expect(aToB[0]?.type).toBe("prerequisite");
  });

  it("같은 소스→타겟에 child와 related가 있으면 child를 유지한다", () => {
    const nodes = [
      makeParsedNode({
        slug: "a",
        childConcepts: ["b"],
        relatedConcepts: [{ slug: "b", relationship: "extends" }],
      }),
      makeParsedNode({ slug: "b" }),
    ];
    const edges = buildEdges(nodes);
    const aToB = edges.filter((e) => e.source === "a" && e.target === "b");
    expect(aToB).toHaveLength(1);
    expect(aToB[0]?.type).toBe("child");
  });

  it("여러 노드에서 동일 타겟을 참조하면 각각 별개 엣지가 생성된다", () => {
    const nodes = [
      makeParsedNode({ slug: "a", prerequisites: ["c"] }),
      makeParsedNode({ slug: "b", prerequisites: ["c"] }),
      makeParsedNode({ slug: "c" }),
    ];
    const edges = buildEdges(nodes);
    expect(edges).toHaveLength(2);
    expect(edges).toContainEqual({
      source: "a",
      target: "c",
      type: "prerequisite",
    });
    expect(edges).toContainEqual({
      source: "b",
      target: "c",
      type: "prerequisite",
    });
  });
});

describe("buildClusters", () => {
  it("각 클러스터의 노드 수를 정확히 계산한다", () => {
    const nodes = [
      makeParsedNode({ slug: "a", cluster: "coordinate" }),
      makeParsedNode({ slug: "b", cluster: "coordinate" }),
      makeParsedNode({ slug: "c", cluster: "data" }),
    ];
    const clusters = buildClusters(nodes);
    const geodesy = clusters.find((c) => c.id === "coordinate");
    const graphics = clusters.find((c) => c.id === "data");
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

  it("고립 노드(관계 없음)에도 3D 좌표가 할당된다", () => {
    const nodes = [makeParsedNode({ slug: "lonely" })];
    const data = generateGraphData(nodes);
    expect(typeof data.nodes[0]?.x).toBe("number");
    expect(typeof data.nodes[0]?.y).toBe("number");
    expect(typeof data.nodes[0]?.z).toBe("number");
    expect(data.edges).toHaveLength(0);
  });

  it("빈 노드 배열을 처리한다", () => {
    const data = generateGraphData([]);
    expect(data.nodes).toHaveLength(0);
    expect(data.edges).toHaveLength(0);
    expect(data.clusters.every((c) => c.nodeCount === 0)).toBe(true);
  });

  it("동일 클러스터의 여러 노드가 서로 다른 좌표를 받는다", () => {
    const nodes = [
      makeParsedNode({ slug: "a", cluster: "coordinate" }),
      makeParsedNode({ slug: "b", cluster: "coordinate" }),
      makeParsedNode({ slug: "c", cluster: "coordinate" }),
    ];
    const data = generateGraphData(nodes);
    const coords = data.nodes.map((n) => `${n.x},${n.y},${n.z}`);
    expect(new Set(coords).size).toBe(3);
  });
});
