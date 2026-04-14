export const CLUSTER_IDS = [
  "discovery",
  "data",
  "coordinate",
  "performance",
  "pipeline",
  "feature",
] as const;

export type ClusterId = (typeof CLUSTER_IDS)[number];

export type KickBase = "red" | "blue" | "green" | "yellow";

interface ClusterMeta {
  label: string;
  color: string;
  base: KickBase;
}

export const CLUSTERS: Record<ClusterId, ClusterMeta> = {
  discovery: { label: "문제 발견과 결정", color: "#B80030", base: "red" },
  data: { label: "3D 데이터 기초", color: "#0058A6", base: "blue" },
  coordinate: { label: "좌표와 배치", color: "#00A651", base: "green" },
  performance: { label: "성능 최적화", color: "#FFC800", base: "yellow" },
  pipeline: { label: "데이터 파이프라인", color: "#2B7CB6", base: "blue" },
  feature: { label: "기능 구현", color: "#D45800", base: "red" },
} as const satisfies Record<ClusterId, ClusterMeta>;

export function getClusterColor(cluster: ClusterId): string {
  return CLUSTERS[cluster].color;
}

export function getClusterLabel(cluster: ClusterId): string {
  return CLUSTERS[cluster].label;
}
