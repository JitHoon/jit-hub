---
name: clean-code
description: 코드 작성 시 PROACTIVELY 활성화. 컴포넌트 분리, 훅 추출, 관심사 분리, 클린 아키텍처 패턴 적용. 새 컴포넌트 작성, 기존 컴포넌트 수정, 리팩토링 작업에 활성화.
allowed-tools: Read, Grep, Glob
---

# 클린 코드 & 피처 아키텍처

Bulletproof React 스타일 피처 코로케이션 기반 아키텍처.

## 네이밍 컨벤션

| 대상 | 컨벤션 | 예시 |
|------|--------|------|
| 컴포넌트 파일 (.tsx) | PascalCase | `ThemeToggle.tsx`, `SunIcon.tsx` |
| 훅 파일 | camelCase (use 접두사) | `useTheme.ts`, `useGraphData.ts` |
| 그 외 파일 (타입, 유틸, 상수 등) | kebab-case | `builder.ts`, `graph-types.ts` |
| 디렉토리 | kebab-case | `features/graph/`, `constants/` |

## 피처 코로케이션 아키텍처

### 디렉토리 구조

```
src/
├── app/                          ← Next.js 라우팅 전용
├── components/                   ← 공유 UI 컴포넌트
│   ├── icons/
│   │   ├── SunIcon.tsx
│   │   └── MoonIcon.tsx
│   └── ThemeToggle.tsx
├── constants/                    ← 도메인 상수/설정값
│   ├── cluster.ts
│   └── tokens.ts
├── features/                     ← ★ 피처별 코로케이션
│   ├── graph/
│   │   ├── api/
│   │   ├── components/
│   │   │   └── GraphCanvas.tsx
│   │   ├── hooks/
│   │   │   └── useGraphData.ts
│   │   ├── types/
│   │   │   └── graph.ts
│   │   └── utils/
│   │       └── builder.ts
│   ├── content/
│   │   ├── components/
│   │   │   └── MdxRenderer.tsx
│   │   ├── types/
│   │   │   └── schema.ts
│   │   └── utils/
│   │       └── pipeline.ts
│   └── theme/
│       ├── components/
│       ├── hooks/
│       │   └── useTheme.ts
│       └── utils/
│           └── store.ts
├── hooks/                        ← 공유 훅 (camelCase)
├── lib/                          ← 외부 라이브러리 래퍼
├── types/                        ← 공유 타입
└── utils/                        ← 공유 순수 헬퍼
```

### 피처 내부 세그먼트

각 피처는 필요한 세그먼트만 생성한다 (전부 필수가 아님):

| 세그먼트 | 역할 |
|----------|------|
| `api/` | 외부 API 호출, 데이터 fetching |
| `components/` | 해당 피처 전용 UI 컴포넌트 |
| `hooks/` | 해당 피처 전용 훅 |
| `types/` | 해당 피처 전용 타입/스키마 |
| `utils/` | 해당 피처 전용 순수 함수 |

### 공유 코드 분류 (src/ 최상위)

2개 이상 피처에서 사용하는 코드만 공유 디렉토리에 배치:

| 디렉토리 | 역할 | 예시 |
|----------|------|------|
| `constants/` | 도메인 상수, 설정값 | `cluster.ts`, `tokens.ts` |
| `components/` | 공유 UI 컴포넌트 | `ThemeToggle.tsx` |
| `hooks/` | 공유 훅 | 여러 피처에서 쓰는 훅 |
| `lib/` | 외부 라이브러리 래퍼/설정 | axios 인스턴스, dayjs 설정 |
| `types/` | 공유 타입 | 여러 피처가 참조하는 타입 |
| `utils/` | 공유 순수 헬퍼 | 범용 유틸리티 함수 |

## 의존 방향 규칙

```
shared(constants/, components/, hooks/, lib/, types/, utils/)
  → features/
    → app/
```

- **features 간 크로스 임포트 금지**: `features/graph/`에서 `features/content/` 임포트 불가
- 공유가 필요하면 해당 코드를 `src/` 최상위 공유 디렉토리로 승격

## 배럴 익스포트 비권장

`index.ts` 배럴 파일을 사용하지 않는다. 직접 임포트를 사용한다.

```typescript
// ✅ 직접 임포트
import { NodeFrontmatter } from "@/features/content/types/schema";
import { GraphData } from "@/features/graph/types/graph";
import { getClusterColor } from "@/constants/cluster";
import { useTheme } from "@/features/theme/hooks/useTheme";

// ✅ 같은 피처 내부 상대 경로
import { nodeFrontmatterSchema } from "../types/schema";

// ❌ 배럴 임포트 금지
import { NodeFrontmatter } from "@/features/content";

// ❌ 다른 피처 내부 직접 임포트 금지
import { something } from "@/features/graph/utils/builder";
```

## 새 코드 배치 판단 흐름

```
새 코드 작성 시:
1. 특정 피처에만 속하는가?
   → features/[feature]/[segment]/
2. 2개 이상 피처에서 사용되는가?
   → src/ 최상위 공유 디렉토리
     - 상수/설정값 → constants/
     - UI 컴포넌트 → components/
     - React 훅 → hooks/
     - 외부 라이브러리 래퍼 → lib/
     - 순수 함수 → utils/
     - 타입 → types/
3. 새로운 도메인인가?
   → features/ 아래 새 피처 디렉토리 생성
```

## 단일 책임 (Single Responsibility)

- **컴포넌트 = 하나의 UI 관심사**: 데이터 가져오기 + 변환 + 렌더링을 한 곳에 넣지 않는다
- **훅 = 하나의 로직 관심사**: `useTheme`은 테마만, `useGraphData`는 그래프 데이터만
- **분리 신호**: 파일 150줄 초과, 이름에 "And" 필요, 내부 상태가 3단계 이상 전달

## 훅 추출 기준

추출해야 하는 경우:
- `useSyncExternalStore`, `useReducer` 등 복잡한 React API 어댑터
- 2개 이상 컴포넌트에서 재사용되는 상태 로직
- 테스트에서 로직만 독립 검증이 필요한 경우
- `useEffect` + `useState` 조합이 하나의 관심사를 형성하는 경우

추출하지 않는 경우:
- 단순 `useState` 하나 — 과도한 추상화
- 컴포넌트 전용이고 3줄 이하인 로직

## 컴포지션 우선

```
children/slots > props drilling > Context > 전역 상태
```

- boolean prop 추가(`isCompact`, `isAlternate`)보다 컴포지션으로 변형
- `children`으로 레이아웃과 콘텐츠 분리
- 관련 상태를 공유하는 형제 → Compound Components 패턴

## 상태 설계

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

## 유닛 테스트 컨벤션

- `*.test.ts` — 유닛 테스트 (소스 파일 옆 co-location)
- `*.spec.ts` — E2E 테스트 (`test/e2e/` 유지)
- jsdom 필요 시 파일 상단에 `// @vitest-environment jsdom`
- 순수 함수 테스트는 node 환경 (기본값)

## Gotchas

- 커스텀 훅 파일에도 `"use client"` 필요 — React 훅은 클라이언트 전용
- `index.ts` 배럴 파일 사용 금지 — 트리쉐이킹 방해, 순환 의존 유발
- `useCallback`으로 감싼 toggle 함수도 훅 안에 포함 — 컴포넌트는 반환값만 사용
- 과도한 추상화 경계 — 3줄짜리 로직을 별도 파일로 분리하면 오히려 가독성 저하
- 컴포넌트 파일 안에 `subscribe`, `getSnapshot` 같은 함수 선언은 관심사 혼재의 신호
- 피처 간 코드 공유가 필요하면 해당 코드를 `src/` 최상위로 승격 — 크로스 임포트 하지 않는다

## 컴포넌트 복원력 (Resilience)

### 언제 FeatureBoundary를 써야 하는가

| 상황 | 적용 |
|------|------|
| `async` Server Component (`await` 포함) | 필수 |
| `dynamic(() => import(...), { ssr: false })` | 필수 |
| 같은 페이지의 두 기능이 서로 독립 동작해야 할 때 | 필수 |
| Client Component에서 외부 API 호출 | 권장 |
| 단순 동기 렌더링 | 불필요 |

### 재사용 컴포넌트

```
src/components/error/
├── ErrorBoundary.tsx    ← 클래스 기반 에러 경계 (유일한 클래스 컴포넌트 예외)
├── ErrorCard.tsx        ← 에러 표시 UI (variant: "panel" | "fatal")
├── Skeleton.tsx         ← 로딩 스켈레톤 (variant: "text" | "block" | "circle")
└── FeatureBoundary.tsx  ← ErrorBoundary + Suspense 조합 래퍼 ← 주로 이것만 사용
```

### 사용 패턴

```tsx
// 기본 사용 (어떤 기능에든 적용 가능)
<FeatureBoundary
  skeleton={<Skeleton variant="block" className="h-full" />}
  errorTitle="그래프를 불러올 수 없습니다"
>
  <AsyncOrDynamicComponent />
</FeatureBoundary>

// 여러 기능 독립 격리: 하나 에러 시 나머지 정상 동작
<FeatureBoundary skeleton={<Skeleton variant="block" />} errorTitle="A 오류">
  <FeatureA />
</FeatureBoundary>
<FeatureBoundary skeleton={<Skeleton variant="text" lines={5} />} errorTitle="B 오류">
  <FeatureB />
</FeatureBoundary>
```

### 핵심 원칙

- **중첩 순서 고정**: `ErrorBoundary > Suspense > Component` — `FeatureBoundary`가 이 순서를 보장함
- **이벤트 핸들러 에러** → ErrorBoundary 미포착 → try-catch 직접 처리
- `FeatureBoundary`는 `"use client"` — async RSC는 children으로 전달하면 동작함
  ```tsx
  // Server Component에서: children으로 async RSC 전달
  <FeatureBoundary skeleton={<Skeleton variant="text" />}>
    <AsyncServerComponent />   {/* Server에서 children으로 전달됨 */}
  </FeatureBoundary>
  ```

## 소스 출처

- Bulletproof React (alan2207) — 피처 코로케이션, 의존 방향, kebab-case 강제
- Kent C. Dodds — Colocation, AHA Programming
- Dan Abramov — "Writing Resilient Components"
- Matt Pocock — Total TypeScript, 판별 유니온 패턴
- React 공식 문서 (react.dev) — "Thinking in React", "Extracting State Logic"
