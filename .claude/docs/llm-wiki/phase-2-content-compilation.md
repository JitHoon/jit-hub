# Phase 2: 콘텐츠 컴파일 (Karpathy 패턴의 핵심)

> **선행 조건**: Phase 1 완료 (빌드 통과)
> **완료 조건**: `bun run build` 통과 + 모든 노드 lint 깨끗
> **참조**: GUIDE.md, knowledge-map.json, slug-audit.md

---

## 핵심 원칙

**기존 본문을 보존하지 않는다.** raw 소스를 기반으로 LLM이 encyclopedia-style로 완전히 새로 작성한다.

---

## TODO 2-1: content-compiler 에이전트 + /compile 커맨드 생성

### 생성할 파일

#### `.claude/agents/content-compiler.md`

**에이전트 프론트매터**:
```yaml
name: content-compiler
description: raw 소스를 읽고 contents/nodes/에 위키 글을 컴파일합니다
model: sonnet
tools: Read, Write, Grep, Glob, Bash(bun:*)
maxTurns: 30
skills: content-pipeline
```

**에이전트 동작**:
1. `.claude/docs/llm-wiki/knowledge-map.json` 읽기 — 분류 체계 파악
2. `contents/raw/existing-nodes/{slug}.md` 읽기 — 원본 소스
3. `contents/nodes/` 기존 노드의 프론트매터 읽기 — 관계 파악
4. 새 .md 파일 작성:
   - 프론트매터: knowledge-map.json의 클러스터, 관계 반영
   - 본문: encyclopedia-style, 한국어, 마크다운
5. 관련 기존 노드의 프론트매터 관계 필드도 업데이트
6. `bun run build` 실행하여 검증

**프론트매터 스키마**:
```yaml
slug: "kebab-case"
title: "한국어 제목"
cluster: "knowledge-map의 클러스터 ID"
difficulty: "beginner|intermediate|advanced|expert"
prerequisites: ["slug1", "slug2"]
relatedConcepts:
  - slug: "slug3"
    relationship: "관계 설명"
childConcepts: ["slug4"]
tags: ["tag1", "tag2"]
```

**본문 작성 가이드**:
- 한국어 기술 문서 스타일
- 코드 예시 포함 (관련 있으면)
- 다른 노드 참조 시 slug 언급
- 분량: 500~2000자 (개념 복잡도에 비례)

#### `.claude/commands/compile.md`
```markdown
---
description: raw 소스에서 wiki 노드를 컴파일합니다
argument-hint: "<slug | all>"
---

content-compiler 에이전트를 사용하여 다음 노드를 컴파일하라: $ARGUMENTS

all이면 knowledge-map.json의 모든 노드를 의존 순서대로 컴파일한다.
```

### 참고 패턴
- `.claude/agents/content-writer.md` — 기존 에이전트 구조
- `.claude/skills/harness-engineering/SKILL.md` — 에이전트 작성 규칙

---

## TODO 2-2: 21개 노드 전부 컴파일

### 컴파일 순서 원칙
선수지식(prerequisites)이 없는 노드부터 시작하여, 이미 컴파일된 노드만 참조하도록 순서를 정한다.

### 작업 흐름 (노드당)
1. `contents/raw/existing-nodes/{slug}.md` 읽기
2. knowledge-map.json에서 해당 slug의 새 클러스터 확인
3. `contents/nodes/{slug}.md` 새로 작성:
   - 프론트매터: 새 클러스터, 기존/새 관계
   - 본문: raw 기반 encyclopedia-style 재작성
4. 관련 노드의 프론트매터 관계 필드 업데이트
5. `bun run build` 실행 → 에러 확인

### 주의사항
- slug는 파일명과 동일해야 함 (`{slug}.md`)
- 모든 관계의 대상 slug가 실제 존재해야 함 (빌드 시 검증됨)
- 한 번에 3~5개씩 배치 컴파일 후 빌드 검증 권장

---

## TODO 2-3: Lint 실행

### 검사 항목
1. **양방향 참조 일관성**: A가 B를 prerequisites에 넣으면, B의 relatedConcepts에 A가 있어야 함
2. **고아 노드**: 아무 노드에서도 참조하지 않는 노드
3. **모순 감지**: 동일 개념에 대해 다른 노드에서 상충하는 설명
4. **누락 개념**: 본문에서 언급되지만 독립 노드가 없는 개념
5. **프론트매터 완전성**: 모든 필수 필드 존재, slug 형식 올바름, 태그 최소 1개

### 실행 방법
```bash
bun run build  # Zod 검증 + slug 참조 검증 자동 실행
```

수동 검사:
- 모든 노드의 프론트매터를 읽고 관계 필드 교차 검증
- 본문에서 다른 노드 slug가 언급되는데 관계 필드에 없는 경우 추가

---

## TODO 2-4: 최종 빌드 검증

```bash
bun run build   # graph-data.json 정상 생성 확인
bun run lint    # 코드 린트
```

### 확인 사항
- graph-data.json에 모든 노드 포함
- 엣지 수가 합리적 (모든 관계가 반영되었는지)
- 클러스터별 노드 수 균형 (극단적 편향 없는지)
