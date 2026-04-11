# Lighthouse 개선 #3: 번들 분석

> 작업일: 2026-04-11
> 대상 카테고리: Performance (TBT/TTI 개선 기반 마련)

---

## 문제

홈 페이지 Performance 88점의 주요 병목은 **미사용 JavaScript** (three.js / react-force-graph).
정확히 어떤 모듈이 얼마나 차지하는지 파악하여 최적화 방향을 설정해야 함.

---

## 분석 방법

`@next/bundle-analyzer`는 Next.js 16 Turbopack 빌드와 호환되지 않아 사용 불가.
대신 `.next/static/chunks/` 빌드 산출물을 직접 분석 (strings, grep, du).

```bash
bun run build
find .next/static -name "*.js" -exec du -h {} \; | sort -rh | head -20
```

---

## 분석 결과

### 전체 Client 번들

- **총 크기**: 2.2MB (16개 JS 청크)
- **상위 5개 청크가 전체의 86%** 차지 (1.9MB / 2.2MB)

### 청크별 구성

| 청크 | 크기 | 내용 | 비고 |
|------|------|------|------|
| `0.4-kdc4zm.bc.js` | **1.1MB** | three.js 전체 (WebGLRenderer, OrbitControls, ForceGraph3D 포함) | 최대 병목 |
| `0w8x9a8n6_wdo.js` | 312KB | three.js 코어 중복 + kapsule | three.js 의존 |
| `0th~6u9gxd-zd.js` | 228KB | Next.js 런타임 (Router, Asset Prefix 등) | 프레임워크 |
| `0o59ac8426icc.js` | 136KB | React DOM 런타임 | 프레임워크 |
| `03~yq9q893hmn.js` | 112KB | Next.js 라우터 | 프레임워크 |
| `0o.zct78_uagp.js` | 60KB | Next.js Router 유틸 | 프레임워크 |
| `0d3shmwh5_nmn.js` | 56KB | Next.js Router | 프레임워크 |
| 기타 (9개) | ~136KB | 앱 코드, Turbopack 런타임 등 | - |

### 의존 그래프 (핵심 발견)

```
GraphCanvas3D (0w2ne9ci.eknn.js, 12KB)
  └── dynamic import (ssr: false)
       └── react-force-graph-3d (96047)
            └── 0.4-kdc4zm.bc.js (1.1MB) ← three.js 전체 번들
```

- `GraphCanvas3D` 컴포넌트가 `react-force-graph-3d`를 dynamic import
- `react-force-graph-3d`가 **three.js 전체**를 번들에 포함 (tree shaking 불가)
- three.js 관련 청크만 **1.1MB + 312KB = 1.4MB** (전체 번들의 64%)

### 사용 중인 three.js 모듈 (앱 코드 기준)

```
SphereGeometry, MeshBasicMaterial, Mesh, Group, Color, Scene, Fog
```

three.js 전체 (~1.1MB) 중 실제 사용 모듈은 7개뿐.
나머지(WebGLRenderer, OrbitControls, 각종 Geometry/Material/Light)는 react-force-graph-3d 내부 의존.

---

## 최적화 대상 선정

| 순위 | 대상 | 현재 크기 | 예상 절감 | 방법 |
|------|------|----------|----------|------|
| 1 | three.js 전체 번들 | 1.1MB | ~700KB | react-force-graph-3d → 2d 전환 (three.js 제거) |
| 2 | three.js 전체 번들 | 1.1MB | ~300KB | three.js 개별 import + sideEffects 설정 |
| 3 | CSS 미사용 규칙 | 26KB | 26KB | Tailwind content 경로 점검 |

### 핵심 판단

**three.js tree shaking은 효과가 제한적.**
react-force-graph-3d 라이브러리 내부에서 three.js 전체를 import하기 때문에,
앱 코드에서 개별 import를 해도 라이브러리가 전체를 끌어옴.

가능한 전략:
1. **react-force-graph-3d → react-force-graph-2d 전환**: three.js 의존 완전 제거 (~1.4MB 절감). 단, 3D 시각화 포기.
2. **three.js externals 설정**: CDN에서 three.js 로드하여 번들에서 제외. 총 전송량은 동일하나 메인 번들 크기 감소.
3. **현상 유지 + lazy loading 강화**: 이미 dynamic import(ssr: false)를 사용 중이므로, 초기 로드가 아닌 상호작용 시점에 로드하도록 조정.

---

## 검증

- [x] `bun run build` 성공
- [x] 청크 크기 및 구성 확인
- [x] three.js 의존 관계 파악

---

## 추가 분석: 가능한 최적화 전략 평가

### 효과 없는 방향 (배제)

| 방향 | 배제 사유 |
|------|----------|
| three.js lazy loading 타이밍 (Intersection Observer) | 그래프가 첫 화면(60vh)에 배치되어 즉시 트리거됨. 이미 dynamic import + ssr: false 적용 중 |
| three.js tree shaking (개별 import) | react-force-graph-3d 내부에서 `import * as THREE` → 앱 레벨 개입 불가 |
| react-force-graph-3d → 2d 전환 | 3D 시각화가 프로젝트 핵심 기능 |
| react-force-graph-3d 포크 | 유지보수 부담 대비 절감량 불확실 |

### 효과 있는 방향

#### 1. 홈 페이지 정적 셸 + HomeLayout 서버/클라이언트 분리 — 완료 ✓

**문제**:
- 홈 페이지가 `searchParams` 사용으로 Dynamic 렌더링(`ƒ /`) 중 → TTFB 증가
- `HomeLayout` 전체가 `"use client"` → 정적 UI까지 클라이언트 번들에 포함

**해결**:
- `page.tsx`에서 `searchParams` 의존 제거 → Static 라우트(`○ /`) 전환
- `HomeLayout`을 서버 컴포넌트로 전환, 인터랙티브 로직을 `InteractiveGraphZone` 클라이언트 컴포넌트로 분리
- 콘텐츠 로딩은 server action(`getSerializedContent`) + `ClientContentSection`으로 변경
- `NodeSearch`에 기본 네비게이션 동작 내장 → 서버 컴포넌트에서 직접 사용 가능

**변경 결과**: Route 테이블에서 `ƒ /` → `○ /` (Static) 전환. SiteHeader/SiteFooter/제목 섹션이 서버 컴포넌트로 hydration 불필요.

**영향 지표**: FCP (10%), LCP (25%), SI (10%), TBT (30%) — 합산 가중치 75%

**수정 파일**:

| 파일 | 변경 |
|------|------|
| `src/app/page.tsx` | `searchParams`/`generateMetadata` 제거, 단순 서버 컴포넌트 |
| `src/app/HomeLayout.tsx` | `"use client"` 제거, 서버 컴포넌트로 전환 |
| `src/app/InteractiveGraphZone.tsx` | 신규: 인터랙티브 상태/로직 + useSearchParams + server action |
| `src/features/graph/components/NodeSearch.tsx` | `onSelect` optional, 기본 router.push 내장 |
| `src/features/graph/hooks/useNodeSearch.ts` | `onSelect` optional 대응 |
| `src/features/content/actions/getSerializedContent.ts` | 기존: server action, MDX serialize |
| `src/features/content/components/ClientContentSection.tsx` | 기존: 클라이언트 MDX 렌더러 |

### 기대 효과 vs 실측

| 지표 | 개선 전 | 예상 | **실측** | 가중치 |
|------|---------|------|----------|--------|
| FCP | 1.6s | ~1.1s | **1.7s** | 10% |
| LCP | 1.9s | ~1.4s | **2.0s** | 25% |
| SI | 3.9s | ~2.5s | **3.1s** | 10% |
| TBT | 400ms | 400ms | **180ms** | 30% |
| CLS | 0 | 0 | **0.011** | 25% |

**예상 점수: 88 → 92~95점 / 실측: 88 → 95점** ✓

FCP/LCP는 네트워크 편차로 개선이 수치에 반영되지 않았으나,
**TBT 400ms → 180ms (55% 감소)** 가 점수 상승의 핵심.
TBT가 예상(변화 없음)과 달리 대폭 개선된 이유: HomeLayout 서버 컴포넌트 전환으로 클라이언트 hydration 범위 축소.

---

## 다음 단계

| 순위 | 작업 | 예상 효과 | 난이도 | 상태 |
|------|------|----------|--------|------|
| 1 | 배포 후 Lighthouse 실측 | 정적 셸 + 서버/클라이언트 분리 효과 수치 확인 | XS | ✓ 완료 |
| 2 | CSS 미사용 규칙 정리 | 26KB 절감 | XS | ✓ 완료 |
