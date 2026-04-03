# VSpec: 홈페이지 리디자인 v2 (세로 스크롤 구조)

> 이 문서는 구현의 시각적 계약서다. 모든 색상, 간격, 애니메이션은 여기 명시된 토큰과 값을 따른다.

---

## A. 시각 감성 (Visual Tone)

```
분위기: 차분한, 모던한, 절제된
참조 감성: linear.app (깔끔한 그레이 톤 + 포인트 컬러 절제), stripe.com/docs (세로 스크롤 자연스러운 전개)
금지 방향: 글래스모피즘, 네온 글로우, 과한 그라데이션, 과한 애니메이션, 고채도 배경
```

---

## B. 레이아웃 인코딩

### 전체 페이지 구조 (Desktop/Mobile 공통)

세로 스크롤 단일 구조. 데스크톱과 모바일이 동일한 레이아웃을 공유한다.

```
[노드 미선택 상태]
┌────────────────────────────────────────────────┐
│ [SiteHeader]  sticky top-0, h-14, z-50        │
│  Logo ─────────────────── Projects  ThemeToggle│
├────────────────────────────────────────────────┤
│                                                │
│ [HeroGraphSection]  h-[calc(100vh-56px)]       │
│                                                │
│   ForceGraph3D (풀 너비, 풀 높이)              │
│                                                │
│                                                │
└────────────────────────────────────────────────┘
CSS: body overflow-y auto. 페이지 전체가 document flow.

[노드 선택 상태]
┌────────────────────────────────────────────────┐
│ [SiteHeader]  sticky top-0, h-14, z-50        │
├────────────────────────────────────────────────┤
│                                                │
│ [HeroGraphSection]  h-[calc(100vh-56px)]       │
│   (높이 변경 없음, 그래프 항상 조작 가능)      │
│                                                │
├────────────────────────────────────────────────┤
│ [ContentSection]  grid-template-rows: 0fr→1fr  │
│   ┌────────────────────────────────────────┐   │
│   │ ContentHeader  (badge + title)         │   │
│   ├────────────────────────────────────────┤   │
│   │ ContentBody  max-w-3xl mx-auto         │   │
│   │ (높이 제한 없음, 본문 길이만큼 늘어남) │   │
│   ├────────────────────────────────────────┤   │
│   │ ContentFooter  (선택적)                │   │
│   └────────────────────────────────────────┘   │
│                                                │
│ [ScrollToTopButton]  fixed bottom-8 right-8    │
└────────────────────────────────────────────────┘
CSS: ContentSection은 display: grid, grid-template-rows 트릭으로 0fr→1fr 전환.
     그래프↔콘텐츠 경계 구분 없음 (border/shadow 없이 자연스럽게 이어짐).
     자동 스크롤: 콘텐츠 영역 상단으로 scrollIntoView({ behavior: 'smooth' }).
```

### 반응형 차이

| 속성 | Desktop (md+) | Mobile (<md) |
|------|---------------|--------------|
| 헤더 패딩 | px-6 | px-4 |
| 로고 크기 | text-lg | text-base |
| 콘텐츠 패딩 | px-6 py-8 | px-4 py-6 |
| 콘텐츠 최대 너비 | max-w-3xl mx-auto | w-full |
| ScrollToTopButton | bottom-8 right-8 | bottom-6 right-6 |

---

## C. 애니메이션 스펙

### C-1. 노드 클릭 -- 콘텐츠 슬라이드 다운 (첫 선택)

```
순서  대상               변화                              지속    이징                              완료 후
1.    ContentSection     grid-template-rows: 0fr → 1fr    350ms   cubic-bezier(0.16, 1, 0.3, 1)     2번 시작
2.    document           scrollIntoView 콘텐츠 상단        --      behavior: 'smooth' (브라우저)      --
```

구현 힌트:
```css
.content-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 350ms cubic-bezier(0.16, 1, 0.3, 1);
}
.content-inner {
  overflow: hidden;
}
.content-wrapper.open {
  grid-template-rows: 1fr;
}
```

### C-2. 다른 노드 클릭 -- 콘텐츠 교체

```
순서  대상               변화                              지속    이징                              완료 후
1.    ContentBody        opacity: 1 → 0                   150ms   cubic-bezier(0, 0, 0.2, 1)        콘텐츠 교체
2.    ContentBody        opacity: 0 → 1                   150ms   cubic-bezier(0, 0, 0.2, 1)        3번 시작
3.    document           scrollIntoView 콘텐츠 상단        --      behavior: 'smooth' (브라우저)      --
```

### C-3. 노드 호버 -- 컬러 리빌 + 스케일업

```
순서  대상               변화                              지속    이징                              완료 후
1.    노드 fill          GRAPH_GRAY → cluster.color        250ms   cubic-bezier(0, 0, 0.2, 1)        --
2.    노드 scale         1 → 1.1                          250ms   cubic-bezier(0, 0, 0.2, 1)        --
3.    노드 shadow        none → glow (--glow-node)        250ms   cubic-bezier(0, 0, 0.2, 1)        --
4.    노드 플로팅        재생 → 정지                       --      즉시                               --
5.    라벨               opacity 0 → 1, 색상 labelActive   250ms   cubic-bezier(0, 0, 0.2, 1)        --
```

### C-4. 노드 선택 상태 (클릭 후 유지)

```
순서  대상               변화                              지속    이징                              완료 후
1.    선택 노드 fill     cluster.color 유지                --      --                                 --
2.    선택 노드 scale    1 (기본 크기, glow/scale 해제)    250ms   cubic-bezier(0, 0, 0.2, 1)        --
3.    선택 노드 glow     해제                              250ms   cubic-bezier(0, 0, 0.2, 1)        --
4.    나머지 노드         opacity 낮춤 (0.3)               250ms   cubic-bezier(0, 0, 0.2, 1)        --
5. 나머지 엣지         opacity 낮춤 (0.15)              250ms   cubic-bezier(0, 0, 0.2, 1)        --
```

선택 노드는 킥 컬러를 유지하되 scale/glow를 해제하여 "강조"가 아닌 "선택됨"을 표현한다.
나머지 노드/엣지는 반투명 처리하여 선택 노드의 컨텍스트만 부각한다.

### C-5. ScrollToTopButton 등장/퇴장

```
순서  대상               변화                              지속    이징                              완료 후
1.    버튼               opacity: 0 → 1, scale: 0.8 → 1  200ms   cubic-bezier(0, 0, 0.2, 1)        --
      (퇴장)             opacity: 1 → 0, scale: 1 → 0.8  150ms   cubic-bezier(0.4, 0, 1, 1)        --
```

등장 조건: 콘텐츠 영역이 펼쳐진 상태에서 콘텐츠 영역이 뷰포트에 보일 때.
클릭 시: `window.scrollTo({ top: 0, behavior: 'smooth' })` 최상단(그래프)으로 복귀.

### C-6. 테마 전환

```
순서  대상               변화                              지속    이징                              완료 후
1.    body bg/color      라이트 ↔ 다크 토큰 전환           200ms   ease (CSS 기본)                    --
```

### prefers-reduced-motion 대안

`@media (prefers-reduced-motion: reduce)` 적용 시:
- 모든 transition duration을 0ms로 설정
- grid-template-rows 전환: 즉시 (0ms)
- opacity 전환: 즉시 (0ms)
- 노드 플로팅 애니메이션: 비활성화 (`animation: none`)
- scrollIntoView: `behavior: 'instant'`로 변경
- ScrollToTopButton: opacity만 즉시 전환, scale 변환 제거

---

## D. 인터랙션 상태 매핑

### D-1. Projects 링크

```
상태        시각 변화                                    Tailwind 구현 힌트
default     text: --text                                text-text text-sm font-medium
hover       text: --foreground                          hover:text-foreground transition-colors duration-150
focus       text: --foreground, outline 2px --accent     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
active      default와 동일                               --
disabled    해당 없음                                    --
```

라이트: --text=#666666, --foreground=#1A1A1A
다크: --text=#999999, --foreground=#EEEEEE

### D-2. 테마 토글 버튼

```
상태        시각 변화                                    Tailwind 구현 힌트
default     text: --muted, bg: transparent              text-muted
hover       text: --foreground, bg: --surface           hover:text-foreground hover:bg-surface transition-colors duration-150
focus       text: --foreground, outline 2px --accent     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
active      text: --foreground, bg: --surface-alt       active:bg-surface-alt
disabled    해당 없음                                    --
```

라이트: --muted=#888888, --surface=#EEEEEE, --surface-alt=#E4E4E4
다크: --muted=#707070, --surface=#1A1A1A, --surface-alt=#232323

### D-3. 그래프 노드 (캔버스 렌더링)

```
상태        시각 변화                                    구현 방식
default     fill: GRAPH_GRAY.node, 플로팅 재생,            Three.js nodeThreeObject, 색상은 tokens.ts 참조
            라벨 opacity 0 (숨김)
hover       fill: cluster.color, scale 1.1, glow,        Three.js 렌더 콜백에서 조건 분기
            플로팅 정지, 라벨 opacity 1 + labelActive
selected    fill: cluster.color 유지, scale/glow 해제,   선택 상태 플래그로 분기
            나머지 노드 opacity 0.3
focus       해당 없음 (WebGL 캔버스)                      --
disabled    해당 없음                                    --
```

라이트 GRAPH_GRAY: node=#C0C0C0, nodeFaded=#D4D4D4, label=#A0A0A0, labelActive=#444444
다크 GRAPH_GRAY: node=#444444, nodeFaded=#333333, label=#555555, labelActive=#CCCCCC

### D-4. ScrollToTopButton

```
상태        시각 변화                                    Tailwind 구현 힌트
default     bg: --surface, text: --muted                bg-surface text-muted rounded-full p-3 shadow-sm
hover       bg: --surface-alt, text: --foreground       hover:bg-surface-alt hover:text-foreground transition-colors duration-150
focus       outline 2px --accent                         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
active      scale 0.95                                   active:scale-95
disabled    해당 없음                                    --
```

라이트: --surface=#EEEEEE, --surface-alt=#E4E4E4
다크: --surface=#1A1A1A, --surface-alt=#232323

---

## E. 토큰 제약 매핑

```
속성                토큰 (CSS 변수)             Tailwind 클래스              주의
페이지 배경         --background                bg-background                라이트 #F7F7F7 / 다크 #111111
헤더 배경           --background                bg-background                헤더 항상 불투명
헤더 테두리         --border                    border-b border-border       1px solid
카드/패널 배경      --surface                   bg-surface                   --
높인 표면           --surface-elevated          bg-surface-elevated          --
대체 표면           --surface-alt               bg-surface-alt               --
기본 텍스트         --foreground                text-foreground              로고, 제목
보조 텍스트         --text                      text-text                    내비 링크, 본문
비활성 텍스트       --muted                     text-muted                   아이콘 기본 상태
구분선              --border                    border-border                --
강조색              --accent                    text-accent / bg-accent      포커스 outline
그래프 배경         --graph-bg                  bg-graph-bg                  라이트 #F7F7F7 / 다크 #111111
그래프 도트         --graph-dot                 --                           캔버스 직접 참조
글로우              --glow-node                 --                           캔버스 shadow 직접 참조
그림자 sm           --shadow-sm                 shadow-sm                    ScrollToTopButton
Duration fast       --duration-fast (150ms)     duration-150                 호버 전환
Duration normal     --duration-normal (200ms)   duration-200                 테마 전환
Duration slow       --duration-slow (350ms)     duration-350                 슬라이드 다운
이징 out            --ease-out                  ease-[cubic-bezier(0.16,1,0.3,1)]    슬라이드 다운
폰트 Display        --font-display (Lexend)     font-display                 로고, 제목
폰트 Body           --font-sans (Noto Sans KR)  font-sans                    본문
헤더 높이           56px                        h-14                         --
```

arbitrary 값(#hex, px 직접 기입) 사용 금지. 위 토큰만 사용한다.
WebGL 캔버스(react-force-graph-3d / Three.js) 내부는 JS 토큰 직접 참조 (CSS 유틸리티 불가).

---

## G. 물리 시뮬레이션 파라미터 (react-force-graph-3d)

```
d3-force 설정 (기존 유지, 변경 없음):
  charge (반발력): 기존 값 유지
  linkDistance: 기존 값 유지
  collision radius: 기존 값 유지

노드 렌더링:
  기본 색상: GRAPH_GRAY.node (라이트 #C0C0C0 / 다크 #444444)
  호버 색상: cluster.color (킥 컬러 계열)
  선택 색상: cluster.color 유지
  선택 시 나머지: opacity 0.3 (노드), opacity 0.15 (엣지)
  호버 scale: 1.1
  선택 scale: 1.0 (기본 크기)

플로팅 애니메이션:
  패턴: float-a, float-b, float-c (globals.css @keyframes)
  주기: 5s ~ 9.8s (노드별 랜덤 배분)
  딜레이: 노드 인덱스 기반 고유 딜레이
  호버 시: animationPlayState paused
  선택 시: 플로팅 유지 (정지하지 않음)

라벨:
  기본 상태: opacity 0 (숨김)
  호버/선택 시: opacity 1, 색상 GRAPH_GRAY.labelActive (라이트 #444444 / 다크 #CCCCCC)
  참조 색상: GRAPH_GRAY.label (라이트 #A0A0A0 / 다크 #555555) — 선택 해제 시 페이드 아웃용

엣지:
  기본 opacity: 0.4
  선택 시 나머지: opacity 0.15

그래프 배경:
  라이트: --graph-bg (#F7F7F7)
  다크: --graph-bg (#111111)
  도트 그리드: --graph-dot (라이트 #B0B0B0 / 다크 #333333)

인터랙션:
  그래프는 항상 조작 가능 (콘텐츠 펼쳐진 상태에서도 드래그/클릭 가능)
  다른 노드 클릭 시 콘텐츠 내용 교체 + 콘텐츠 상단으로 스크롤
```

---

## H. 마이크로인터랙션

```
트리거                  피드백 종류          구현 방식
노드 호버               컬러 리빌           fill 색상 GRAPH_GRAY → cluster.color, 250ms cubic-bezier(0,0,0.2,1)
노드 호버               스케일업 + 글로우    scale 1→1.1, box-shadow --glow-node, 250ms
노드 호버               플로팅 정지          animationPlayState: paused
노드 클릭               콘텐츠 슬라이드      grid-template-rows 0fr→1fr, 350ms cubic-bezier(0.16,1,0.3,1)
노드 선택               페이드 아웃          나머지 노드 opacity 0.3, 나머지 엣지 opacity 0.15, 250ms
콘텐츠 교체             크로스페이드         opacity 1→0→1, 각 150ms
ScrollToTopButton 등장  페이드인 + 스케일    opacity 0→1, scale 0.8→1, 200ms cubic-bezier(0,0,0.2,1)
ScrollToTopButton 클릭  최상단 스크롤        window.scrollTo({ top: 0, behavior: 'smooth' })
Projects 링크 호버      색상 전환            --text → --foreground, 150ms transition-colors
테마 토글 호버          배경 + 색상 전환     bg transparent→--surface, 150ms transition-colors
```

---

## 부록: 컴포넌트 계층 구조 (참조)

```
[SiteHeader]                           [header, sticky top-0 z-50, h-14, bg-background, border-b border-border]
├── Logo "JIT-Hub"                     [a, href="/", font-display, text-lg font-bold, text-foreground]
└── NavRight                           [nav, aria-label="메인 내비게이션", flex items-center gap-4]
    ├── ProjectsLink "Projects"        [a, href="/projects", text-sm font-medium, text-text]
    └── ThemeToggle                    [button, aria-label="테마 전환"]

[HeroGraphSection]                     [section, h-[calc(100vh-56px)], aria-label="지식 그래프"]
└── GraphCanvas                        [div, w-full h-full, role="application"]
    └── ForceGraph3D                   [WebGL canvas, dynamic import ssr:false]

[ContentSection]                       [section, display:grid, aria-label="노드 상세"]
├── ContentHeader                      [header]
│   ├── ClusterBadge                   [기존 컴포넌트]
│   ├── DifficultyLabel                [기존 컴포넌트]
│   └── Title                          [h1, font-display, text-2xl font-bold, text-foreground]
├── ContentBody                        [div, max-w-3xl mx-auto, px-6 py-8 (md) / px-4 py-6 (mobile)]
│   └── MdxContent                     [기존 MdxRenderer]
└── ContentFooter                      [footer, 선택적]
    └── RelatedNodes                   [nav, aria-label="관련 노드"]

[ScrollToTopButton]                    [button, fixed bottom-8 right-8, rounded-full, bg-surface, shadow-sm]
                                       [aria-label="맨 위로 스크롤"]
```

---

## 부록: 접근성 요구사항

- **헤더**: `header` 시맨틱 태그, `nav` 내 `aria-label="메인 내비게이션"`
- **그래프**: `role="application"`, `aria-label="지식 그래프"`
- **콘텐츠**: `section`, `aria-label="노드 상세"`, 펼침 시 콘텐츠로 포커스 이동
- **테마 토글**: `aria-label` 현재 상태 반영 ("라이트 모드로 전환" / "다크 모드로 전환")
- **ScrollToTopButton**: `aria-label="맨 위로 스크롤"`
- **키보드 순서**: Logo -> Projects -> ThemeToggle -> 그래프 -> 콘텐츠 -> ScrollToTopButton
- **reduced-motion**: 모든 애니메이션에 대안 명시 (섹션 C-6 참조)
