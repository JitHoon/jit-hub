# 07. 테스트 전략 회고

## 이 문서의 위치

> **Tier 3: 프로세스 품질** — 개발 프로세스와 품질 관리를 평가
>
> 📍 현재 문서: **07-testing-strategy** (8/17)
>
> **권장 읽기 순서**: 01 → 06 → 03 → 04 → 05 → 02 → 10 → **07** → 08 → 09 → 14 → 15 → 12 → 11 → 13 → 16 → 17
>
> 이전: [10-workflow-efficiency](./10-workflow-efficiency.md) · 다음: [08-performance-bundle](./08-performance-bundle.md)

## 개요

유닛 테스트 5개, E2E 테스트 7개인 현재 테스트 전략의 적정성을 평가하고, 테스트 ROI를 분석한다.

## 현재 테스트 인벤토리

### 유닛 테스트 (Vitest, co-located)

| 파일 | 대상 | 테스트 영역 |
|------|------|------------|
| cluster.test.ts | 클러스터 상수 | 9개 클러스터 정의 무결성 |
| node-connections.test.ts | 노드 연결 유틸 | 관계 그래프 로직 |
| fix-emphasis.test.ts | 텍스트 처리 | 마크다운 강조 구문 수정 |
| builder.test.ts | 그래프 빌더 | 노드/엣지 생성 로직 |
| schema.test.ts | 프론트매터 스키마 | Zod 검증 로직 |

### E2E 테스트 (Playwright)

| 파일 | 테스트 시나리오 |
|------|----------------|
| smoke.spec.ts | 기본 페이지 로딩 |
| home-3d.spec.ts | WebGL 폴백, URL 파라미터 노드 선택 |
| theme.spec.ts | 테마 전환 |
| design-tokens.spec.ts | 디자인 토큰 일관성 |
| seo.spec.ts | SEO 메타데이터, JSON-LD |
| vertical-layout.spec.ts | 세로 레이아웃 |
| site-header.spec.ts | 헤더 네비게이션 |

## 테스트 ROI 분석

### 테스트가 실제로 잡아준 버그

| 버그 | 발견 경로 | 테스트 유형 |
|------|----------|------------|
| WebGL 미지원 환경 크래시 | E2E (home-3d) | 폴백 UI 렌더링 검증 |
| URL 파라미터 노드 선택 실패 | E2E (home-3d) | 콘텐츠 렌더링 검증 |
| 테마 전환 후 상태 불일치 | E2E (theme) | localStorage 동기화 검증 |
| 클러스터 색상 누락 | 유닛 (cluster) | 9개 클러스터 완전성 검증 |

### 테스트가 놓친 영역

| 영역 | 위험도 | 이유 |
|------|--------|------|
| 콘텐츠 파이프라인 전체 흐름 | 높음 | 빌드 스크립트 ← E2E로 커버하기 어려움 |
| 3D 렌더링 성능 | 중간 | 성능 회귀 감지 테스트 부재 |
| MDX 렌더링 결과 | 중간 | 커스텀 컴포넌트 렌더링 검증 부재 |
| 모바일 반응형 | 중간 | viewport별 E2E 부재 |
| 접근성 | 중간 | axe-core 등 자동 접근성 테스트 부재 |

## 테스트 전략 평가

### 강점
1. **E2E가 사용자 시나리오 중심**: 실제 브라우저에서 주요 플로우 검증
2. **WebGL 폴백 테스트**: 엣지 케이스(WebGL 미지원) 명시적 테스트
3. **디자인 토큰 일관성 테스트**: CSS 변수가 올바르게 적용되는지 검증
4. **co-located 유닛 테스트**: 소스 파일 옆에 테스트 → 유지보수 용이

### 약점
1. **유닛 테스트 비율 낮음**: 5개 유닛 / 4,644 LOC = 약 1 테스트/929 LOC
2. **파이프라인 통합 테스트 부재**: Zod 검증 → graph-data.json 생성 전체 흐름
3. **성능 회귀 테스트 부재**: three.js 렌더링 성능 베이스라인 없음
4. **접근성 자동 테스트 부재**: 스크린리더 지원 수준 미검증

## 테스트 피라미드 현황

```
        /  E2E (7)  \          ← 현재 비율이 높음
       / Integration (0) \     ← 비어있음
      /    Unit (5)         \  ← 확장 필요
```

이상적 피라미드와 비교하면 "역삼각형"에 가까움. E2E가 유닛보다 많은 상태.

## 테스트 작성 시간 대비 효과

| 테스트 유형 | 추정 작성 시간 | 발견 버그 수 | ROI |
|------------|--------------|-------------|-----|
| E2E | ~3시간 (7개) | 3+ | 높음 |
| 유닛 | ~1시간 (5개) | 1+ | 보통 |

E2E 테스트의 ROI가 현재 프로젝트 규모에서는 더 높음. 하지만 노드 수 증가 시 유닛 테스트 필요성 증가.

## 심화 탐구 가이드

### 이 회고를 더 깊이 파고들 때 확인할 것
- [ ] 각 E2E 테스트가 실제로 잡아낸 회귀 버그 사례 수집 (git log에서 fix 커밋과 테스트 연관)
- [ ] 유닛 테스트 커버리지 리포트 생성 (vitest --coverage)
- [ ] E2E 실행 시간 측정 — CI에서 병목이 되는지 확인
- [ ] 테스트가 없는 핵심 유틸 함수 목록화 (pipeline.ts, connected-nodes.ts 등)

### 관련 소스 파일
- `src/constants/cluster.test.ts`, `src/features/content/types/schema.test.ts` — 유닛 테스트 예시
- `test/e2e/` — E2E 테스트 전체
- `vitest.config.ts`, `playwright.config.ts` — 테스트 설정

### 관련 회고 문서
- [04-architecture-maturity](./04-architecture-maturity.md) — 테스트 대상 아키텍처
- [12-error-handling-patterns](./12-error-handling-patterns.md) — 테스트가 잡아야 할 에러 패턴
- [11-tech-debt-inventory](./11-tech-debt-inventory.md) — 테스트 부족이 부채에 미치는 영향

## 액션 아이템

- [ ] 콘텐츠 파이프라인 통합 테스트 추가 (Zod 검증 → JSON 생성 전체 흐름)
- [ ] 그래프 빌더 유닛 테스트 확장 (엣지 케이스: 순환 참조, 고립 노드)
- [ ] 모바일 viewport E2E 테스트 추가 (768px 이하)
- [ ] axe-core 기반 접근성 자동 테스트 도입 검토
- [ ] Lighthouse CI 통합으로 성능 회귀 방지
