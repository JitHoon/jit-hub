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

## 상세 레퍼런스

필요 시 아래 파일을 읽어라:

- `references/state-transitions.md` — 3가지 상태 간 전환 로직, 트리거, d3 시뮬레이션 관리, 모바일 대응
