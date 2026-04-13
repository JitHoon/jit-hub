# Phase 4: 운영 명령 구축

> **선행 조건**: Phase 3 완료 (시각 확인 통과)
> **완료 조건**: 3개 커맨드 수동 테스트 통과
> **참조**: GUIDE.md, `.claude/docs/planning/llm-wiki-migration.md` §4 Phase 4

---

## 핵심 원칙

Karpathy 원본의 3가지 운영 명령 (ingest, lint, query)을 하네스에 통합한다.
각 명령은 **Command → Agent** 패턴으로 구현한다.

---

## TODO 4-1: /ingest 커맨드 + 에이전트

### 생성할 파일

#### `.claude/commands/ingest.md`
```markdown
---
description: raw/의 소스를 읽고 wiki(contents/nodes/)를 업데이트합니다
argument-hint: "<raw 폴더 내 파일 경로 또는 주제 설명>"
---

wiki-ingestor 에이전트를 사용하여 다음 소스를 ingest하라: $ARGUMENTS
```

#### `.claude/agents/wiki-ingestor.md`

**에이전트 프론트매터**:
```yaml
name: wiki-ingestor
description: 새 소스를 분석하여 위키에 통합합니다
model: sonnet
tools: Read, Write, Grep, Glob, Bash(bun:*)
maxTurns: 30
skills: content-pipeline
```

**에이전트 동작** (Karpathy 원본과 동일):
1. `contents/nodes/`의 모든 프론트매터 읽기 → 기존 글 목록 파악
2. 새 소스에서 기존에 없는 개념 식별
3. 새 개념마다 `contents/nodes/`에 .md 생성
4. 기존 관련 글의 프론트매터 관계 필드 업데이트
5. `bun run build` 실행하여 검증

### 참조 파일
- `.claude/agents/content-writer.md` — 기존 에이전트 패턴
- `.claude/skills/harness-engineering/SKILL.md` — 에이전트 작성 규칙
- `.claude/skills/content-pipeline/SKILL.md` — 프론트매터 스키마

---

## TODO 4-2: /lint-wiki 커맨드 + 에이전트

### 생성할 파일

#### `.claude/commands/lint-wiki.md`
```markdown
---
description: 위키 건강 점검 — 모순, 고아 페이지, 누락 개념 감지
---

wiki-linter 에이전트를 사용하여 위키 건강 점검을 수행하라.
```

#### `.claude/agents/wiki-linter.md`

**에이전트 프론트매터**:
```yaml
name: wiki-linter
description: 위키 건강 점검을 수행합니다
model: sonnet
tools: Read, Grep, Glob, Bash(bun:*)
maxTurns: 20
skills: content-pipeline
```

**에이전트 동작** (Karpathy 원본과 동일):
1. `contents/nodes/`의 모든 글 읽기 (프론트매터 + 본문)
2. 검사 항목:
   - 모순되는 주장 (동일 개념에 대한 상충 설명)
   - 누락된 backlink (A→B 참조 시 B→A도 있어야 함)
   - 본문에서 언급되지만 독립 글이 없는 개념
   - 고아 글 (아무 글에서도 참조하지 않는 글)
   - 프론트매터에 존재하지 않는 slug 참조
   - 클러스터 편향 (한 클러스터에 과도하게 집중)
3. 누락된 글의 stub 제안
4. 결과를 구조화된 리포트로 출력

### 주의사항
- **Write 도구 없음** — 읽기 전용
- 결과는 콘솔에 출력, 파일로 저장하지 않음

---

## TODO 4-3: /query 커맨드 + 에이전트

### 생성할 파일

#### `.claude/commands/query.md`
```markdown
---
description: 위키 전체를 기반으로 질문에 답변합니다
argument-hint: "<질문>"
---

wiki-querier 에이전트를 사용하여 다음 질문에 답변하라: $ARGUMENTS
```

#### `.claude/agents/wiki-querier.md`

**에이전트 프론트매터**:
```yaml
name: wiki-querier
description: 위키를 기반으로 질문에 답변합니다
model: sonnet
tools: Read, Grep, Glob
maxTurns: 15
```

**에이전트 동작** (Karpathy 원본과 동일):
1. `contents/nodes/`의 모든 프론트매터 읽기 → 관련 글 식별
2. 관련 글의 본문 읽기
3. 답변 생성 (노드 인용 포함)

### 답변 형식
- 관련 노드를 `[제목](/nodes/slug)` 형태로 인용
- 여러 노드의 지식을 종합하여 답변
- 출처 노드 목록을 답변 끝에 첨부

---

## TODO 4-4: 수동 테스트

### /ingest 테스트
```
/ingest "WebAssembly를 활용한 3D 렌더링 최적화에 대한 내용을 추가해줘"
```
기대 결과: 새 노드 생성 또는 기존 관련 노드 업데이트 + 빌드 통과

### /lint-wiki 테스트
```
/lint-wiki
```
기대 결과: 구조화된 건강 점검 리포트 출력

### /query 테스트
```
/query "좌표 변환은 어떻게 작동하는가?"
```
기대 결과: coordinate-transform, geoid-correction, meridian-convergence 등 관련 노드를 인용한 종합 답변

---

## Phase 4 완료 후 마무리

### content-pipeline SKILL.md 최종 업데이트
새로 추가된 커맨드와 에이전트를 SKILL.md에 문서화:
- `/ingest` — 새 소스 통합
- `/lint-wiki` — 위키 건강 점검
- `/query` — 위키 기반 질의 응답
- `/compile` — raw에서 노드 컴파일 (Phase 2)
