# 프로젝트 진행 상황

## 현재 단계

Phase 0 완료 → **Phase 1 진행 중** (1-1, 1-2, 1-3 완료)

## 완료된 작업

- [x] 하네스 엔지니어링 초기 구축 (Command/Agent/Skill/Hooks)
- [x] 하네스 평가 보고서 작성 → `.claude/docs/harness-improve-1.md`
- [x] 하네스 개선 우선순위 1~5 완료 (상세: `.claude/docs/harness-improve-1.md`)
- [x] 콘텐츠 21개 노드 작성 완료 (`contents/nodes/`)
- [x] 프로젝트 블루프린트 v2 확정 (`.claude/docs/project-blueprint-v2.md`)

---

## 다음 할 일

### Phase 0: 선결 작업 (콘텐츠 정합성) · 브랜치: `feat/init`

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 0-1 | 클러스터 매핑 확정: 기존 7개 → v2 9개 | S | [x] |
| 0-2 | 21개 노드의 `cluster` 값을 v2 기준으로 일괄 수정 | S | [x] |
| 0-3 | 21개 노드에서 `stage: "evergreen"` 필드 일괄 제거 | S | [x] |

- **검증**: `grep -h '^cluster:' contents/nodes/*.md | sort | uniq -c`

### Phase 1: 기초 기반 (Foundation) · 브랜치: `feat/init`

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 1-1 | Next.js 16 프로젝트 초기화 (bun, App Router, TS, Tailwind) | M | [x] |
| 1-2 | TypeScript strict 설정 강화 (noUncheckedIndexedAccess 등) | S | [x] |
| 1-3 | ESLint + Prettier 설정 | S | [x] |
| 1-4 | .gitignore (graph-data.json, .DS_Store 등) | S | [x] |
| 1-5 | 디렉토리 구조 생성 (src/app, components, lib, scripts) | S | [x] |

- **검증**: `bun run dev` 정상 실행

### Phase 2: Git & GitHub · 브랜치: `feat/init`

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 2-1 | git init + 초기 커밋 | S | [ ] |
| 2-2 | GitHub **public** 레포 생성 + push | S | [ ] |
| 2-3 | 브랜치 전략 설정 (main 보호, feat/ 브랜치) | S | [ ] |
| 2-4 | lint-staged + husky pre-commit 훅 설정 (커밋 시 ESLint + Prettier 자동 실행) | S | [ ] |

- **검증**: git push 성공

### Phase 3: 디자인 시스템 · 브랜치: `feat/design-system`

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 3-1 | Tailwind 커스텀: 클러스터 색상 토큰 + `darkMode: 'class'` → `tailwind.config.ts` | S | [ ] |
| 3-2 | 글로벌 스타일 + 한국어 폰트 + 다크 모드 CSS 변수 → `globals.css`, `layout.tsx` | S | [ ] |
| 3-3 | 클러스터 색상 상수 + 다크 모드 토글 → `src/lib/clusters.ts` | S | [ ] |

- **검증**: `bun run dev`에서 폰트/색상/다크 모드 확인

### Phase 4: 콘텐츠 파이프라인 · 브랜치: `feat/content-pipeline`

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 4-1 | Zod 스키마 정의 (cluster enum 9개, difficulty, slug 등) → `src/lib/schema.ts` | M | [ ] |
| 4-2 | 파이프라인 핵심 함수 (getAllNodes, getNodeBySlug, validateReferences) → `src/lib/pipeline.ts` | M | [ ] |
| 4-3 | graph-data.json 생성 스크립트 → `scripts/generate-graph-data.ts` | M | [ ] |
| 4-4 | 빌드 스크립트 통합: `prebuild`로 graph-data.json 자동 생성 | S | [ ] |
| 4-5 | MDX 렌더링 설정 (next-mdx-remote + rehype-shiki + remark-gfm) → `src/lib/mdx.ts` | M | [ ] |

- **검증**: `bun run build` 성공 + graph-data.json 생성 + slug 무결성 검증

### Phase 5: 핵심 UI 컴포넌트 · 브랜치: `feat/graph-ui`

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 5-1 | 루트 레이아웃 (메타데이터, 폰트) → `src/app/layout.tsx` | S | [ ] |
| 5-2 | 그래프 컴포넌트 (react-force-graph-2d, dynamic import + ssr: false) → `src/components/graph/` | L | [ ] |
| 5-3 | 분할 뷰 레이아웃 (좌: 그래프, 우: 본문) → `src/components/layout/SplitView.tsx` | M | [ ] |
| 5-4 | 노드 상세 패널 (MDX 본문 + 관계 링크) → `src/components/node/NodePanel.tsx` | M | [ ] |
| 5-5 | 메인 페이지 조립 (?node=slug 쿼리) → `src/app/page.tsx` | M | [ ] |

- **검증**: 그래프 렌더링 + 허브 호버 시 리프 펼침 + 노드 클릭 시 분할 뷰

### Phase 6: 라우팅 & SEO · 브랜치: `feat/seo`

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 6-1 | /nodes/[slug] 정적 페이지 (generateStaticParams, generateMetadata) | M | [ ] |
| 6-2 | JSON-LD 구조화 데이터 (Schema.org TechArticle) | S | [ ] |
| 6-3 | sitemap.xml + robots.txt | S | [ ] |

- **검증**: `bun run build` 후 21개 정적 페이지 생성 확인

### Phase 7: 배포 · 브랜치: `feat/deploy`

| # | 작업 | 크기 | 상태 |
|---|------|------|------|
| 7-1 | Vercel 배포 설정 (GitHub 연결, 빌드 커맨드) | S | [ ] |
| 7-2 | GitHub Actions CI (push/PR 시 lint + build) | S | [ ] |
| 7-3 | 커스텀 도메인 (선택, 나중) | S | [ ] |

- **검증**: Vercel 라이브 URL에서 정상 동작

---

## 피처 브랜치 순서

| 순서 | 브랜치 | Phase | 검증 기준 |
|------|--------|-------|-----------|
| 1 | `feat/init` | 0+1+2 | dev 서버 정상 + git push 성공 |
| 2 | `feat/design-system` | 3 | 폰트/색상/다크 모드 확인 |
| 3 | `feat/content-pipeline` | 4 | build 성공 + graph-data.json 생성 |
| 4 | `feat/graph-ui` | 5 | 그래프 인터랙션 동작 |
| 5 | `feat/seo` | 6 | 정적 페이지 21개 생성 |
| 6 | `feat/deploy` | 7 | Vercel 라이브 배포 |

## 핵심 결정 사항

- GitHub: **Public** 레포
- 다크 모드: **포함** (Tailwind dark: 클래스, 처음부터 적용)
- 클러스터: v2 기준 9개로 통일 (Phase 0에서 해결)

## 메모

- 하네스 개선은 프로젝트 개발과 병행하며 점진적으로 진행
- 블루프린트 원칙: "완벽하게 설계한 후 시작하지 않는다"
- 복잡도: `S` 소규모, `M` 중규모, `L` 대규모
