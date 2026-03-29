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

## Gotchas

- App Router에서 클라이언트 컴포넌트는 'use client' 명시
- react-force-graph-2d는 반드시 클라이언트 컴포넌트
- URL 쿼리 파라미터는 useSearchParams() 사용 (클라이언트)
- generateStaticParams + generateMetadata 조합으로 SEO 최적화
