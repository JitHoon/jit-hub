---
name: harness-engineering
description: 새 Command, Agent, Skill, Hook을 만들거나 수정할 때 사용. 오케스트레이션 패턴, 프론트매터 필드, 설계 원칙 관련 작업에 활성화.
allowed-tools: Read, Grep, Glob
---

# 하네스 엔지니어링 레퍼런스

## 오케스트레이션 패턴: Command → Agent → Skill

```
Command (얇은 트리거, 1~2줄)
  → Agent (독립 컨텍스트, skills: 프리로드)
    → Skill (재사용 도메인 지식)
```

- **Command**: 사용자 진입점. 로직 없이 Agent에 위임만. $ARGUMENTS, !`shell` 활용
- **Agent**: 독립 컨텍스트 작업자. skills:로 Skill 프리로드, 자체 model/tools/권한
- **Skill**: 도메인 지식 문서. description이 트리거. 폴더 구조로 progressive disclosure

| 상황                            | 사용할 것           |
| ------------------------------- | ------------------- |
| 반복 워크플로우 진입점          | Command             |
| 무거운 분석/파일 읽기 작업      | Agent               |
| 여러 Agent가 공유하는 도메인    | Skill               |
| 가벼운 상태 확인                | Command (직접 실행) |

### 안티패턴

- Command에 긴 절차 → Agent로 분리
- Agent와 Command 내용 중복 → Command는 트리거만
- Agent에서 "Skill을 읽어라" 지시 → skills: 필드로 프리로드
- 범용 Agent → 기능 특화 Agent

## Skill 작성 핵심 원칙

1. description은 트리거 — "언제 발동할지" 키워드 포함
2. Gotchas 섹션 필수 — 반복 실수 패턴 누적
3. 당연한 것은 적지 않는다 — Claude 기본 동작을 벗어나게 하는 것만
4. 목표와 제약만 주고 단계별 지시를 강제하지 않는다
5. 스크립트/라이브러리 포함 — 재구성이 아닌 조합
6. SKILL.md + references/ + examples/로 progressive disclosure

## 체크리스트 요약

**Command**: 1~2줄 트리거? Agent 있는가? $ARGUMENTS 전달?
**Agent**: skills: 프리로드? model 적절? tools 최소화? 기능 특화?
**Skill**: description이 트리거? Gotchas 있는가? 폴더 구조 활용?
**Hook**: 이벤트 적절? timeout 설정? exit 코드/JSON 올바른가?

## Gotchas

- skills: 필드 이름은 .claude/skills/ 하위 폴더명과 정확히 일치해야 함
- CLAUDE.md는 200줄 이하, 60줄 이상적
- description에 "PROACTIVELY" 포함 시 자동 호출됨 — 의도적으로만 사용

## 상세 레퍼런스

필요 시 아래 파일을 읽어라:

- `references/frontmatter-reference.md` — 프론트매터 필드 상세 (Command/Agent/Skill)
- `references/hooks-reference.md` — Hooks 4가지 이벤트, 응답 형식, 실전 패턴
- `references/design-principles.md` — 컨텍스트 관리, 모델 전략, 점진적 구축 원칙
