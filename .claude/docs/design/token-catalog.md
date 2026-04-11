# Token Catalog

디자인 토큰의 전체 값과 사용처를 정리한 레퍼런스.

## Kick Colors — Nintendo Retro 원색

| 이름   | HEX       | CSS 변수              | Tailwind                            | JS (`tokens.ts`) |
| ------ | --------- | --------------------- | ----------------------------------- | ---------------- |
| Red    | `#E60012` | `--color-kick-red`    | `bg-kick-red` `text-kick-red`       | `KICK.red`       |
| Blue   | `#0058A6` | `--color-kick-blue`   | `bg-kick-blue` `text-kick-blue`     | `KICK.blue`      |
| Green  | `#00A651` | `--color-kick-green`  | `bg-kick-green` `text-kick-green`   | `KICK.green`     |
| Yellow | `#FFC800` | `--color-kick-yellow` | `bg-kick-yellow` `text-kick-yellow` | `KICK.yellow`    |

## Cluster Colors — 9색

| 클러스터    | HEX       | 베이스 | CSS 변수                         | Tailwind                    | JS (`clusters.ts`)              |
| ----------- | --------- | ------ | -------------------------------- | --------------------------- | ------------------------------- |
| 측지·좌표계 | `#00A651` | green  | `--color-cluster-geodesy`        | `bg-cluster-geodesy`        | `CLUSTERS.geodesy.color`        |
| 3D 그래픽스 | `#0058A6` | blue   | `--color-cluster-graphics`       | `bg-cluster-graphics`       | `CLUSTERS.graphics.color`       |
| 구현 사례   | `#E60012` | red    | `--color-cluster-implementation` | `bg-cluster-implementation` | `CLUSTERS.implementation.color` |
| 문제 해결   | `#B80030` | red    | `--color-cluster-problem`        | `bg-cluster-problem`        | `CLUSTERS.problem.color`        |
| 최적화      | `#FFC800` | yellow | `--color-cluster-optimization`   | `bg-cluster-optimization`   | `CLUSTERS.optimization.color`   |
| 인프라·배포 | `#2B7CB6` | blue   | `--color-cluster-infrastructure` | `bg-cluster-infrastructure` | `CLUSTERS.infrastructure.color` |
| 프론트엔드  | `#D45800` | red    | `--color-cluster-frontend`       | `bg-cluster-frontend`       | `CLUSTERS.frontend.color`       |
| 데이터 포맷 | `#007A4D` | green  | `--color-cluster-format`         | `bg-cluster-format`         | `CLUSTERS.format.color`         |
| 의사결정    | `#E0A500` | yellow | `--color-cluster-decision`       | `bg-cluster-decision`       | `CLUSTERS.decision.color`       |

## Base Palette — Light / Dark

| 토큰             | Light     | Dark      | CSS 변수             | Tailwind               | JS (`tokens.ts`)                           |
| ---------------- | --------- | --------- | -------------------- | ---------------------- | ------------------------------------------ |
| background       | `#F7F7F7` | `#111111` | `--background`       | `bg-background`        | `LIGHT.bg` / `DARK.bg`                     |
| foreground       | `#1A1A1A` | `#EEEEEE` | `--foreground`       | `text-foreground`      | `LIGHT.heading` / `DARK.heading`           |
| surface          | `#EEEEEE` | `#1A1A1A` | `--surface`          | `bg-surface`           | `LIGHT.surface` / `DARK.surface`           |
| surface-alt      | `#E4E4E4` | `#232323` | `--surface-alt`      | `bg-surface-alt`       | `LIGHT.surfaceAlt` / `DARK.surfaceAlt`     |
| muted            | `#737373` | `#878787` | `--muted`            | `text-muted`           | `LIGHT.muted` / `DARK.muted`               |
| text             | `#666666` | `#999999` | `--text`             | `text-text`            | `LIGHT.text` / `DARK.text`                 |
| border           | `#D0D0D0` | `#2E2E2E` | `--border`           | `border-border`        | `LIGHT.border` / `DARK.border`             |
| border-strong    | `#B0B0B0` | `#444444` | `--border-strong`    | `border-border-strong` | `LIGHT.borderStrong` / `DARK.borderStrong` |
| surface-elevated | `#FFFFFF` | `#1A1A1A` | `--surface-elevated` | `bg-surface-elevated`  | `LIGHT.white` / `DARK.white`               |
| accent           | `#0058A6` | `#2B7CB6` | `--accent`           | `text-accent`          | —                                          |

## Graph Canvas

| 토큰        | Light     | Dark      | CSS 변수      | Tailwind      | JS (`tokens.ts`)                                 |
| ----------- | --------- | --------- | ------------- | ------------- | ------------------------------------------------ |
| graph-bg    | `#F0F0F0` | `#0E0E0E` | `--graph-bg`  | `bg-graph-bg` | `GRAPH_GRAY.light.bg` / `GRAPH_GRAY.dark.bg`     |
| graph-dot   | `#B0B0B0` | `#333333` | `--graph-dot` | —             | `GRAPH_GRAY.light.dot` / `GRAPH_GRAY.dark.dot`   |
| node        | `#C0C0C0` | `#444444` | —             | —             | `GRAPH_GRAY.light.node` / `GRAPH_GRAY.dark.node` |
| nodeFaded   | `#D4D4D4` | `#333333` | —             | —             | `GRAPH_GRAY.light.nodeFaded`                     |
| edge        | `#D0D0D0` | `#2A2A2A` | —             | —             | `GRAPH_GRAY.light.edge`                          |
| leafEdge    | `#C8C8C8` | `#333333` | —             | —             | `GRAPH_GRAY.light.leafEdge`                      |
| label       | `#A0A0A0` | `#555555` | —             | —             | `GRAPH_GRAY.light.label`                         |
| labelActive | `#444444` | `#CCCCCC` | —             | —             | `GRAPH_GRAY.light.labelActive`                   |

## Typography

| 용도           | 폰트                             | CSS 변수         | Tailwind       | JS (`tokens.ts`) |
| -------------- | -------------------------------- | ---------------- | -------------- | ---------------- |
| Display (제목) | Lexend                           | `--font-display` | `font-display` | `FONT.display`   |
| Body (본문)    | Noto Sans KR                     | `--font-sans`    | `font-sans`    | `FONT.body`      |
| Mono (코드)    | ui-monospace, SF Mono, Fira Code | —                | `font-mono`    | —                |

## Shadows & Glows

| 토큰      | Light                           | Dark                             | CSS 변수      |
| --------- | ------------------------------- | -------------------------------- | ------------- |
| shadow-sm | `0 1px 2px rgb(0 0 0 / 0.06)`   | `0 1px 2px rgb(0 0 0 / 0.3)`     | `--shadow-sm` |
| shadow-md | `0 4px 12px rgb(0 0 0 / 0.08)`  | `0 4px 12px rgb(0 0 0 / 0.4)`    | `--shadow-md` |
| shadow-lg | `0 10px 40px rgb(0 0 0 / 0.12)` | `0 10px 40px rgb(0 0 0 / 0.5)`   | `--shadow-lg` |
| glow-node | `0 0 20px rgb(0 88 166 / 0.4)`  | `0 0 24px rgb(43 124 182 / 0.5)` | `--glow-node` |

## Transitions

| 토큰            | 값                               | CSS 변수            |
| --------------- | -------------------------------- | ------------------- |
| duration-fast   | `150ms`                          | `--duration-fast`   |
| duration-normal | `200ms`                          | `--duration-normal` |
| duration-slow   | `350ms`                          | `--duration-slow`   |
| ease-out        | `cubic-bezier(0.16, 1, 0.3, 1)`  | `--ease-out`        |
| ease-in-out     | `cubic-bezier(0.65, 0, 0.35, 1)` | `--ease-in-out`     |

## Float Keyframes

| 이름      | 설명               | 사용처                                               |
| --------- | ------------------ | ---------------------------------------------------- |
| `float-a` | 궤도 A (↗ → ↙ → ↘) | 노드 플로팅 — `animation: float-a 5~9.8s infinite`   |
| `float-b` | 궤도 B (↙ → ↗ → ↖) | 노드 플로팅 — index % 3으로 분배                     |
| `float-c` | 궤도 C (↘ → ↖ → ↗) | 노드 플로팅 — 호버 시 `animation-play-state: paused` |

## 소스 파일 매핑

| 파일                  | 역할                                                                 |
| --------------------- | -------------------------------------------------------------------- |
| `src/app/globals.css` | CSS 변수 정의 (`:root` / `.dark`), `@theme` Tailwind 등록, keyframes |
| `src/lib/tokens.ts`   | JS 상수 — KICK, Palette, FONT, GRAPH_GRAY (캔버스 직접 사용)         |
| `src/lib/clusters.ts` | JS 상수 — 클러스터 ID, 라벨, HEX 색상, 베이스 킥 컬러                |
