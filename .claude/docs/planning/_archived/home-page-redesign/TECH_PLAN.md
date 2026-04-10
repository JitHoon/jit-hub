# 기술 구현 계획: 홈페이지 리디자인 (Starfield Graph 3D)

## 기술 스택

현재 스택 기반. 변경 사항:
- **react-force-graph-3d**: 기존 react-force-graph-2d 대신 사용. `dynamic(() => import('react-force-graph-3d'), { ssr: false })` 패턴 유지. 내부적으로 Three.js + three-spritetext 의존.
- **three**: react-force-graph-3d의 peerDependency. `bun add three @types/three` 필요.
- **next/navigation**: `useSearchParams` 활용 (URL ?node=slug 동기화)
- react-force-graph-2d는 유지 (기존 `/nodes/[slug]` SEO 페이지에서 사용 중일 수 있음). 홈에서만 3D로 전환.

### Three.js 의존성 상세

react-force-graph-3d는 내부적으로 다음을 사용:
- `three` -- 3D 렌더링 엔진 (WebGL)
- `three-spritetext` -- 노드 라벨 텍스트 (Sprite 기반)
- `three-forcegraph` -- Force-directed 3D 그래프 레이아웃
- `three-render-objects` -- 오브젝트 인터랙션 (hover, click)

## 영향 범위

### 수정 파일
- `src/app/page.tsx` -- 플레이스홀더 → 풀스크린 3D 그래프 + 분할 뷰
- `src/app/layout.tsx` -- ThemeToggle 위치 조정 (3D 캔버스 위 z-index 보장)
- `package.json` -- three, @types/three 의존성 추가

### 신규 파일
- `src/features/graph/components/GraphCanvas3D.tsx` -- react-force-graph-3d 래퍼
- `src/features/graph/components/CameraHint.tsx` -- 카메라 조작 안내 UI
- `src/features/graph/components/index.ts` -- re-export
- `src/features/graph/hooks/useGraphLayout.ts` -- 풀스크린/분할 모드 전환 로직
- `src/features/graph/hooks/useNodeSelection.ts` -- 노드 선택 상태 + URL 동기화
- `src/features/graph/hooks/useGraph3DRenderer.ts` -- 3D 노드/엣지 커스텀 렌더링 (Three.js 오브젝트 생성)
- `src/features/graph/hooks/useCameraControl.ts` -- 카메라 위치, 자동 회전, 포커스 이동 로직
- `src/features/content/components/ContentPanel.tsx` -- 우측 콘텐츠 패널
- `src/features/content/components/PanelHeader.tsx` -- 패널 헤더 (뱃지, 닫기)
- `src/features/content/components/CloseButton.tsx` -- 닫기 버튼
- `src/features/content/components/index.ts` -- re-export

### 스키마 변경
없음. 기존 `GraphData`, `GraphNode`, `GraphEdge` 타입 그대로 사용.

## API 설계

별도 API 엔드포인트 없음. 모든 데이터는 빌드 타임에 생성된 `graph-data.json`에서 정적 import.

| 데이터 흐름 | 소스 | 소비자 |
|------------|------|--------|
| 그래프 구조 | `public/graph-data.json` (빌드 생성) | GraphCanvas3D |
| 노드 콘텐츠 | `contents/nodes/*.md` (MDX 파이프라인) | ContentPanel |
| 클러스터 메타 | `src/constants/cluster.ts` | GraphCanvas3D, PanelHeader |
| 테마 상태 | `useTheme()` | GraphCanvas3D (씬 배경색, 노드 material 분기) |

## 데이터 모델

기존 타입 재사용. 신규 타입만 정의:

```typescript
// src/features/graph/types/layout.ts

type GraphMode = "fullscreen" | "split";

interface GraphLayoutState {
  mode: GraphMode;
  selectedNodeId: string | null;
}

// react-force-graph-3d 노드 확장 (3D 위치 포함)
interface ForceGraph3DNode extends GraphNode {
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
}

// 카메라 상태
interface CameraState {
  position: { x: number; y: number; z: number };
  lookAt: { x: number; y: number; z: number };
  autoRotate: boolean;
}
```

## 구현 태스크 (체크리스트)

- [ ] **단계 0: Three.js 의존성 설치** -- `bun add three @types/three react-force-graph-3d`. 기존 react-force-graph-2d는 유지. 완료 기준: `bun run build` 성공.

- [ ] **단계 1: GraphCanvas3D 기본 렌더링** -- graph-data.json을 읽어 react-force-graph-3d로 풀스크린 3D 렌더링. `dynamic(() => import('react-force-graph-3d'), { ssr: false })`. 노드를 클러스터 색상으로 SphereGeometry 표시. 완료 기준: 3D 공간에 노드가 표시되고 마우스로 회전/줌 가능.

- [ ] **단계 2: 카메라 제어 + 자동 회전** -- useCameraControl 훅 구현. 초기 카메라 위치 설정, 자동 회전 on/off, 노드 포커스 이동. ForceGraph3D의 `cameraPosition` API 활용. 완료 기준: 첫 진입 시 자동 회전, 드래그 시 정지, 노드 클릭 시 카메라 이동.

- [ ] **단계 3: 별빛 효과 (3D Emissive)** -- 다크모드에서 MeshStandardMaterial의 emissive/emissiveIntensity 적용. FogExp2로 깊이감. 라이트모드에서는 MeshLambertMaterial. 완료 기준: 다크모드에서 노드가 빛나며 3D 공간에 깊이감 표현.

- [ ] **단계 4: 노드 선택 + URL 동기화** -- useNodeSelection 훅 구현. 클릭 시 `?node=slug` 반영. 새로고침 시 선택 복원. 완료 기준: 노드 클릭 → URL 변경 → 새로고침 → 동일 노드 선택 + 카메라 포커스 상태.

- [ ] **단계 5: 분할 뷰 전환 애니메이션** -- useGraphLayout 훅 구현. 풀스크린 ↔ 분할 모드 전환. CSS transition으로 컨테이너 축소 + 콘텐츠 등장. ForceGraph3D의 `width`/`height` props 동적 변경으로 3D 씬 리사이즈. 완료 기준: 부드러운 전환, 350ms ease-out, 3D 씬 정상 리사이즈.

- [ ] **단계 6: ContentPanel 구현** -- MDX 콘텐츠 렌더링. ClusterBadge, TagList, LeadQuote 등 기존 패턴 조합. 완료 기준: 선택된 노드의 MDX 본문이 우측에 정상 렌더링.

- [ ] **단계 7: CameraHint + WebGL 폴백** -- 첫 진입 시 카메라 조작 안내 표시 (5초 후 페이드아웃). WebGL 미지원 시 폴백 메시지. 완료 기준: 안내 UI 표시/사라짐 정상, WebGL 미지원 환경에서 에러 없이 폴백.

- [ ] **단계 8: 반응형 + 모바일** -- md 미만에서 그래프/콘텐츠 레이아웃 전환. 모바일에서 3D 터치 인터랙션 확인. 완료 기준: 768px 미만에서 정상 동작.

- [ ] **단계 9: 접근성 + 성능 최적화 + 마무리** -- aria-label, 키보드 탐색, 포커스 관리. 노드 50개 기준 60fps 확인. 완료 기준: Tab으로 노드 탐색, Enter로 선택 가능. 성능 프로파일 통과.

## 기술적 리스크

| 리스크 | 영향도 | 완화 방안 |
|--------|--------|---------|
| Three.js 번들 크기 증가 | 상 | dynamic import로 코드 스플리팅. Three.js는 ~600KB (gzip ~150KB). 초기 로드에 영향 있으므로 Suspense + 로딩 UI 필수. tree-shaking 효과 확인. |
| WebGL 컨텍스트 미지원/손실 | 중 | `renderer.domElement`에서 `webglcontextlost` 이벤트 감지. 폴백 UI 표시. WebGL 지원 여부 사전 체크 (`document.createElement('canvas').getContext('webgl2')`). |
| 풀스크린 → 분할 전환 시 3D 씬 리사이즈 | 중 | ForceGraph3D의 `width`/`height` props로 리사이즈 트리거. `renderer.setSize()` 자동 호출 확인. ResizeObserver로 컨테이너 크기 추적. |
| 3D force simulation 안정화 시간 | 중 | `warmupTicks`, `cooldownTicks` 파라미터 조정. 초기에 충분한 warmup으로 노드 위치 안정화 후 렌더링 시작. |
| 모바일 GPU 성능 | 상 | 모바일에서 노드 수 제한 또는 LOD(Level of Detail) 적용. SphereGeometry segments 수 감소 (32 → 8). Fog 비활성화 옵션. 모바일 감지 시 `enableNodeDrag: false`로 인터랙션 단순화. |
| MDX 콘텐츠 동적 로딩 지연 | 중 | 콘텐츠 패널 열릴 때 Suspense + 스켈레톤 UI 표시. 또는 빌드 타임 pre-render 후 fetch. |
| 다크/라이트 전환 시 3D 씬 깜빡임 | 중 | useTheme 구독으로 scene.background, material.color, fog.color 즉시 업데이트. Three.js material의 `needsUpdate = true` 트리거. |
| react-force-graph-3d의 접근성 한계 | 중 | WebGL canvas 내부는 스크린 리더 접근 불가. canvas 외부에 숨겨진 노드 목록(aria) 배치하여 보조. `aria-label`로 전체 그래프 설명 제공. |
