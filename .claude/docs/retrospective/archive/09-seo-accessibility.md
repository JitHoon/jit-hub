# 09. SEO 및 접근성 효과 측정

## 이 문서의 위치

> **Tier 3: 프로세스 품질** — 개발 프로세스와 품질 관리를 평가
>
> 📍 현재 문서: **09-seo-accessibility** (10/17)
>
> **권장 읽기 순서**: 01 → 06 → 03 → 04 → 05 → 02 → 10 → 07 → 08 → **09** → 14 → 15 → 12 → 11 → 13 → 16 → 17
>
> 이전: [08-performance-bundle](./08-performance-bundle.md) · 다음: [14-design-system-maturity](./14-design-system-maturity.md)

## 개요

듀얼 라우트 SEO 전략과 접근성 구현의 효과를 평가한다.

## SEO 구현 현황

### 적용된 SEO 요소

| 요소 | 구현 | 파일 |
|------|------|------|
| 듀얼 라우트 | / (UX) + /nodes/[slug] (SEO) | app/page.tsx, app/[slug]/page.tsx |
| 메타데이터 | title, description, openGraph, twitter | app/layout.tsx, [slug]/page.tsx |
| JSON-LD | WebSite + Person + TechArticle | layout.tsx, [slug]/page.tsx |
| Sitemap | 동적 생성 (getAllSlugs) | app/sitemap.ts |
| Robots.txt | 크롤링 허용 + sitemap URL | app/robots.ts |
| Canonical URL | 중복 콘텐츠 방지 | 메타데이터에 포함 |
| OG Image | 정적 이미지 | public/ |
| Favicon/Icons | favicon, apple-icon | app/ |
| Web App Manifest | PWA 기본 메타데이터 | manifest |

### SEO 전략 평가

**듀얼 라우트 전략 (★★★★☆)**
- 장점: SPA UX + SEO 인덱싱 양립
- 한계: canonical URL 설정이 중요 — 잘못되면 중복 콘텐츠 패널티
- 검증 필요: Google Search Console에서 실제 인덱싱 상태 확인

**JSON-LD 구조화 데이터 (★★★★★)**
- WebSite: 사이트 전체 정보
- Person: 저자(개발자) 정보
- TechArticle: 각 노드의 기술 문서 정보
- 리치 스니펫 가능성 높음

**Sitemap + Robots (★★★★★)**
- getAllSlugs() 기반 동적 생성 — 노드 추가 시 자동 반영
- robots.ts에서 크롤링 범위 명시

## 접근성 구현 현황

### 적용된 접근성 요소

| 요소 | 구현 | 수준 |
|------|------|------|
| 스크린리더 노드 목록 | GraphSection에 숨겨진 목록 | WCAG A |
| 3D 컨테이너 aria-label | role="img" + aria-label | WCAG A |
| WebGL 폴백 UI | ErrorCard (접근 가능한 대체 콘텐츠) | WCAG A |
| 키보드 내비게이션 | 기본 탭 순서 | WCAG A |
| 다크모드 | prefers-color-scheme 존중 | WCAG AA |
| 제목 계층 | h1 → h2 → h3 순차적 | WCAG A |
| rehypeSlug | 제목 앵커 링크 | 내비게이션 보조 |

### 접근성 부족 영역

| 영역 | 현재 상태 | 목표 |
|------|----------|------|
| 3D 그래프 키보드 탐색 | 미구현 | 노드 간 키보드 이동 |
| 색상 대비 | 미검증 | WCAG AA 충족 확인 |
| 포커스 표시기 | 기본값 의존 | 커스텀 포커스 링 |
| aria-live 알림 | 미구현 | 노드 선택 시 알림 |
| 모션 감소 | 미구현 | prefers-reduced-motion 존중 |
| 대체 텍스트 | 부분적 | 모든 시각 요소에 alt/aria-label |

## 효과 측정 계획

### SEO 측정
- [ ] Google Search Console 등록 상태 확인
- [ ] 인덱싱된 페이지 수 (목표: 21개 노드 + 홈)
- [ ] 검색 노출 키워드 분석
- [ ] 리치 스니펫 생성 여부 (JSON-LD 효과)
- [ ] robots.txt 유효성 검증 (Google 도구)

### 접근성 측정
- [ ] Lighthouse 접근성 점수
- [ ] axe-core 자동 검사 결과
- [ ] 스크린리더(NVDA/VoiceOver) 수동 테스트
- [ ] 키보드 전용 탐색 테스트
- [ ] 색상 대비 검사 (WebAIM Contrast Checker)

## 심화 탐구 가이드

### 이 회고를 더 깊이 파고들 때 확인할 것
- [ ] Google Rich Results Test로 JSON-LD 유효성 검증
- [ ] Google Search Console에서 실제 인덱싱 페이지 수 확인
- [ ] Lighthouse 접근성 점수 측정 + 개별 항목 분석
- [ ] axe-core DevTools 확장으로 접근성 위반 사항 전수 조사

### 관련 소스 파일
- `src/app/layout.tsx` — WebSite + Person JSON-LD
- `src/app/nodes/[slug]/page.tsx` — TechArticle JSON-LD + 메타데이터
- `src/app/sitemap.ts`, `src/app/robots.ts` — 크롤링 설정
- `src/features/content/utils/structured-data.ts` — JSON-LD 빌더

### 관련 회고 문서
- [08-performance-bundle](./08-performance-bundle.md) — Lighthouse 성능 점수와 함께 측정
- [04-architecture-maturity](./04-architecture-maturity.md) — 듀얼 라우트 SEO 전략 평가
- [14-design-system-maturity](./14-design-system-maturity.md) — 색상 대비 접근성

## 액션 아이템

- [ ] Google Search Console에서 실제 인덱싱 상태 확인
- [ ] JSON-LD 유효성 검증 (Google Rich Results Test)
- [ ] axe-core 기반 접근성 자동 테스트 추가
- [ ] prefers-reduced-motion 미디어 쿼리 지원
- [ ] 3D 그래프 키보드 탐색 구현 검토
- [ ] 색상 대비 WCAG AA 준수 검증
