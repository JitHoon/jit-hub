# 08. 성능 및 번들 분석

## 이 문서의 위치

> **Tier 3: 프로세스 품질** — 개발 프로세스와 품질 관리를 평가
>
> 📍 현재 문서: **08-performance-bundle** (9/17)
>
> **권장 읽기 순서**: 01 → 06 → 03 → 04 → 05 → 02 → 10 → 07 → **08** → 09 → 14 → 15 → 12 → 11 → 13 → 16 → 17
>
> 이전: [07-testing-strategy](./07-testing-strategy.md) · 다음: [09-seo-accessibility](./09-seo-accessibility.md)

## 개요

three.js + react-force-graph-3d를 포함하는 3D 포트폴리오의 성능 베이스라인을 정리하고, 최적화 기회를 식별한다.

## 현재 최적화 현황

### 적용된 최적화

| 최적화 | 구현 위치 | 효과 |
|--------|----------|------|
| Dynamic Import (SSR: false) | GraphCanvas3D | three.js 서버 실행 방지, 코드 스플리팅 |
| THREE.Geometry 캐싱 | useGraph3DRenderer | GC 압력 감소, 메모리 효율화 |
| 반응형 LOD | useGraph3DRenderer | 모바일 세그먼트 32→16 |
| 물리 시뮬레이션 워밍업 | GraphCanvas3D | 100 ticks 사전 계산 후 렌더링 |
| graph-data.json 정적 생성 | generate-graph-data.ts | 런타임 파싱 불필요 |
| rehype-pretty-code (서버 사이드) | MdxRenderer | 클라이언트 JS 제로 구문 강조 |

### 미적용 최적화 (기회)

| 최적화 | 예상 효과 | 복잡도 |
|--------|----------|--------|
| InstancedMesh | 드로우 콜 감소 (21개 → 1개) | 중 |
| OffscreenCanvas | 메인 스레드 부하 감소 | 높 |
| Tree shaking (three.js) | 번들 크기 감소 | 중 |
| Image 최적화 (next/image) | LCP 개선 | 낮 |
| Font subsetting | FOUT/FOIT 감소 | 낮 |
| Prefetch/Preconnect | 초기 로딩 개선 | 낮 |

## 번들 구성 추정

### 주요 의존성 크기 (npm 기준)

| 패키지 | 추정 크기 | 비고 |
|--------|----------|------|
| three.js | ~600KB (gzip ~150KB) | 3D 렌더링 코어 |
| react-force-graph-3d | ~50KB | 그래프 라이브러리 |
| next-mdx-remote | ~30KB | MDX 서버 렌더링 |
| gray-matter | ~20KB | 프론트매터 파싱 |
| zod | ~50KB | 스키마 검증 |
| tailwindcss | 빌드 타임만 | 런타임 제로 |

three.js가 전체 클라이언트 번들의 가장 큰 비중을 차지할 것으로 예상.

## Core Web Vitals 예측

| 지표 | 예상 | 위험 요소 |
|------|------|----------|
| LCP | 보통~양호 | three.js dynamic import 후 3D 캔버스 렌더링 |
| FID/INP | 양호 | 물리 시뮬레이션이 메인 스레드에서 실행 |
| CLS | 양호 | 레이아웃 고정, Skeleton 폴백 |

## 성능 병목 예상 지점

### 1. three.js 초기 로딩
- Dynamic import이지만 여전히 ~150KB(gzip) 다운로드 필요
- 워밍업 100 ticks 동안 프레임 드롭 가능

### 2. 노드 수 증가 시 물리 시뮬레이션
- 현재 21개 노드는 문제없음
- 100+ 노드 시 d3-force 시뮬레이션 부하 증가

### 3. 호버 애니메이션
- 노드 호버 시 색상 전환이 매 프레임 THREE.Color 업데이트
- requestAnimationFrame 기반이지만 저사양 기기에서 프레임 드롭 가능

## 측정 계획

### 즉시 측정 가능
- [ ] Lighthouse 성능/접근성/SEO/Best Practices 점수
- [ ] `next build` 빌드 사이즈 리포트
- [ ] Chrome DevTools Performance 탭 프로파일링

### 도구 도입 후 측정
- [ ] @next/bundle-analyzer로 번들 구성 시각화
- [ ] web-vitals 라이브러리로 실사용자 RUM 데이터 수집
- [ ] Lighthouse CI로 PR별 성능 회귀 감지

## 심화 탐구 가이드

### 이 회고를 더 깊이 파고들 때 확인할 것
- [ ] `bun run build` 후 `.next/` 번들 사이즈 측정
- [ ] Lighthouse CLI로 4개 카테고리 점수 측정 (로컬 + Vercel 배포)
- [ ] Chrome DevTools Performance 탭으로 3D 그래프 초기 로딩 프로파일링
- [ ] three.js import 분석 — 실제 사용하는 모듈 vs 전체 번들 비교

### 관련 소스 파일
- `src/features/graph/components/GraphCanvas3D.tsx` — dynamic import 진입점
- `src/features/graph/hooks/useGraph3DRenderer.ts` — THREE.js 사용 범위
- `next.config.ts` — 빌드 최적화 설정

### 관련 회고 문서
- [05-core-code-review](./05-core-code-review.md) — 성능 관련 코드 패턴 (캐싱, LOD)
- [09-seo-accessibility](./09-seo-accessibility.md) — Lighthouse SEO/접근성 점수
- [16-enhancement-roadmap](./16-enhancement-roadmap.md) — 성능 최적화 로드맵

## 액션 아이템

- [ ] Lighthouse 베이스라인 점수 측정 및 기록
- [ ] @next/bundle-analyzer 도입
- [ ] three.js tree shaking 가능 여부 조사
- [ ] InstancedMesh 적용 PoC (노드 수 증가 대비)
- [ ] 폰트 서브셋팅 적용 (한글 폰트 특히 중요)
