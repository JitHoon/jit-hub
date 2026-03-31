/**
 * 클러스터 색상 상수
 *
 * globals.css의 @theme 토큰과 1:1 매핑.
 * 그래프 캔버스(react-force-graph-2d)는 CSS 유틸리티가 아닌
 * JS 색상값을 직접 사용하므로 여기서 관리한다.
 */

export const CLUSTER_IDS = [
  "geodesy",
  "graphics",
  "implementation",
  "problem",
  "optimization",
  "infrastructure",
  "frontend",
  "format",
  "decision",
] as const;

export type ClusterId = (typeof CLUSTER_IDS)[number];

export type KickBase = "red" | "blue" | "green" | "yellow";

interface ClusterMeta {
  label: string;
  color: string;
  base: KickBase;
}

export const CLUSTERS: Record<ClusterId, ClusterMeta> = {
  geodesy: { label: "측지·좌표계", color: "#00A651", base: "green" },
  graphics: { label: "3D 그래픽스", color: "#0058A6", base: "blue" },
  implementation: { label: "구현 사례", color: "#E60012", base: "red" },
  problem: { label: "문제 해결", color: "#B80030", base: "red" },
  optimization: { label: "최적화", color: "#FFC800", base: "yellow" },
  infrastructure: { label: "인프라·배포", color: "#2B7CB6", base: "blue" },
  frontend: { label: "프론트엔드", color: "#D45800", base: "red" },
  format: { label: "데이터 포맷", color: "#007A4D", base: "green" },
  decision: { label: "의사결정", color: "#E0A500", base: "yellow" },
} as const satisfies Record<ClusterId, ClusterMeta>;

export function getClusterColor(cluster: ClusterId): string {
  return CLUSTERS[cluster].color;
}

export function getClusterLabel(cluster: ClusterId): string {
  return CLUSTERS[cluster].label;
}
