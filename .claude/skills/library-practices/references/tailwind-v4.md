# Tailwind CSS v4 베스트 프랙티스

> 소스: [secondsky/tailwind-v4-shadcn](https://github.com/secondsky/claude-skills), [Tailwind v4 공식 문서](https://tailwindcss.com/docs)

## v3 → v4 Breaking Changes

| v3 | v4 |
|----|-----|
| `tailwind.config.ts` | CSS-first: `@theme` directive |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| `theme.extend` in config | `@theme { }` in CSS |
| PostCSS `tailwindcss` 플러그인 | `@tailwindcss/postcss` 플러그인 |
| `content` 경로 수동 지정 | 자동 콘텐츠 감지 |
| `darkMode: 'class'` in config | CSS `prefers-color-scheme` 기본 |

## 4단계 CSS 아키텍처

### 1단계: CSS Variables 정의
```css
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.7 0.15 200);
  --color-secondary: oklch(0.6 0.12 250);
  --font-family-display: "Pretendard", sans-serif;
  --spacing-container: 1rem;
}
```

### 2단계: `@theme inline`으로 외부 변수 매핑
```css
/* shadcn/ui 등 외부 디자인 시스템 연동 시 */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

### 3단계: Base Styles
```css
/* ⚠️ :root를 @layer base 안에 절대 넣지 말 것 */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.1 0 0);
}

.dark {
  --background: oklch(0.1 0 0);
  --foreground: oklch(1 0 0);
}
```

### 4단계: 다크모드
- CSS `prefers-color-scheme` 자동 적용 (기본)
- 수동 토글: `.dark` 클래스 기반으로 전환

## Critical Rules

1. **`:root`를 `@layer base` 안에 넣지 말 것** — specificity 문제로 유틸리티 클래스가 오버라이드 안 됨
2. **`hsl()` 래퍼 중복 사용 금지** — `oklch()` 또는 `hsl()` 둘 중 하나만 일관되게
3. **`@theme` 블록 중첩 금지** — 하나의 파일에 하나의 `@theme`
4. **`tw-animate-css` 대신 `tailwindcss-animate` 사용** — tw-animate-css는 deprecate됨

## 플러그인 (v4)

```css
/* v4 방식: @plugin directive */
@plugin "@tailwindcss/typography";
@plugin "@tailwindcss/forms";
```

## 이 프로젝트 설정

- `@tailwindcss/postcss` (postcss.config.mjs에 설정됨)
- `@import "tailwindcss"` (globals.css)
- Next.js 환경 — Vite 설정 불필요
- 클러스터별 색상 토큰은 `@theme`으로 정의 예정

## Gotchas

- v3 예제/튜토리얼의 `tailwind.config.ts` 코드를 그대로 복사하면 동작 안 함
- `@apply`는 v4에서도 작동하지만, 유틸리티 클래스 직접 사용 권장
- Tailwind v4는 Safari 16.4+, Chrome 111+, Firefox 128+ 필요
