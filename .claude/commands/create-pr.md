---
description: Phase 완료 시 검증 → 커밋 → PR 생성을 자동으로 수행합니다
---

## 지시사항

현재 브랜치의 Phase가 완료되었을 때, 검증 → 커밋 → Push → PR 생성까지 일괄 수행하라.

## 프로세스

### 1단계: Phase 파악

1. `progress.md`를 읽어라
2. 현재 브랜치(`git branch --show-current`)가 어느 Phase에 해당하는지 "피처 브랜치 순서" 테이블에서 확인하라
3. 해당 Phase의 모든 항목이 `[x]`인지 확인하라
4. 미완료 항목이 있으면 → 목록을 보여주고 **PR 생성을 중단**하라

### 2단계: 검증

1. 해당 Phase의 **검증 기준**을 `progress.md`에서 찾아 실행하라
2. 검증 실패 시 → 실패 내용을 안내하고 중단하라

### 3단계: 커밋 + Push

1. `git status`로 미커밋 변경사항 확인
2. 변경사항이 있으면 → 관련 파일만 staging 후 커밋 (`feat: Phase {N} - {Phase 제목}`)
3. `git push -u origin {브랜치명}`

### 4단계: PR 생성

`gh pr create`로 PR을 생성하라:

- **title**: `feat: Phase {N} 완료 — {Phase 제목}`
- **base**: `main`
- **body**: 아래 형식 사용

```
## Summary
- Phase {N}: {Phase 제목} 완료
- {완료된 항목을 불릿으로 나열}

## Verification
- {검증 기준}: {통과/실패 결과}

## Checklist
- [ ] 코드 리뷰
- [ ] main merge

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### 5단계: progress.md 업데이트

1. "현재 단계" 섹션을 갱신하라 (예: `Phase 0~3 완료 → **Phase 4 진행 중**`)
2. 생성된 PR URL을 사용자에게 안내하라

## Gotchas

- PR base는 항상 `main`
- 검증 실패 시 PR 생성하지 마라
- `gh` CLI 미인증 시 → `gh auth login` 안내
- 1 Phase = 1 브랜치 (여러 브랜치에 걸치지 않음)
