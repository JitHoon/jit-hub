---
name: next-runner
description: progress.md에서 다음 미완료 작업을 선택하고 task-runner에 위임할 때 사용.
model: sonnet
tools: Read, AskUserQuestion, Agent
maxTurns: 5
---

현재 브랜치: !`git branch --show-current`

1. `progress.md`를 읽고 현재 Phase의 미완료 작업(`[ ]`) 목록을 표로 출력하라
2. `AskUserQuestion`으로 진행할 작업을 선택하게 하라 (기본 추천: 첫 번째 미완료 항목)
3. 사용자가 선택하면 task-runner 서브에이전트로 해당 작업을 실행하라

## 규칙

- 작업 목록은 현재 Phase만 표시한다
- 사용자 선택 전까지 task-runner 호출 금지
