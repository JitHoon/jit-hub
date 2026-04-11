# Lighthouse Baseline

> 최초 측정: 2026-04-11 | 최종 갱신: 2026-04-11

## 현재 점수

| Page | Perf | A11y | BP | SEO |
|------|------|------|----|-----|
| `/` (홈) | **95** | 100 | 100 | 100 |
| `/nodes/cesium-adoption` | **100** | 100 | 100 | 100 |
| `/nodes/3d-tiles-spec` | **100** | 100 | 100 | 100 |

노드 페이지 전 카테고리 100점 달성. **홈 페이지 Performance만 잔여 감점.**

---

## 개선 이력

| 단계 | 홈 Perf | 노드 Perf | A11y | 주요 변경 |
|------|---------|-----------|------|----------|
| 초기 측정 | 96 | 99 | 96 | — |
| 색상 대비 수정 | 94 | 98 | **100** | `--muted` WCAG AA 충족 ([상세](./02-improve-color-contrast.md)) |
| 가변 폰트 최적화 | 88 | 99 | 100 | 폰트 서브셋 + display swap ([상세](./03-font-variable-optimization.md)) |
| Static 셸 + HomeLayout 분리 | **95** | **100** | 100 | Static 라우트, 서버 컴포넌트, CSS 정리 ([상세](./04-bundle-analyzer.md)) |

---

## 홈 페이지 Performance 상세 (95점)

### Core Web Vitals

| Metric | 값 | 100점 기준 | 상태 |
|--------|----|-----------|------|
| FCP | 1.7s | < 0.8s | 초과 |
| LCP | 2.0s | < 1.2s | 초과 |
| TBT | 180ms | 0ms | 초과 |
| CLS | 0.011 | 0 | 미세 초과 |
| SI | 3.1s | < 1.0s | 초과 |

### 병목: 미사용 JavaScript (275KB)

| 청크 | 전체 | 미사용 | 추정 원인 |
|------|------|--------|----------|
| `0.4-kdc4zm.bc.js` | 297KB | 190KB | three.js / react-force-graph |
| `0w8x9a8n6_wdo.js` | 84KB | 62KB | 그래프 유틸리티 |
| `0th~6u9gxd-zd.js` | 72KB | 23KB | 기타 |

3D 그래프 라이브러리 로드 시 메인 스레드 Script Evaluation **987ms** 소요.

### 병목: 미사용 CSS (26KB)

Tailwind CSS 번들에서 26KB 미사용. purge content 경로 점검 필요.

### 남은 개선 방안

| # | 작업 | 효과 | 난이도 |
|---|------|------|--------|
| 1 | three.js tree shaking (개별 import) | TBT/TTI 대폭 개선 | M |
| 2 | Tailwind CSS 미사용 규칙 정리 | 26KB 절감 | XS |

---

## 해결 완료

### Accessibility 96 → 100

`--muted` 색상 대비가 WCAG AA(4.5:1) 미달 → `globals.css`에서 값 변경하여 해결.

| 테마 | 변경 전 | 변경 후 | 대비비 |
|------|---------|---------|--------|
| 라이트 (`#f7f7f7`) | `#888888` (3.5:1) | `#737373` (4.52:1) | PASS |
| 다크 (`#111111`) | `#707070` (3.7:1) | `#878787` (4.55:1) | PASS |

상세 → [02-improve-color-contrast.md](./02-improve-color-contrast.md)

### 홈 Performance 88 → 95 (+7점)

Static 라우트 전환 + HomeLayout 서버 컴포넌트 분리로 TBT 55% 감소(400ms → 180ms), SI 0.8s 개선.

상세 → [04-bundle-analyzer.md](./04-bundle-analyzer.md)

---

## 측정 CLI

```bash
for url in \
  "https://jithub-space.vercel.app" \
  "https://jithub-space.vercel.app/nodes/cesium-adoption" \
  "https://jithub-space.vercel.app/nodes/3d-tiles-spec"; do
  npx lighthouse "$url" \
    --output=json \
    --chrome-flags="--headless=new --no-sandbox" \
    --only-categories=performance,accessibility,best-practices,seo \
    > "/tmp/lh-$(echo $url | sed 's/.*\///' | sed 's/^$/home/').json"
done
```
