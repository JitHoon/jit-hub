# 디자인 가이드: 홈페이지 리디자인 (Starfield Graph 3D)

## 화면 목록

| 화면 | 진입 경로 | 주요 액션 |
|------|----------|----------|
| 풀스크린 3D 그래프 (랜딩) | `/` 직접 접속 | 카메라 회전(드래그), 줌(스크롤), 노드 호버, 노드 클릭 |
| 분할 뷰 (그래프 + 콘텐츠) | 노드 클릭 후 | 카메라 조작, 다른 노드 클릭, 패널 닫기, 스크롤 |

## 사용자 플로우

```
[홈 접속] → [풀스크린 3D 그래프 표시 (카메라 자동 회전 + 노드 플로팅)]
                    ↓
            [카메라 인터랙션 → 자동 회전 정지, 사용자 제어 시작]
            [노드 호버 → glow 강화 + 스케일업 + 라벨 표시]
                    ↓
            [노드 클릭]
                    ↓
    [카메라가 클릭된 노드로 부드럽게 이동 (duration-slow)]
    [그래프 왼쪽 38%로 축소 (duration-slow, ease-out)]
    [클릭된 노드 선택 상태 유지]
    [우측 62%에 콘텐츠 패널 등장]
    [URL → /?node={slug}]
                    ↓
        ┌─ [다른 노드 클릭] → 카메라 이동 + 콘텐츠 전환
        ├─ [패널 닫기 버튼] → 풀스크린 복귀 + 카메라 원위치
        └─ [콘텐츠 스크롤] → 본문 탐색
```

## 3D 공간 디자인 원칙

### 카메라 시점 설계

- **초기 카메라 위치**: 그래프 중심에서 약간 위(+Y)에서 비스듬히 내려다보는 앵글. `cameraPosition: { x: 0, y: 150, z: 300 }`
- **자동 회전**: 첫 진입 시 Y축 기준 천천히 회전 (`autoRotate: true, autoRotateSpeed: 0.5`). 사용자가 드래그/스크롤 시 즉시 정지.
- **노드 클릭 시 카메라**: 클릭된 노드로 카메라가 부드럽게 이동 (lookAt + 적절한 거리 유지). `cameraTransitionDuration: 800ms`
- **분할 뷰 전환 시**: 카메라가 좌측 영역에 맞게 재조정

### 깊이감(Depth) 표현

- **노드 크기 원근감**: Three.js의 PerspectiveCamera에 의해 자동으로 원근 적용
- **안개(Fog) 효과**: 먼 거리의 노드가 서서히 흐려짐. 다크모드에서 배경색과 블렌딩 (`scene.fog = new THREE.FogExp2(bgColor, 0.002)`)
- **엣지 투명도**: 거리에 따른 투명도 변화로 시각적 혼잡 방지

### 노드 3D 표현

- **허브 노드**: Three.js SphereGeometry 기반. 클러스터 색상 적용. 다크모드에서 emissive glow
- **리프 노드**: 더 작은 SphereGeometry. 부모 클러스터 색상의 연한 버전
- **라벨**: Three.js Sprite 또는 CSS2DRenderer 기반 텍스트. 카메라와 항상 정면 대향 (billboarding)

## 화면별 컴포넌트 스펙

### 풀스크린 3D 그래프 (랜딩 상태)

**P0 (Core)**: 3D 그래프 캔버스, 노드(구체), 노드 라벨
**P1 (Supporting)**: 엣지(연결선), 카메라 컨트롤 힌트
**P2 (Contextual)**: 테마 토글 버튼

#### 컴포넌트 계층 구조

```
[HomePage]                              [main, aria-label="3D 지식 그래프 포트폴리오"]
├── [GraphCanvas3D]                     [div, role="application", aria-label="3D 지식 그래프"]
│   └── ForceGraph3D (dynamic)          [canvas, WebGL]
│       ├── HubNode (클러스터 대표)     [sphere, role="button", aria-label="{title}"]
│       ├── LeafNode (개별 지식)        [sphere, role="button", aria-label="{title}"]
│       └── NodeLabel (Sprite)          [sprite, billboarding]
├── [CameraHint]                        [div, aria-hidden="true", 첫 진입 시 표시 후 페이드아웃]
│   └── "드래그하여 회전 / 스크롤하여 줌"
└── [ThemeToggle]                       [button, aria-label="테마 전환"] (기존 컴포넌트)
```

#### 토큰 매핑

```
씬 배경:         --graph-bg (라이트: #F0F0F0 / 다크: #0E0E0E)
안개(Fog):       --graph-bg와 동일, density 0.002
허브 노드 기본:  GRAPH_GRAY.node (라이트: #C0C0C0 / 다크: #444444)
허브 노드 호버:  cluster.color + emissive glow
리프 노드 기본:  GRAPH_GRAY.nodeFaded (라이트: #D4D4D4 / 다크: #333333)
노드 라벨 기본:  GRAPH_GRAY.label (라이트: #A0A0A0 / 다크: #555555)
노드 라벨 활성:  GRAPH_GRAY.labelActive (라이트: #444444 / 다크: #CCCCCC)
엣지 (허브간):   GRAPH_GRAY.edge, opacity 0.4
엣지 (허브-리프): GRAPH_GRAY.leafEdge, opacity 0.15
카메라 힌트:     --muted, text-sm, opacity 0.6
```

#### 인터랙션 상태 -- 허브 노드

| 상태 | 색상 | 스케일 | Emissive | 라벨 |
|------|------|--------|----------|------|
| default | GRAPH_GRAY.node | 1 | 없음 | GRAPH_GRAY.label |
| hover | cluster.color | 1.3 | cluster.color, intensity 0.5 | GRAPH_GRAY.labelActive, font-bold |
| focus | cluster.color | 1.2 | cluster.color, intensity 0.4 | GRAPH_GRAY.labelActive |
| active (선택됨) | cluster.color | 1.5 | cluster.color, intensity 0.8 | --foreground, font-bold |

#### 인터랙션 상태 -- 리프 노드

| 상태 | 색상 | 투명도 | 라벨 |
|------|------|--------|------|
| default | GRAPH_GRAY.nodeFaded | 0.6 | GRAPH_GRAY.label |
| hover | cluster.color | 0.9 | GRAPH_GRAY.labelActive |
| focus | cluster.color | 0.9 | GRAPH_GRAY.labelActive |
| active (부모 선택) | cluster.color | 0.8 | GRAPH_GRAY.labelActive |

#### 별빛(Starfield) 효과 -- 다크모드 전용

- 허브 노드: Three.js MeshStandardMaterial의 `emissive: cluster.color`, `emissiveIntensity: 0.5`. PointLight를 노드 위치에 배치하여 주변 조명 효과 (선택적)
- 리프 노드: `emissive: cluster.color`, `emissiveIntensity: 0.2`
- 라이트모드에서는 emissive 없이 MeshLambertMaterial로 solid color만 표시
- 3D 공간의 깊이감이 자연스럽게 별빛 효과를 강화 (원근에 의한 크기/밝기 차이)

#### 카메라 인터랙션

| 입력 | 동작 | 비고 |
|------|------|------|
| 좌클릭 드래그 | 카메라 회전 (orbit) | OrbitControls 기본 동작 |
| 스크롤 | 줌인/줌아웃 | 최소/최대 거리 제한 설정 |
| 우클릭 드래그 | 패닝 (카메라 평행 이동) | |
| 노드 좌클릭 | 노드 선택 + 카메라 포커스 이동 | |
| 더블클릭 (빈 공간) | 카메라 초기 위치로 복귀 | |

#### 반응형 동작

| 브레이크포인트 | 동작 |
|--------------|------|
| Desktop (md+) | 풀스크린 3D 그래프. 클릭 시 좌 38% / 우 62% 분할 |
| Mobile (<md) | 3D 그래프 상단 40vh 고정 (터치로 회전/줌). 노드 클릭 시 하단에 콘텐츠 오버레이 |

---

### 분할 뷰 (노드 선택 후)

**P0 (Core)**: 축소된 3D 그래프, 콘텐츠 패널 (제목, 본문)
**P1 (Supporting)**: 클러스터 뱃지, 태그, 리드 인용문
**P2 (Contextual)**: 난이도 라벨, 관련 노드 링크

#### 컴포넌트 계층 구조

```
[HomePage]                              [main]
├── [GraphPanel]                        [aside, w-[38%], aria-label="3D 지식 그래프"]
│   └── ForceGraph3D (축소)             [canvas, WebGL]
├── [Divider]                           [div, w-px, aria-hidden="true"]
└── [ContentPanel]                      [article, flex-1, aria-label="노드 상세"]
    ├── [PanelHeader]                   [header]
    │   ├── ClusterBadge               (기존 컴포넌트)
    │   ├── DifficultyLabel            (기존 컴포넌트)
    │   └── CloseButton                [button, aria-label="패널 닫기"]
    ├── [PanelBody]                     [section]
    │   ├── Title                      [h1, font-display, --foreground]
    │   ├── TagList                    (기존 컴포넌트)
    │   ├── LeadQuote                  (기존 컴포넌트)
    │   └── MdxContent                 (기존 MdxRenderer 재사용)
    └── [PanelFooter]                   [footer]
        └── RelatedNodes               [nav, aria-label="관련 노드"]
```

#### 토큰 매핑

```
그래프 패널 배경:    --graph-bg
디바이더:           --border, 1px
콘텐츠 패널 배경:   --surface-elevated (라이트: #FFFFFF / 다크: #1A1A1A)
콘텐츠 패널 패딩:   p-8
제목:               --foreground, font-display (Lexend), text-2xl font-bold
본문:               --text, font-sans (Noto Sans KR), text-[13px] leading-[1.85]
닫기 버튼:          --muted → hover: --foreground
```

#### 전환 애니메이션

- 그래프 축소: `width 100% → 38%`, duration-slow (350ms), ease-out. 3D 씬이 새로운 컨테이너 크기에 맞게 리사이즈
- 카메라 포커스: 선택된 노드로 카메라 lookAt 이동, `duration 800ms`, ease-in-out
- 콘텐츠 등장: `opacity 0 → 1` + `translateX(20px) → 0`, duration-slow, ease-out, delay 100ms
- 풀스크린 복귀: 역방향 동일 타이밍 + 카메라 초기 위치 복원

#### 인터랙션 상태 -- 닫기 버튼

| 상태 | 색상 | 배경 |
|------|------|------|
| default | --muted | transparent |
| hover | --foreground | --surface |
| focus | --foreground | --surface, focus ring |
| active | --foreground | --surface-alt |

#### 반응형 동작

| 브레이크포인트 | 동작 |
|--------------|------|
| Desktop (md+) | 좌 38% 3D 그래프 + 우 62% 콘텐츠, 나란히 |
| Mobile (<md) | 그래프 숨김, 콘텐츠 전체 너비 w-full, 상단 "그래프로 돌아가기" 버튼 |

## 재사용 컴포넌트

기존 컴포넌트 재사용:
- **ClusterBadge** -- 콘텐츠 패널 헤더
- **DifficultyLabel** -- 클러스터 뱃지 옆
- **TagList** -- 제목 아래 태그 나열
- **LeadQuote** -- 본문 시작 전 요약 인용
- **ThemeToggle** -- 기존 컴포넌트 그대로 사용
- **MdxRenderer** -- 기존 MDX 렌더러 그대로 사용

신규 컴포넌트:
- **GraphCanvas3D** -- react-force-graph-3d 래퍼, 풀스크린/축소 모드 지원, Three.js 씬 관리
- **CameraHint** -- 첫 진입 시 카메라 조작 안내 UI (5초 후 페이드아웃)
- **ContentPanel** -- 우측 콘텐츠 패널 (열기/닫기 애니메이션 포함)
- **CloseButton** -- 패널 닫기 버튼 (재사용 가능한 범용 컴포넌트)
