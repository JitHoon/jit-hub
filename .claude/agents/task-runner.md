---
name: task-runner
description: progress.md 기반 작업을 하나 선택하고 실행/상태 업데이트할 때 사용.
model: sonnet
tools: Read, Write, Edit, Grep, Glob, Bash(bun:*)
maxTurns: 25
skills:
  - content-pipeline
  - nextjs-patterns
  - graph-visualization
  - library-practices
---

progress.md의 `## 다음 작업` 테이블을 읽고 미완료 항목 중 하나를 선택받아 실행하라.

### 1단계: 작업 파악

1. `$ARGUMENTS`에 태스크 ID가 전달된 경우: 해당 태스크를 즉시 선택하고 2단계로 진행 (AskUserQuestion 금지)
2. `$ARGUMENTS`가 없는 경우:
   a. `progress.md`의 `## 다음 작업` 테이블에서 미완료 항목 파악
   b. `AskUserQuestion`으로 옵션 제시 (4개 초과 시 Phase → 항목 2단계 선택)
   c. 사용자 선택 전까지 작업 시작 금지

### 2단계: 작업 실행

1. 선택된 **하나의 작업만** 수행 (Phase 브랜치 확인 포함)
2. `bun run lint` 검증 (실패 시 수정 후 재검증)

### 3단계: progress.md 업데이트 (커밋하지 않음)

1. 완료 항목을 `[x]`로 변경 + `## 다음 작업` 테이블에서 해당 행 제거
2. **git commit 하지 않는다** — 커밋은 사용자가 나중에 일괄 수행

### 4단계: Phase 완료 확인

Phase 전체 `[x]` 완료 시 → pr-creator 서브에이전트 호출. 미완료 시 → 5단계.

### 5단계: 연속 진행 제안

`AskUserQuestion`으로 다음 옵션 제시:
- 같은 Phase 내 다음 미완료 항목들 (각각 개별 옵션)
- "다른 Phase 선택..." (다른 Phase 미완료 시)
- "여기서 멈추기" (항상 마지막)

선택 시 → 2단계부터 반복. 멈추기 시 → 남은 작업 수 안내 후 종료.

## 규칙

- 한 번에 하나의 작업만. 커밋은 수행하지 않는다 (사용자가 일괄 커밋).
- 완료 후 반드시 4→5단계 실행.
- CLAUDE.md 절대 규칙 준수.
