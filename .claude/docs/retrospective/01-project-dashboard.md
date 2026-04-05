# 01. 프로젝트 수치 대시보드

## 이 문서의 위치

> **Tier 1: 맥락 파악** — 프로젝트의 규모와 의사결정을 이해하는 출발점
>
> 📍 현재 문서: **01-project-dashboard** (1/17)
>
> **권장 읽기 순서**: 01 → 06 → 03 → 04 → 05 → 02 → 10 → 07 → 08 → 09 → 14 → 15 → 12 → 11 → 13 → 16 → 17
>
> 다음 문서: [06-decision-timeline](./06-decision-timeline.md)

## 기본 정보

| 항목 | 값 |
|------|------|
| 프로젝트명 | 3D GIS 지식 포트폴리오 |
| 기간 | 2026-03-30 ~ 2026-04-05 (7일) |
| 배포 | Vercel Hobby (무료) |

## 코드 정량 지표

| 항목 | 값 | 비고 |
|------|------|------|
| 총 커밋 수 | 222 | 일평균 ~32 커밋 (main 기준) |
| 머지된 PR 수 | 26 | 일평균 ~3.7 PR (main 기준) |
| 총 LOC (src/) | 4,644 | TypeScript/TSX |
| 콘텐츠 노드 수 | 21 | contents/nodes/*.md |
| 유닛 테스트 파일 | 5 | *.test.ts (co-located) |
| E2E 테스트 스위트 | 7 | test/e2e/*.spec.ts |

## 하네스 정량 지표

| 항목 | 값 | 비고 |
|------|------|------|
| 스킬 (Skills) | 11 | 각각 SKILL.md + references/ + examples/ |
| 에이전트 (Agents) | 13 | 도메인별 특화 |
| 커맨드 (Commands) | 12 | 워크플로우 진입점 |
| 훅 (Hooks) | 6 | 4개 이벤트 (Pre 2 + Post 2 + Submit 1 + Stop 1) |
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
| 0 | 클러스터 9개 매핑 + 21개 노드 | 데이터 설계 |
| 1~2 | Next.js 16 초기화, Git/CI 설정 | PR #1 |
| 3-A/B | 디자인 시스템 토큰 + 하네스 | PR #2 |
| 4 | 콘텐츠 파이프라인 (Zod + MDX) | 핵심 기능 |
| 5~7 | 3D 그래프 + 콘텐츠 패널 + 분할 뷰 | 핵심 기능 |
| 8 | 홈페이지 리디자인 v2 | SiteHeader, 3D 인터랙션 |
| 9 | WebGL 폴백 + 접근성 + 모바일 LOD | 폴리시 |
| 10~12 | SEO + Vercel 배포 + CI | MVP 완성 |

## 핵심 비율

| 비율 | 값 | 해석 |
|------|------|------|
| 커밋/일 | ~32 | AI 협업으로 달성한 높은 생산성 |
| PR/일 | ~3.7 | 작은 단위의 빈번한 머지 |
| LOC/커밋 | ~21 | 적절한 커밋 크기 |
| 하네스 .md / 소스 LOC | 71/4644 | 소스 65줄당 하네스 문서 1개 |
| E2E 테스트/기능 | 7/~10 | 주요 기능 대부분 커버 |

## 심화 탐구 가이드

### 이 회고를 더 깊이 파고들 때 확인할 것
- [ ] Lighthouse 4개 카테고리(성능/접근성/SEO/Best Practices) 점수 측정
- [ ] `@next/bundle-analyzer`로 번들 구성 시각화
- [ ] Phase별 커밋 수 분포 분석 (어떤 Phase에 가장 많은 노력이 들었나)
- [ ] 하네스 파일 대비 소스 코드 비율이 프로젝트 성숙도에 미친 영향 분석

### 관련 소스 파일
- `package.json` — 의존성 전체 목록
- `progress.md` — Phase별 진행 현황 원본
- `.claude/settings.json` — 훅/권한 설정

### 관련 회고 문서
- [06-decision-timeline](./06-decision-timeline.md) — 수치 뒤에 숨겨진 의사결정 맥락
- [10-workflow-efficiency](./10-workflow-efficiency.md) — 커밋/PR 분포의 워크플로우 분석
- [08-performance-bundle](./08-performance-bundle.md) — 성능 측정 계획

## 액션 아이템

- [ ] 프로젝트 완료 시 최종 대시보드 업데이트
- [ ] Lighthouse 성능 점수 베이스라인 측정 후 추가
- [ ] 토큰 사용량 데이터 확보 시 추가 (Claude Code 사용 통계)
