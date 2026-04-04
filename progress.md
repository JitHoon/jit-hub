# 프로젝트 진행 상황

## 다음 작업

---

## 현재 단계

Phase 10 진행 중 — **라우팅 & SEO** (10-2-1 완료)

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
- **Phase 9** (폴백 + 접근성 + 성능): WebGL 폴백 UI, 캔버스 aria-label/스크린리더 노드 목록, 모바일 LOD 분기, nodeThreeObject 캐싱 검증, E2E 테스트 3건 (9-1 ~ 9-7-3)

---

## 이후 Phase

### Phase 10: 라우팅 & SEO · 브랜치: `feat/seo`

| # | 작업 | 크기 | 의존 | 상태 |
|---|------|------|------|------|
| ~~10-1~~ | ~~`/nodes/[slug]` 정적 페이지~~ | ~~M~~ | - | 8-12로 통합 |
| 10-2-1 | `layout.tsx`에 WebSite + Person JSON-LD 스크립트 추가 | XS | 8-12 | [x] |
| 10-2-2 | `nodes/[slug]/page.tsx`에 TechArticle JSON-LD 생성 로직 추가 | S | 10-2-1 | [ ] |
| 10-3-1 | `src/app/sitemap.ts` 생성 -- getAllSlugs() 기반 동적 sitemap 반환 | XS | 8-12 | [ ] |
| 10-3-2 | `src/app/robots.ts` 생성 -- 크롤링 허용 + sitemap URL 명시 | XS | 10-3-1 | [ ] |

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
