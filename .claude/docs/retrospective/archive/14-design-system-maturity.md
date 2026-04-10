# 14. 디자인 시스템 성숙도 평가

## 이 문서의 위치

> **Tier 4: 시스템 성숙도** — 디자인 시스템, 문서, 에러 처리, 부채를 평가
>
> 📍 현재 문서: **14-design-system-maturity** (11/17)
>
> **권장 읽기 순서**: 01 → 06 → 03 → 04 → 05 → 02 → 10 → 07 → 08 → 09 → **14** → 15 → 12 → 11 → 13 → 16 → 17
>
> 이전: [09-seo-accessibility](./09-seo-accessibility.md) · 다음: [15-documentation-quality](./15-documentation-quality.md)

## 개요

9개 클러스터 컬러, 라이트/다크 팔레트, CSS 변수 + JS 토큰 이중 체계의 확장성과 일관성을 평가한다.

## 디자인 시스템 구성 요소

### 1. 컬러 시스템

**클러스터 컬러 (9개, Nintendo Retro 킥 컬러)**

| 클러스터 | 색상 | 용도 |
|----------|------|------|
| geodesy | 고유 HEX | 노드 색상, 그래프 |
| coordinate | 고유 HEX | 노드 색상, 그래프 |
| 3d-data | 고유 HEX | 노드 색상, 그래프 |
| rendering | 고유 HEX | 노드 색상, 그래프 |
| optimization | 고유 HEX | 노드 색상, 그래프 |
| web-platform | 고유 HEX | 노드 색상, 그래프 |
| devops | 고유 HEX | 노드 색상, 그래프 |
| gis-application | 고유 HEX | 노드 색상, 그래프 |
| data-formats | 고유 HEX | 노드 색상, 그래프 |

**이중 체계**: CSS 변수(@theme) + JS 상수(tokens.ts)
- CSS 변수: Tailwind 유틸리티 클래스에서 사용 (`bg-cluster-geodesy`)
- JS 상수: three.js 캔버스 렌더링에서 사용 (CSS 변수 접근 불가)

**라이트/다크 팔레트**: tokens.ts에 정의
- 그래프 캔버스 배경색
- 노드 기본색, 호버색
- 엣지 색상

### 2. 타이포그래피

| 요소 | 값 | 비고 |
|------|------|------|
| 본문 | --font-sans | 시스템 폰트 스택 |
| 제목 | --font-display | 차별화된 디스플레이 폰트 |

### 3. 컴포넌트 라이브러리

| 컴포넌트 | 위치 | 재사용 횟수 |
|----------|------|------------|
| SiteHeader | components/ | 전역 1회 |
| SiteFooter | components/ | 전역 1회 |
| ThemeToggle | components/ | 헤더에 포함 |
| ErrorCard | components/ | 에러 바운더리 |
| FeatureBoundary | components/ | 피처 래핑 |
| Skeleton | components/ | 로딩 상태 |
| ScrollToTopButton | components/ | 콘텐츠 섹션 |
| ScrollDownIndicator | components/ | 홈 페이지 |
| Icons (11개) | components/icons/ | 다양한 곳 |

### 4. Storybook

- 디자인 시스템 스토리 일부 존재 (`src/stories/`)
- 전체 컴포넌트 커버리지 부족

## 성숙도 평가

| 영역 | 점수 | 근거 |
|------|------|------|
| 컬러 일관성 | ★★★★★ | 단일 소스(tokens.ts + @theme), 하드코딩 색상 없음 |
| 타이포그래피 | ★★★★☆ | 폰트 변수 정의, 프로즈 스타일(prose-jithub) |
| 스페이싱 | ★★★☆☆ | Tailwind 기본값 의존, 커스텀 스페이싱 토큰 없음 |
| 컴포넌트 재사용 | ★★★★☆ | 공유 컴포넌트 적절, 일부 피처 컴포넌트 재사용 여지 |
| 다크모드 | ★★★★☆ | 전환 동작 양호, 깜빡임 해결, 일부 미세 조정 필요 |
| Storybook | ★★☆☆☆ | 시작만 된 상태, 전체 커버리지 부족 |
| 문서화 | ★★★★☆ | design-system Skill에 정리, 실제 사용 예시 보강 필요 |

### 강점
1. **단일 소스 원칙**: 색상이 tokens.ts와 @theme 한 곳에서 정의
2. **Tailwind 4 @theme 활용**: CSS 변수로 디자인 토큰 선언
3. **이중 체계의 합리적 이유**: 캔버스(JS)와 DOM(CSS) 각각 최적 방식
4. **클러스터 컬러 네이밍**: 의미 기반 이름 (geodesy, rendering 등)

### 약점
1. **스페이싱 시스템 부재**: Tailwind 기본값만 사용, 커스텀 규칙 없음
2. **Storybook 미완성**: 컴포넌트 카탈로그로서의 역할 부족
3. **반응형 규칙 미체계화**: 브레이크포인트별 디자인 규칙 부재
4. **애니메이션 토큰 부재**: 트랜지션 duration, easing 등 표준화 안 됨

## 다음 프로젝트를 위한 교훈

1. **디자인 토큰 우선**: 프로젝트 시작 시 색상, 타이포, 스페이싱, 애니메이션 토큰을 먼저 정의
2. **Storybook 병행 개발**: 컴포넌트 개발과 동시에 스토리 작성
3. **반응형 규칙 체계화**: 브레이크포인트별 레이아웃/사이즈 규칙 사전 정의
4. **JS-only 토큰의 필요성 인지**: 캔버스 렌더링 시 CSS 변수 사용 불가 → 별도 JS 상수 필요

## 심화 탐구 가이드

### 이 회고를 더 깊이 파고들 때 확인할 것
- [ ] src/ 내에서 하드코딩된 색상값(#xxx, rgb) 검색 — 토큰 미사용 사례
- [ ] Storybook에 등록된 컴포넌트 vs 전체 컴포넌트 수 비교
- [ ] 다크모드 전환 시 깜빡임(FOUC) 발생 여부 실제 녹화 테스트
- [ ] 클러스터 컬러 9개의 접근성(색각 이상자 구분 가능 여부) 검증

### 관련 소스 파일
- `src/constants/tokens.ts` — JS 디자��� 토큰
- `src/constants/cluster.ts` — 클러스터 컬러 정의
- `src/app/globals.css` — @theme CSS 변수
- `src/stories/` — Storybook 스토리

### 관련 회고 문서
- [09-seo-accessibility](./09-seo-accessibility.md) — 색상 대비 접근성
- [05-core-code-review](./05-core-code-review.md) — 테마 시스템 코드 분석
- [15-documentation-quality](./15-documentation-quality.md) — 디자인 시스템 문서화 수준

## 액션 아이템

- [ ] 스페이싱 토큰 정의 (컴포넌트 간 간격, 섹션 패딩 등)
- [ ] 애니메이션 토큰 정의 (duration, easing 표준화)
- [ ] Storybook 컴포넌트 커버리지 확대
- [ ] 다크모드 전환 시 미세 깜빡임 최종 점검
- [ ] 디자인 시스템 시작 템플릿 작성 (다음 프로젝트용)
