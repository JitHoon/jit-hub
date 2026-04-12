import { describe, expect, it } from "vitest";
import {
  easeInOut,
  resolveEndpointId,
  resolveClusterColor,
  lightenHex,
  buildDegreeMap,
  buildAdjacencyMap,
} from "./graph-helpers";
import type { GraphData } from "@/types/graph";

describe("easeInOut", () => {
  it("returns 0 at t=0", () => {
    expect(easeInOut(0)).toBe(0);
  });

  it("returns 0.5 at t=0.5", () => {
    expect(easeInOut(0.5)).toBe(0.5);
  });

  it("returns 1 at t=1", () => {
    expect(easeInOut(1)).toBe(1);
  });
});

describe("resolveEndpointId", () => {
  it("returns string as-is", () => {
    expect(resolveEndpointId("node-1")).toBe("node-1");
  });

  it("returns id from object", () => {
    expect(resolveEndpointId({ id: "node-2" })).toBe("node-2");
  });

  it("returns undefined when object has no id", () => {
    expect(resolveEndpointId({})).toBeUndefined();
  });
});

describe("resolveClusterColor", () => {
  it("returns fallback for unknown cluster", () => {
    expect(resolveClusterColor("unknown")).toBe("#888888");
  });
});

describe("lightenHex", () => {
  it("returns white when amount=1", () => {
    expect(lightenHex("#000000", 1)).toBe("#ffffff");
  });

  it("returns same color when amount=0", () => {
    expect(lightenHex("#ff0000", 0)).toBe("#ff0000");
  });
});

const SAMPLE_DATA: GraphData = {
  nodes: [
    { id: "a", title: "A", cluster: "c1", difficulty: "easy", tags: [] },
    { id: "b", title: "B", cluster: "c1", difficulty: "easy", tags: [] },
    { id: "c", title: "C", cluster: "c2", difficulty: "easy", tags: [] },
  ],
  edges: [
    { source: "a", target: "b", type: "prerequisite" },
    { source: "b", target: "c", type: "related" },
  ],
  clusters: [],
};

describe("buildDegreeMap", () => {
  it("counts edges per node", () => {
    const map = buildDegreeMap(SAMPLE_DATA);
    expect(map.get("a")).toBe(1);
    expect(map.get("b")).toBe(2);
    expect(map.get("c")).toBe(1);
  });
});

describe("buildAdjacencyMap", () => {
  it("builds bidirectional adjacency", () => {
    const map = buildAdjacencyMap(SAMPLE_DATA);
    expect(map.get("a")).toEqual(new Set(["b"]));
    expect(map.get("b")).toEqual(new Set(["a", "c"]));
    expect(map.get("c")).toEqual(new Set(["b"]));
  });
});
