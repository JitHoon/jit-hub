---
description: Phase 완료 시 검증 → Push → PR 생성을 자동으로 수행합니다
---

현재 브랜치: !`git branch --show-current`
미커밋 변경: !`git status --short | wc -l | tr -d ' '`

pr-creator 서브에이전트를 사용하여 현재 브랜치의 PR을 생성하라: $ARGUMENTS
