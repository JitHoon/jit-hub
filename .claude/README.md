# Claude Code Harness

이 디렉토리는 [Claude Code](https://claude.com/claude-code) 하네스 구성 파일을 포함합니다.

## 구조

| 디렉토리 | 설명 |
|-----------|------|
| `agents/` | 특화 서브에이전트 정의 (코드 리뷰, 테스트, 기획 등) |
| `commands/` | 슬래시 커맨드 (`/plan`, `/review`, `/test` 등) |
| `docs/` | [프로젝트 문서 인덱스](docs/README.md) — 기획, 디자인, 회고 |
| `rules/` | 코드 스타일 및 컨벤션 규칙 |
| `skills/` | 조건부 활성화 스킬 (디자인 시스템, 콘텐츠 파이프라인 등) |

## 설정 파일

- `settings.json` — 공유 하네스 설정 (커밋 대상)
- `settings.local.json` — 로컬 전용 설정 (.gitignore 대상)

## 프로젝트 지침

프로젝트의 핵심 규칙과 아키텍처는 루트의 [`CLAUDE.md`](../CLAUDE.md)를 참조하세요.
