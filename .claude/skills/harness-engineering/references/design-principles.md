# 설계 원칙 (Boris Cherny + 커뮤니티)

## 컨텍스트 관리

- 컨텍스트 창은 가장 중요한 자원이다
- 50%에서 수동 /compact 실행 (Agent Dumb Zone 방지)
- 작업 전환 시 /clear로 리셋
- 같은 이슈에 2번 이상 수정 실패 → /clear 후 더 나은 프롬프트로 재시작
- 서브에이전트를 적극 활용 — 독립 컨텍스트에서 실행되어 메인 오염 방지

## 모델 전략

- Opus로 계획, Sonnet으로 코드 — Agent의 model: 필드로 제어
- thinking mode true + Output Style Explanatory 권장

## CLAUDE.md 원칙

- 파일당 200줄 이하 (60줄 이상적)
- <important if="..."> 태그로 조건부 로드
- 모든 것을 넣지 않고, 조건부 목차 역할
- .claude/rules/로 큰 지시를 분리

## 점진적 구축

- 완벽하게 설계한 후 시작하지 않는다
- 개발하면서 Skill과 Agent를 추가/수정한다
- 과적합 방지 — 규칙이 너무 촘촘하면 Claude의 창의적 해결을 막는다
- Gotchas 섹션에 실패 패턴을 누적하는 것이 가장 가치 있는 진화

## 반복 작업 자동화

- 하루 1회 이상 하는 작업 → Command 또는 Skill로 만든다
- PostToolUse 훅으로 포맷/린트/테스트 자동화
- 커밋은 최소 시간당 1회

## 공신력 있는 레퍼런스

1. https://code.claude.com/docs/en/best-practices
2. https://github.com/shanraisshan/claude-code-best-practice
3. https://github.com/ChrisWiles/claude-code-showcase
4. https://github.com/FlorianBruniaux/claude-code-ultimate-guide
5. https://github.com/hesreallyhim/awesome-claude-code
