---
description: 현재 PR의 체크리스트 항목을 코드베이스와 대조하여 통과 여부를 검증합니다
---

현재 브랜치: !`git branch --show-current`
PR 정보: !`gh pr view --json number,title,headRefName,body 2>/dev/null || gh pr list --state open --json number,title,headRefName,body --limit 1 | jq '.[0] // empty'`

위 PR 정보에서:
1. PR 번호, 제목, 브랜치명을 확인하라. 현재 브랜치와 다른 경우 "(브랜치 자동 감지됨)" 을 명시하라.
2. 본문에서 체크리스트 항목(- [ ] 로 시작하는 줄)을 추출하라.
3. 각 항목을 코드베이스와 대조하여 ✅ 통과 / ❌ 실패로 검증하라.
