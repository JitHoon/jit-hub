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

## 커밋 메시지

conventional commits 형식:

- feat: 새 기능
- fix: 버그 수정
- refactor: 리팩토링
- content: 콘텐츠 추가/수정
- style: 스타일 변경
- chore: 빌드, 설정 변경
