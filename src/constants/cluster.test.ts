import { describe, it, expect } from "vitest";
import {
  CLUSTER_IDS,
  CLUSTERS,
  getClusterColor,
  getClusterLabel,
} from "./cluster";

describe("CLUSTER_IDS", () => {
  it("CLUSTERS 레코드의 키 개수와 일치한다", () => {
    expect(CLUSTER_IDS.length).toBe(Object.keys(CLUSTERS).length);
  });
});

describe("getClusterColor", () => {
  it("각 클러스터에 대해 HEX 색상을 반환한다", () => {
    for (const id of CLUSTER_IDS) {
      const color = getClusterColor(id);
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe("getClusterLabel", () => {
  it("각 클러스터에 대해 비어있지 않은 라벨을 반환한다", () => {
    for (const id of CLUSTER_IDS) {
      const label = getClusterLabel(id);
      expect(label.length).toBeGreaterThan(0);
    }
  });
});
