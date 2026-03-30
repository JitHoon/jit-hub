# 프로젝트 진행 상황

## 현재 단계

Phase 3 진행 중 → **Phase 3-B (디자인 시스템 프로덕션 전환)**

## 완료된 Phase 요약

- **Phase 0** (선결 작업): 클러스터 9개 매핑 + 21개 노드 업데이트
- **Phase 1** (기초 기반): Next.js 16 + TS strict + ESLint/Prettier + 디렉토리 구조
- **Phase 2** (Git & GitHub): public 레포 + 브랜치 보호 + husky pre-commit
- **Phase 3-A** (디자인 프로토타입): 디자인 방향 확정 + 프로토타입 구축 완료
- **Phase 5-0** (E2E 인프라): Playwright 설정 완료

---

## Phase 3-B: 디자인 시스템 프로덕션 전환 · 브랜치: `feat/design-prototype`

프로토타입(`src/app/design/page.tsx`)의 인라인 토큰을 구조적으로 분리하여 재사용 가능한 프로덕션 시스템으로 전환한다.

### Step 1: 디자인 토큰 모듈

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 3B-1 | `src/lib/tokens.ts` 생성 — KICK, Palette(LIGHT/DARK), FONT, GRAPH_GRAY 추출 | M | [x] |
| 3B-2 | `src/lib/clusters.ts` 업데이트 — oklch→HEX, base 필드 추가 | S | [ ] |
| 3B-3 | `src/app/globals.css` 업데이트 — 팔레트 교체, 신규 CSS 변수, float keyframes | M | [ ] |
| 3B-4 | `src/app/layout.tsx` 업데이트 — Lexend 폰트 추가, CSS 변수 등록 | S | [ ] |

- **검증**: `bun run dev` 정상 + `bun run build` 성공 + `/design` 프로토타입 정상

### Step 2: design-system 스킬 생성

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 3B-5 | `.claude/skills/design-system/SKILL.md` 생성 — 디자인 철학, 토큰 규칙, 패턴 | M | [ ] |
| 3B-6 | `references/token-catalog.md` — 전체 토큰 값 + 사용처 | S | [ ] |
| 3B-7 | `references/component-patterns.md` — 뱃지, 태그, 분할뷰 등 패턴 | S | [ ] |

### Step 3: 하네스 연동

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 3B-8 | `CLAUDE.md` — design-system 스킬 조건부 컨텍스트 추가 | S | [ ] |
| 3B-9 | `graph-visualization/SKILL.md` — HEX 색상 참조 추가 | S | [ ] |

### Step 4: Playwright E2E 테스트

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 3B-10 | `e2e/theme.spec.ts` — 테마 전환, 배경색, localStorage 유지 | M | [ ] |
| 3B-11 | `e2e/design-tokens.spec.ts` — 폰트 적용, CSS 변수 값 검증 | M | [ ] |

- **검증**: `bun run test:e2e` 전체 통과

---

## 이후 Phase (변경 없음)

### Phase 4: 콘텐츠 파이프라인 · 브랜치: `feat/content-pipeline`

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 4-1 | Zod 스키마 정의 → `src/lib/schema.ts` | M | [ ] |
| 4-2 | 파이프라인 핵심 함수 → `src/lib/pipeline.ts` | M | [ ] |
| 4-3 | graph-data.json 생성 스크립트 | M | [ ] |
| 4-4 | 빌드 스크립트 통합 (prebuild) | S | [ ] |
| 4-5 | MDX 렌더링 설정 | M | [ ] |

### Phase 5: 핵심 UI 컴포넌트 · 브랜치: `feat/graph-ui`

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 5-1 | 루트 레이아웃 최종 정리 | S | [ ] |
| 5-2 | 그래프 컴포넌트 (react-force-graph-2d) | L | [ ] |
| 5-3 | 분할 뷰 레이아웃 | M | [ ] |
| 5-4 | 노드 상세 패널 (MDX 본문) | M | [ ] |
| 5-5 | 메인 페이지 조립 (?node=slug) | M | [ ] |

### Phase 6: 라우팅 & SEO · 브랜치: `feat/seo`

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 6-1 | /nodes/[slug] 정적 페이지 | M | [ ] |
| 6-2 | JSON-LD 구조화 데이터 | S | [ ] |
| 6-3 | sitemap.xml + robots.txt | S | [ ] |

### Phase 7: 배포 · 브랜치: `feat/deploy`

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 7-1 | Vercel 배포 설정 | S | [ ] |
| 7-2 | GitHub Actions CI | S | [ ] |
| 7-3 | 커스텀 도메인 | S | [ ] |

---

## 핵심 결정 사항

- GitHub: **Public** 레포
- 다크 모드: **포함** (html.dark 클래스 기반)
- 클러스터: v2 기준 9개
- 디자인: **Modern Gray + Nintendo Retro Kick** 확정
- 타이포그래피: **Lexend (display) + Noto Sans KR (body)** 확정
- 그래프 인터랙션: 모노크롬 기본 → 호버 시 킥 컬러 리빌 + 노드 플로팅

## 메모

- 복잡도: `S` 소규모, `M` 중규모, `L` 대규모
- 프로토타입 페이지(`/design`)는 레퍼런스로 유지
- 디자인 시스템 상세 스펙: `.claude/projects/.../memory/design_system_spec.md`
