# 설계 문서 템플릿

> 이 파일을 직접 수정하지 말 것. `.claude/docs/designs/{slug}.md`로 복사 후 작성.

---

# [컴포넌트명] — 설계 문서

> 생성: [날짜] | 작성: ui-designer 에이전트
> 경로: `.claude/docs/designs/{slug}.md`

---

## 1. 개요

**목적**: [한 문장으로 이 컴포넌트가 무엇을 하는지]

**사용 맥락**: [어떤 상황에서, 어떤 상태에서 등장하는지]

**정보 우선순위 요약**:
- P0 (Core): [없으면 컴포넌트가 성립하지 않는 요소]
- P1 (Supporting): [판단을 돕는 보조 정보]
- P2 (Contextual): [있으면 좋은 부가 정보]

**기존 패턴 활용**: [component-patterns.md 중 재사용하는 패턴 목록, 없으면 "없음"]

---

## 2. 컴포넌트 계층 구조

```
[ComponentName]                    [시맨틱 태그, 역할]
├── [SubComponent A]               [태그, aria-* 속성]
│   ├── [Element A-1]              [태그, aria-* 속성]
│   └── [Element A-2]              [태그, aria-* 속성]
├── [SubComponent B]               [태그, aria-* 속성]
│   └── [Element B-1]              [태그, aria-* 속성]
└── [SubComponent C]               [태그, aria-* 속성]
```

---

## 3. 토큰 매핑

### 컨테이너

| 속성 | 라이트 | 다크 | 토큰/클래스 |
|------|--------|------|-------------|
| 배경 | `#FFFFFF` | `#1A1A1A` | `--surface-elevated` |
| 테두리 | `#D0D0D0` | `#2E2E2E` | `--border` |
| 그림자 | `0 4px 12px rgb(0 0 0 / 0.08)` | `0 4px 12px rgb(0 0 0 / 0.4)` | `--shadow-md` |
| 모서리 | — | — | `rounded-lg` |
| 패딩 | — | — | `p-6` |

### 타이포그래피

| 요소 | 폰트 | 크기/행간 | 색상 (라이트) | 색상 (다크) | 토큰 |
|------|------|-----------|--------------|------------|------|
| 제목 | Lexend | `text-lg font-bold tracking-tight` | `#1A1A1A` | `#EEEEEE` | `--foreground`, `font-display` |
| 본문 | Noto Sans KR | `text-[13px] leading-[1.85]` | `#666666` | `#999999` | `--text`, `font-sans` |
| 캡션 | Noto Sans KR | `text-[11px]` | `#888888` | `#707070` | `--muted`, `font-sans` |

### 클러스터 종속 요소

> 클러스터 색상은 `clusters.ts`의 `CLUSTERS.{clusterId}.color` 참조. 하드코딩 금지.

| 요소 | 처리 방식 | 참조 |
|------|----------|------|
| 클러스터 뱃지 배경 | `{clusterColor}12` (라이트) / `{clusterColor}18` (다크) | component-patterns.md |
| 리드 인용문 좌측 보더 | `{clusterColor}` | component-patterns.md |

---

## 4. 인터랙션 상태

### [인터랙티브 요소명 1] (예: 닫기 버튼)

| 상태 | 배경 | 아이콘 색상 | 변환 |
|------|------|------------|------|
| default | transparent | `--muted` | — |
| hover | `--surface` | `--foreground` | — |
| focus | transparent | `--foreground` | `outline: 2px solid var(--accent)` |
| active | `--surface-alt` | `--foreground` | `scale(0.95)` |
| disabled | — | — | 해당 없음 |

**전환**: `transition: background-color var(--duration-fast), color var(--duration-fast)`

### [인터랙티브 요소명 2]

| 상태 | [속성] | [속성] | 설명 |
|------|--------|--------|------|
| default | | | |
| hover | | | |
| focus | | | |
| active | | | |
| disabled | | | |

---

## 5. 반응형 동작

### Desktop (md 이상, 768px+)

[레이아웃 설명. 분할 뷰 기준 우측 패널에서의 위치와 크기]

- 너비: `[값]`
- 위치: `[설명]`
- 스크롤: `[있음/없음]`

### Mobile (md 미만)

[모바일에서의 변화 사항]

- 너비: `w-full`
- 위치: `[변경 사항]`
- 숨기거나 재배치되는 요소: `[목록 또는 "없음"]`

---

## 6. 접근성

### ARIA 명세

| 요소 | role | aria-label | 비고 |
|------|------|-----------|------|
| 컨테이너 | `region` | `"[컴포넌트 설명]"` | |
| 닫기 버튼 | — | `"닫기"` | button 요소 자체 |
| [요소명] | `[role]` | `"[레이블]"` | |

### 키보드 동작

| 키 | 동작 |
|----|------|
| `Tab` | 포커스 순서: [요소 A → 요소 B → 요소 C] |
| `Shift+Tab` | 역방향 포커스 |
| `Escape` | [닫기 / 해당 없음] |
| `Enter` / `Space` | [버튼 활성화] |

### 포커스 트랩 (모달/패널인 경우)

열릴 때: 첫 번째 포커스 가능 요소로 포커스 이동
닫힐 때: 트리거 요소(노드 클릭 요소)로 포커스 복귀

---

## 7. 기존 패턴 연계

component-patterns.md에서 그대로 가져오는 패턴:

| 패턴 | 위치 | 변경 사항 |
|------|------|----------|
| 클러스터 뱃지 | Header | 없음 |
| 난이도 라벨 | Header | 없음 |
| 태그 | Body | 없음 |
| 리드 인용문 | Body | 없음 |
| [패턴명] | [위치] | [변경 내용 또는 "없음"] |
