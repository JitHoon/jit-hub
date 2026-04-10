# everything-claude-code 통합 분석 기록

> 작성일: 2026-04-03
> 배경: ECC(everything-claude-code) 레포지토리를 jit-hub 하네스와 혼합 사용할 수 있는지 평가

## ECC란

- 2025 Anthropic x Forum Ventures 해커톤 우승작 (Affaan Mustafa)
- GitHub: `affaan-m/everything-claude-code`
- 규모: 136+ skills, 30 agents, 60+ commands, 14 MCP 서버
- 범용 하네스 플러그인 레포지토리 (특정 프로젝트에 종속되지 않음)

## jit-hub 하네스 vs ECC 비교

| 관점 | jit-hub | ECC |
|------|---------|-----|
| 설계 철학 | 프로젝트 특화 깊이 | 범용적 넓이 |
| Skills | 11개 (도메인 밀착) | 156개 (전방위 커버) |
| Agents | 12개 (워크플로우 체인) | 38개 (독립적) |
| Hooks | settings.json 인라인 shell | scripts/ Node.js 외부 파일 |
| 배포 모델 | 프로젝트 내장 (.claude/) | 플러그인 레포지토리 (루트 레벨) |

## 결론: 전체 통합 불가, 선택적 체리픽 권장

### 통합하지 않은 이유

1. **설계 철학 차이**: jit-hub의 도메인 특화 skills(content-pipeline, graph-visualization, design-system)은 프로젝트 고유 데이터 흐름과 토큰 값을 담고 있음. ECC의 범용 skills로 대체 불가.

2. **컨텍스트 예산 희석**: CLAUDE.md의 `<important if="...">` 조건부 로딩으로 필요한 skill만 효율적으로 로드하는 구조. 156개 skill description이 추가되면 불필요한 매칭 발생.

3. **이름 충돌**: `planner`, `code-reviewer`, `/plan`, `design-system` 등 다수 충돌. 프로젝트 로컬이 우선하지만 skills의 description 매칭은 양쪽 모두 활성화될 수 있음.

4. **워크플로우 결합도**: product-planner -> dev-planner -> task-runner -> pr-creator 체인이 progress.md와 강하게 결합. ECC 에이전트로 대체하면 파이프라인이 깨짐.

5. **hooks 구조 충돌**: 같은 이벤트에 양쪽 hooks가 모두 실행되면 실행 순서 보장 없음.

### ECC에서 차용한 것

| 개념 | 출처 | 적용 방식 |
|------|------|----------|
| Confidence-Based Filtering | ECC code-reviewer | `code-reviewer.md` 프로세스에 "80% 이상 확신하는 이슈만 보고" 추가 |
| 보안 체크리스트 | ECC security-reviewer / AgentShield | `code-reviewer.md`에 보안 카테고리 신설, `code-style.md`에 보안 섹션 추가 |
| commit-quality hook | ECC pre-bash-commit-quality.js | `settings.json` PreToolUse에 git commit 감지 hook 추가 (인라인 shell 유지) |
| allow 목록 감사 | AgentShield 개념 | `settings.local.json` 85개 -> 30개로 정리 |

### 차용하지 않은 것

- continuous-learning-v2 (instinct 기반 학습): 현재 규모에서 과도
- MCP 서버 14개: 프로젝트에서 MCP 미사용
- AgentShield npm 패키지: 독립 도구로 필요 시 실행 가능하나 하네스에 통합하지 않음
- 언어별/프레임워크별 skills (Go, Rust, Python, Django 등): TypeScript/Next.js 전용 프로젝트

## 변경된 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `.claude/agents/code-reviewer.md` | Confidence Filtering + 보안 체크리스트 |
| `.claude/settings.json` | commit-quality PreToolUse hook |
| `.claude/settings.local.json` | 85개 -> 30개 allow 정리 |
| `.claude/rules/code-style.md` | 보안 섹션 신설 |

## 향후 참고 사항

- 프로젝트에 백엔드 API 추가 시 ECC의 `api-design`, `database-migrations` skills 참고 가능
- 팀원 증가 시 continuous-learning 개념으로 팀 지식 공유 시스템 구축 고려
- hooks가 복잡해지면 ECC처럼 `scripts/hooks/` 외부 파일 분리 고려
- AgentShield는 `npx ecc-agentshield scan .`으로 독립 실행 가능 (통합 불필요)
