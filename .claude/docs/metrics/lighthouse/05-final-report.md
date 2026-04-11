# Lighthouse 최적화 최종 보고서

> 작업 기간: 2026-04-11
> 목표: 전 카테고리 100점 달성

---

## 최종 점수

| Page | Perf | A11y | Best Practices | SEO | 합계 |
|------|------|------|----------------|-----|------|
| `/` (홈) | **95** | **100** | **100** | **100** | 395/400 |
| `/nodes/cesium-adoption` | **100** | **100** | **100** | **100** | 400/400 |
| `/nodes/3d-tiles-spec` | **100** | **100** | **100** | **100** | 400/400 |

**SSG 노드 페이지: 전 카테고리 100점 달성.**
홈 페이지: Performance 95점 (three.js 번들 고유 한계).

---

## 개선 이력

### 1. 색상 대비 WCAG AA 준수 — [02-improve-color-contrast.md](./02-improve-color-contrast.md)

| 항목 | 내용 |
|------|------|
| 대상 | Accessibility 96 → 100 |
| 변경 | `--muted` 색상값 조정 (라이트 #888→#737, 다크 #707→#878) |
| 결과 | color-contrast 이슈 0건, **A11y 100점** |

### 2. 가변 폰트 전환 — [03-font-variable-optimization.md](./03-font-variable-optimization.md)

| 항목 | 내용 |
|------|------|
| 대상 | Performance (FCP/LCP) |
| 변경 | Noto Sans KR, Lexend → 가변 폰트 (슬라이스당 파일 수 1/3) |
| 결과 | 노드 페이지 99점 유지. 홈 페이지는 JS 번들 병목에 가려 수치 미반영 |

### 3. 번들 분석 + 정적 셸 + 서버 컴포넌트 분리 — [04-bundle-analyzer.md](./04-bundle-analyzer.md)

| 항목 | 내용 |
|------|------|
| 대상 | Performance 88 → 95+ |
| 분석 | three.js 1.4MB (전체 번들의 64%), tree shaking 불가 확인 |
| 변경 | page.tsx Static 전환, HomeLayout 서버 컴포넌트 분리, CSS 정리 |
| 결과 | TBT 400ms → 180ms (-55%), SI 3.9s → 3.1s (-0.8s), **Perf 88 → 95** |

---

## Core Web Vitals 변화 추이 (홈 페이지)

| Metric | 초기 (96점) | 폰트 후 (88점) | 최종 (95점) | 100점 기준 |
|--------|------------|---------------|------------|-----------|
| FCP | 1.1s | 1.6s | 1.7s | < 0.8s |
| LCP | 1.7s | 1.9s | 2.0s | < 1.2s |
| SI | 1.9s | 3.9s | 3.1s | < 1.0s |
| TBT | 220ms | 400ms | **180ms** | 0ms |
| CLS | 0 | 0 | 0.011 | 0 |

---

## 홈 페이지 Performance 95점의 원인과 한계

### 병목: three.js / react-force-graph-3d (1.4MB)

```
GraphCanvas3D
  └── dynamic import (ssr: false)
       └── react-force-graph-3d
            └── three.js 전체 번들 (1.1MB + 312KB)
```

### 검토 후 배제한 최적화 방향

| 방향 | 배제 사유 |
|------|----------|
| three.js tree shaking | react-force-graph-3d 내부 `import * as THREE` → 앱 레벨 개입 불가 |
| react-force-graph-3d → 2d 전환 | 3D 시각화가 프로젝트 핵심 기능 |
| Intersection Observer lazy loading | 그래프가 첫 화면(60vh)에 배치, 이미 dynamic import 적용 중 |
| react-force-graph-3d 포크 | 유지보수 부담 대비 절감량 불확실 |
| three.js CDN externals | 총 전송량 동일, 번들 분리 효과만 (점수 개선 미미) |

### 결론

현 아키텍처(react-force-graph-3d + three.js)에서 **홈 페이지 Performance 95점이 실질적 상한**.
three.js 번들을 제거하지 않는 한 FCP/LCP/TBT의 추가 개선은 불가능하며,
3D 그래프가 프로젝트의 핵심 기능이므로 제거는 적절하지 않음.

---

## 산출물 목록

| 파일 | 내용 |
|------|------|
| [00-wiki.md](./00-wiki.md) | Lighthouse 용어 사전 |
| [01-baseline.md](./01-baseline.md) | 베이스라인 측정 + 개선 추적 |
| [02-improve-color-contrast.md](./02-improve-color-contrast.md) | 색상 대비 WCAG AA 수정 |
| [03-font-variable-optimization.md](./03-font-variable-optimization.md) | 가변 폰트 전환 |
| [04-bundle-analyzer.md](./04-bundle-analyzer.md) | 번들 분석 + 정적 셸/서버 컴포넌트 분리 |
| [05-final-report.md](./05-final-report.md) | 최종 보고서 (본 문서) |

---

## 향후 재검토 시점

- **react-force-graph-3d가 three.js tree shaking을 지원**하게 되면 TBT/TTI 대폭 개선 가능
- **Next.js Turbopack이 @next/bundle-analyzer를 지원**하면 정밀 분석 가능
- 새로운 대형 의존성 추가 시 번들 크기 재점검 권장
