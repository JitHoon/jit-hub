# 02. 하네스 엔지니어링 회고

## 이 문서의 위치

> **Tier 2: 구현 분석** — 아키텍처와 핵심 코드 구현을 분석
>
> 📍 현재 문서: **02-harness-engineering** (6/17)
>
> **권장 읽기 순서**: 01 → 06 → 03 → 04 → 05 → **02** → 10 → 07 → 08 → 09 → 14 → 15 → 12 → 11 → 13 → 16 → 17
>
> 이전: [05-core-code-review](./05-core-code-review.md) · 다음: [10-workflow-efficiency](./10-workflow-efficiency.md)

## 개요

Claude Code 하네스(Skills, Agents, Commands, Hooks, Rules)를 설계하고 구축한 과정을 평가한다. 7일간 71개 .md 파일을 포함하는 하네스 시스템을 구축했다.

## 구축 현황

### 오케스트레이션 패턴: Command → Agent → Skill

```
사용자 → /plan-product (Command)
         → product-planner (Agent, skills: [task-planner, ui-ux-designer])
            → task-planner (Skill) — 태스크 도출
            → ui-ux-designer (Skill) — UI 인터뷰
```

- Command는 1~2줄의 얇은 위임자 역할
- Agent는 독립 컨텍스트에서 Skill을 조합하여 작업 수행
- Skill은 도메인 지식을 재사용 가능한 형태로 제공

### 컴포넌트별 평가

| 컴포넌트 | 수량 | 평점 | 핵심 평가 |
|----------|------|------|----------|
| Commands | 12 | ★★★★☆ | 대부분 패턴 준수, 일부 Agent 미위임 |
| Agents | 13 | ★★★★★ | 기능 특화 우수, 전체 maxTurns 설정 (15~30) |
| Skills | 11 | ★★★★☆ | 트리거/Gotchas 우수, progressive disclosure 일부 미활용 |
| Hooks | 6 | ★★★★☆ | 4개 이벤트 모두 활용, 실용적 자동화 |
| Rules | 1 | ★★★★★ | 코드 스타일 + 테이블 편집 규칙까지 실용적 |
| CLAUDE.md | 1 | ★★★★★ | 99줄, 조건부 컨텍스트 로딩 모범적 |

### 잘한 점

1. **조건부 컨텍스트 로딩**: CLAUDE.md에서 `<important if="...">` 태그로 필요한 스킬만 로딩 — 컨텍스트 효율성 극대화
2. **점진적 구축**: blueprint v2에서 "사전에 완벽하게 설계하지 않는다"는 원칙 실천 — 필요한 것만 구축
3. **Proactive Skill 활성화**: clean-code, library-practices 스킬이 코드 작성 시 자동 활성화
4. **실용적 훅 조합**: PreToolUse(main 브랜치 보호, 시크릿 감지) + PostToolUse(TypeScript/ESLint 자동 검사) + UserPromptSubmit(컨텍스트 주입) + Stop(알림)
5. **권한 관리**: deny 목록(rm -rf, git push --force, git reset --hard)으로 안전장치 구축
6. **progressive disclosure**: SKILL.md → references/ → examples/ 3단계 구조로 인지 부하 방지
7. **Agent maxTurns 전체 설정**: 13개 에이전트 모두에 maxTurns 15~30 설정 — 무한 루프 방지 안전장치 완비

### 아쉬운 점

1. **code-reviewer Agent에 graph-visualization Skill 누락**: 그래프 관련 코드 리뷰 시 시각화 패턴을 참조하지 못함
3. **think-reviewer 에이전트 중복 파일**: `think-reviewer.md`와 `think-reviewer 2.md` 존재 — 정리 필요
4. **일부 Skill의 progressive disclosure 미완성**: 모든 스킬이 references/examples/ 하위 폴더를 갖추진 않음
5. **Skill allowed-tools 일관성**: 4개 스킬 모두 동일한 도구 목록 — 스킬별 차별화 부족

## 현실적 지표

| 지표 | 값 | 평가 |
|------|------|------|
| 하네스 파일 수 | 71 | 프로젝트 규모 대비 충분 |
| CLAUDE.md 줄 수 | 99 | 이상적 범위 (60~200) |
| 이벤트 커버리지 | 4/4 | PreToolUse, PostToolUse, UserPromptSubmit, Stop 모두 활용 |
| 스킬 참조 문서 | 8+ | progressive disclosure 실천 |
| Gotchas 문서화 | 50+ | 실전에서 발견한 함정들 기록 |
| 훅 타임아웃 설정 | 6/6 | 모든 훅에 타임아웃 명시 |

## 워크플로우 패턴

### 효과적이었던 워크플로우
1. `/plan-product` → PRD 생성 → `/dev-plan` → progress.md 태스크 도출 → `/next` → 순차 실행
2. `/review` → 코드 리뷰 → 수정 → `/create-pr` → PR 생성
3. PostToolUse 훅으로 .ts/.tsx 편집 후 자동 TypeScript/ESLint 검사

### 개선이 필요한 워크플로우
1. 하네스 자체의 테스트/검증 방법 부재 — 스킬이 실제로 올바르게 로딩되는지 확인하기 어려움
2. 메모리 시스템 미구축 — 세션 간 컨텍스트 유지 불가
3. 에이전트 실행 결과의 정량적 추적 부재 — 어떤 에이전트가 가장 유용했는지 데이터 없음

## 심화 탐구 가이드

### 이 회고를 더 깊이 파고들 때 확인할 것
- [ ] 각 에이전트의 실제 사용 빈도 측정 (13개 중 자주 쓰인 것 vs 미사용)
- [ ] 스킬 조건부 로딩이 실제로 작동했는지 검증 (어떤 작업에서 어떤 스킬이 활성화되었나)
- [ ] harness-improve-1.md의 10가지 강점/약점과 이 문서의 분석 비교
- [ ] 훅이 실제로 잡아낸 이슈 사례 수집 (시크릿 감지, 타입 에러 등)
- [ ] 대시보드 리뷰 #5: 하네스 최적화 — 에이전트 사용 빈도, 스킬 조건부 로딩 검증 ★★★
- [ ] 대시보드 리뷰 #10: 하네스 파일 대비 소스 코드 비율이 프로젝트 성숙도에 미친 영향 분석 ★★☆

### 관련 소스 파일
- `.claude/settings.json` — 훅 정의 + 권한 모델
- `.claude/docs/harness/harness-improve-1.md` — 기존 하네스 평가 리포트
- `.claude/skills/harness-engineering/SKILL.md` — 오케스트레이션 패턴 레퍼런스

### 관련 회고 문서
- [03-ai-collaboration-patterns](./03-ai-collaboration-patterns.md) — 하네스를 "어떻게 사용했는지" 행동 패턴
- [15-documentation-quality](./15-documentation-quality.md) — 71개 .md 파일의 실제 효과
- [16-enhancement-roadmap](./16-enhancement-roadmap.md) — 하네스 고도화 계획

## 액션 아이템

- [ ] code-reviewer Agent에 graph-visualization Skill 추가
- [ ] think-reviewer 2.md 중복 파일 삭제
- [ ] Skill별 allowed-tools 차별화 검토
- [ ] 메모리 시스템 구축 (MEMORY.md 또는 세션 간 컨텍스트 저장)
- [ ] 하네스 자가진단 훅 또는 커맨드 개발 검토
