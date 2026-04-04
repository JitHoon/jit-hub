import { describe, expect, it } from "vitest";
import type { GraphData } from "@/types/graph";
import { buildNodeConnectionMap } from "./node-connections";

function makeGraphData(overrides?: Partial<GraphData>): GraphData {
  return {
    nodes: [
      { id: "a", title: "A", cluster: "geo", difficulty: "basic", tags: [] },
      { id: "b", title: "B", cluster: "geo", difficulty: "basic", tags: [] },
      { id: "c", title: "C", cluster: "geo", difficulty: "basic", tags: [] },
      { id: "d", title: "D", cluster: "gfx", difficulty: "basic", tags: [] },
    ],
    edges: [],
    clusters: [],
    ...overrides,
  };
}

describe("buildNodeConnectionMap", () => {
  it("같은 클러스터와 다른 클러스터 edge 모두 포함한다", () => {
    const data = makeGraphData({
      edges: [
        { source: "a", target: "b", type: "prerequisite" },
        { source: "a", target: "d", type: "related" },
      ],
    });

    const map = buildNodeConnectionMap(data);
    const connections = map.get("a");

    expect(connections).toHaveLength(2);
    expect(connections).toEqual([
      {
        slug: "b",
        title: "B",
        cluster: "geo",
        edgeType: "prerequisite",
        relationship: undefined,
      },
      {
        slug: "d",
        title: "D",
        cluster: "gfx",
        edgeType: "related",
        relationship: undefined,
      },
    ]);
  });

  it("edge가 없는 노드는 map에 포함되지 않는다", () => {
    const data = makeGraphData({ edges: [] });
    const map = buildNodeConnectionMap(data);
    expect(map.size).toBe(0);
  });

  it("한 노드에서 여러 연결을 가질 수 있다", () => {
    const data = makeGraphData({
      edges: [
        { source: "a", target: "b", type: "prerequisite" },
        { source: "a", target: "c", type: "child" },
      ],
    });

    const map = buildNodeConnectionMap(data);
    const connections = map.get("a");

    expect(connections).toHaveLength(2);
    expect(connections![0].edgeType).toBe("prerequisite");
    expect(connections![1].edgeType).toBe("child");
  });

  it("relationship 필드를 보존한다", () => {
    const data = makeGraphData({
      edges: [
        {
          source: "a",
          target: "b",
          type: "related",
          relationship: "유사 개념",
        },
      ],
    });

    const map = buildNodeConnectionMap(data);
    expect(map.get("a")![0].relationship).toBe("유사 개념");
  });

  it("같은 source→target 쌍이 여러 타입으로 존재하면 첫 번째만 유지한다", () => {
    const data = makeGraphData({
      edges: [
        { source: "a", target: "b", type: "prerequisite" },
        { source: "a", target: "b", type: "related" },
      ],
    });

    const map = buildNodeConnectionMap(data);
    const connections = map.get("a");

    expect(connections).toHaveLength(1);
    expect(connections![0].edgeType).toBe("prerequisite");
  });
});
