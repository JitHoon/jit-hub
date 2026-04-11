# Lighthouse Baseline

> 측정일: 2026-04-11  
> 목표: 전 카테고리 100점

## 측정 환경

```bash
# CLI 명령어
npx lighthouse <URL> \
  --output=json \
  --chrome-flags="--headless=new --no-sandbox" \
  --only-categories=performance,accessibility,best-practices,seo

# 도구 버전
# Lighthouse CLI 13.1.0, headless Chrome
```

---

## 점수 요약

### 개선 전 (2026-04-11 초기 측정)

| Page | Perf | A11y | Best Practices | SEO |
|------|------|------|----------------|-----|
| `/` (홈) | **96** | **96** | 100 | 100 |
| `/nodes/cesium-adoption` | **99** | **96** | 100 | 100 |
| `/nodes/3d-tiles-spec` | **99** | **96** | 100 | 100 |

### 개선 후 (2026-04-11 색상 대비 수정 배포)

| Page | Perf | A11y | Best Practices | SEO |
|------|------|------|----------------|-----|
| `/` (홈) | 94 | **100** | 100 | 100 |
| `/nodes/cesium-adoption` | 98 | **100** | 100 | 100 |

Accessibility **96 → 100** 달성. color-contrast 이슈 0건.
Performance는 네트워크 편차 범위(94~99). **남은 감점 요인은 Performance만 존재.**

---

## Performance: 96~99 → 100

### Core Web Vitals

| Metric | 홈 | 노드 평균 | 100점 기준 |
|--------|-----|----------|-----------|
| FCP | 1.1s | 1.35s | < 0.8s |
| LCP | 1.7s | 2.1s | < 1.2s |
| TBT | **220ms** | 25ms | 0ms |
| CLS | 0 | 0 | 0 |
| SI | 1.9s | 1.35s | < 1.0s |
| TTI | **4.5s** | 2.35s | < 2.0s |

홈 페이지의 TBT(220ms)와 TTI(4.5s)가 주요 감점. 노드 SSG 페이지는 거의 만점.

### 문제: 미사용 JavaScript (275KB)

| 청크 | 전체 | 미사용 | 추정 원인 |
|------|------|--------|----------|
| `0.4-kdc4zm.bc.js` | 297KB | 190KB | three.js / react-force-graph |
| `0w8x9a8n6_wdo.js` | 84KB | 62KB | 그래프 유틸리티 |
| `0th~6u9gxd-zd.js` | 72KB | 23KB | 기타 |

홈 페이지에서 3D 그래프 라이브러리를 로드하면서 메인 스레드 Script Evaluation에 **987ms** 소요.

### 문제: 미사용 CSS (26KB)

Tailwind CSS 번들에서 26KB 미사용. purge 설정 또는 content 경로 점검 필요.

### 개선 방안

| # | 작업 | 효과 | 난이도 |
|---|------|------|--------|
| 1 | `@next/bundle-analyzer` 도입 → 실사용 모듈 식별 | 최적화 기반 마련 | S |
| 2 | three.js tree shaking (개별 import) | TBT/TTI 대폭 개선 | M |
| 3 | 한글 폰트 서브셋팅 (65KB → ~15KB) | FCP/LCP 개선 | S |
| 4 | Tailwind CSS 미사용 규칙 정리 | 26KB 절감 | XS |

---

## Accessibility: 96 → 100 (해결 완료)

### 문제: `--muted` 색상 대비 WCAG AA 미달

전 페이지에서 `text-[var(--muted)]`를 사용하는 요소의 대비비가 4.5:1 미만.

### 해결

`globals.css`에서 `--muted` 값 변경:

| 테마 | 변경 전 | 변경 후 | 대비비 |
|------|---------|---------|--------|
| 라이트 (`#f7f7f7` 배경) | `#888888` (3.5:1) | `#737373` (4.52:1) | PASS |
| 다크 (`#111111` 배경) | `#707070` (3.7:1) | `#878787` (4.55:1) | PASS |

상세 변경 내역 → [02-improve-color-contrast.md](./02-improve-color-contrast.md)

---

## 다음 측정 시 비교용 CLI

```bash
# 전체 페이지 일괄 측정
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
