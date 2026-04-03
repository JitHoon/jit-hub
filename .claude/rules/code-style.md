# 코드 스타일 규칙

## TypeScript

- strict mode 필수
- any 금지 → unknown 또는 구체적 타입
- interface 우선 (type은 유니온/인터섹션에만)
- 함수 반환 타입 명시 (복잡한 경우)

## React

- 함수형 컴포넌트 only
- Props는 interface로 정의
- 컴포넌트 파일명 = PascalCase
- 훅 파일명 = camelCase (예: useTheme.ts)

## 스타일링

- 인라인 `style={{}}` 금지 — Tailwind 클래스 사용
- CSS 변수 색상 참조: Tailwind arbitrary 값 (`text-[var(--color-text-muted)]`)
- 동적 클래스 조합: `cn()` 유틸리티 사용
- JS 변수 기반 `transition` duration 등 Tailwind로 표현 불가능한 경우에만 `style` 예외 허용

## 관심사 분리

- 컴포넌트는 프레젠테이션 + 이벤트 바인딩만 담당
- 재사용 가능하거나 복잡한 로직은 커스텀 훅으로 추출 → `src/hooks/`
- 순수 유틸리티 함수는 `src/lib/`에 유지
- 컴포넌트 파일 안에 헬퍼 함수 선언 금지 — 훅 또는 lib으로 이동

## 주석

- 불필요한 주석 금지 — 코드가 스스로 설명할 수 있으면 주석을 달지 않는다
- 정말 "왜(why)"를 설명해야 하는 경우에만 주석 허용 (비즈니스 로직, 우회 이유 등)
- TODO, FIXME 등 액션 태그도 금지 — 발견 즉시 해결한다

## 파일 구조

- 한 파일에 한 컴포넌트
- index.ts로 re-export
- 아이콘 컴포넌트는 src/components/icons/에 배치, {Name}Icon.tsx 네이밍
- 커스텀 훅은 src/hooks/에 배치, camelCase (예: useTheme.ts)
- 유틸리티 함수는 src/lib/에 배치

## progress.md 표 편집 규칙

- `progress.md`의 마크다운 표를 편집할 때는 **기존 열 구분자(`|`)를 그대로 유지**한다
- 행을 추가/수정할 때 반드시 모든 열의 `|`가 빠짐없이 포함되어야 한다
- 열 개수가 헤더와 일치하지 않으면 표가 깨지므로, 편집 전 헤더 열 수를 먼저 확인한다
- `Edit` 도구로 행 하나를 수정할 때 줄 양 끝의 `|`를 제거하지 않는다
- 표 안 셀 내용에 `|` 문자가 포함될 경우 `\|`로 이스케이프한다

## 보안

- `dangerouslySetInnerHTML` 사용 시 반드시 sanitize 처리 (DOMPurify 등)
- `NEXT_PUBLIC_` 환경변수에 밀키/토큰/비밀번호 등 민감 정보 금지
- 사용자 입력을 href/src에 직접 삽입 금지 (javascript: 프로토콜 차단)
- `eval()`, `new Function()` 사용 금지

## 커밋 메시지

conventional commits 형식:

- feat: 새 기능
- fix: 버그 수정
- refactor: 리팩토링
- content: 콘텐츠 추가/수정
- style: 스타일 변경
- chore: 빌드, 설정 변경

scope에 태스크/Phase 번호 금지: `feat(5-7-2):` ❌ → `feat:` ✅

## 커맨드/에이전트 파일

- 커맨드(`.claude/commands/*.md`)에 절대 경로 하드코딩 금지 — 상대 경로(`progress.md`, `.claude/docs/...`) 사용
- 에이전트 간 산출물 경로는 하나의 정규 경로만 사용 (기획 산출물: `.claude/docs/planning/[slug]/`)
