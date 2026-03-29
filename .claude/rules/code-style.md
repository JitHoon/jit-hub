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
- 훅 파일명 = use- 접두사

## 파일 구조

- 한 파일에 한 컴포넌트
- index.ts로 re-export
- 유틸리티 함수는 src/lib/에 배치

## 커밋 메시지

conventional commits 형식:

- feat: 새 기능
- fix: 버그 수정
- refactor: 리팩토링
- content: 콘텐츠 추가/수정
- style: 스타일 변경
- chore: 빌드, 설정 변경
