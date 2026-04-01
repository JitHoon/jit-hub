# 프로젝트 진행 상황

## 다음 작업

| # | 작업 | Phase | 크기 |
|---|------|-------|------|

---

## 현재 단계

Phase 5 진행 중 → **3D 그래프 기반 + GraphCanvas3D** (5-1 ~ 5-8)

## 완료된 Phase 요약

- **Phase 0** (선결 작업): 클러스터 9개 매핑 + 21개 노드 업데이트
- **Phase 1** (기초 기반): Next.js 16 + TS strict + ESLint/Prettier + 디렉토리 구조
- **Phase 2** (Git & GitHub): public 레포 + 브랜치 보호 + husky pre-commit
- **Phase 3-A** (디자인 프로토타입): 디자인 방향 확정 + 프로토타입 구축 완료
- **Phase 5-0** (E2E 인프라): Playwright 설정 완료
- **Phase 3-B** (디자인 시스템): 토큰 모듈 + 스킬 생성 + 하네스 연동 + E2E 테스트 (3B-1 ~ 3B-11)
- **Phase 4** (콘텐츠 파이프라인): Zod 스키마 + pipeline.ts + graph-data.json 생성 스크립트 + prebuild 통합 + MDX 렌더링 설정 (4-1 ~ 4-5)

---

## 이후 Phase

### Phase 5: 3D 그래프 기반 + GraphCanvas3D · 브랜치: `feat/home-page-redesign`

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 5-1 | 설치: three, @types/three, react-force-graph-3d 패키지 추가 | XS | [x] |
| 5-2 | 정의: GraphMode, GraphLayoutState(mode만), CameraState 타입 + NodeObject<GraphNode>/LinkObject<GraphNode,GraphEdge> type alias (`src/features/graph/types/layout.ts`)<br>완료 기준: `layout.ts`에 `GraphMode`, `GraphLayoutState`, `CameraState`, `ForceGraph3DNode`(=`NodeObject<GraphNode>`), `ForceGraph3DLink`(=`LinkObject<GraphNode, GraphEdge>`) 5개 타입이 export되고 tsc 통과 | XS | [x] |
| 5-3-1 | 구현: useGraph3DRenderer 훅 -- `nodeThreeObject` 콜백 반환 (허브/리프 SphereGeometry + MeshStandardMaterial, 클러스터 색상 기본 상태, 테마 분기) (`src/features/graph/hooks/useGraph3DRenderer.ts`)<br>완료 기준: `nodeThreeObject` 콜백이 `GraphNode`를 받아 허브/리프 분기된 Three.js Mesh를 반환하고, tsc 통과 | S | [x] |
| 5-3-2 | 구현: useGraph3DRenderer에 `linkThreeObject`/`linkColor` 콜백 + 노드 라벨(SpriteText) 생성 로직 추가 (`src/features/graph/hooks/useGraph3DRenderer.ts`)<br>완료 기준: 엣지가 허브간/리프간 opacity 분기되고, 노드 라벨이 SpriteText로 표시되며 tsc 통과 | XS | [ ] |
| 5-3-3 | 구현: useGraph3DRenderer에 호버/선택 상태 시각 변화 콜백 추가 (`onNodeHover`에서 scale/emissive/color 전환) (`src/features/graph/hooks/useGraph3DRenderer.ts`)<br>완료 기준: `onNodeHover` 콜백이 VISUAL_SPEC D섹션의 default/hover/active 상태 전환을 처리하고 tsc 통과 | S | [ ] |
| 5-4-1 | 수정: CameraState 타입에 lookAt, autoRotate 필드 추가 (`src/features/graph/types/layout.ts`) | XS | [ ] |
| 5-4-2 | 구현: useCameraControl 훅 -- 초기 위치(0,150,300) 설정 + Y축 자동 회전(controls().autoRotate) on/off 제어 (`src/features/graph/hooks/useCameraControl.ts`) | S | [ ] |
| 5-4-3 | 추가: useCameraControl에 노드 포커스 이동(cameraPosition API, 800ms) + 인터랙션 종료 후 3s 딜레이 자동 회전 재개 로직 | S | [ ] |
| 5-5 | 구현: useNodeSelection 훅 -- 클릭된 노드 ID 상태 관리 + `useSearchParams`로 `?node=slug` 양방향 동기화 + 해제(null) 처리 (`src/features/graph/hooks/useNodeSelection.ts`) <!-- 완료 기준: selectNode(slug)로 URL이 ?node=slug로 변경되고, clearSelection()으로 ?node 파라미터가 제거되며, URL에 ?node=xxx가 있는 상태에서 마운트 시 해당 노드가 selectedNodeId로 복원되고 tsc 통과 --> | S | [ ] |
| 5-6 | 구현: useGraphLayout 훅 -- GraphMode 상태(fullscreen/split) 관리 + containerRef 기반 ResizeObserver로 width/height 계산 + 모드 전환 시 ForceGraph3D dimensions 반환 (`src/features/graph/hooks/useGraphLayout.ts`)<br>반환값: `{ mode, setMode, graphWidth, graphHeight, containerRef }` — CSS 전환 애니메이션(Phase 7-4/7-5)은 이 훅 범위 밖<br>완료 기준: mode 변경 시 graphWidth가 컨테이너 100% 또는 38% 에 연동되고 tsc 통과 | S | [ ] |
| 5-7 | 구현: GraphCanvas3D 컴포넌트 -- react-force-graph-3d 래퍼 + 훅 통합, 물리 파라미터(charge:-120, linkDistance:80, warmupTicks:100) (`src/features/graph/components/GraphCanvas3D.tsx`) | M | [ ] |
| 5-8 | 구현: CameraHint 컴포넌트 -- 카메라 조작 안내 UI, opacity 0.6에서 5초 후 500ms easeIn 페이드아웃, 첫 인터랙션 시 즉시 소멸 (`src/features/graph/components/CameraHint.tsx`) | XS | [ ] |

### Phase 6: 콘텐츠 패널 + 분할 뷰 · 브랜치: `feat/home-page-redesign`

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 6-1 | 구현: CloseButton 컴포넌트 -- hover시 bg-surface, focus-visible ring-2 ring-accent (`src/features/content/components/CloseButton.tsx`) | XS | [ ] |
| 6-2 | 구현: LoadingIndicator 컴포넌트 -- CSS 스피너(rotate 1s linear infinite, 24px, --muted), isLoading/progress props (`src/components/LoadingIndicator.tsx`) | XS | [ ] |
| 6-3 | 구현: PanelHeader 컴포넌트 -- ClusterBadge + DifficultyLabel + CloseButton 조합 (`src/features/content/components/PanelHeader.tsx`) | S | [ ] |
| 6-4 | 구현: ContentPanel 컴포넌트 -- PanelHeader + MDX 본문 렌더링, bg-surface-elevated + shadow-lg 좌측 구분 (`src/features/content/components/ContentPanel.tsx`) | S | [ ] |
| 6-5 | 추가: graph/components, content/components index.ts re-export 정리 | XS | [ ] |

### Phase 7: 홈 페이지 조립 + 전환 애니메이션 · 브랜치: `feat/home-page-redesign`

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 7-1 | 조립: page.tsx에 GraphCanvas3D + ContentPanel 분할 뷰 통합 (`src/app/page.tsx`) | M | [ ] |
| 7-2 | 수정: layout.tsx에 ThemeToggle position fixed top-4 right-4 z-10 조정 (`src/app/layout.tsx`) | XS | [ ] |
| 7-3 | 구현: 초기 로딩 시퀀스 -- LoadingIndicator 표시 → 그래프 opacity 0→1 (500ms easeOut) → CameraHint 등장 → 자동 회전 시작 | S | [ ] |
| 7-4 | 구현: 노드 클릭 시 분할 뷰 전환 애니메이션 -- 그래프 width 100%→38% (400ms easeOut), ContentPanel translateX(100%)→0 + opacity 0→1 (400ms easeOut, delay 100ms) | S | [ ] |
| 7-5 | 구현: 패널 닫기 애니메이션 -- ContentPanel translateX→100% + opacity→0 (300ms easeIn), 그래프 38%→100% (350ms easeOut), 카메라 초기 위치 복원(600ms), 자동 회전 재개(3s 딜레이) | S | [ ] |
| 7-6 | 구현: 다른 노드 클릭 시 콘텐츠 크로스페이드 -- 이전 노드 scale 1.5→1 (200ms), 카메라 이동(800ms), 새 노드 scale 1→1.5 (200ms easeOutBack), 본문 opacity 크로스페이드(300ms) | S | [ ] |
| 7-7 | 구현: 노드 플로팅 애니메이션 -- cooldownTicks:0 기반 3D 공간 미세 움직임 | S | [ ] |
| 7-8 | 구현: 테마 전환 시 3D 씬 업데이트 -- scene.background, fog.color, 노드 material.color + emissive 토글(다크on/라이트off), 200ms 전환 | S | [ ] |

### Phase 8: 폴백 + 반응형 + 접근성 · 브랜치: `feat/home-page-redesign`

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 8-1 | 구현: WebGL 지원 여부 사전 체크 + 폴백 UI 메시지 표시 | S | [ ] |
| 8-2 | 구현: BackToGraphButton 컴포넌트 -- 모바일 전용, sticky top-0 z-10, 그래프로 복귀 (`src/features/graph/components/BackToGraphButton.tsx`) | XS | [ ] |
| 8-3 | 구현: 반응형 레이아웃 -- md 미만에서 그래프 숨김 + ContentPanel w-full + BackToGraphButton 표시 | S | [ ] |
| 8-4 | 추가: 접근성 -- 3D 캔버스 aria-label, 숨겨진 노드 목록, 키보드 탐색(Tab/Enter), Escape로 패널 닫기, 포커스 관리(패널 열림 시 h1, 닫기 시 이전 노드) | S | [ ] |
| 8-5 | 추가: prefers-reduced-motion 대응 -- 자동 회전 비활성화, 전환 duration 0ms, 패널 등장 opacity만 유지(150ms), 노드 플로팅 비활성화 | S | [ ] |
| 8-6 | 검증: 성능 프로파일링 -- 50개 노드 60fps 확인, 모바일 LOD(32seg→16seg), nodeThreeObject 캐싱 | S | [ ] |
| 8-7 | 검증: E2E 테스트 -- 3D 그래프 렌더링 + 노드 클릭 + 분할 뷰 전환 (`test/e2e/home-3d.spec.ts`) | M | [ ] |

### Phase 9: 라우팅 & SEO · 브랜치: `feat/seo`

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 9-1 | /nodes/[slug] 정적 페이지 | M | [ ] |
| 9-2 | JSON-LD 구조화 데이터 | S | [ ] |
| 9-3 | sitemap.xml + robots.txt | S | [ ] |

### Phase 10: 배포 · 브랜치: `feat/deploy`

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 10-1 | Vercel 배포 설정 | S | [ ] |
| 10-2 | GitHub Actions CI | S | [ ] |
| 10-3 | 커스텀 도메인 | S | [ ] |

---

## 핵심 결정 사항

- GitHub: **Public** 레포
- 다크 모드: **포함** (html.dark 클래스 기반)
- 클러스터: v2 기준 9개
- 디자인: **Modern Gray + Nintendo Retro Kick** 확정
- 타이포그래피: **Lexend (display) + Noto Sans KR (body)** 확정
- 그래프 인터랙션: 모노크롬 기본 → 호버 시 킥 컬러 리빌 + 노드 플로팅
- 홈페이지: **3D Starfield Graph** (react-force-graph-3d + Three.js) 확정. 기존 2D 계획(Phase 5) 대체.

## 메모

- 복잡도: `XS` 30분 이내, `S` ~2시간, `M` ~4시간, `L` 대규모 (사용 금지, 반드시 분할)
- 프로토타입 페이지(`/design`)는 Phase 3-B 완료 후 삭제됨 (토큰은 globals.css/Tailwind에 코드화)
- 디자인 시스템 상세 스펙: `.claude/projects/.../memory/design_system_spec.md`
- react-force-graph-2d는 유지 (기존 SEO 페이지에서 사용 가능). 홈에서만 3D로 전환.
