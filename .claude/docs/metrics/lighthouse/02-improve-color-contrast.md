# Lighthouse 개선 #1: 색상 대비 WCAG AA 준수

> 작업일: 2026-04-11  
> 대상 카테고리: Accessibility (96 → 100 목표)

---

## 문제

Lighthouse Accessibility 감사에서 **color-contrast** 항목 실패.

`--muted` CSS 변수를 사용하는 모든 텍스트 요소가 WCAG AA 기준(일반 텍스트 4.5:1) 미달.

| 테마 | 변경 전 | 배경 | 대비비 | 판정 |
|------|---------|------|--------|------|
| 라이트 | `#888888` | `#F7F7F7` | 3.5:1 | FAIL |
| 다크 | `#707070` | `#111111` | 3.7:1 | FAIL |

영향 범위: 홈 서브타이틀, 푸터, 노드 페이지 메타 정보/레이블/네비게이션 — 전 페이지 공통.

---

## 변경 내용

`--muted` 색상값을 WCAG AA 4.5:1 이상으로 조정. 디자인 톤(그레이 뉴트럴)은 유지.

| 테마 | 변경 전 | 변경 후 | 대비비 |
|------|---------|---------|--------|
| 라이트 | `#888888` | `#737373` | 4.52:1 |
| 다크 | `#707070` | `#878787` | 4.55:1 |

### 수정 파일

| 파일 | 변경 |
|------|------|
| `src/app/globals.css` | `:root` `--muted` #888888 → #737373 |
| `src/app/globals.css` | `.dark` `--muted` #707070 → #878787 |
| `src/constants/tokens.ts` | `LIGHT.muted` / `DARK.muted` 동기화 |
| `src/app/opengraph-image.tsx` | OG 이미지 텍스트 색상 동기화 |
| `src/app/nodes/[slug]/opengraph-image.tsx` | OG 이미지 텍스트 색상 동기화 |
| `.claude/docs/design/token-catalog.md` | 토큰 문서 업데이트 |

### 미변경 (의도적 유지)

| 파일 | 값 | 사유 |
|------|-----|------|
| `src/features/graph/hooks/useGraph3DRenderer.ts` | `#888888` | 3D 그래프 노드 fallback 색상. `--muted`와 별도 용도 |

---

## 검증

- `bun run build` — 성공
- `bun run test` — 27/27 통과
- Lighthouse 재측정 — 배포 후 실측 필요

### 예상 결과

| Page | A11y (before) | A11y (expected) |
|------|--------------|-----------------|
| `/` | 96 | 100 |
| `/nodes/*` | 96 | 100 |

---

## 배포 후 실측 결과 (2026-04-11)

| Page | A11y (before) | A11y (after) | Perf | BP | SEO |
|------|--------------|-------------|------|-----|-----|
| `/` | 96 | **100** | 94 | 100 | 100 |
| `/nodes/cesium-adoption` | 96 | **100** | 98 | 100 | 100 |

- color-contrast 이슈: **0건** (이전 2~11건 → 완전 해소)
- Accessibility **96 → 100** 달성

---

## 남은 개선 사항

Accessibility 100점 달성 후, Performance 100점을 위한 작업:

| 순위 | 작업 | 예상 효과 |
|------|------|----------|
| 1 | 한글 폰트 서브셋팅 | FCP/LCP 개선 |
| 2 | `@next/bundle-analyzer` 도입 | 번들 최적화 기반 |
| 3 | three.js tree shaking | TBT/TTI 대폭 개선 |
| 4 | CSS 미사용 규칙 정리 | 26KB 절감 |
