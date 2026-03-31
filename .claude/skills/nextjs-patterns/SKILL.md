---
name: nextjs-patterns
description: Next.js 16 App Router 관련 작업 시 사용. 라우팅, 레이아웃, SSG, 메타데이터, SEO, JSON-LD, Turbopack 관련 작업에 활성화.
allowed-tools: Read, Grep, Glob
---

# Next.js 16 패턴 Skill

## 프로젝트 라우팅 구조

```
src/app/
├── layout.tsx          ← 루트 레이아웃 (메타데이터, 폰트)
├── page.tsx            ← / 메인 (분할 뷰)
├── nodes/
│   └── [slug]/
│       └── page.tsx    ← SEO용 정적 페이지 (generateStaticParams)
└── projects/           ← MVP 이후
```

## SEO 이중 경로 전략

- `/` — 싱글 페이지 분할 뷰. `/?node=cesium-mouse-events`로 특정 노드 열기
- `/nodes/[slug]` — SEO용 정적 페이지. generateStaticParams로 빌드 타임 생성
- 사용자 접근 시 분할 뷰 상태로 열어줌

## 메타데이터 & JSON-LD

- Schema.org TechArticle 타입 사용
- generateMetadata에서 노드별 동적 메타데이터 생성
- JSON-LD는 <script type="application/ld+json"> 으로 삽입

## SSG 패턴

```tsx
// nodes/[slug]/page.tsx
export async function generateStaticParams() {
  const nodes = getAllNodes(); // content/nodes/*.md에서 수집
  return nodes.map((node) => ({ slug: node.slug }));
}
```

## Turbopack 주의사항

- Next.js 16에서 Turbopack이 기본
- next-mdx-remote: `transpilePackages: ['next-mdx-remote']` 필수 (없으면 Turbopack 빌드 에러)
- dynamic import는 정상 동작

## 에러 & 로딩 파일 컨벤션

### 에러 경계 3계층

| 파일 | 잡는 범위 | layout 생존 여부 |
|------|---------|---------------|
| `global-error.tsx` | RootLayout 자체 붕괴 | ✗ (html+body 직접 렌더링) |
| `error.tsx` | 해당 segment page.tsx 에러 | ✓ (ThemeToggle 등 layout 살아있음) |
| `FeatureBoundary` 컴포넌트 | 개별 기능 단위 | ✓ (다른 기능 계속 동작) |

```
global-error.tsx    ← RootLayout 붕괴 (최후 보루)
app/error.tsx       ← page.tsx 렌더링 실패
FeatureBoundary     ← 같은 페이지 내 패널/기능 독립 격리
```

### 주의: error.tsx로 패널별 격리 불가

같은 route segment(같은 페이지) 안에서 그래프 패널과 콘텐츠 패널을 독립 격리하려면 `error.tsx` 파일로는 불가능. 반드시 `FeatureBoundary` 컴포넌트를 사용해야 함.

### loading.tsx

이 프로젝트에서는 **사용하지 않음**. 이유:
- `graph-data.json`은 정적 파일 (네트워크 대기 없음)
- `page.tsx`는 동기 Server Component
- 패널 내부 `FeatureBoundary`의 skeleton으로 충분
- route-level loading.tsx는 불필요한 UX 플래시를 유발

### global-error.tsx 작성 시 주의

RootLayout을 대체하므로 반드시:
1. `<html>` + `<body>` 직접 렌더링
2. `globals.css` import (CSS 변수, Tailwind)
3. layout.tsx의 `themeScript` 동일하게 포함 (다크모드 유지)

## Gotchas

- **React 19 + Next.js 16 정적 생성 버그**: 루트 레이아웃에 `useSyncExternalStore`를 사용하는 클라이언트 컴포넌트가 있으면 정적 프리렌더링이 실패 (`Cannot read properties of null`). `bun run dev`는 정상. Vercel 배포는 다를 수 있음. 회피책: `export const dynamic = "force-dynamic"`.
- App Router에서 클라이언트 컴포넌트는 'use client' 명시
- react-force-graph-2d는 반드시 클라이언트 컴포넌트
- URL 쿼리 파라미터는 useSearchParams() 사용 (클라이언트)
- generateStaticParams + generateMetadata 조합으로 SEO 최적화
