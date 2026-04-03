# 디자인 가이드: 홈페이지 리디자인 v2 (세로 스크롤 구조)

## 화면 목록

| 화면 | 진입 경로 | 주요 액션 |
|------|----------|----------|
| 히어로 그래프 (랜딩) | `/` 직접 접속 | 노드 호버, 노드 클릭, 테마 토글, Projects 링크 |
| 콘텐츠 펼침 상태 | 노드 클릭 후 | 본문 스크롤, 다른 노드 클릭, 그래프로 스크롤 복귀 |

## 사용자 플로우

```
[홈 접속] → [상단 헤더(고정) + 히어로 그래프(뷰포트 전체)]
                    |
            [노드 호버 → glow 강화 + 스케일업 + 라벨 강조]
                    |
            [노드 클릭]
                    |
    [그래프 아래에 콘텐츠 영역 슬라이드 다운 등장]
    [콘텐츠 영역 상단으로 자동 스크롤]
    [URL → /?node={slug}]
                    |
        +-- [다른 노드 클릭] → 콘텐츠 내용 교체 + 본문 상단으로 스크롤
        +-- [상단 스크롤] → 그래프 다시 보기
        +-- [Projects 클릭] → /projects 페이지 이동
```

## 화면별 컴포넌트 스펙

### 헤더 (SiteHeader)

**P0 (Core)**: 로고, 내비게이션 링크
**P1 (Supporting)**: 테마 토글
**P2 (Contextual)**: 없음

#### 컴포넌트 계층 구조

```
[SiteHeader]                           [header, sticky top-0, z-50]
├── Logo                               [a, href="/", font-display, font-bold]
│   └── "JIT-Hub"
└── NavRight                           [nav, aria-label="메인 내비게이션"]
    ├── ProjectsLink                   [a, href="/projects"]
    │   └── "Projects"
    └── ThemeToggle                    [button, aria-label="테마 전환"] (기존 컴포넌트 재배치)
```

#### 토큰 매핑

```
헤더 배경:       --background (라이트: #F7F7F7 / 다크: #111111)
헤더 테두리:     --border, border-b 1px (라이트: #D0D0D0 / 다크: #2E2E2E)
로고 텍스트:     --foreground, font-display (Lexend), text-lg font-bold
내비 링크 기본:  --text (라이트: #666666 / 다크: #999999)
내비 링크 호버:  --foreground (라이트: #1A1A1A / 다크: #EEEEEE)
헤더 높이:       h-14 (56px)
헤더 패딩:       px-6
```

#### 인터랙션 상태 -- Projects 링크

| 상태 | 색상 | 기타 |
|------|------|------|
| default | --text | text-sm font-medium |
| hover | --foreground | transition-colors duration-fast |
| focus | --foreground | focus-visible:outline, outline-2, outline-offset-2, outline-accent |
| active | --foreground | default와 동일 |
| disabled | 해당 없음 | -- |

#### 인터랙션 상태 -- 테마 토글 (헤더 내)

| 상태 | 색상 | 배경 |
|------|------|------|
| default | --muted | transparent |
| hover | --foreground | --surface |
| focus | --foreground | transparent, focus ring |
| active | --foreground | --surface-alt |
| disabled | 해당 없음 | -- |

#### 반응형 동작

| 브레이크포인트 | 동작 |
|--------------|------|
| Desktop (md+) | 로고 왼쪽, Projects + 테마토글 오른쪽. px-6 |
| Mobile (<md) | 동일 레이아웃. px-4. 로고 text-base로 축소 가능 |

---

### 히어로 그래프 섹션

**P0 (Core)**: 3D 그래프 캔버스, 노드
**P1 (Supporting)**: 엣지(연결선), 노드 라벨
**P2 (Contextual)**: 카메라 힌트 (첫 진입)

#### 컴포넌트 계층 구조

```
[HeroGraphSection]                     [section, h-[calc(100vh-56px)], aria-label="지식 그래프"]
└── GraphSection                       [div, w-full, h-full]
    └── GraphCanvas                    [div, role="application", aria-label="3D 지식 그래프"]
        └── ForceGraph3D (dynamic)     [WebGL canvas]
```

#### 토큰 매핑

```
섹션 배경:       --graph-bg (라이트: #F7F7F7 / 다크: #111111)
허브 노드 기본:  GRAPH_GRAY.node (라이트: #C0C0C0 / 다크: #444444)
허브 노드 호버:  cluster.color + glow 효과
리프 노드 기본:  GRAPH_GRAY.nodeFaded (라이트: #D4D4D4 / 다크: #333333)
라벨 기본:       GRAPH_GRAY.label (라이트: #A0A0A0 / 다크: #555555)
라벨 활성:       GRAPH_GRAY.labelActive (라이트: #444444 / 다크: #CCCCCC)
엣지:            GRAPH_GRAY.edge, opacity 0.4
```

#### 반응형 동작

| 브레이크포인트 | 동작 |
|--------------|------|
| Desktop (md+) | `h-[calc(100vh-56px)]`, 풀 너비 그래프 |
| Mobile (<md) | 동일. `h-[calc(100vh-56px)]`, 풀 너비 그래프 |

데스크톱과 모바일이 동일한 세로 스크롤 구조를 공유한다.

---

### 콘텐츠 영역 (슬라이드 다운)

**P0 (Core)**: 제목, MDX 본문
**P1 (Supporting)**: 클러스터 뱃지, 난이도, 태그
**P2 (Contextual)**: 관련 노드 링크

#### 컴포넌트 계층 구조

```
[ContentSection]                       [section, aria-label="노드 상세"]
├── ContentHeader                      [header, border-b]
│   ├── ClusterBadge                   (기존 컴포넌트)
│   ├── DifficultyLabel                (기존 컴포넌트)
│   └── Title                          [h1, font-display, --foreground]
├── ContentBody                        [div, px-6 py-8]
│   └── MdxContent                     (기존 MdxRenderer 재사용)
└── ContentFooter                      [footer, 선택적]
    └── RelatedNodes                   [nav, aria-label="관련 노드"]
```

#### 토큰 매핑

```
콘텐츠 영역 배경:   --background (페이지 배경과 동일)
구분선:             --border, border-t 1px
제목:               --foreground, font-display (Lexend), text-2xl font-bold
클러스터 뱃지:      cluster.color 기반 (기존 패턴)
본문:               --text, font-sans (Noto Sans KR), text-[13px] leading-[1.85]
패딩:               px-6 py-8 (Desktop), px-4 py-6 (Mobile)
최대 너비:          max-w-3xl mx-auto (본문 읽기 편의)
```

#### 슬라이드 다운 애니메이션

| 속성 | 값 |
|------|-----|
| 트리거 | 노드 클릭 시 |
| 방향 | 그래프 아래에서 세로로 펼쳐짐 |
| duration | --duration-slow (350ms) |
| easing | --ease-out (cubic-bezier(0.16, 1, 0.3, 1)) |
| 구현 | `max-height: 0 → auto` 또는 `height: 0 → auto` + `opacity: 0 → 1` |
| 자동 스크롤 | 애니메이션 시작과 동시에 콘텐츠 영역 상단으로 `scrollIntoView({ behavior: 'smooth' })` |

#### 콘텐츠 전환 애니메이션 (다른 노드 클릭)

| 속성 | 값 |
|------|-----|
| 트리거 | 이미 콘텐츠가 펼쳐진 상태에서 다른 노드 클릭 |
| 동작 | 본문 내용 교체 + 콘텐츠 영역 상단으로 스크롤 |
| 내용 교체 | `opacity: 1 → 0 → 1`, duration-fast (150ms) |
| 스크롤 | 콘텐츠 영역 상단으로 `scrollIntoView({ behavior: 'smooth' })` |

#### 반응형 동작

| 브레이크포인트 | 동작 |
|--------------|------|
| Desktop (md+) | max-w-3xl mx-auto, px-6 py-8 |
| Mobile (<md) | w-full, px-4 py-6 |

---

## 접근성

- **헤더**: `header` 시맨틱 태그, `nav` 내 `aria-label="메인 내비게이션"`, 링크에 키보드 포커스 가능
- **그래프**: `role="application"`, `aria-label="지식 그래프"`, 캔버스 외부에 숨겨진 노드 목록 제공 (스크린 리더용)
- **콘텐츠**: `section` 시맨틱 태그, `aria-label="노드 상세"`, 펼침 시 콘텐츠 영역으로 포커스 이동
- **테마 토글**: `aria-label` 현재 상태 반영 ("라이트 모드로 전환" / "다크 모드로 전환")
- **키보드 탐색 순서**: 로고 → Projects 링크 → 테마 토글 → 그래프 → 콘텐츠

## 재사용 컴포넌트

기존 컴포넌트 재사용:
- **ThemeToggle** -- 헤더 우측으로 위치 변경 (fixed 제거, 헤더 안 배치)
- **ClusterBadge** -- 콘텐츠 헤더
- **DifficultyLabel** -- 콘텐츠 헤더
- **MdxRenderer** -- 기존 MDX 렌더러 그대로 사용
- **GraphSection** -- 기존 그래프 섹션 래퍼 재사용 (높이만 조정)
- **LoadingIndicator** -- 그래프 로딩 중 표시

신규 컴포넌트:
- **SiteHeader** -- sticky 상단 헤더 (로고 + 내비게이션 + 테마 토글)
- **HeroGraphSection** -- 히어로 높이(`calc(100vh - 56px)`) 래퍼
- **ContentSection** -- 슬라이드 다운 콘텐츠 영역 (기존 ContentPanel 대체)
