# TypeScript Strict 베스트 프랙티스

> 소스: [TypeScript 공식 문서](https://www.typescriptlang.org/docs/), 프로젝트 tsconfig.json 기반

## 프로젝트 활성화된 strict 옵션

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "noFallthroughCasesInSwitch": true
}
```

## `noUncheckedIndexedAccess` 패턴

배열/객체 인덱스 접근 시 `T | undefined` 반환:

```tsx
// ❌ 컴파일 에러
const items = ['a', 'b', 'c'];
const first: string = items[0]; // string | undefined

// ✅ 안전한 접근
const first = items[0];
if (first !== undefined) {
  console.log(first.toUpperCase()); // OK
}

// ✅ non-null assertion (확실할 때만)
const first = items[0]!; // 주의: 런타임 보장 없음
```

## `satisfies` 연산자

타입 안전성을 유지하면서 리터럴 타입 추론:

```tsx
// ❌ as 사용 — 타입 체크 우회
const config = { theme: 'dark' } as Config;

// ✅ satisfies — 타입 체크 + 리터럴 추론 유지
const config = {
  theme: 'dark',
  colors: { primary: '#000' },
} satisfies Config;
// config.theme의 타입: 'dark' (리터럴), Config 아님
```

## Discriminated Union

```tsx
// ❌ optional properties (모든 조합 가능)
interface Node {
  type: string;
  data?: string;
  error?: Error;
}

// ✅ discriminated union (유효한 조합만)
type Node =
  | { type: 'success'; data: string }
  | { type: 'error'; error: Error }
  | { type: 'loading' };
```

## Zod 타입 추출

```tsx
import { z } from 'zod';

const nodeSchema = z.object({
  slug: z.string(),
  title: z.string(),
  cluster: z.enum(['geodesy', 'coordinate-systems', ...]),
});

// ✅ 스키마에서 타입 추출 (수동 중복 금지)
type Node = z.infer<typeof nodeSchema>;

// ❌ 수동 타입 정의 (스키마와 불일치 위험)
interface Node { slug: string; title: string; ... }
```

## `as const` 활용

```tsx
// 상수 객체의 리터럴 타입 보존
const CLUSTERS = ['geodesy', 'coordinate-systems', 'spatial-data'] as const;
type Cluster = (typeof CLUSTERS)[number]; // 'geodesy' | 'coordinate-systems' | 'spatial-data'
```

## 타입 가드 패턴

```tsx
// unknown 타입 안전하게 좁히기
function isNodeData(value: unknown): value is NodeData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'slug' in value &&
    typeof (value as Record<string, unknown>).slug === 'string'
  );
}
```

## 이 프로젝트 규칙

- `any` 절대 금지 → `unknown` + 타입 가드
- `interface` 우선 (`type`은 유니온/인터섹션에만)
- 함수 반환 타입 명시 (복잡한 경우)
- `as` 타입 단언 최소화 → `satisfies` 또는 타입 가드 선호
