---
description: 현재 PR의 체크리스트 항목을 코드베이스와 대조하여 통과 여부를 검증합니다
---

현재 브랜치: !`git branch --show-current`
PR 체크리스트:
!`gh pr view --json body -q '.body'`

위 PR 본문에서 체크리스트 항목(- [ ] 로 시작하는 줄)을 추출하고, 각 항목을 코드베이스와 대조하여 ✅ 통과 / ❌ 실패로 검증하라.
