---
name: library-practices
description: 코드 작성 시 PROACTIVELY 활성화. 프로젝트 라이브러리별 베스트 프랙티스, 버전별 주의사항, 알려진 함정 제공.
allowed-tools: Read, Grep, Glob
---

## 라이브러리 레지스트리

| 라이브러리 | 버전 | 상태 | 베스트 프랙티스 담당 |
|-----------|------|------|---------------------|
| Next.js | 16 | ✅ 설치됨 | nextjs-patterns |
| React | 19 | ✅ 설치됨 | **이 Skill** → `references/react-19.md` |
| Tailwind CSS | v4 | ✅ 설치됨 | **이 Skill** → `references/tailwind-v4.md` |
| TypeScript | 5.9 (strict) | ✅ 설치됨 | **이 Skill** → `references/typescript-strict.md` |
| react-force-graph-2d | — | ⏳ 예정 | graph-visualization |
| gray-matter | 4.0.3 | ✅ 등록됨 | **이 Skill** → `references/gray-matter.md` |
| Zod | v3 | ✅ 등록됨 | **이 Skill** → `references/zod-v3.md` |
| next-mdx-remote | 6.0.0 | ✅ 등록됨 | **이 Skill** → `references/next-mdx-remote.md` |
| rehype-pretty-code | 0.14.x | ✅ 등록됨 | **이 Skill** → `references/rehype-pretty-code.md` |
| remark-gfm | 4.0.1 | ✅ 등록됨 | **이 Skill** → `references/remark-gfm.md` |

> 각 라이브러리의 도메인 맥락(라우팅, 그래프 시각화, 콘텐츠 파이프라인)은 해당 Skill이 담당한다.
> 이 Skill은 **라이브러리 자체의 API/패턴/함정**만 다룬다.

## 핵심 규칙 (CRITICAL)

### React 19
- Server Components가 기본 — 클라이언트 전용 코드만 `'use client'`
- `forwardRef` 불필요 — `ref`를 일반 prop으로 전달
- `use()` 훅으로 Promise/Context 소비 (React.use, not await in render)

### Tailwind v4
- `tailwind.config.ts` 없음 — CSS-first 설정 (`@theme` directive)
- `@import "tailwindcss"` 사용 (v3의 `@tailwind base/components/utilities` 아님)
- `:root`를 `@layer base` 안에 절대 넣지 말 것

### TypeScript
- `any` 금지 → `unknown` + 타입 가드
- `satisfies` 연산자로 타입 안전한 객체 리터럴
- Zod 스키마에서 `z.infer<>` 로 타입 추출 (수동 중복 금지)

### 콘텐츠 파이프라인 라이브러리
- **gray-matter**: 프론트매터 파싱 후 반드시 Zod 검증 (data 필드가 untyped)
- **Zod v3**: `z.infer<>` 단일 소스 원칙. 빌드 타임 = `.parse()`, 런타임 = `.safeParse()`
- **next-mdx-remote**: `next-mdx-remote/rsc` import 필수 (Pages Router 방식 금지)
- **rehype-pretty-code**: Shiki 기반 코드 하이라이팅. CSS 미포함 — 직접 스타일 필요
- **remark-gfm**: ESM-only. remarkPlugins 배열 첫 번째로 등록

## 크로스 라이브러리 Gotchas

- `next/dynamic`으로 SSR 비활성화할 때 `{ ssr: false }` 필수 — canvas 기반 라이브러리(react-force-graph-2d)
- Tailwind v4 + Next.js: `@tailwindcss/postcss` 플러그인 사용 (v3 PostCSS 플러그인 아님)
- React 19 Server Components에서 `useEffect`, `useState` 등 훅 사용 불가 — `'use client'` 누락 시 빌드 에러
- **Turbopack + next-mdx-remote**: `transpilePackages: ['next-mdx-remote']` 필수 (없으면 빌드 에러)
- `React.cache()`는 서버 컴포넌트에서만 작동 — 클라이언트에서 중복 요청 제거는 SWR/React Query
- next-mdx-remote/rsc에서 MDXProvider 컨텍스트 사용 불가 → components prop 직접 전달
- rehype-pretty-code는 CSS 미포함 — `globals.css`에 `[data-rehype-pretty-code-figure]` 스타일 정의 필요
- remark-gfm 등 remark/rehype 플러그인은 ESM-only — `require()` 사용 불가

## 상세 레퍼런스

상황별로 아래 파일을 참조:
- React 19 API/패턴 → `references/react-19.md`
- Tailwind v4 설정/아키텍처 → `references/tailwind-v4.md`
- TypeScript strict 패턴 → `references/typescript-strict.md`
- gray-matter 파싱/타이핑 → `references/gray-matter.md`
- Zod v3 스키마/검증 → `references/zod-v3.md`
- next-mdx-remote RSC → `references/next-mdx-remote.md`
- rehype-pretty-code 하이라이팅 → `references/rehype-pretty-code.md`
- remark-gfm GFM 확장 → `references/remark-gfm.md`

## 소스 출처

이 Skill의 베스트 프랙티스는 다음 검증된 소스를 기반으로 작성됨:
- [Vercel Labs react-best-practices](https://github.com/vercel-labs/agent-skills) — Vercel 공식
- [secondsky/nextjs](https://github.com/secondsky/claude-skills) — 프로덕션 검증
- [secondsky/tailwind-v4-shadcn](https://github.com/secondsky/claude-skills) — 프로덕션 검증
