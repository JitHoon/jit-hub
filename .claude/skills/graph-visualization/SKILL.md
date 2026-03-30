---
name: graph-visualization
description: 그래프 시각화 작업 시 사용. react-force-graph-2d, 허브/리프 전환, 노드 클릭/호버 인터랙션, 분할 뷰 레이아웃, 클러스터 색상 관련 작업에 활성화.
allowed-tools: Read, Grep, Glob
---

# 그래프 시각화 Skill

## 라이브러리

react-force-graph-2d — Next.js에서 반드시 dynamic import:

```tsx
const ForceGraph = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});
```

## 3가지 상태

### 상태 1: 초기 화면

- 허브 노드만 표시 (nodeVisibility 사용)
- 허브 크기 = 연결 수에 비례
- 클러스터별 색상
- 허브 간 관계선만 표시
- 리프는 nodeVisibility: false

### 상태 2: 허브 호버 → 리프 펼치기

- 호버한 허브의 직접 연결 리프가 애니메이션으로 등장
- nodeVisibility를 동적으로 토글
- 다른 허브 호버 → 이전 리프 접힘 + 새 리프 펼침
- 호버 해제 → 리프 숨김

### 상태 3: 노드 클릭 → 분할 뷰

- 그래프가 좌측으로 축소
- 우측에 본문 패널 열림 (MDX 렌더링)
- 좌우 비율 드래그 조절 가능
- 다른 노드 클릭 → 본문만 전환 (그래프 상태 유지)

## 관계선 시각화

- 4~5개 시각 카테고리로 매핑 (선 스타일, 색상, 두께)
- 매핑 테이블은 src/lib/ 에서 관리
- fallback: "관련" 카테고리

## Gotchas

- react-force-graph-2d는 canvas 기반 → SSR 불가
- nodeVisibility 변경 시 d3 시뮬레이션 재시작 주의
- 모바일: 본문이 그래프 아래로 펼쳐짐 (세로 레이아웃)
- 그래프 리사이즈 시 width/height props 동적 업데이트 필요
- 노드 데이터는 graph-data.json에서 가져옴 (빌드 타임 생성)

## 색상 참조

그래프 캔버스는 CSS가 아닌 JS HEX 값을 직접 사용한다. 아래 두 파일에서 가져온다:

- `src/lib/clusters.ts` — 클러스터별 HEX 색상 (`CLUSTERS[id].color`) + base 킥 컬러 매핑
- `src/lib/tokens.ts` — 킥 컬러(`KICK`), 팔레트(`LIGHT`/`DARK`), 그래프 전용 그레이(`GRAPH_GRAY`)

### 클러스터 색상 (HEX)

| 클러스터 | color | base |
|----------|-------|------|
| geodesy (측지·좌표계) | `#00A651` | green |
| graphics (3D 그래픽스) | `#0058A6` | blue |
| implementation (구현 사례) | `#E60012` | red |
| problem (문제 해결) | `#B80030` | red |
| optimization (최적화) | `#FFC800` | yellow |
| infrastructure (인프라·배포) | `#2B7CB6` | blue |
| frontend (프론트엔드) | `#D45800` | red |
| format (데이터 포맷) | `#007A4D` | green |
| decision (의사결정) | `#E0A500` | yellow |

### 그래프 캔버스 그레이

| 용도 | Light | Dark |
|------|-------|------|
| bg | `#F0F0F0` | `#0E0E0E` |
| node | `#C0C0C0` | `#444444` |
| nodeFaded | `#D4D4D4` | `#333333` |
| edge | `#D0D0D0` | `#2A2A2A` |
| leafEdge | `#C8C8C8` | `#333333` |
| label | `#A0A0A0` | `#555555` |
| labelActive | `#444444` | `#CCCCCC` |

### 사용 패턴

```tsx
import { getClusterColor } from "@/lib/clusters";
import { getGraphGray } from "@/lib/tokens";

const color = getClusterColor("geodesy"); // "#00A651"
const gray = getGraphGray(isDark);        // GraphGray 객체
```

## 상세 레퍼런스

필요 시 아래 파일을 읽어라:

- `references/state-transitions.md` — 3가지 상태 간 전환 로직, 트리거, d3 시뮬레이션 관리, 모바일 대응
