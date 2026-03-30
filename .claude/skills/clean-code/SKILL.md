---
name: clean-code
description: 코드 작성 시 PROACTIVELY 활성화. 컴포넌트 분리, 훅 추출, 관심사 분리, 클린 아키텍처 패턴 적용. 새 컴포넌트 작성, 기존 컴포넌트 수정, 리팩토링 작업에 활성화.
allowed-tools: Read, Grep, Glob
---

# 클린 코드 & 컴포넌트 아키텍처

## 핵심 원칙

### 1. 단일 책임 (Single Responsibility)

- **컴포넌트 = 하나의 UI 관심사**: 데이터 가져오기 + 변환 + 렌더링을 한 곳에 넣지 않는다
- **훅 = 하나의 로직 관심사**: `useTheme`은 테마만, `useGraphData`는 그래프 데이터만
- **분리 신호**: 파일 150줄 초과, 이름에 "And" 필요, 내부 상태가 3단계 이상 전달

### 2. 3계층 분리

```
src/hooks/     ← React 상태/구독 로직 (use- 접두사)
src/lib/       ← 순수 유틸리티, 타입, 상수 (React 의존 없음)
src/components/ ← 프레젠테이션 + 이벤트 바인딩만
```

- **컴포넌트 파일에 헬퍼 함수 선언 금지** — 훅 또는 lib으로 이동
- 순수 함수(React 무관) → `src/lib/`
- React 훅 사용하는 로직 → `src/hooks/`
- JSX 렌더링 → `src/components/`

### 3. 훅 추출 기준

추출해야 하는 경우:
- `useSyncExternalStore`, `useReducer` 등 복잡한 React API 어댑터
- 2개 이상 컴포넌트에서 재사용되는 상태 로직
- 테스트에서 로직만 독립 검증이 필요한 경우
- `useEffect` + `useState` 조합이 하나의 관심사를 형성하는 경우

추출하지 않는 경우:
- 단순 `useState` 하나 — 과도한 추상화
- 컴포넌트 전용이고 3줄 이하인 로직

### 4. 컴포지션 우선

```
children/slots > props drilling > Context > 전역 상태
```

- boolean prop 추가(`isCompact`, `isAlternate`)보다 컴포지션으로 변형
- `children`으로 레이아웃과 콘텐츠 분리
- 관련 상태를 공유하는 형제 → Compound Components 패턴

### 5. 상태 설계

```tsx
// ❌ boolean 플래그 조합
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);
const [data, setData] = useState<T | null>(null);

// ✅ 판별 유니온 (불가능한 상태 제거)
type State<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; data: T };
```

## 이 프로젝트 적용

| 계층 | 디렉토리 | 예시 |
|------|----------|------|
| 훅 | `src/hooks/use-*.ts` | `use-theme.ts` |
| 유틸 | `src/lib/*.ts` | `theme.ts`, `tokens.ts`, `clusters.ts` |
| 컴포넌트 | `src/components/**/*.tsx` | `ThemeToggle.tsx` |
| 아이콘 | `src/components/icons/*Icon.tsx` | `SunIcon.tsx`, `MoonIcon.tsx` |

## Gotchas

- 커스텀 훅 파일에도 `"use client"` 필요 — React 훅은 클라이언트 전용
- barrel file (`index.ts`) 남용 금지 — tree-shaking 방해. 기능 경계에서만 사용
- `useCallback`으로 감싼 toggle 함수도 훅 안에 포함 — 컴포넌트는 반환값만 사용
- 과도한 추상화 경계 — 3줄짜리 로직을 별도 파일로 분리하면 오히려 가독성 저하
- 컴포넌트 파일 안에 `subscribe`, `getSnapshot` 같은 함수 선언은 관심사 혼재의 신호

## 상세 레퍼런스

상황별로 아래 파일을 참조:
- 컴포넌트 분리 패턴/신호 → `references/component-patterns.md`
- 훅 설계/추출 가이드 → `references/hook-patterns.md`

## 소스 출처

- Kent C. Dodds — Colocation, AHA Programming, Epic React Advanced Patterns
- Dan Abramov — "Writing Resilient Components", Container/Presentational 재정립
- Matt Pocock — Total TypeScript, 판별 유니온 패턴
- React 공식 문서 (react.dev) — "Thinking in React", "Extracting State Logic"
