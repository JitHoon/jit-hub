# LLM Wiki Migration 가이드 문서 생성

## Context
Karpathy의 LLM Wiki 패턴을 JIT-Hub에 적용하여 21개 지식 노드를 재구조화하는 마이그레이션 작업의 **가이드 문서 + TODO 리스트 + Phase별 참조 문서**를 생성한다. 각 Phase를 별도 세션에서 진행할 수 있도록 충분한 컨텍스트를 담은 독립적 참조 문서를 만든다.

## 생성된 문서 (`.claude/docs/llm-wiki/`)

| 문서 | 역할 |
|------|------|
| `GUIDE.md` | 마스터 가이드 — 전체 흐름, TODO 체크리스트, 위험 분석 |
| `phase-0-raw-and-knowledge-map.md` | raw/ 생성, my-preferences.md 템플릿, knowledge-map.json 스키마, slug 감사 |
| `phase-1-schema-adaptation.md` | cluster.ts 교체, Zod 검증, 테스트/스토리북 업데이트, 빌드 검증 |
| `phase-2-content-compilation.md` | content-compiler 에이전트, 21개 노드 컴파일 순서, lint 검사 |
| `phase-3-visualization-adaptation.md` | 그래프 빌더/헬퍼 검증, UI 컴포넌트 검증, SKILL.md 업데이트 |
| `phase-4-operational-commands.md` | /ingest, /lint-wiki, /query 커맨드+에이전트 생성 |

## TODO 전체 요약 (20개 항목)

### Phase 0: raw + 지식 맵 (4개)
- 0-1: raw/ 디렉토리 생성 + .gitignore
- 0-2: 사용자 my-preferences.md 작성 (사용자 작업)
- 0-3: LLM 분류 체계 분석 → knowledge-map.json
- 0-4: slug 안정성 감사

### Phase 1: 스키마 적응 (5개)
- 1-1: cluster.ts 상수 교체
- 1-2: Zod 스키마 검증
- 1-3: 테스트 파일 업데이트
- 1-4: 스토리북 파일 업데이트 (8개)
- 1-5: bun run build + test 통과

### Phase 2: 콘텐츠 컴파일 (4개)
- 2-1: content-compiler 에이전트 + /compile 커맨드
- 2-2: 21개 노드 전부 컴파일
- 2-3: lint (양방향 참조, 고아, 모순)
- 2-4: bun run build 통과

### Phase 3: 시각화 적응 (4개)
- 3-1: 그래프 빌더 + 헬퍼 검증
- 3-2: UI 컴포넌트 검증
- 3-3: content-pipeline SKILL.md 업데이트
- 3-4: 종합 검증 (빌드 + 테스트 + 시각)

### Phase 4: 운영 명령 (4개 — 나중 가능)
- 4-1: /ingest 커맨드 + 에이전트
- 4-2: /lint-wiki 커맨드 + 에이전트
- 4-3: /query 커맨드 + 에이전트
- 4-4: 수동 테스트

## 핵심 위험
- `src/constants/cluster.ts` 변경 → ~48개 파일에 전파 (TypeScript가 전부 잡아줌)
- Phase 1에서 콘텐츠 cluster 필드도 임시 변경 필요 (빌드 통과를 위해)

## 검증 방법
- 각 Phase 끝: `bun run build` + `bun run test`
- Phase 3: dev 서버에서 시각 확인
- Phase 4: 커맨드 수동 실행
