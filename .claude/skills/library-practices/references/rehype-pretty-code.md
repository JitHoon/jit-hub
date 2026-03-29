# rehype-pretty-code 베스트 프랙티스

> 소스: [공식 문서](https://rehype-pretty.pages.dev/), [GitHub](https://github.com/rehype-pretty/rehype-pretty-code), [npm](https://www.npmjs.com/package/rehype-pretty-code)

## 패키지 선택 근거

| 패키지 | 상태 | 비고 |
|--------|------|------|
| **rehype-pretty-code** | ✅ 채택 | Shiki 기반, ~170k 주간 다운로드, 고수준 API |
| rehype-shiki | ❌ 6년 방치 | 절대 사용 금지 |
| @shikijs/rehype | 대안 | 저수준 제어 필요 시에만 |
| rehype-highlight | 대안 | 번들 최소화 필요 시에만 |

## 기본 설정

```typescript
import rehypePrettyCode from 'rehype-pretty-code';
import { type Options } from 'rehype-pretty-code';

const rehypePrettyCodeOptions: Options = {
  theme: {
    dark: 'github-dark',
    light: 'github-light',
  },
};

// next-mdx-remote와 통합
<MDXRemote
  source={content}
  options={{
    mdxOptions: {
      rehypePlugins: [[rehypePrettyCode, rehypePrettyCodeOptions]],
    },
  }}
/>
```

## 다크/라이트 듀얼 테마

```typescript
// ✅ 듀얼 테마 설정
const options: Options = {
  theme: {
    dark: 'github-dark',
    light: 'github-light',
  },
};
```

CSS에서 테마 전환:

```css
/* 라이트 모드 */
[data-rehype-pretty-code-figure] code[data-theme*='dark'],
[data-rehype-pretty-code-figure] code[data-theme*='dark'] span {
  color: var(--shiki-dark) !important;
}

/* html.dark일 때 다크 테마 표시 */
.dark [data-rehype-pretty-code-figure] code[data-theme*='light'],
.dark [data-rehype-pretty-code-figure] code[data-theme*='light'] span {
  display: none;
}

[data-rehype-pretty-code-figure] code[data-theme*='dark'],
[data-rehype-pretty-code-figure] code[data-theme*='dark'] span {
  display: none;
}

.dark [data-rehype-pretty-code-figure] code[data-theme*='dark'],
.dark [data-rehype-pretty-code-figure] code[data-theme*='dark'] span {
  display: initial;
}
```

⚠️ 프로젝트가 Tailwind `darkMode: 'class'`를 사용하므로 `.dark` 선택자 기반으로 전환.

## 라인 하이라이트 & 번호

````markdown
```typescript {1,3-5}
// 이 줄이 하이라이트됨 (1번째)
const normal = 'not highlighted';
// 이 줄도 하이라이트됨 (3번째)
// 이 줄도 (4번째)
// 이 줄도 (5번째)
```
````

```typescript
// 라인 번호 표시 옵션
const options: Options = {
  theme: { dark: 'github-dark', light: 'github-light' },
  // 라인 번호는 CSS로 제어
};
```

CSS로 라인 번호 추가:

```css
code[data-line-numbers] {
  counter-reset: line;
}

code[data-line-numbers] > [data-line]::before {
  counter-increment: line;
  content: counter(line);
  display: inline-block;
  width: 1rem;
  margin-right: 1rem;
  text-align: right;
  color: gray;
}
```

## Diff 표시

````markdown
```typescript
// [!code ++]  ← 추가된 줄 (초록)
// [!code --]  ← 삭제된 줄 (빨강)
```
````

Shiki transformer 사용:

```typescript
import { transformerNotationDiff } from '@shikijs/transformers';

const options: Options = {
  theme: { dark: 'github-dark', light: 'github-light' },
  transformers: [transformerNotationDiff()],
};
```

## 인라인 코드 하이라이팅

````markdown
본문에서 `const x: number = 1`{:typescript} 처럼 인라인 코드도 하이라이트 가능.
````

## 사용 가능한 테마

인기 테마: `github-dark`, `github-light`, `vitesse-dark`, `vitesse-light`, `nord`, `dracula`, `one-dark-pro`, `tokyo-night`

## 알려진 Gotchas

### 스타일 미포함

rehype-pretty-code는 **CSS를 포함하지 않는다**. HTML 속성(data-*)만 생성하고, 스타일링은 직접 해야 한다. Tailwind와 조합할 때 `globals.css`에 기본 스타일 추가 필요.

### Turbopack

next-mdx-remote를 통해 사용할 경우 `transpilePackages` 설정이 필요한 것은 next-mdx-remote 자체의 요구사항이다. rehype-pretty-code 자체는 Turbopack 이슈 없음.

### 번들 크기

Shiki 테마/언어가 번들에 포함된다. 필요한 언어만 사용하려면:

```typescript
const options: Options = {
  // 특정 언어만 로드하려면 shiki의 getHighlighter를 커스텀
  // 기본값은 사용된 언어 자동 감지
};
```

## 이 프로젝트 규칙

- `github-dark` / `github-light` 듀얼 테마 사용
- Tailwind `dark:` 클래스와 연동하여 테마 전환
- 라인 하이라이트는 `{1,3-5}` 문법으로 마크다운에서 직접 지정
- `globals.css`에 rehype-pretty-code 기본 스타일 정의
- @shikijs/transformers에서 필요한 transformer만 선택적 사용
