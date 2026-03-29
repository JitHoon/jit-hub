# Hooks 레퍼런스

위치: .claude/settings.json의 hooks 섹션

## 4가지 이벤트

| 이벤트           | 발동 시점        | 용도                      |
| ---------------- | ---------------- | ------------------------- |
| PreToolUse       | 도구 실행 전     | 차단 (exit 2), 검증       |
| PostToolUse      | 도구 완료 후     | 자동 포맷, 자동 테스트    |
| UserPromptSubmit | 프롬프트 제출 시 | 컨텍스트 주입, Skill 제안 |
| Stop             | 에이전트 완료 시 | 계속 진행 유도, 완료 검증 |

## 응답 형식 (stderr로 JSON 출력)

```json
{
  "block": true,
  "message": "차단 이유",
  "feedback": "정보",
  "continue": false
}
```

## Exit 코드

- 0: 성공
- 2: 차단 (PreToolUse만, exit 2 + JSON으로 block: true)
- 기타: 비차단 에러

## 실전 패턴

main 브랜치 편집 차단 (PreToolUse):

```json
{
  "matcher": "Edit|Write",
  "hooks": [
    {
      "type": "command",
      "command": "[ \"$(git branch --show-current)\" != \"main\" ] || { echo '{\"block\": true, \"message\": \"main 브랜치 편집 금지\"}' >&2; exit 2; }",
      "timeout": 5
    }
  ]
}
```

.ts/.tsx 편집 후 자동 타입 체크 + ESLint (PostToolUse):

```json
{
  "matcher": "Write|Edit",
  "hooks": [
    {
      "type": "command",
      "command": "FILE=\"$CLAUDE_FILE_PATH\"; if echo \"$FILE\" | grep -qE '\\.(ts|tsx)$'; then bunx tsc --noEmit --pretty 2>&1 | head -20 || true; fi",
      "timeout": 30
    },
    {
      "type": "command",
      "command": "FILE=\"$CLAUDE_FILE_PATH\"; if echo \"$FILE\" | grep -qE '\\.(ts|tsx|js|jsx)$' && [ -f node_modules/.bin/eslint ]; then bunx eslint --no-error-on-unmatched-pattern --max-warnings 0 \"$FILE\" 2>&1 | head -20 || true; fi",
      "timeout": 30
    }
  ]
}
```

프롬프트 제출 시 컨텍스트 자동 주입 (UserPromptSubmit):

```json
{
  "matcher": "",
  "hooks": [
    {
      "type": "command",
      "command": "BRANCH=$(git branch --show-current 2>/dev/null || echo N/A) && NODES=$(ls content/nodes/*.md 2>/dev/null | wc -l | tr -d ' ') && printf '{\"feedback\": \"[context] branch: %s | nodes: %s\"}' \"$BRANCH\" \"${NODES:-0}\" >&2",
      "timeout": 5
    }
  ]
}
```

에이전트 완료 시 빌드 검증 리마인더 (Stop):

```json
{
  "matcher": "",
  "hooks": [
    {
      "type": "command",
      "command": "[ -f package.json ] && printf '{\"feedback\": \"[reminder] bun run build로 빌드 검증을 권장합니다.\"}' >&2 || true",
      "timeout": 5
    }
  ]
}
```

## Agent 내부 Hooks (on-demand)

Agent 프론트매터에 hooks: 필드로 해당 Agent에만 적용되는 훅을 설정 가능.
Skill 안에서도 on-demand hooks를 정의할 수 있다 (예: /careful 블록, /freeze 블록).
