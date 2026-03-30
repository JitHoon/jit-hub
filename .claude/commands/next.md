---
description: progress.md에서 다음 미완료 작업을 보여주고 사용자 확인 후 실행합니다
---

현재 브랜치: !`git branch --show-current`

## 동작 순서

1. progress.md를 읽고 현재 Phase의 미완료 작업(`[ ]`) 목록을 표로 보여줘라
2. 다음 미완료 작업 하나를 추천하고, 사용자에게 "진행하려면 엔터, 다른 작업을 원하면 번호를 입력하세요"라고 물어라 (AskUserQuestion 사용)
3. 사용자가 확인하면 그때 task-runner 서브에이전트로 해당 작업을 실행하라

$ARGUMENTS
