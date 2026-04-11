/**
 * 디자인 토큰 — Modern Gray + Nintendo Retro Kick
 *
 * 프로토타입(src/app/design/page.tsx)에서 검증된 값을 추출.
 * CSS 변수가 아닌 JS 값이 필요한 곳(그래프 캔버스 등)에서 사용한다.
 */

/* ── Kick Colors ─────────────────────────────────────────── */

export const KICK = {
  red: "#E60012",
  blue: "#0058A6",
  green: "#00A651",
  yellow: "#FFC800",
} as const;

export type KickColor = keyof typeof KICK;

/* ── Base Palette ────────────────────────────────────────── */

export interface Palette {
  white: string;
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderStrong: string;
  muted: string;
  text: string;
  heading: string;
}

export const LIGHT: Palette = {
  white: "#FFFFFF",
  bg: "#F7F7F7",
  surface: "#EEEEEE",
  surfaceAlt: "#E4E4E4",
  border: "#D0D0D0",
  borderStrong: "#B0B0B0",
  muted: "#737373",
  text: "#666666",
  heading: "#1A1A1A",
};

export const DARK: Palette = {
  white: "#1A1A1A",
  bg: "#111111",
  surface: "#1A1A1A",
  surfaceAlt: "#232323",
  border: "#2E2E2E",
  borderStrong: "#444444",
  muted: "#878787",
  text: "#999999",
  heading: "#EEEEEE",
};

export function getPalette(dark: boolean): Palette {
  return dark ? DARK : LIGHT;
}

/* ── Typography ──────────────────────────────────────────── */

export const FONT = {
  display: "var(--font-lexend)",
  body: "var(--font-noto-kr)",
} as const;

/* ── Graph Canvas Grays ──────────────────────────────────── */

export interface GraphGray {
  bg: string;
  node: string;
  nodeFaded: string;
  edge: string;
  leafEdge: string;
  dot: string;
  label: string;
  labelActive: string;
}

const GRAPH_GRAY_LIGHT: GraphGray = {
  bg: "#111111",
  node: "#C0C0C0",
  nodeFaded: "#D4D4D4",
  edge: "#D0D0D0",
  leafEdge: "#C8C8C8",
  dot: "#B0B0B0",
  label: "#A0A0A0",
  labelActive: "#444444",
};

const GRAPH_GRAY_DARK: GraphGray = {
  bg: "#F7F7F7",
  node: "#444444",
  nodeFaded: "#333333",
  edge: "#2A2A2A",
  leafEdge: "#333333",
  dot: "#333333",
  label: "#555555",
  labelActive: "#CCCCCC",
};

export const GRAPH_GRAY = {
  light: GRAPH_GRAY_LIGHT,
  dark: GRAPH_GRAY_DARK,
} as const;

export function getGraphGray(dark: boolean): GraphGray {
  return dark ? GRAPH_GRAY_DARK : GRAPH_GRAY_LIGHT;
}
