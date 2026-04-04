# 프로젝트 진행 상황

## 다음 작업

| # | 작업 | 크기 | 의존 | 상태 |
|---|------|------|------|------|
| 9-1 | 구현: WebGL 지원 여부 사전 체크 + 폴백 UI 메시지 표시 | S | - | [ ] |
| 9-2 | 구현: BackToGraphButton 컴포넌트 -- 모바일 전용, sticky top-0 z-10, 그래프로 복귀 (`src/features/graph/components/BackToGraphButton.tsx`) | XS | - | [ ] |
| 9-3 | 구현: 반응형 레이아웃 -- md 미만에서 그래프 숨김 + ContentPanel w-full + BackToGraphButton 표시 | S | 9-2 | [ ] |
| 9-4 | 추가: 접근성 -- 3D 캔버스 aria-label, 숨겨진 노드 목록, 키보드 탐색(Tab/Enter), Escape로 패널 닫기, 포커스 관리(패널 열림 시 h1, 닫기 시 이전 노드) | S | - | [ ] |
| 9-5 | 추가: prefers-reduced-motion 대응 -- 자동 회전 비활성화, 전환 duration 0ms, 패널 등장 opacity만 유지(150ms), 노드 플로팅 비활성화 | S | - | [ ] |
| 9-6 | 검증: 성능 프로파일링 -- 50개 노드 60fps 확인, 모바일 LOD(32seg→16seg), nodeThreeObject 캐싱 | S | - | [ ] |
| 9-7 | 검증: E2E 테스트 -- 3D 그래프 렌더링 + 노드 클릭 + 분할 뷰 전환 (`test/e2e/home-3d.spec.ts`) | M | 9-1, 9-3, 9-4 | [ ] |

---

## 현재 단계

Phase 9 진행 중 — **폴백 + 반응형 + 접근성** (브랜치: `feat/home-page-redesign`)

## 완료된 Phase 요약

- **Phase 0** (선결 작업): 클러스터 9개 매핑 + 21개 노드 업데이트
- **Phase 1** (기초 기반): Next.js 16 + TS strict + ESLint/Prettier + 디렉토리 구조
- **Phase 2** (Git & GitHub): public 레포 + 브랜치 보호 + husky pre-commit
- **Phase 3-A** (디자인 프로토타입): 디자인 방향 확정 + 프로토타입 구축 완료
- **Phase 5-0** (E2E 인프라): Playwright 설정 완료
- **Phase 3-B** (디자인 시스템): 토큰 모듈 + 스킬 생성 + 하네스 연동 + E2E 테스트 (3B-1 ~ 3B-11)
- **Phase 4** (콘텐츠 파이프라인): Zod 스키마 + pipeline.ts + graph-data.json 생성 스크립트 + prebuild 통합 + MDX 렌더링 설정 (4-1 ~ 4-5)
- **Phase 5** (3D 그래프): GraphCanvas3D + 3D 렌더링 훅 5종 + CameraHint (5-1 ~ 5-8)
- **Phase 6** (콘텐츠 패널 + 분할 뷰): CloseButton, LoadingIndicator, ClusterBadge, DifficultyLabel, PanelHeader, ContentPanel + re-export 정리 (6-1 ~ 6-5)
- **Phase 7** (홈 페이지 조립 + 전환 애니메이션): 분할 뷰 레이아웃, 로딩 시퀀스, 노드 클릭/닫기/전환 애니메이션, 노드 플로팅 효과 (7-1 ~ 7-7)
- **Phase 8** (홈페이지 리디자인 v2): SiteHeader + 세로 스크롤 전환, 3D 인터랙션 고도화(호버 glow/라벨/선택), ContentSection 슬라이드 다운, ScrollToTopButton, SEO 정적 페이지 (8-1 ~ 8-13)

---

## 이후 Phase

### Phase 9: 폴백 + 반응형 + 접근성 · 브랜치: `feat/home-page-redesign`

| # | 작업 | 크기 | 의존 | 상태 |
|---|------|------|------|------|
| 9-1 | 구현: WebGL 지원 여부 사전 체크 + 폴백 UI 메시지 표시 | S | - | [ ] |
| 9-2 | 구현: BackToGraphButton 컴포넌트 -- 모바일 전용, sticky top-0 z-10, 그래프로 복귀 (`src/features/graph/components/BackToGraphButton.tsx`) | XS | - | [ ] |
| 9-3 | 구현: 반응형 레이아웃 -- md 미만에서 그래프 숨김 + ContentPanel w-full + BackToGraphButton 표시 | S | 9-2 | [ ] |
| 9-4 | 추가: 접근성 -- 3D 캔버스 aria-label, 숨겨진 노드 목록, 키보드 탐색(Tab/Enter), Escape로 패널 닫기, 포커스 관리(패널 열림 시 h1, 닫기 시 이전 노드) | S | - | [ ] |
| 9-5 | 추가: prefers-reduced-motion 대응 -- 자동 회전 비활성화, 전환 duration 0ms, 패널 등장 opacity만 유지(150ms), 노드 플로팅 비활성화 | S | - | [ ] |
| 9-6 | 검증: 성능 프로파일링 -- 50개 노드 60fps 확인, 모바일 LOD(32seg→16seg), nodeThreeObject 캐싱 | S | - | [ ] |
| 9-7 | 검증: E2E 테스트 -- 3D 그래프 렌더링 + 노드 클릭 + 분할 뷰 전환 (`test/e2e/home-3d.spec.ts`) | M | 9-1, 9-3, 9-4 | [ ] |

### Phase 10: 라우팅 & SEO · 브랜치: `feat/seo`

| # | 작업 | 크기 | 의존 | 상태 |
|---|------|------|------|------|
| ~~10-1~~ | ~~`/nodes/[slug]` 정적 페이지~~ | ~~M~~ | - | 8-12로 통합 |
| 10-2 | JSON-LD 구조화 데이터 | S | 8-12 | [ ] |
| 10-3 | sitemap.xml + robots.txt | S | 8-12 | [ ] |

### Phase 11: 배포 · 브랜치: `feat/deploy`

| # | 작업 | 크기 | 의존 | 상태 |
|---|------|------|------|------|
| 11-1 | Vercel 배포 설정 | S | - | [ ] |
| 11-2 | GitHub Actions CI | S | 11-1 | [ ] |
| 11-3 | 커스텀 도메인 | S | 11-1 | [ ] |

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
