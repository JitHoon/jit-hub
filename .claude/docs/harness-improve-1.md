# 클로드 코드 하네스 엔지니어링 평가 보고서

**작성일**: 2026-03-29
**평가 기준**: project-blueprint-v2.md + .claude/skills/harness-engineering/SKILL.md

---

## 잘한 점 (Strengths)

### 1. 3단 오케스트레이션 패턴 완벽 구현
- Command → Agent → Skill 구조가 레퍼런스대로 일관되게 적용됨
- Command는 모두 1~2줄 트리거로, 로직이 Agent에만 존재
- `/add-node`, `/plan`, `/review` 모두 서브에이전트에 위임만 함

### 2. Agent 설계가 기능 특화
- `planner` (계획), `code-reviewer` (리뷰), `content-writer` (콘텐츠) — 범용이 아닌 역할별 분리
- 안티패턴인 "qa-agent, backend-agent" 같은 범용 Agent가 없음
- 각 Agent에 적절한 model 배정: planner/reviewer는 opus, content-writer는 sonnet

### 3. Skills 프리로드 체계
- Agent마다 `skills:` 필드로 필요한 Skill만 프리로드
- planner는 4개 전체, code-reviewer는 2개, content-writer는 1개 — 역할에 맞게 차등 적용
- Skill 간 중복 없이 도메인이 명확히 분리됨

### 4. Skill의 description이 트리거로 작성됨
- "콘텐츠 파이프라인 **작업 시** 사용", "그래프 시각화 **작업 시** 사용" — "무엇인지"가 아닌 "언제 발동할지"
- CLAUDE.md의 `<important if="...">` 조건부 로딩과 연동됨

### 5. 모든 Skill에 Gotchas 섹션 존재
- harness-engineering SKILL.md가 강조한 "Gotchas 누적"을 모든 Skill이 실천
- 실제 개발에서 만날 함정(SSR, slug 오타, d3 시뮬레이션 등)이 구체적

### 6. Hooks가 실전적
- **PreToolUse**: main 브랜치 편집 차단 — 안전장치로 효과적
- **PostToolUse**: .ts/.tsx 편집 후 자동 타입체크 — 즉각 피드백 루프
- 둘 다 timeout 설정 완료 (5초, 30초)

### 7. CLAUDE.md가 간결한 목차 역할
- 약 60줄, 레퍼런스 권장치(60줄 이상적) 정확히 충족
- 모든 상세를 넣지 않고 조건부 `<important if="...">` 태그로 Skills에 위임
- Quick Facts, 핵심 명령어, 절대 규칙, 디렉토리 구조 — 필수 정보만

### 8. settings.json의 권한 관리
- `deny` 목록에 `rm -rf`, `git push --force`, `git reset --hard` — 파괴적 명령 차단
- `allow` 목록이 명시적이고 과도하지 않음

### 9. /review Command의 !`shell` 활용
- `!`git branch --show-current`` + `!`git diff --stat | tail -1`` — 동적 컨텍스트 주입
- Agent에게 현재 상태를 자동으로 전달하는 좋은 패턴

### 10. 블루프린트의 "점진적 구축" 원칙 실천
- v2에서 "하네스를 사전에 완벽하게 설계하지 않는다"고 했는데, 실제로 필요한 것만 구축됨
- 불필요한 Agent/Skill이 없음

---

## 부족한 점 (Weaknesses)

### 1. UserPromptSubmit / Stop 훅 미활용
- harness-engineering SKILL.md에서 4가지 이벤트를 설명했지만, 실제로는 PreToolUse/PostToolUse만 사용
- **UserPromptSubmit** 훅으로 할 수 있는 것: 프롬프트 제출 시 현재 브랜치/상태 자동 주입, Skill 제안
- **Stop** 훅으로 할 수 있는 것: Agent 완료 시 빌드 검증 자동 실행, 커밋 리마인더

### 2. /progress Command가 오케스트레이션 패턴을 위반
- 다른 Command는 모두 Agent에 위임하는데, `/progress`만 직접 절차를 포함 (15줄의 절차/체크리스트)
- harness-engineering SKILL.md 안티패턴: "Command 안에 긴 절차/체크리스트를 넣는다 → Agent로 분리"
- `allowed-tools:` 필드도 Agent 위임 시에는 불필요한 것으로 레퍼런스가 명시

### 3. Skill의 progressive disclosure 미활용
- 레퍼런스가 강조하는 `references/`, `scripts/`, `examples/` 하위 폴더가 하나도 없음
- content-pipeline SKILL.md (90줄), harness-engineering SKILL.md (332줄) — 후자는 길어서 분리가 필요
- 예: `harness-engineering/references/hooks-patterns.md`, `content-pipeline/examples/sample-node.md` 등

### 4. 메모리 시스템 미구축
- `~/.claude/projects/.../memory/` 디렉토리에 MEMORY.md도 없고 메모리 파일도 없음
- 사용자 프로필(2년차 프론트엔드, 3D GIS 특화), 피드백, 프로젝트 상태 등 기록 없음
- 세션 간 컨텍스트가 전혀 유지되지 않는 상태

### 5. code-reviewer Agent에 graph-visualization Skill 누락
- 그래프 관련 코드 리뷰 시 시각화 패턴(SSR, nodeVisibility 등)을 모를 수 있음
- planner는 4개 전부 프리로드하는데, reviewer는 2개만 — 리뷰 범위가 제한적

### 6. Agent의 maxTurns 미설정
- 레퍼런스에서 `maxTurns: 20` 옵션을 제시했지만, 어떤 Agent도 설정하지 않음
- 무한 루프 방지 안전장치가 없음

### 7. lint/format 자동화 훅 부재
- PostToolUse에 TypeScript 타입체크만 있고, ESLint/Prettier 자동 실행이 없음
- 블루프린트: "PostToolUse 훅으로 포맷/린트/테스트 자동화"

### 8. Agent 내부 hooks 미활용
- harness-engineering SKILL.md에서 "Agent 프론트매터에 hooks: 필드"를 언급했지만 사용되지 않음
- 예: content-writer Agent에서 Write 후 자동으로 `bun run build` 검증

### 9. progress.md 파일이 초기 상태
- planner Agent가 "progress.md에 기록하라"고 하고, /progress Command도 "progress.md를 읽어라"고 하지만, 실제로는 빈 상태
- 블루프린트에서 "개발 시작 시 생성"이라 했으므로 현 시점에서는 정상

### 10. Skill의 allowed-tools 일관성 부족
- 4개 Skill 모두 `allowed-tools: Read, Grep, Glob, Bash(bun:*)` 동일
- Skill마다 필요한 도구가 다를 텐데 차별화가 없음

---

## 종합 평점

| 영역 | 점수 | 비고 |
|------|------|------|
| Command 설계 | ★★★★☆ | /progress만 패턴 위반 |
| Agent 설계 | ★★★★☆ | 기능 특화 우수, maxTurns/hooks 부재 |
| Skill 설계 | ★★★★☆ | 트리거/Gotchas 우수, progressive disclosure 미활용 |
| Hooks 설계 | ★★★☆☆ | 2/4 이벤트만 활용, lint/format 부재 |
| CLAUDE.md | ★★★★★ | 모범적. 간결한 목차, 조건부 로딩 |
| 권한/보안 | ★★★★★ | deny 목록, main 브랜치 보호 |
| 메모리 시스템 | ☆☆☆☆☆ | 전혀 구축되지 않음 |
| 전체 일관성 | ★★★★☆ | 블루프린트 원칙에 높은 수준으로 부합 |

**종합: 4/5** — 핵심 구조는 우수하나, 고급 기능과 세부 일관성에서 개선 여지

---

## 우선 개선 제안 (구현 순서)

1. **메모리 시스템 초기화** — MEMORY.md + 사용자/프로젝트 메모리 작성
2. **/progress를 Agent 위임으로 리팩토링** — 패턴 일관성 확보
3. **harness-engineering Skill을 progressive disclosure로 분리** — 332줄 → SKILL.md + references/
4. **UserPromptSubmit 훅 추가** — 현재 브랜치/노드 수 자동 주입
5. **Agent에 maxTurns 설정** — 안전장치 추가
