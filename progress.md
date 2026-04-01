# 프로젝트 진행 상황

## 다음 작업

| # | 작업 | Phase | 크기 |
|---|------|-------|------|

---

## 현재 단계

Phase 6 진행 중 → **콘텐츠 패널 + 분할 뷰** (6-1 ~ 6-5)

## 완료된 Phase 요약

- **Phase 0** (선결 작업): 클러스터 9개 매핑 + 21개 노드 업데이트
- **Phase 1** (기초 기반): Next.js 16 + TS strict + ESLint/Prettier + 디렉토리 구조
- **Phase 2** (Git & GitHub): public 레포 + 브랜치 보호 + husky pre-commit
- **Phase 3-A** (디자인 프로토타입): 디자인 방향 확정 + 프로토타입 구축 완료
- **Phase 5-0** (E2E 인프라): Playwright 설정 완료
- **Phase 3-B** (디자인 시스템): 토큰 모듈 + 스킬 생성 + 하네스 연동 + E2E 테스트 (3B-1 ~ 3B-11)
- **Phase 4** (콘텐츠 파이프라인): Zod 스키마 + pipeline.ts + graph-data.json 생성 스크립트 + prebuild 통합 + MDX 렌더링 설정 (4-1 ~ 4-5)
- **Phase 5** (3D 그래프): GraphCanvas3D + 3D 렌더링 훅 5종 + CameraHint (5-1 ~ 5-8)

---

## 이후 Phase

### Phase 6: 콘텐츠 패널 + 분할 뷰 · 브랜치: `feat/home-page-redesign`

| # | 작업 | 크기 | 의존 | 상태 |
|---|------|------|------|------|
| 6-1 | 구현: CloseButton 컴포넌트 -- hover시 bg-surface, focus-visible ring-2 ring-accent (`src/features/content/components/CloseButton.tsx`) | XS | - | [x] |
| 6-2 | 구현: LoadingIndicator 컴포넌트 -- CSS 스피너(animate-spin, 24px, text-muted), isLoading=false일 때 null 반환 (`src/components/LoadingIndicator.tsx`) | XS | - | [x] |
| 6-3-1 | 구현: ClusterBadge 컴포넌트 -- cluster ID를 받아 CLUSTERS 상수에서 color/label 읽어 dot + 한국어 레이블 표시 (`src/features/content/components/ClusterBadge.tsx`) | XS | - | [x] |
| 6-3-2 | 구현: DifficultyLabel 컴포넌트 -- Difficulty 타입을 받아 한국어 텍스트 레이블 표시 (`src/features/content/components/DifficultyLabel.tsx`) | XS | - | [x] |
| 6-3-3 | 구현: PanelHeader 컴포넌트 -- ClusterBadge + DifficultyLabel + CloseButton 조립, header 태그 안에 배치 (`src/features/content/components/PanelHeader.tsx`) | XS | 6-1, 6-3-1, 6-3-2 | [x] |
| 6-4 | 구현: ContentPanel 컴포넌트 -- PanelHeader + MDX 본문 렌더링, bg-surface-elevated + shadow-lg 좌측 구분 (`src/features/content/components/ContentPanel.tsx`) | S | 6-3-3 | [x] |
| 6-5 | 추가: content/components index.ts re-export 정리 (`src/features/content/components/index.ts`) | XS | 6-4 | [x] |

### Phase 7: 홈 페이지 조립 + 전환 애니메이션 · 브랜치: `feat/home-page-redesign`

| # | 작업 | 크기 | 의존 | 상태 |
|---|------|------|------|------|
| 7-1-1 | 구현: page.tsx에서 graph-data.json 읽어 GraphCanvas3D에 props 전달 (`src/app/page.tsx`) | S | - | [x] |
| 7-1-2 | 구현: 선택된 노드의 MDX 콘텐츠를 서버에서 로딩하는 데이터 흐름 -- searchParams.node로 getNodeBySlug 호출, ContentPanel에 전달 (`src/app/page.tsx`) | S | 7-1-1 | [x] |
| 7-1-3 | 구현: 그래프(좌) + ContentPanel(우) 분할 뷰 CSS 레이아웃 -- 노드 미선택 시 그래프 100%, 선택 시 그래프 38% + 패널 62% (`src/app/page.tsx`) | XS | 7-1-2 | [x] |
| 7-2 | 수정: ThemeToggle z-index를 분할 뷰와 조화되는 값으로 조정 — ContentPanel/그래프 캔버스와 z-index 충돌 없이 항상 최상단 유지 확인 (`src/components/ThemeToggle.tsx`) | XS | 7-1-3 | [x] |
| 7-3-1 | 구현: useLoadingSequence 훅 -- phase 상태 머신(loading → revealing → ready) 관리, onEngineReady 콜백으로 phase 전환 트리거 (`src/features/graph/hooks/useLoadingSequence.ts`) | S | - | [x] |
| 7-3-2 | 연결: page.tsx에서 useLoadingSequence 소비 -- LoadingIndicator(loading phase), GraphCanvas3D opacity 전환(revealing phase, 500ms easeOut), CameraHint 표시(ready phase) 바인딩 (`src/app/page.tsx`) | S | 7-3-1 | [x] |
| 7-4 | 구현: 노드 클릭 시 분할 뷰 전환 애니메이션 -- 그래프 영역에 transition-all 400ms cubic-bezier(0,0,0.2,1) 적용, ContentPanel에 translateX(100%)→0 + opacity 0→1 (400ms, delay 100ms) 적용 (`src/app/page.tsx`, `src/features/content/components/ContentPanel.tsx`) \| 완료 기준: 노드 클릭 시 그래프 width 축소(400ms)와 ContentPanel 슬라이드인(400ms, delay 100ms)이 시각적으로 연속 재생된다 | S | 7-1-3 | [x] |
| 7-5 | 구현: 패널 닫기 애니메이션 -- CloseButton 클릭 시 패널 translateX→100% + opacity→0 (300ms easeIn), 그래프 38%→100% (350ms easeOut), useCameraControl.initCamera에 duration 파라미터 추가하여 카메라 초기 위치 복원(600ms), onInteractionEnd 재사용으로 자동 회전 3s 후 재개 (`src/app/page.tsx`, `src/features/content/components/ContentPanelWrapper.tsx`, `src/features/graph/hooks/useCameraControl.ts`) | S | 7-4 | [x] |
| 7-6-1 | 구현: 노드 전환 시 Three.js scale 애니메이션 -- 이전 노드 scale 1.5→1 (200ms), 새 노드 scale 1→1.5 (200ms easeOutBack) (`src/features/graph/hooks/useGraph3DRenderer.ts`) | S | 7-4 | [x] |
| 7-6-2 | 구현: ContentPanel 본문 opacity 크로스페이드 -- 노드 전환 시 본문 영역 opacity 0→1 (300ms) 전환 (`src/features/content/components/ContentPanel.tsx`) | XS | 7-4 | [x] |
| 7-7-1 | 검증: cooldownTicks:0 상태에서 노드 플로팅 효과 시각적 확인 (결과를 progress.md 메모에 기록) | XS | 7-3-2 | [x] |
| 7-7-2 | [조건부] 구현: useNodePerturbation 훅 — d3Force reheat 또는 rAF 기반 미세 위치 변동, GraphCanvas3D에 연결 | S | 7-7-1 | [ ] |

### Phase 8: 폴백 + 반응형 + 접근성 · 브랜치: `feat/home-page-redesign`

| # | 작업 | 크기 | 의존 | 상태 |
|---|------|------|------|------|
| 8-1 | 구현: WebGL 지원 여부 사전 체크 + 폴백 UI 메시지 표시 | S | - | [ ] |
| 8-2 | 구현: BackToGraphButton 컴포넌트 -- 모바일 전용, sticky top-0 z-10, 그래프로 복귀 (`src/features/graph/components/BackToGraphButton.tsx`) | XS | - | [ ] |
| 8-3 | 구현: 반응형 레이아웃 -- md 미만에서 그래프 숨김 + ContentPanel w-full + BackToGraphButton 표시 | S | 8-2 | [ ] |
| 8-4 | 추가: 접근성 -- 3D 캔버스 aria-label, 숨겨진 노드 목록, 키보드 탐색(Tab/Enter), Escape로 패널 닫기, 포커스 관리(패널 열림 시 h1, 닫기 시 이전 노드) | S | - | [ ] |
| 8-5 | 추가: prefers-reduced-motion 대응 -- 자동 회전 비활성화, 전환 duration 0ms, 패널 등장 opacity만 유지(150ms), 노드 플로팅 비활성화 | S | - | [ ] |
| 8-6 | 검증: 성능 프로파일링 -- 50개 노드 60fps 확인, 모바일 LOD(32seg→16seg), nodeThreeObject 캐싱 | S | - | [ ] |
| 8-7 | 검증: E2E 테스트 -- 3D 그래프 렌더링 + 노드 클릭 + 분할 뷰 전환 (`test/e2e/home-3d.spec.ts`) | M | 8-1, 8-3, 8-4 | [ ] |

### Phase 9: 라우팅 & SEO · 브랜치: `feat/seo`

| # | 작업 | 크기 | 의존 | 상태 |
|---|------|------|------|------|
| 9-1 | /nodes/[slug] 정적 페이지 | M | - | [ ] |
| 9-2 | JSON-LD 구조화 데이터 | S | 9-1 | [ ] |
| 9-3 | sitemap.xml + robots.txt | S | 9-1 | [ ] |

### Phase 10: 배포 · 브랜치: `feat/deploy`

| # | 작업 | 크기 | 의존 | 상태 |
|---|------|------|------|------|
| 10-1 | Vercel 배포 설정 | S | - | [ ] |
| 10-2 | GitHub Actions CI | S | 10-1 | [ ] |
| 10-3 | 커스텀 도메인 | S | 10-1 | [ ] |

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

### 7-7-1 검증: cooldownTicks:0 플로팅 효과 분석 결과

- 현재 설정: `GraphCanvas3D.tsx` — `WARMUP_TICKS = 100`, `COOLDOWN_TICKS = 0`
- `warmupTicks:100`: 초기 렌더링 전 d3 시뮬레이션을 100틱 내부 실행하여 레이아웃 배치 완료
- `cooldownTicks:0`: `onEngineStop` 발동 허용 틱을 0으로 제한 → 렌더링 시작 즉시 시뮬레이션 정지
- **결론: 플로팅 효과 없음.** cooldownTicks:0은 시뮬레이션을 즉시 종료시키므로 노드 위치가 warmupTicks 완료 시점에 고정된다. 지속적으로 노드가 미세하게 움직이는 플로팅 효과를 원한다면 7-7-2(useNodePerturbation — rAF 기반 미세 위치 변동)가 필요하다.
