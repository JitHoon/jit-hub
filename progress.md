# 프로젝트 진행 상황

## 다음 작업

| # | 작업 | Phase | 크기 |
|---|------|-------|------|
| 4-1 | Zod 스키마 정의 → `src/lib/schema.ts` | 4 콘텐츠 파이프라인 | M |
| 4-2 | 파이프라인 핵심 함수 → `src/lib/pipeline.ts` | 4 콘텐츠 파이프라인 | M |
| 4-3 | graph-data.json 생성 스크립트 | 4 콘텐츠 파이프라인 | M |
| 4-4 | 빌드 스크립트 통합 (prebuild) | 4 콘텐츠 파이프라인 | S |
| 4-5 | MDX 렌더링 설정 | 4 콘텐츠 파이프라인 | M |

---

## 현재 단계

Phase 4 진행 예정 → **콘텐츠 파이프라인**

## 완료된 Phase 요약

- **Phase 0** (선결 작업): 클러스터 9개 매핑 + 21개 노드 업데이트
- **Phase 1** (기초 기반): Next.js 16 + TS strict + ESLint/Prettier + 디렉토리 구조
- **Phase 2** (Git & GitHub): public 레포 + 브랜치 보호 + husky pre-commit
- **Phase 3-A** (디자인 프로토타입): 디자인 방향 확정 + 프로토타입 구축 완료
- **Phase 5-0** (E2E 인프라): Playwright 설정 완료
- **Phase 3-B** (디자인 시스템): 토큰 모듈 + 스킬 생성 + 하네스 연동 + E2E 테스트 (3B-1 ~ 3B-11)

---

## 이후 Phase

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
- 프로토타입 페이지(`/design`)는 Phase 3-B 완료 후 삭제됨 (토큰은 globals.css/Tailwind에 코드화)
- 디자인 시스템 상세 스펙: `.claude/projects/.../memory/design_system_spec.md`
