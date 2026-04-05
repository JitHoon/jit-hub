# 01. 프로젝트 수치 대시보드

## 기본 정보

| 항목 | 값 |
|------|------|
| 프로젝트명 | 3D GIS 지식 포트폴리오 |
| 기간 | 2026-03-30 ~ 2026-04-05 (7일) |
| 배포 | Vercel Hobby (무료) |

## 코드 정량 지표

| 항목 | 값 | 비고 |
|------|------|------|
| 총 커밋 수 | 243 | 일평균 ~35 커밋 |
| 머지된 PR 수 | 27 | 일평균 ~4 PR |
| 총 LOC (src/) | 4,644 | TypeScript/TSX |
| 콘텐츠 노드 수 | 21 | contents/nodes/*.md |
| 유닛 테스트 파일 | 4 | *.test.ts (co-located) |
| E2E 테스트 스위트 | 7 | test/e2e/*.spec.ts |

## 하네스 정량 지표

| 항목 | 값 | 비고 |
|------|------|------|
| 스킬 (Skills) | 11 | 각각 SKILL.md + references/ + examples/ |
| 에이전트 (Agents) | 13 | 도메인별 특화 |
| 커맨드 (Commands) | 12 | 워크플로우 진입점 |
| 훅 (Hooks) | 7 | 4개 이벤트 (Pre/Post/Submit/Stop) |
| 룰 (Rules) | 1 | code-style.md |
| .claude/ 내 .md 파일 | 71 | 전체 하네스 문서 |
| CLAUDE.md | 99줄 | 권장 범위(60~200줄) 이내 |
| project-blueprint-v2 | 259줄 | 아키텍처 설계 문서 |

## 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 16 |
| 언어 | TypeScript (strict) | 5.9 |
| 스타일링 | Tailwind CSS | 4 |
| 3D 시각화 | react-force-graph-3d + three.js | - |
| 콘텐츠 | gray-matter + Zod + next-mdx-remote | - |
| 테스트 (유닛) | Vitest | - |
| 테스트 (E2E) | Playwright | - |
| 배포 | Vercel | Hobby |
| CI | GitHub Actions | - |
| 패키지 매니저 | bun | - |

## Phase별 진행 현황

| Phase | 주요 내용 | 비고 |
|-------|----------|------|
| 1 | 프로젝트 초기화, CI/CD | PR #1 |
| 2 | 하네스 엔지니어링 기초 | PR #2 |
| 3 | 디자인 시스템 | PR #2 |
| 4~8 | 콘텐츠 파이프라인 + 그래프 | 핵심 기능 구현 |
| 9 | 접근성 + 폴리시 | WebGL 폴백, LOD |
| 10~11 | 홈 리디자인 + SEO | 듀얼 라우트, JSON-LD |
| 12 | SEO 강화 | sitemap, robots, OG |
| 13~15 | MVP 후 정리 + UI 개선 | 푸터, 스크롤 인디케이터 |

## 핵심 비율

| 비율 | 값 | 해석 |
|------|------|------|
| 커밋/일 | ~35 | AI 협업으로 달성한 높은 생산성 |
| PR/일 | ~4 | 작은 단위의 빈번한 머지 |
| LOC/커밋 | ~19 | 적절한 커밋 크기 |
| 하네스 .md / 소스 LOC | 71/4644 | 소스 65줄당 하네스 문서 1개 |
| E2E 테스트/기능 | 7/~10 | 주요 기능 대부분 커버 |

## 액션 아이템

- [ ] 프로젝트 완료 시 최종 대시보드 업데이트
- [ ] Lighthouse 성능 점수 베이스라인 측정 후 추가
- [ ] 토큰 사용량 데이터 확보 시 추가 (Claude Code 사용 통계)
