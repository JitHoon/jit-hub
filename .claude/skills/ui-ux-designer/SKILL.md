---
name: ui-ux-designer
description: UI/UX 설계 인터뷰 진행, 설계 문서 작성, 컴포넌트 스펙 구조화 작업 시 활성화. 막연한 아이디어를 코딩 가능한 스펙으로 변환하는 방법론 제공.
allowed-tools: Read
---

# UI/UX 디자이너 Skill

## 이 Skill의 범위

- **담당**: 인터뷰 방법론, 정보 계층 설계, 스펙 작성 형식
- **비담당**: 토큰 값, 색상 코드, 컴포넌트 구현 코드 (→ design-system Skill)

## 정보 계층 설계 원칙

### Priority Tier 분류

컴포넌트의 모든 정보 요소를 아래 3단계로 분류한 뒤 설계한다:

| Tier | 기준 | 시각적 처리 |
|------|------|------------|
| **P0 (Core)** | 없으면 이 컴포넌트가 성립하지 않음 | 가장 높은 명도, 가장 큰 폰트 크기 |
| **P1 (Supporting)** | 판단에 도움이 되는 보조 정보 | `--text` 색상, 보조 폰트 크기 |
| **P2 (Contextual)** | 있으면 좋지만 없어도 됨 | `--muted` 색상, 최소 폰트 크기 |

이 분류가 레이아웃 순서와 공간 배분의 근거가 된다.

### 인터랙션 상태 5가지

모든 인터랙티브 요소에 아래 5개 상태를 정의한다. 불필요한 상태는 "default와 동일"로 명시한다:

1. **default** — 아무 동작 없는 기본 상태
2. **hover** — 마우스 오버
3. **focus** — 키보드 포커스 (outline 스타일 필수)
4. **active** — 클릭/탭 중인 상태
5. **disabled** — 비활성 상태 (해당 없으면 명시)

### 반응형 브레이크포인트

이 프로젝트의 레이아웃은 분할 뷰 기반이다:

| 브레이크포인트 | 조건 | 대응 |
|--------------|------|------|
| **Desktop** | `md` 이상 (768px+) | 좌측 그래프 + 우측 콘텐츠 분할 뷰 |
| **Mobile** | `md` 미만 | 그래프 축소, 콘텐츠 전체 너비 |

우측 패널 안에 위치한 컴포넌트는 모바일에서 `w-full`이 기본이다.

## 스펙 문서 필수 섹션 순서

1. **개요** — 목적, 사용 맥락, P0/P1/P2 요약, 기존 패턴 활용 여부
2. **컴포넌트 계층 구조** — 트리 형태 (시맨틱 태그 + ARIA 속성 포함)
3. **토큰 매핑** — 각 시각 요소에 사용할 CSS 변수 (라이트/다크 분리)
4. **인터랙션 상태** — 인터랙티브 요소별 5개 상태 전부
5. **반응형 동작** — Desktop / Mobile 각각
6. **접근성** — ARIA 역할, 키보드 동작, 포커스 순서
7. **기존 패턴 연계** — component-patterns.md에서 재사용하는 패턴 목록

### 트리 구조 명세 형식

```
[ComponentName]                    [시맨틱 태그, 역할]
├── Header                         [header]
│   ├── ClusterBadge               (component-patterns.md 참조)
│   └── CloseButton                [button, aria-label="닫기"]
├── Body                           [main]
│   ├── Title                      [h2, font-display]
│   └── TagList                    (component-patterns.md 참조)
└── Footer                         [footer]
    └── RelatedNodes               [nav, aria-label="관련 노드"]
```

### 토큰 명세 형식

```
배경: --surface-elevated
제목: --foreground, font-display (Lexend), text-lg font-bold
본문: --text, font-sans (Noto Sans KR), text-[13px] leading-[1.85]
구분선: --border, 1px solid
```

## Gotchas

- AskUserQuestion은 한 번에 하나의 질문만 — 복합 질문은 사용자가 놓친다
- "모르겠다" 응답 → A/B/C 선택지 제시. 결정권은 사용자에게 돌려라
- 라이트/다크 모드 토큰을 반드시 둘 다 명시 — 하나만 쓰면 불완전
- 토큰이 아닌 하드코딩 HEX 금지 — token-catalog.md에 없는 색상은 사용 불가
- 기존 component-patterns.md 패턴과 충돌 시 → 재정의 말고 확장하라
- 접근성 섹션 생략 금지 — `aria-label`, `role`, 키보드 동작 최소 명시

## 상세 레퍼런스

- `references/design-spec-template.md` — 설계 문서 전체 템플릿 (복사 후 채워 넣기)
