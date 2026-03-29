# Zod v3 베스트 프랙티스

> 소스: [Zod 공식 문서](https://zod.dev), [GitHub](https://github.com/colinhacks/zod)

## 버전 선택 근거

이 프로젝트는 **Zod v3**을 사용한다.
- TypeScript 5.9와 완전 호환 (v4는 재귀타입 TS2615 이슈)
- 가장 큰 생태계 (React Hook Form, tRPC 등)
- 레퍼런스/자료 풍부

```typescript
import { z } from 'zod';
```

## 핵심 원칙: z.infer 단일 소스

```typescript
// ✅ 스키마에서 타입 추출 (단일 소스)
const NodeSchema = z.object({
  slug: z.string(),
  title: z.string(),
  cluster: z.enum(['geodesy', 'coordinate-systems', /* ... */]),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  tags: z.array(z.string()),
});

type Node = z.infer<typeof NodeSchema>;

// ❌ 수동 타입 + 스키마 이중 정의
interface Node { slug: string; title: string; /* ... */ }
const NodeSchema = z.object({ slug: z.string(), /* ... */ });
```

⚠️ **수동 타입 중복 절대 금지** — 스키마가 유일한 타입 소스

## safeParse vs parse

```typescript
// ✅ 빌드 타임 검증 — parse (에러 시 즉시 빌드 실패)
const validated = NodeSchema.parse(file.data);

// ✅ 사용자 입력/외부 데이터 — safeParse
const result = NodeSchema.safeParse(untrustedInput);
if (result.success) {
  // result.data는 완전 타입 안전
  processNode(result.data);
} else {
  // result.error는 ZodError
  console.error(result.error.format());
}
```

| 메서드 | 실패 시 | 사용 시점 |
|--------|--------|----------|
| `.parse()` | ZodError throw | 빌드 타임 검증, 내부 데이터 |
| `.safeParse()` | `{ success: false, error }` | 런타임 입력, API 응답 |

이 프로젝트에서 프론트매터 검증은 **빌드 타임**이므로 `.parse()` 사용.

## 스키마 정의 패턴

### 모듈 스코프에서 정의

```typescript
// ✅ 모듈 최상위에서 한 번 정의
const ClusterEnum = z.enum([
  'geodesy', 'coordinate-systems', 'spatial-data',
  'gis-platforms', 'graphics', 'web-gl',
  'frontend', 'devops', 'harness-engineering',
]);

const DifficultyEnum = z.enum([
  'beginner', 'intermediate', 'advanced', 'expert',
]);

// ❌ 함수/루프 안에서 매번 재생성
function validate(data: unknown) {
  const schema = z.object({ ... }); // 매 호출마다 생성 — 비효율
  return schema.parse(data);
}
```

### 스키마 조합

```typescript
// 기본 스키마에서 파생
const BaseSchema = z.object({ slug: z.string(), title: z.string() });
const ExtendedSchema = BaseSchema.extend({ cluster: ClusterEnum });
const PartialSchema = BaseSchema.partial(); // 모든 필드 optional
const PickedSchema = BaseSchema.pick({ slug: true }); // slug만
const OmittedSchema = BaseSchema.omit({ title: true }); // title 제외
```

### 선택 필드와 기본값

```typescript
const NodeSchema = z.object({
  // 필수
  slug: z.string(),
  title: z.string(),
  cluster: ClusterEnum,
  difficulty: DifficultyEnum,
  tags: z.array(z.string()),

  // 선택 (없으면 undefined)
  prerequisites: z.array(z.string()).optional(),

  // 선택 + 기본값 (없으면 빈 배열)
  childConcepts: z.array(z.string()).default([]),
});
```

### 중첩 객체

```typescript
const RelatedConceptSchema = z.object({
  slug: z.string(),
  relationship: z.string(),
});

const NodeSchema = z.object({
  relatedConcepts: z.array(RelatedConceptSchema).optional(),
});
```

## 에러 포맷팅

```typescript
try {
  NodeSchema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    // 구조화된 에러 (중첩 객체 형태)
    const formatted = error.format();

    // 플랫 에러 배열
    for (const issue of error.issues) {
      console.error(`${issue.path.join('.')}: ${issue.message}`);
      // 예: "cluster: Invalid enum value"
    }
  }
}
```

## 알려진 Gotchas

### `.strict()` vs 기본 동작

```typescript
// 기본: 알 수 없는 키 무시 (strip)
z.object({ name: z.string() }).parse({ name: 'a', extra: 1 });
// → { name: 'a' } (extra 제거됨)

// strict: 알 수 없는 키 있으면 에러
z.object({ name: z.string() }).strict().parse({ name: 'a', extra: 1 });
// → ZodError

// passthrough: 알 수 없는 키 유지
z.object({ name: z.string() }).passthrough().parse({ name: 'a', extra: 1 });
// → { name: 'a', extra: 1 }
```

### enum과 nativeEnum

```typescript
// ✅ z.enum — 문자열 리터럴 배열
const Cluster = z.enum(['geodesy', 'graphics']);
type Cluster = z.infer<typeof Cluster>; // 'geodesy' | 'graphics'

// TS enum 사용 시 — z.nativeEnum
enum Direction { Up, Down }
const DirectionSchema = z.nativeEnum(Direction);
```

### 배열 + refine

```typescript
// 최소 1개 이상 태그 필수
const TagsSchema = z.array(z.string()).min(1, '최소 1개 태그 필요');
```

## 이 프로젝트 규칙

- 스키마는 `src/lib/schema.ts`에서 한 번만 정의
- 모든 타입은 `z.infer<>` 로 추출 (수동 interface 금지)
- 프론트매터 검증은 `.parse()` 사용 (빌드 실패 = 좋은 것)
- 클러스터/difficulty enum은 Zod 스키마가 유일한 소스
- `any` 금지 — Zod 검증 후 타입이 자동으로 좁혀짐
