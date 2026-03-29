# remark-gfm 베스트 프랙티스

> 소스: [GitHub](https://github.com/remarkjs/remark-gfm), [npm](https://www.npmjs.com/package/remark-gfm)

## 개요

remark-gfm은 GitHub Flavored Markdown(GFM) 확장을 remark 파이프라인에 추가한다.

**제공 기능:**
- 테이블 (`| cell | cell |`)
- 취소선 (`~~text~~`)
- 각주 (`[^1]`)
- 자동 링크 (`www.example.com`)
- 체크리스트 (`- [x] Done`)

## 설치 및 사용

```typescript
import remarkGfm from 'remark-gfm';

// next-mdx-remote와 통합
<MDXRemote
  source={content}
  options={{
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [/* ... */],
    },
  }}
/>
```

## ESM-only

⚠️ remark-gfm v4는 **ESM 전용**이다. `require()`로 불러올 수 없다.

```typescript
// ✅ ESM import
import remarkGfm from 'remark-gfm';

// ❌ CommonJS (에러 발생)
const remarkGfm = require('remark-gfm');
// Error: Must use import to load ES Module
```

이 프로젝트는 `"type": "module"`이므로 문제 없음.

## next-mdx-remote 통합

```typescript
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';

export default async function MDXContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],       // remark 단계
          rehypePlugins: [rehypePrettyCode], // rehype 단계
        },
      }}
    />
  );
}
```

**플러그인 실행 순서**: remark → rehype. `remarkGfm`이 먼저 GFM 문법을 파싱하고, `rehypePrettyCode`가 코드 블록을 하이라이팅한다.

## GFM 테이블 스타일링

remark-gfm이 생성하는 `<table>` 요소에 Tailwind 스타일 적용:

```tsx
// MDX 커스텀 컴포넌트로 테이블 스타일링
const mdxComponents = {
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="border border-gray-300 px-4 py-2 text-left font-semibold dark:border-gray-600">
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
      {children}
    </td>
  ),
};
```

## 알려진 Gotchas

### 자동 링크와 MDX

GFM 자동 링크(`www.example.com`)가 MDX의 JSX 표현식과 충돌할 수 있다. MDX 본문에서 URL을 사용할 때는 명시적 마크다운 링크 `[text](url)` 권장.

### 각주 ID 충돌

한 페이지에 여러 MDX 콘텐츠를 렌더링하면 각주 ID가 충돌할 수 있다. 이 프로젝트의 분할 뷰에서는 한 번에 하나의 노드만 표시하므로 문제 없음.

## 이 프로젝트 규칙

- `remarkPlugins` 배열의 첫 번째로 등록 (GFM 파싱이 다른 플러그인보다 먼저)
- 테이블은 MDX 커스텀 컴포넌트로 반응형 스타일 적용
- 노드 마크다운에서 GFM 문법 자유롭게 사용 가능
