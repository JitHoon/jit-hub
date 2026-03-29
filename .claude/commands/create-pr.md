---
description: Phase 완료 시 검증 → Push → PR 생성을 자동으로 수행합니다
---

## 지시사항

현재 브랜치의 Phase가 완료되었을 때, 검증 → Push → PR 생성까지 일괄 수행하라.
개별 작업 커밋은 `/next`에서 이미 완료된 상태이므로 여기서는 커밋하지 않는다.

## 프로세스

### 1단계: Phase 파악

1. `progress.md`를 읽어라
2. 현재 브랜치(`git branch --show-current`)가 어느 Phase에 해당하는지 "피처 브랜치 순서" 테이블에서 확인하라
3. 해당 Phase의 모든 항목이 `[x]`인지 확인하라
4. 미완료 항목이 있으면 → 목록을 보여주고 **PR 생성을 중단**하라

### 2단계: 검증

1. 해당 Phase의 **검증 기준**을 `progress.md`에서 찾아 실행하라
2. 검증 실패 시 → 실패 내용을 안내하고 중단하라

### 3단계: 잔여 변경사항 처리 + Push

1. `git status`로 미커밋 변경사항 확인
2. 변경사항이 있으면 → 관련 파일만 staging 후 커밋 (`chore: Phase {N} 마무리`)
3. `git push -u origin {브랜치명}`

### 4단계: PR 생성

`gh pr create`로 PR을 생성하라:

- **title**: `feat: Phase {N} 완료 — {Phase 제목}`
- **base**: `main`
- **assignee**: `JitHoon`
- **reviewer**: `JitHoon` (단, PR 작성자와 동일하면 GitHub 정책상 실패 → 무시하고 계속 진행)
- **label**: 아래 Phase-라벨 매핑표에서 해당 Phase의 라벨을 사용

#### Phase-라벨 매핑

| Phase | 라벨 |
|-------|------|
| 1-2 | `foundation` |
| 3 | `design` |
| 4 | `pipeline` |
| 5 | `ui` |
| 6 | `seo` |
| 7 | `deploy` |

#### PR body 형식

body에는 **개별 커밋 목록**을 포함하여 리뷰어가 커밋 단위로 리뷰할 수 있게 한다.
`git log main..HEAD --oneline`으로 커밋 목록을 가져온다.

```
## Summary
Phase {N}: {Phase 제목} 완료

## Commits
{git log main..HEAD --oneline 결과를 - 불릿 목록으로 나열}

## Verification
- {검증 기준}: {통과/실패 결과}

## Checklist
- [ ] 커밋 단위 코드 리뷰
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
- 개별 커밋은 `/next`에서 이미 수행됨 — 여기서 큰 커밋을 새로 만들지 마라
