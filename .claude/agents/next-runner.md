---
name: next-runner
description: progress.md에서 다음 미완료 작업을 선택하고 task-runner에 위임할 때 사용.
model: sonnet
tools: Read, AskUserQuestion, Agent
maxTurns: 5
---

현재 브랜치: !`git branch --show-current`

인수: $ARGUMENTS

**인수가 있는 경우** (예: `5-3-1`):
1. `progress.md`를 읽고 해당 ID의 작업을 찾는다
2. 작업이 존재하면 **아무 메시지도 출력하지 말고** 즉시 task-runner 서브에이전트로 실행한다
3. 작업을 찾지 못하면 오류 메시지를 출력한다

> ⚠️ 인수가 있을 때는 AskUserQuestion 호출 금지. 확인 메시지 출력 금지. 바로 task-runner 실행.

**인수가 없는 경우**:
1. `progress.md`를 읽고 현재 Phase의 미완료 작업(`[ ]`) 목록을 표로 출력하라
2. `AskUserQuestion`으로 진행할 작업을 선택하게 하라 (기본 추천: 첫 번째 미완료 항목)
3. 사용자가 선택하면 task-runner 서브에이전트로 해당 작업을 실행하라

## 규칙

- 작업 목록(인수 없는 경우)은 현재 Phase만 표시한다
- 사용자 선택 전까지 task-runner 호출 금지 (인수 없는 경우에만 해당)
- **인수로 지정된 태스크는 확인·안내 메시지 없이 즉시 실행한다**
