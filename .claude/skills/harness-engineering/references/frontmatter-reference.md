# 프론트매터 필드 레퍼런스

## Command 프론트매터

```yaml
---
description: 슬래시 명령어 목록에 표시되는 설명
argument-hint: "[slug]" # 자동완성 힌트 (선택)
allowed-tools: Read, Grep, Glob # 허용 도구 (선택, Agent 위임 시 불필요)
---
```

## Agent 프론트매터

```yaml
---
name: agent-name # 소문자 + 하이픈
description: 언제/왜 사용하는지 # Claude가 호출 판단에 사용
model: opus | sonnet | haiku # 기본값: inherit (메인 세션과 동일)
tools: Read, Grep, Glob # 허용 도구 (쉼표 구분)
skills: # 프리로드할 Skill 목록
  - skill-name-1
  - skill-name-2
permissionMode: plan | acceptEdits | bypassPermissions # 선택
maxTurns: 20 # 최대 에이전틱 턴 (선택)
background: true # 백그라운드 실행 (선택)
---
```

- description에 "PROACTIVELY"를 포함하면 Claude가 명시적 호출 없이도 자동으로 사용
- tools를 생략하면 메인 세션의 모든 도구를 상속
- skills: 필드의 이름은 .claude/skills/ 하위 폴더명과 일치해야 함

## Skill 프론트매터

```yaml
---
name: skill-name # 소문자 + 하이픈, 폴더명과 일치
description: 언제 이 Skill을 활성화할지 # 트리거 판단 기준
allowed-tools: Read, Grep, Glob # Skill 활성 시 추가 허용 도구
disable-model-invocation: true # 자동 발견 방지 (선택)
user-invocable: false # /메뉴에서 숨기기 (선택)
---
```

- description이 가장 중요 — "모델이 언제 발동할까?"로 작성
- 당연한 것은 적지 않는다 — Claude의 기본 동작을 벗어나게 하는 것만 기술
