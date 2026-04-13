# LLM Wiki Migration Guide

> **목적**: Karpathy의 LLM Wiki 패턴으로 JIT-Hub 지식 그래프를 재구조화한다.
> **원본 계획**: `.claude/docs/planning/llm-wiki-migration.md`

---

## 핵심 원리

기존 21개 노드를 **raw 소스에서 완전히 새로 컴파일**한다.
9개 고정 클러스터 대신, **콘텐츠에서 자연스럽게 도출되는 분류 체계**를 사용한다.

## Phase 흐름도

```
Phase 0: raw 수집 + 지식 맵 도출
  ↓ (사용자 승인)
Phase 1: 스키마 적응 (클러스터 상수 + Zod + 타입 + 테스트 + 스토리)
  ↓ (bun run build + test 통과)
Phase 2: 콘텐츠 컴파일 (21개 노드 전부 재작성)
  ↓ (bun run build 통과)
Phase 3: 시각화 적응 (검증 + 문서 업데이트)
  ↓ (bun run build + test + 시각 확인)
Phase 4: 운영 명령 구축 (/ingest, /lint-wiki, /query)
  ↓ (수동 테스트)
완료
```

## 유지하는 것

| 항목 | 이유 |
|------|------|
| UI/시각화 코드 (react-force-graph-3d, 컴포넌트) | 코드 구조 유지, 상수/매핑만 교체 |
| 빌드 파이프라인 (gray-matter + Zod + next-mdx-remote) | 검증된 파이프라인 |
| SEO 이중 경로 (`/` + `/nodes/[slug]`) | SEO 보존 |
| 하네스 구조 (Command → Agent → Skill) | 기존 인프라 활용 |

## 바꾸는 것

| 항목 | Before | After |
|------|--------|-------|
| 클러스터 분류 | 9개 고정 | raw에서 자연 도출 |
| 노드 본문 | 수동 작성 | LLM이 raw 기반으로 컴파일 |
| 콘텐츠 운영 | 수동 | /ingest, /lint-wiki, /query 명령 |
| 클러스터 상수 | `src/constants/cluster.ts` 하드코딩 | 새 분류 체계로 교체 |

## 핵심 위험: 클러스터 상수 변경

`src/constants/cluster.ts`의 `CLUSTER_IDS` 튜플은 ~48개 파일에서 참조된다.
변경 시 TypeScript가 모든 참조 지점에서 컴파일 에러를 발생시킨다.
이것은 **안전 장치**다 — 놓치는 곳 없이 전부 수정할 수 있다.

**자동 적응 파일** (코드 변경 불필요):
- ClusterBadge, ClusterDot, ConnectionTree (ClusterId prop 받아 lookup)
- FullNodeTree, useNodeSearch (CLUSTER_IDS 이터레이션)
- graph-helpers (resolveClusterColor에 fallback 있음)
- builder.ts (Object.entries(CLUSTERS) 이터레이션)

**수동 수정 필요 파일**:
- 테스트: cluster.test.ts, schema.test.ts, builder.test.ts, graph-helpers.test.ts 등
- 스토리: 8개 .stories.tsx 파일
- 콘텐츠: 21개 .md 파일 (Phase 2에서 전부 재생성)

## Phase별 상세 참조 문서

- [Phase 0: raw 수집 + 지식 맵](./phase-0-raw-and-knowledge-map.md)
- [Phase 1: 스키마 적응](./phase-1-schema-adaptation.md)
- [Phase 2: 콘텐츠 컴파일](./phase-2-content-compilation.md)
- [Phase 3: 시각화 적응](./phase-3-visualization-adaptation.md)
- [Phase 4: 운영 명령 구축](./phase-4-operational-commands.md)

## TODO 체크리스트 (전체)

- [ ] **0-1** raw/ 디렉토리 생성 + .gitignore 추가
- [ ] **0-2** 사용자 `raw/my-preferences.md` 작성
- [ ] **0-3** LLM 분류 체계 분석 → knowledge-map.json
- [ ] **0-4** slug 안정성 감사 → slug-audit.md
- [ ] **--- 사용자 리뷰 게이트 ---**
- [ ] **1-1** 클러스터 상수 교체 (`src/constants/cluster.ts`)
- [ ] **1-2** Zod 스키마 검증 (자동 반영 확인)
- [ ] **1-3** 테스트 파일 업데이트 (cluster, schema, builder, graph-helpers)
- [ ] **1-4** 스토리북 파일 업데이트 (8개 .stories.tsx)
- [ ] **1-5** `bun run build` + `bun run test` 통과 확인
- [ ] **--- 빌드 검증 게이트 ---**
- [ ] **2-1** content-compiler 에이전트 + /compile 커맨드 생성
- [ ] **2-2** 21개 노드 전부 컴파일 (의존 순서대로)
- [ ] **2-3** lint 실행 (양방향 참조, 고아 노드, 모순 검사)
- [ ] **2-4** `bun run build` 통과 확인
- [ ] **--- 콘텐츠 검증 게이트 ---**
- [ ] **3-1** 그래프 빌더 + 헬퍼 검증
- [ ] **3-2** UI 컴포넌트 검증 (FullNodeTree, SearchSuggestions)
- [ ] **3-3** content-pipeline SKILL.md 문서 업데이트
- [ ] **3-4** `bun run build` + `bun run test` + dev 서버 시각 확인
- [ ] **--- 시각 검증 게이트 ---**
- [ ] **4-1** /ingest 커맨드 + wiki-ingestor 에이전트 생성
- [ ] **4-2** /lint-wiki 커맨드 + wiki-linter 에이전트 생성
- [ ] **4-3** /query 커맨드 + wiki-querier 에이전트 생성
- [ ] **4-4** 3개 커맨드 수동 테스트
