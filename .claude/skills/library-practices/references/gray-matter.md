# gray-matter 베스트 프랙티스

> 소스: [gray-matter GitHub](https://github.com/jonschlinkert/gray-matter), [npm](https://www.npmjs.com/package/gray-matter)

## 기본 사용법

```typescript
import matter from 'gray-matter';

const file = matter('---\ntitle: Hello\n---\nContent here');
// file.data → { title: 'Hello' }
// file.content → 'Content here'
```

## TypeScript 타이핑

### data 필드 한계

gray-matter의 `data` 필드는 `{ [key: string]: any }` 타입이다. 제네릭을 지원하지 않으므로 Zod 검증 후 타입을 확보해야 한다.

```typescript
// ✅ Zod 검증 후 타입 확보
const file = matter(raw);
const validated = frontmatterSchema.parse(file.data);
// validated는 z.infer<typeof frontmatterSchema> 타입

// ❌ 타입 단언만으로 끝내기
const data = file.data as Frontmatter; // 런타임 검증 없음
```

### GrayMatterFile 인터페이스

```typescript
import type { GrayMatterFile } from 'gray-matter';

// 반환 타입의 주요 속성
interface GrayMatterFile<I extends string | Buffer> {
  data: { [key: string]: unknown };  // 프론트매터 파싱 결과
  content: string;                    // 본문 (프론트매터 제외)
  excerpt?: string;                   // 발췌문
  isEmpty: boolean;                   // 프론트매터가 비어있는지
  empty: string;                      // 빈 프론트매터 원본 문자열
}
```

## YAML 파싱 주의사항

### 프론트매터 위치

```markdown
<!-- ✅ 파일 첫 줄에서 시작 -->
---
title: Hello
---

<!-- ❌ 빈 줄이 먼저 오면 파싱 실패 -->

---
title: Hello
---
```

⚠️ 프론트매터는 반드시 **파일 첫 줄**에서 `---`로 시작해야 한다. Jekyll 컨벤션을 따르며, 앞에 빈 줄이 있으면 인식하지 못한다.

### 구분자 충돌

본문에 `---`가 포함된 경우 gray-matter가 혼동할 수 있다. 단, gray-matter는 regex 기반이 아니라 이 문제가 다른 파서보다 적다.

### 빈 프론트매터

```typescript
const file = matter('---\n---\nContent');
file.isEmpty; // true
file.empty;   // '' (빈 프론트매터 원본)
file.data;    // {}
```

## 주요 API

```typescript
// 문자열 파싱
matter(input: string, options?)

// 파일 직접 읽기 (동기)
matter.read(filepath: string, options?)

// 프론트매터 + 본문 → 마크다운 문자열로 변환
matter.stringify(content: string, data: object)

// 프론트매터 존재 여부 테스트
matter.test(string: string) // → boolean
```

## 성능 고려

- gray-matter는 regex 파싱을 사용하지 않아 안정적
- 21개 노드 규모에서 성능 이슈 없음
- 수백 개 파일도 문제 없이 처리 가능
- 스키마 재사용 자동 — `matter()` 반복 호출하면 됨

## 이 프로젝트 규칙

- `contents/nodes/*.md` 파일을 gray-matter로 파싱
- 파싱 후 반드시 Zod 스키마로 `data` 검증
- `matter.read()` 대신 `fs.readFile()` + `matter()` 조합 권장 (async I/O)
- 프론트매터는 항상 파일 첫 줄에서 시작
- `---` 구분자 정확히 사용 (커스텀 구분자 사용하지 않음)
