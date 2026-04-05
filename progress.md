# 프로젝트 진행 상황

## 현재 상태

**1차 MVP 배포 완료** (2026-04-05) | Phase 15 완료

## 완료된 Phase 요약

- **Phase 0**: 클러스터 9개 매핑 + 21개 노드 업데이트
- **Phase 1**: Next.js 16 + TS strict + ESLint/Prettier + 디렉토리 구조
- **Phase 2**: Git & GitHub public 레포 + 브랜치 보호 + husky pre-commit
- **Phase 3-A**: 디자인 방향 확정 + 프로토타입 구축
- **Phase 3-B**: 디자인 시스템 토큰 + 스킬 + 하네스 연동 + E2E 테스트
- **Phase 4**: 콘텐츠 파이프라인 (Zod + pipeline.ts + graph-data.json + MDX)
- **Phase 5-0**: Playwright E2E 인프라
- **Phase 5**: 3D 그래프 (GraphCanvas3D + 렌더링 훅 5종 + CameraHint)
- **Phase 6**: 콘텐츠 패널 + 분할 뷰
- **Phase 7**: 홈 페이지 조립 + 전환 애니메이션 + 노드 플로팅
- **Phase 8**: 홈페이지 리디자인 v2 (SiteHeader, 3D 인터랙션, ContentSection, SEO 정적 페이지)
- **Phase 9**: WebGL 폴백 + 접근성 + 모바일 LOD + 성능 최적화
- **Phase 10**: JSON-LD + sitemap.ts + robots.ts
- **Phase 11**: Vercel 배포 + CI (vitest + Playwright)
- **Phase 12**: SEO · 공유 최적화 (OG 이미지, favicon, manifest, 메타데이터)
- **Phase 13**: Canonical URL + 내부 링크 SEO 정합성 + Google Search Console 등록
- **Phase 14**: 메인 페이지 H1 + 소개 텍스트 (조건부 렌더링)

## 다음 작업: SEO & 사이트 완성도 개선

Chrome 분석 기반 (SEO 55/100, 완성도 68/100). sitemap, robots, JSON-LD, 노드별 메타데이터는 이미 구현 완료 — 실제 미비한 부분만 대상.

### Phase 15: Footer 컴포넌트 · 브랜치: `feat/footer`

| # | 작업 | 크기 | 의존 | 상태 |
|---|------|------|------|------|
| 15-1 | SiteFooter 컴포넌트 생성 — 저작자, 저작권, GitHub 링크 (`src/components/SiteFooter.tsx`) | S | - | [x] |
| 15-2 | HomeLayout에 Footer 추가 — `/?node=` 페이지 포함 자동 적용, fixed bottom 레이어와 겹침 방지 `pb-16` 이상 확보 (`src/app/HomeLayout.tsx`) | XS | 15-1 | [x] |
| 15-3 | 노드 상세 페이지에 Footer 추가 (`src/app/nodes/[slug]/page.tsx`) | XS | 15-1 | [x] |
<!-- 완료 기준: 홈·노드 상세 페이지 하단에 Footer 렌더링, ScrollToTopButton과 겹치지 않음 -->

### Phase 16: 노드 검색 기능 · 브랜치: `feat/node-search`

| # | 작업 | 크기 | 의존 | 상태 |
|---|------|------|------|------|
| 16-1 | NodeSearch 컴포넌트 생성 — 클라이언트 사이드 substring 매칭 (`src/features/graph/components/NodeSearch.tsx`) | S | - | [ ] |
| 16-2 | 검색 입력창을 기존 fixed bottom 레이어(`pointer-events-none`)에 배치, 입력 요소에 `pointer-events-auto` 적용 (`src/features/graph/components/NodeSearch.tsx`) | S | 16-1 | [ ] |
| 16-3 | HomeLayout에 검색 통합 (`src/app/HomeLayout.tsx`) | XS | 16-2 | [ ] |
<!-- 완료 기준: 검색어 입력 시 매칭 노드 목록 표시, 클릭 시 노드 선택 -->

### Phase 17: 콘텐츠 외부 링크 · 브랜치: `content/external-links`

| # | 작업 | 크기 | 의존 | 상태 |
|---|------|------|------|------|
| 17-1 | MDX 링크 컴포넌트에서 외부 링크 `target="_blank" rel="noopener noreferrer"` 처리 (구현 완료 확인) | XS | - | [x] |
| 17-2 | 각 노드 마크다운에 관련 공식 문서 외부 링크 추가 (`contents/nodes/*.md`) — 콘텐츠 편집, 우선순위 낮음 | S | - | [ ] |
<!-- 완료 기준: 주요 노드에 공식 문서 링크 1개 이상 포함 -->

## 핵심 결정 사항

- GitHub: **Public** 레포
- 다크 모드: html.dark 클래스 기반
- 클러스터: v2 기준 9개
- 디자인: **Modern Gray + Nintendo Retro Kick**
- 타이포그래피: **Lexend (display) + Noto Sans KR (body)**
- 그래프: **3D Starfield** (react-force-graph-3d + Three.js), SEO 페이지는 2D 유지
- 배포: **Vercel Hobby**
