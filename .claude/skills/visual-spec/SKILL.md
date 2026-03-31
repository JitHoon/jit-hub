---
name: visual-spec
description: 시각적·인터랙티브 디자인을 AI가 구현 가능한 텍스트 스펙(VSpec)으로 인코딩할 때 사용. 애니메이션, 3D 파라미터, 레이아웃 비율, 인터랙션 상태, 마이크로인터랙션 명세 작업에 활성화.
allowed-tools: Read
---

# Visual Spec (VSpec) 레퍼런스

## 이 Skill의 목적

AI는 이미지를 볼 수 없다. 시각적 의도를 코드로 옮기려면 **텍스트로 인코딩된 시각 계약서**가 필요하다.
VSpec은 그 계약서다 — 코드 생성 전에 먼저 작성하고, 구현의 기준으로 삼는다.

## VSpec 문서 섹션

필요한 섹션만 포함한다. 해당 없는 조건부 섹션은 생략한다.

---

### [공통] A. 시각 감성 (Visual Tone)

```
분위기: [형용사 3개] (예: 우주적, 차분한, 미니멀)
참조 감성: [URL 또는 라이브러리명] (예: linear.app 사이드바, shadcn/ui 카드)
금지 방향: [피해야 할 것] (예: 플랫 디자인, 고채도 배경, 그림자 없는 UI)
```

---

### [공통] B. 레이아웃 인코딩

브레이크포인트별로 ASCII 다이어그램 + CSS 구현 단서를 함께 제공한다.

```
[데스크탑 md+]
┌──────────────────┬────────────────────────┐
│   영역A          │   영역B                │
│   38% (flex)     │   62% (flex)           │
│                  │  ┌──────────────────┐  │
│   주요 콘텐츠    │  │ 헤더             │  │
│                  │  ├──────────────────┤  │
│                  │  │ 본문 (scroll)    │  │
│                  │  └──────────────────┘  │
└──────────────────┴────────────────────────┘
CSS: flex, transition-all duration-400ms

[모바일 <md]
┌──────────────────────────┐
│   영역A (h-[40vh])       │
├──────────────────────────┤
│   영역B (flex-1, scroll) │
└──────────────────────────┘
CSS: flex-col
```

**레이아웃 인코딩 규칙**
- 비율은 `fr` 단위로 명시 (예: `grid-cols-[38fr_62fr]`)
- 고정 높이는 `vh` 또는 `px`로 명시
- 오버레이는 `absolute`, `z-index` 레이어 순서 명시
- `position: fixed` vs `sticky` vs `absolute` 구분 필요 시 명시

---

### [공통] C. 애니메이션 스펙

각 트리거별로 상태 전환 체인을 순서대로 서술한다.
이징은 이름 대신 반드시 `cubic-bezier()` 값을 명시한다.

```
[트리거명 — 예: 노드 클릭]
순서  대상          변화                     지속    이징                       완료 후
1.    카메라        position → focusTarget   800ms   cubic-bezier(0.4,0,0.2,1)  -
2.    그래프 영역   width 100%→38%           400ms   cubic-bezier(0,0,0.2,1)    -
3.    패널          translateX 100%→0        400ms   cubic-bezier(0,0,0.2,1)    -
4.    선택 노드     scale 1→1.5, glow×2      200ms   cubic-bezier(0.34,1.56,0.64,1)  -

[트리거명 — 예: 패널 닫기]
순서  대상          변화                     지속    이징                       완료 후
1.    패널          translateX 0→100%        300ms   cubic-bezier(0.4,0,1,1)    -
2.    그래프 영역   width 38%→100%           300ms   cubic-bezier(0,0,0.2,1)    -
3.    카메라        resetToInitialPos        600ms   cubic-bezier(0.4,0,0.2,1)  -
```

**자주 쓰는 이징 참조**
```
easeOut      = cubic-bezier(0,0,0.2,1)       ← 등장, 슬라이드인
easeIn       = cubic-bezier(0.4,0,1,1)       ← 퇴장, 슬라이드아웃
easeInOut    = cubic-bezier(0.4,0,0.2,1)     ← 상태 전환, 카메라 이동
easeOutBack  = cubic-bezier(0.34,1.56,0.64,1) ← 탄성 효과 (과슈팅)
easeOutQuart = cubic-bezier(0.25,1,0.5,1)   ← 빠른 등장
```

---

### [공통] D. 인터랙션 상태 매핑

5개 상태 전부 명시한다. 라이트/다크 토큰 둘 다 지정한다.

```
상태        시각 변화                              Tailwind 구현 힌트
default     bg-transparent, text: --foreground     -
hover       bg: --surface-hover, scale 1.02        hover:bg-surface-hover hover:scale-[1.02] transition-all duration-150
focus       outline 2px --ring, offset 2px         focus-visible:ring-2 focus-visible:ring-offset-2
active      scale 0.98, bg: --surface-active       active:scale-[0.98]
disabled    opacity 0.4, cursor not-allowed        disabled:opacity-40 disabled:cursor-not-allowed
```

---

### [공통] E. 토큰 제약 매핑

arbitrary 값(예: `#3b82f6`, `p-[13px]`) 사용 금지.
프로젝트 디자인 토큰만 사용한다.

```
속성            토큰 (CSS 변수)          Tailwind 클래스 예시        주의
페이지 배경     --background             bg-background               -
카드/패널 배경  --surface                bg-surface                  -
높인 카드 배경  --surface-elevated       bg-surface-elevated         -
기본 텍스트     --foreground             text-foreground             -
보조 텍스트     --muted-foreground       text-muted-foreground       -
구분선          --border                 border-border               -
강조색          --primary                bg-primary text-primary     -
강조 호버       --primary-hover          hover:bg-primary-hover      -
링 색상         --ring                   ring-ring                   포커스 아웃라인
```

---

### [조건부] F. 3D/WebGL 파라미터

canvas 기반 렌더러(Three.js, WebGL) 사용 시에만 포함.

```
카메라:
  초기 position: (x, y, z)
  lookAt: (0, 0, 0)
  fov: 60
  near: 0.1 / far: 10000

자동 회전:
  axis: Y
  speed: 0.5 rad/s
  pauseOn: drag | scroll
  resumeAfter: 3000ms

포그:
  type: FogExp2
  color: --background 값 (getComputedStyle로 읽어 THREE.Color로 변환)
  density: 0.002

오브젝트 머티리얼:
  geometry: SphereGeometry(반지름, 32seg 데스크탑 / 8seg 모바일 LOD)
  material: MeshStandardMaterial
  color: 클러스터 색상 토큰
  emissive: 클러스터 색상 × 0.4 (다크모드) / × 0 (라이트모드)
  metalness: 0.1
  roughness: 0.7

조명:
  AmbientLight: intensity 0.6
  DirectionalLight: position (10, 20, 10), intensity 0.8
```

---

### [조건부] G. 물리 시뮬레이션 파라미터

react-force-graph, d3-force 등 물리 시뮬레이션 사용 시에만 포함.

```
d3-force 설정:
  charge (반발력): -120
  linkDistance (기본 엣지 거리): 80
  linkStrength: 0.3
  centerStrength: 0.05
  collision radius: 15

3D 전용:
  numDimensions: 3
  dagMode: null (자유 3D 배치)
  warmupTicks: 100 (초기 안정화)
  cooldownTicks: 0  (계속 시뮬레이션)
```

---

### [조건부] H. 마이크로인터랙션

버튼 피드백, 로딩/오류/성공 표현이 중요한 경우에만 포함.

```
트리거          피드백 종류          구현 방식
버튼 클릭       ripple               ::after 가상요소 + scale 0→2 + opacity 1→0
데이터 로드     skeleton shimmer     bg-gradient-to-r animate-[shimmer_1.5s_infinite]
오류 발생       shake                @keyframes shake: 0%,100%{x:0} 25%{x:-4px} 75%{x:4px}
성공 완료       checkmark 드로우     stroke-dashoffset 100→0 (0.4s easeOut)
호버 강조       glow pulse           box-shadow 0→0_0_12px_var(--primary) 200ms
```

---

## Gotchas

### 공통 (모든 UI)
- 이징 이름만 쓰면 안 됨 — `cubic-bezier()` 값을 반드시 명시
- hover 상태는 `transition-` 없으면 즉시 전환 — duration 항상 명시
- 다크/라이트 토큰 둘 다 지정 — 하나만 쓰면 테마 전환 시 깨짐
- `will-change: transform` — 복잡한 애니메이션에만 사용. 남발하면 GPU 메모리 낭비
- `prefers-reduced-motion` — 모든 애니메이션에 `@media (prefers-reduced-motion: reduce)` 대안 필요

### 3D/WebGL 한정
- Three.js Color는 CSS 변수 직접 불가 — `getComputedStyle(document.documentElement).getPropertyValue('--background')`로 읽어서 `new THREE.Color()` 변환
- `emissiveIntensity` 변경 후 `material.needsUpdate = true` 필수
- `nodeThreeObject` 반환값 — 매 tick 재생성 방지를 위해 `useMemo` 또는 캐싱 필수
- 분할 뷰 resize 시 `renderer.setSize()` 수동 호출 (ResizeObserver 연동)
- 카메라 애니메이션 중 drag 이벤트 → 즉시 애니메이션 취소 후 사용자 제어권 반환
- `react-force-graph-3d`는 `dynamic(() => import(...), { ssr: false })` 필수
