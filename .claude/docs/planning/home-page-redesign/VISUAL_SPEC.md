# VSpec: 홈페이지 리디자인 (Starfield Graph 3D)

## A. 시각 감성 (Visual Tone)

```
분위기: 우주적(cosmic), 차분한(calm), 몰입형(immersive)
참조 감성: 별이 떠 있는 3D 성운 공간, linear.app의 절제된 UI, GitHub Universe 랜딩
금지 방향: 플랫 디자인, 고채도 네온 글로우, 글래스모피즘, 과한 그라데이션, 유치한 색상 사용
```

---

## B. 레이아웃 인코딩

### 풀스크린 랜딩 (노드 미선택)

```
[데스크탑 md+]
┌──────────────────────────────────────────────┐
│                                              │
│         GraphCanvas3D (100vw x 100vh)        │
│         position: fixed, inset: 0            │
│                                              │
│   ┌─────────────┐                            │
│   │ ThemeToggle  │  position: fixed           │
│   │ top-4 right-4│  z-10                     │
│   └─────────────┘                            │
│                                              │
│   ┌──────────────────────┐                   │
│   │ CameraHint           │  position: fixed   │
│   │ bottom-8, center-x   │  z-10, 5s fadeout │
│   └──────────────────────┘                   │
│                                              │
│   ┌─────────────────┐                        │
│   │ LoadingIndicator │  center, z-20          │
│   │ (초기 로드 시)    │  그래프 준비 전 표시   │
│   └─────────────────┘                        │
│                                              │
└──────────────────────────────────────────────┘
CSS: relative, w-screen h-screen overflow-hidden

[모바일 <md]
동일 구조. 터치 제스처로 회전/줌.
CameraHint: "터치하여 회전 / 핀치하여 줌"
```

### 분할 뷰 (노드 선택 후)

```
[데스크탑 md+]
┌───────────────────────────────────────────────┐
│                   │                           │
│  GraphCanvas3D    │   ContentPanel            │
│  38% (flex-none)  │   62% (flex-1)            │
│                   │  ┌──────────────────┐     │
│  카메라가 선택    │  │ PanelHeader      │     │
│  노드로 포커스    │  │ badge + close    │     │
│                   │  ├──────────────────┤     │
│                   │  │ PanelBody        │     │
│                   │  │ title, tags,     │     │
│                   │  │ lead, mdx        │     │
│                   │  │ (overflow-y      │     │
│                   │  │  auto, scroll)   │     │
│                   │  ├──────────────────┤     │
│                   │  │ PanelFooter      │     │
│                   │  │ related nodes    │     │
│                   │  └──────────────────┘     │
└───────────────────────────────────────────────┘
CSS: flex, transition-all duration-[400ms]

구분 방식: 별도 divider 선 없음.
  - ContentPanel에 bg-surface-elevated 배경 적용으로 그래프 영역과 자연스럽게 구분
  - 패널 좌측에 shadow-lg (또는 shadow-left) 적용으로 깊이감 표현
  - 구분선 대신 콘텐츠가 공간을 채우며 자연스럽게 펼쳐지는 느낌

[모바일 <md]
┌──────────────────────────────┐
│  BackToGraphButton           │
│  (sticky top-0, z-10)       │
├──────────────────────────────┤
│                              │
│  ContentPanel (w-full)       │
│  flex-1, overflow-y auto     │
│                              │
└──────────────────────────────┘
CSS: flex-col, 그래프 숨김
```

---

## C. 애니메이션 스펙

### 트리거: 초기 로딩

```
순서  대상              변화                         지속    이징                          완료 후
1.    LoadingIndicator  opacity 1 (표시)             즉시    -                             그래프 데이터 로드 대기
2.    GraphCanvas3D     WebGL 초기화 + 물리 안정화   ~2s     -                             -
3.    LoadingIndicator  opacity 1 → 0                300ms   cubic-bezier(0.4,0,1,1)       display:none
4.    GraphCanvas3D     opacity 0 → 1                500ms   cubic-bezier(0,0,0.2,1)       카메라 자동 회전 시작
5.    CameraHint        opacity 0 → 0.6              300ms   cubic-bezier(0,0,0.2,1)       5초 후 페이드아웃
```

### 트리거: 노드 클릭 (풀스크린 → 분할 뷰)

```
순서  대상              변화                         지속    이징                          완료 후
1.    카메라            position → 선택노드 포커스    800ms   cubic-bezier(0.4,0,0.2,1)     자동 회전 정지
2.    그래프 영역       width 100% → 38%             400ms   cubic-bezier(0,0,0.2,1)       renderer.setSize() 호출
3.    선택 노드         scale 1 → 1.5                200ms   cubic-bezier(0.34,1.56,0.64,1) emissive 강화
4.    ContentPanel      translateX(100%) → 0          400ms   cubic-bezier(0,0,0.2,1)       delay 100ms
5.    ContentPanel      opacity 0 → 1                400ms   cubic-bezier(0,0,0.2,1)       delay 100ms
```

### 트리거: 패널 닫기 (분할 뷰 → 풀스크린)

```
순서  대상              변화                         지속    이징                          완료 후
1.    ContentPanel      translateX(0) → 100%          300ms   cubic-bezier(0.4,0,1,1)       -
2.    ContentPanel      opacity 1 → 0                300ms   cubic-bezier(0.4,0,1,1)       -
3.    그래프 영역       width 38% → 100%             350ms   cubic-bezier(0,0,0.2,1)       renderer.setSize() 호출
4.    카메라            → 초기 위치 복원              600ms   cubic-bezier(0.4,0,0.2,1)     자동 회전 재개 (3s 딜레이)
5.    선택 노드         scale 1.5 → 1                200ms   cubic-bezier(0,0,0.2,1)       emissive 원복
```

### 트리거: 다른 노드 클릭 (분할 뷰 유지)

```
순서  대상              변화                         지속    이징                          완료 후
1.    이전 노드         scale 1.5 → 1, emissive 원복 200ms   cubic-bezier(0,0,0.2,1)       -
2.    카메라            → 새 노드로 이동              800ms   cubic-bezier(0.4,0,0.2,1)     -
3.    새 노드           scale 1 → 1.5, emissive 강화 200ms   cubic-bezier(0.34,1.56,0.64,1) -
4.    ContentPanel 본문 opacity 1→0→1 (crossfade)     300ms   cubic-bezier(0,0,0.2,1)       새 콘텐츠 렌더
```

### 트리거: CameraHint 페이드아웃

```
순서  대상              변화                         지속    이징                          완료 후
1.    CameraHint        opacity 0.6 → 0              500ms   cubic-bezier(0.4,0,1,1)       display: none
                        (5초 후 자동 실행 또는 첫 인터랙션 시 즉시)
```

### 트리거: 테마 전환

```
순서  대상              변화                         지속    이징                          완료 후
1.    body              bg/color 전환                200ms   ease                          -
2.    씬 fog            fog.color 전환               200ms   -                             JS로 THREE.Color 업데이트
3.    씬 배경           scene.background 전환        200ms   -                             -
4.    전체 노드         material.color 전환          200ms   -                             emissive 토글 (다크on/라이트off)
```

### prefers-reduced-motion 대안

```
@media (prefers-reduced-motion: reduce) {
  - 카메라 자동 회전: 비활성화
  - 노드 플로팅: 비활성화
  - 전환 duration: 모두 0ms (즉시 전환)
  - 카메라 이동: duration 0ms
  - 패널 등장: opacity 전환만 유지 (translateX 제거), duration 150ms
}
```

---

## D. 인터랙션 상태 매핑

### 허브 노드 (3D Sphere)

```
상태        시각 변화                                          구현 힌트
default     color: GRAPH_GRAY.node, scale: 1, emissive: 없음  Three.js MeshStandardMaterial
hover       color: cluster.color, scale: 1.3,                 emissiveIntensity 0.5 (다크모드)
            emissive: cluster.color                            라벨 → GRAPH_GRAY.labelActive
focus       color: cluster.color, scale: 1.2,                 키보드 Tab으로 접근 시
            emissive: cluster.color (0.4)                      포커스 링 대신 glow 강화
active      color: cluster.color, scale: 1.5,                 선택된 노드
            emissive: cluster.color (0.8)                      라벨 → --foreground, font-bold
disabled    해당 없음                                          -
```

### 리프 노드 (3D Sphere)

```
상태        시각 변화                                          구현 힌트
default     color: GRAPH_GRAY.nodeFaded, opacity: 0.6          더 작은 SphereGeometry
hover       color: cluster.color, opacity: 0.9                 라벨 → GRAPH_GRAY.labelActive
focus       color: cluster.color, opacity: 0.9                 키보드 접근
active      color: cluster.color, opacity: 0.8                 부모 클러스터 선택 시
disabled    해당 없음                                          -
```

### 닫기 버튼 (CloseButton)

```
상태        시각 변화                                          Tailwind 구현 힌트
default     color: --muted, bg: transparent                    text-muted
hover       color: --foreground, bg: --surface                 hover:text-foreground hover:bg-surface transition-all duration-150
focus       color: --foreground, bg: --surface,                focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent
            outline: 2px --accent, offset 2px
active      color: --foreground, bg: --surface-alt             active:bg-surface-alt
disabled    해당 없음                                          -
```

### 테마 토글 (ThemeToggle -- 기존 컴포넌트)

```
기존 컴포넌트 그대로 사용. 위치만 position: fixed, top-4 right-4, z-10으로 재배치.
```

### 관련 노드 링크 (RelatedNodes)

```
상태        시각 변화                                          Tailwind 구현 힌트
default     color: --accent, underline                         text-accent underline underline-offset-2
hover       opacity: 0.8                                       hover:opacity-80 transition-opacity duration-150
focus       outline: 2px --accent, offset 2px                  focus-visible:ring-2 focus-visible:ring-accent
active      scale: 0.98                                        active:scale-[0.98]
disabled    해당 없음                                          -
```

---

## E. 토큰 제약 매핑

```
속성                토큰 (CSS 변수)             Tailwind 클래스           비고
페이지 배경         --background                bg-background             라이트:#F7F7F7 / 다크:#111111
3D 씬 배경          --graph-bg                  -                         JS: getGraphGray(dark).bg
3D 씬 안개          --graph-bg                  -                         FogExp2, density 0.002
패널 배경           --surface-elevated          bg-surface-elevated       라이트:#FFFFFF / 다크:#1A1A1A
제목                --foreground                text-foreground           font-display (Lexend), text-2xl font-bold
본문                --text > --foreground       prose-jithub 클래스       font-sans (Noto Sans KR)
보조 텍스트         --muted                     text-muted                카메라 힌트, 메타 정보
강조/링크           --accent                    text-accent               라이트:#0058A6 / 다크:#2B7CB6
노드 기본 (허브)    GRAPH_GRAY.node             -                         JS 직접 참조
노드 기본 (리프)    GRAPH_GRAY.nodeFaded        -                         JS 직접 참조
노드 활성           cluster.color               -                         JS: CLUSTERS[id].color
노드 glow           --glow-node                 -                         라이트: 0 0 20px / 다크: 0 0 24px
엣지 (허브간)       GRAPH_GRAY.edge             -                         opacity 0.4
엣지 (허브-리프)    GRAPH_GRAY.leafEdge         -                         opacity 0.15
라벨 기본           GRAPH_GRAY.label            -                         JS 직접 참조
라벨 활성           GRAPH_GRAY.labelActive      -                         JS 직접 참조
그림자 (패널)       --shadow-lg                 shadow-lg                 패널 등장 시
```

---

## F. 3D/WebGL 파라미터

```
라이브러리: react-force-graph-3d (dynamic import, ssr: false)

카메라:
  초기 position: { x: 0, y: 150, z: 300 }
  lookAt: (0, 0, 0)
  fov: 60 (PerspectiveCamera 기본)
  near: 0.1 / far: 10000

자동 회전:
  axis: Y
  speed: 0.5 rad/s
  pauseOn: drag | scroll | touch
  resumeAfter: 3000ms (사용자 인터랙션 종료 후)

포그:
  type: FogExp2
  color: getGraphGray(dark).bg (getComputedStyle 불필요, JS 토큰 직접 사용)
  density: 0.002

허브 노드 머티리얼:
  geometry: SphereGeometry(radius: 노드 크기 비례, 32seg 데스크탑 / 16seg 모바일 LOD)
  material: MeshStandardMaterial
  color: GRAPH_GRAY.node (기본) → cluster.color (호버/선택)
  emissive: cluster.color * 0.5 (다크모드, 호버) / * 0 (라이트모드)
  emissiveIntensity: 0 (기본) → 0.5 (호버) → 0.8 (선택)
  metalness: 0.1
  roughness: 0.7

리프 노드 머티리얼:
  geometry: SphereGeometry(radius: 허브의 60%, 16seg)
  material: MeshStandardMaterial
  color: GRAPH_GRAY.nodeFaded (기본) → cluster.color (호버)
  emissive: cluster.color * 0.2 (다크모드) / * 0 (라이트모드)
  metalness: 0.1
  roughness: 0.8
  opacity: 0.6

라벨:
  렌더러: CSS2DRenderer 또는 Three.js SpriteText
  billboarding: 항상 카메라 정면 대향
  font: Lexend (영문) / Noto Sans KR (한글)
  기본 색상: GRAPH_GRAY.label
  활성 색상: GRAPH_GRAY.labelActive

조명:
  AmbientLight: intensity 0.6, color #FFFFFF
  DirectionalLight: position (10, 20, 10), intensity 0.8, color #FFFFFF

분할 뷰 리사이즈:
  ResizeObserver로 컨테이너 크기 변화 감지 → renderer.setSize() + camera.aspect 업데이트
```

---

## G. 물리 시뮬레이션 파라미터

```
라이브러리: react-force-graph-3d (d3-force-3d 내장)

d3-force 설정:
  charge (반발력): -120
  linkDistance (기본 엣지 거리): 80
  linkStrength: 0.3
  centerStrength: 0.05
  collision radius: 노드 반지름 * 1.5

3D 전용:
  numDimensions: 3
  dagMode: null (자유 3D 배치)
  warmupTicks: 100 (초기 안정화 -- 로딩 인디케이터 표시 중)
  cooldownTicks: 0 (계속 시뮬레이션, 플로팅 효과)

카메라 컨트롤:
  좌클릭 드래그: orbit (회전)
  스크롤: 줌인/줌아웃 (minDistance: 50, maxDistance: 800)
  우클릭 드래그: 패닝
  노드 좌클릭: 노드 선택 + 카메라 포커스
  더블클릭 빈 공간: 카메라 초기 위치 복귀
  드래그 중 카메라 애니메이션: 즉시 취소, 사용자 제어권 반환
```

---

## H. 마이크로인터랙션

```
트리거              피드백 종류              구현 방식
초기 로딩           심플 스피너              CSS animation: rotate 1s linear infinite
                                            중앙 배치, --muted 색상, 크기 24px
                                            향후 로딩 바로 교체 가능하도록
                                            LoadingIndicator 컴포넌트로 분리
그래프 렌더 완료    페이드인                 opacity 0 → 1 (500ms, easeOut)
노드 호버           glow 강화 + scale up    Three.js emissive 전환 (200ms)
노드 클릭           탄성 스케일             scale 1 → 1.5 (200ms, easeOutBack)
패널 등장           슬라이드 + 페이드       translateX + opacity (400ms, easeOut)
패널 닫기           슬라이드 아웃           translateX + opacity (300ms, easeIn)
콘텐츠 전환         크로스페이드            opacity 전환 (300ms, easeOut)
카메라 힌트 소멸    페이드아웃              opacity (500ms, easeIn), 5초 딜레이
테마 전환           부드러운 색상 전환       body transition 200ms ease
```

### 로딩 인디케이터 설계 원칙

```
현재 구현: 심플 CSS 스피너 (border 기반 rotate 애니메이션)
향후 교체: 로딩 바 (progress bar) 또는 커스텀 로딩 애니메이션

교체 용이성을 위한 설계:
- LoadingIndicator를 독립 컴포넌트로 분리 (src/components/LoadingIndicator.tsx)
- Props: isLoading (boolean), progress? (number, 0-100, 향후 로딩 바용)
- 그래프 로딩 상태는 부모에서 관리, LoadingIndicator에 주입
- 컴포넌트 교체만으로 스피너 → 로딩 바 전환 가능한 구조
```

---

## 접근성

```
역할/속성:
  GraphCanvas3D:     role="application", aria-label="3D 지식 그래프"
  각 노드:           role="button", aria-label="{title}", aria-pressed (선택 시)
  ContentPanel:      role="complementary", aria-label="노드 상세 콘텐츠"
  CloseButton:       aria-label="패널 닫기"
  CameraHint:        aria-hidden="true" (장식적 요소)
  ThemeToggle:       aria-label="테마 전환" (기존 유지)
  RelatedNodes:      nav, aria-label="관련 노드"
  LoadingIndicator:  role="status", aria-label="로딩 중"

키보드 동작:
  Tab:      노드 간 순차 이동 (그래프 내 포커스 순서)
  Enter:    포커스된 노드 선택 (= 클릭)
  Escape:   패널 닫기 (분할 뷰 → 풀스크린)
  Tab (패널 내): 패널 헤더 → 본문 링크 → 관련 노드 순차 탐색

포커스 관리:
  노드 클릭 시: 포커스를 ContentPanel의 제목(h1)으로 이동
  패널 닫기 시: 포커스를 이전에 선택했던 노드로 복귀
  포커스 트랩: 패널 열림 시 패널 내부에서만 Tab 순환 (선택적)

WebGL 미지원 폴백:
  canvas 대신 "이 브라우저는 WebGL을 지원하지 않습니다" 메시지 표시
  기존 2D 그래프로 폴백하거나 노드 목록 텍스트 표시
```

---

## 기존 패턴 연계

### 재사용 컴포넌트

| 컴포넌트 | 위치 | 용도 |
|----------|------|------|
| ThemeToggle | `src/components/ThemeToggle.tsx` | 테마 전환, fixed 재배치 |
| MdxRenderer | `src/features/content/components/MdxRenderer.tsx` | 콘텐츠 본문 렌더링 |
| ErrorBoundary | `src/components/error/ErrorBoundary.tsx` | WebGL 에러 캐치 |
| Skeleton | `src/components/error/Skeleton.tsx` | 콘텐츠 로딩 대기 |
| AlertIcon | `src/components/icons/AlertIcon.tsx` | 에러 상태 표시 |

### 신규 컴포넌트

| 컴포넌트 | 예상 위치 | 역할 |
|----------|----------|------|
| GraphCanvas3D | `src/features/graph/components/` | react-force-graph-3d 래퍼 |
| ContentPanel | `src/features/content/components/` | 우측 콘텐츠 패널 (열기/닫기) |
| CameraHint | `src/features/graph/components/` | 카메라 조작 안내 (5s 페이드아웃) |
| CloseButton | `src/components/` | 범용 닫기 버튼 |
| LoadingIndicator | `src/components/` | 로딩 상태 표시 (스피너, 향후 로딩 바) |
| BackToGraphButton | `src/features/graph/components/` | 모바일 전용, 그래프로 복귀 |

### 토큰 소스

| 소스 파일 | 사용처 |
|----------|--------|
| `src/constants/tokens.ts` | 3D 씬 내 JS 색상값 (GRAPH_GRAY, KICK, Palette) |
| `src/constants/cluster.ts` | 클러스터별 노드 색상 (CLUSTERS) |
| `src/app/globals.css` | CSS 변수 (Tailwind 유틸리티, 콘텐츠 패널 스타일) |

---

## 성능 고려사항

```
목표: 데스크탑 60fps, 모바일 최선의 노력 (30fps 이상)
노드 수: 50개 이하 (현재 스코프)
초기 렌더: 2초 이내 (warmupTicks: 100)

최적화 전략:
- LOD: 데스크탑 32세그먼트 / 모바일 16세그먼트
- nodeThreeObject 캐싱: useMemo 또는 Map 기반 캐시
- will-change: 패널 전환 애니메이션에만 한정 사용
- 모바일: 리프 노드 라벨 숨김 (호버 시에만 표시)
- 분할 뷰 전환 시 renderer.setSize() 1회만 호출 (디바운스)
```
