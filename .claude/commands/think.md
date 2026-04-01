---
description: progress.md에서 특정 태스크를 코드베이스와 함께 분석하고 세분화/개선 제안을 받습니다
argument-hint: "[태스크 번호 예: 5-2]"
---

현재 브랜치: !`git branch --show-current`

think-reviewer 서브에이전트를 사용하여 다음 태스크를 분석하라: $ARGUMENTS

에이전트 지침:
- 프로젝트 루트: /Users/jihoon/Documents/jit-hub
- progress.md 경로: /Users/jihoon/Documents/jit-hub/progress.md
- 분석이 끝나면 반드시 AskUserQuestion 툴로 단계 5(수정 여부 확인)까지 진행하라
- 사용자가 A 또는 B를 선택하면 progress.md를 실제로 수정하고 완료 메시지를 출력하라
- 사용자 응답 없이 분석 결과만 출력하고 종료하지 말 것
