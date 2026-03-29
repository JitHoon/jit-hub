# next-mdx-remote 베스트 프랙티스

> 소스: [GitHub](https://github.com/hashicorp/next-mdx-remote), [npm](https://www.npmjs.com/package/next-mdx-remote)

## 버전 및 import

이 프로젝트는 **next-mdx-remote v6** + **App Router (RSC)**를 사용한다.

```typescript
// ✅ App Router (Server Components)
import { MDXRemote, compileMDX } from 'next-mdx-remote/rsc';

// ❌ Pages Router 방식 (이 프로젝트에서 사용하지 않음)
import { serialize, MDXRemote } from 'next-mdx-remote';
```

⚠️ `/rsc` 경로를 반드시 사용. 기본 import는 Pages Router용이다.

## App Router (RSC) 핵심 차이

| Pages Router | App Router (RSC) |
|-------------|-----------------|
| `serialize()` → `<MDXRemote>` | `<MDXRemote source={raw} />` 직접 전달 |
| 클라이언트 hydration | 서버에서 렌더링 완료 |
| MDXProvider 컨텍스트 사용 가능 | ❌ MDXProvider 사용 불가 |
| `lazy` prop 지원 | ❌ `lazy` 미지원 |

## 기본 사용법

```tsx
// ✅ Server Component에서 직접 사용
import { MDXRemote } from 'next-mdx-remote/rsc';

export default async function NodePage({ content }: { content: string }) {
  return (
    <MDXRemote
      source={content}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [[rehypePrettyCode, { theme: { dark: 'github-dark', light: 'github-light' } }]],
        },
      }}
    />
  );
}
```

## compileMDX로 프론트매터 추출

```tsx
import { compileMDX } from 'next-mdx-remote/rsc';

const { content, frontmatter } = await compileMDX<{ title: string }>({
  source: rawMdx,
  options: {
    parseFrontmatter: true,
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [/* ... */],
    },
  },
  components: mdxComponents,
});
```

⚠️ 이 프로젝트에서는 gray-matter로 프론트매터를 먼저 분리하므로, `parseFrontmatter: true` 대신 gray-matter 결과의 `content`만 전달한다.

## 커스텀 컴포넌트 매핑

```tsx
// ✅ components prop으로 직접 전달
const mdxComponents = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-3xl font-bold">{children}</h1>
  ),
  code: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <code className={className}>{children}</code>
  ),
  // 클라이언트 컴포넌트는 별도 파일에서 'use client'로 정의
  InteractiveDemo: ClientSideDemo,
};

// ❌ MDXProvider 컨텍스트 사용 (RSC에서 동작하지 않음)
import { MDXProvider } from '@mdx-js/react';
```

## Turbopack 호환성

⚠️ **필수 설정** — 없으면 `next dev --turbopack`에서 빌드 에러

```typescript
// next.config.ts
const nextConfig = {
  transpilePackages: ['next-mdx-remote'],
};

export default nextConfig;
```

## 알려진 제약 및 Gotchas

### import/export 문 사용 불가

```mdx
<!-- ❌ MDX 파일 내 import/export 불가 -->
import { Chart } from './Chart';
export const meta = { title: 'Hello' };

<!-- ✅ components prop으로 전달 -->
<Chart data={/* ... */} />
```

### CSP (Content Security Policy)

next-mdx-remote는 내부적으로 `new Function()`을 사용한다. 엄격한 CSP 환경에서는 `unsafe-eval`을 허용해야 한다. 포트폴리오 사이트에서는 일반적으로 문제 없음.

### Server Component 전용

`<MDXRemote>`는 async Server Component이다. 클라이언트 컴포넌트 안에서 직접 사용할 수 없다.

```tsx
// ✅ Server Component
export default async function Page() {
  return <MDXRemote source={content} />;
}

// ❌ Client Component
'use client';
export default function Page() {
  return <MDXRemote source={content} />; // Error
}
```

### 인터랙티브 컴포넌트 패턴

```tsx
// components/ClientDemo.tsx
'use client';
export function ClientDemo() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// MDX에서 사용 — components prop에 등록
<ClientDemo />
```

## 성능

- RSC에서는 직렬화 단계 없음 → Pages Router보다 빠름
- MDX v3 엔진 사용 (v2보다 최적화된 코드 생성)
- remark/rehype 플러그인은 각각 컴파일 시간 추가 → 필요한 것만 사용
- 21개 노드 규모에서 빌드 성능 문제 없음

## 이 프로젝트 규칙

- `next-mdx-remote/rsc` import 사용 (Pages Router 방식 금지)
- gray-matter로 프론트매터 분리 후 본문만 MDXRemote에 전달
- 커스텀 컴포넌트는 components prop으로 전달
- `transpilePackages: ['next-mdx-remote']` next.config에 필수
- 클라이언트 인터랙션 필요한 컴포넌트는 별도 `'use client'` 파일로 분리
