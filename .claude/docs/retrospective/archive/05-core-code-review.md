# 05. 주요 기능 핵심 코드 회고 및 학습

## 이 문서의 위치

> **Tier 2: 구현 분석** — 아키텍처와 핵심 코드 구현을 분석
>
> 📍 현재 문서: **05-core-code-review** (5/17)
>
> **권장 읽기 순서**: 01 → 06 → 03 → 04 → **05** → 02 → 10 → 07 → 08 → 09 → 14 → 15 → 12 → 11 → 13 → 16 → 17
>
> 이전: [04-architecture-maturity](./04-architecture-maturity.md) · 다음: [02-harness-engineering](./02-harness-engineering.md)

## 개요

프로젝트의 3대 핵심 기능(콘텐츠 파이프라인, 3D 그래프 시각화, 테마 시스템)의 코드를 리뷰하고 학습 포인트를 정리한다.

---

## 1. 콘텐츠 파이프라인

### 핵심 파일
- `src/features/content/types/schema.ts` — Zod 스키마 정의
- `src/features/content/utils/pipeline.ts` — 마크다운 로딩/파싱
- `src/features/content/components/MdxRenderer.tsx` — MDX 렌더링
- `src/lib/generate-graph-data.ts` — 빌드 타임 그래프 데이터 생성

### 핵심 패턴: Single Source → Build Validation → Static Artifact

```
contents/nodes/*.md
  → gray-matter (프론트매터 추출)
    → Zod safeParse (스키마 검증)
      → validateSlugReferences (참조 무결성)
        → graph-data.json (정적 아티팩트)
```

### 학습 포인트
1. **Zod와 TypeScript의 시너지**: `z.infer<typeof schema>`로 타입 자동 추론 — 스키마와 타입이 항상 동기화
2. **빌드 타임 검증의 가치**: slug 오타, 존재하지 않는 참조를 배포 전에 잡음
3. **prebuild/predev 훅**: `npm scripts`의 pre 접두사로 빌드 전 자동 실행
4. **ESM-only 라이브러리 주의**: remark-gfm 등 ESM 전용 모듈의 동적 import 필요성

### 개선 가능 영역
- 슬러그 자동 생성 (파일명에서 추론)
- 프론트매터 자동 완성 스크립트
- 관계 그래프의 순환 참조 감지 강화

---

## 2. 3D 그래프 시각화

### 핵심 파일
- `src/features/graph/components/GraphCanvas3D.tsx` — 3D 그래프 메인 컴포넌트
- `src/features/graph/hooks/useGraph3DRenderer.ts` — THREE.js 렌더링 로직
- `src/features/graph/hooks/useCameraControl.ts` — 카메라 제어
- `src/features/graph/hooks/useGraphLayout.ts` — 레이아웃 계산
- `src/features/graph/utils/builder.ts` — 그래프 데이터 빌더

### 핵심 패턴: 캐싱 + LOD + 물리 시뮬레이션

```
nodeThreeObject 콜백
  → 캐시 히트? → 기존 THREE.Group 반환
  → 캐시 미스? → SphereGeometry(세그먼트: 모바일 16 / 데스크톱 32) 생성
    → MeshStandardMaterial 할당 → 캐시에 저장
```

### 학습 포인트
1. **THREE.js 메모리 관리**: Geometry/Material 캐싱으로 GC 압력 감소
2. **반응형 LOD**: `matchMedia('(max-width: 768px)')` 리스너로 모바일 감지, 세그먼트 수 분기
3. **물리 시뮬레이션 워밍업**: `warmupTicks: 100`으로 초기 배치 안정화 후 렌더링
4. **easeInOut 애니메이션**: 호버 시 색상 전환에 커스텀 이징 함수 적용
5. **URL 상태 동기화**: 노드 클릭 → URL 파라미터 업데이트 → 콘텐츠 섹션 반응

### 개선 가능 영역
- 인스턴스드 메시(InstancedMesh)로 드로우 콜 감소
- 오프스크린 캔버스(OffscreenCanvas)로 메인 스레드 부하 감소
- 노드 수 증가 시 공간 분할(octree) 기반 레이캐스팅 최적화

---

## 3. 테마 시스템

### 핵심 파일
- `src/features/theme/hooks/useTheme.ts` — 테마 상태 관리
- `src/features/theme/utils/store.ts` — localStorage + DOM 동기화

### 핵심 패턴: useSyncExternalStore + 즉시 DOM 반영

```
useSyncExternalStore(
  subscribe,        // localStorage change + matchMedia listener
  getSnapshot,      // 현재 테마 값
  getServerSnapshot // SSR 시 기본값 (system)
)
```

### 학습 포인트
1. **useSyncExternalStore의 올바른 사용법**: 외부 저장소(localStorage)를 React 상태와 동기화하는 공식 패턴
2. **hydration mismatch 방지**: getServerSnapshot으로 서버/클라이언트 초기값 일치
3. **useLayoutEffect vs useEffect**: 테마 적용은 페인트 전에 완료해야 깜빡임 방지
4. **applyThemeToDOM 분리**: hydration 시 localStorage 값 덮어쓰기 방지를 위한 세심한 타이밍 제어

### 관련 버그 해결 과정
```
커밋 히스토리:
e846048 fix: React 하이드레이션이 테마 클래스를 덮어쓰는 버그 수정
18fa6ee fix: 폰트 변수를 body로 이동 및 manifest theme_color 수정
18f82c9 fix: useEffect를 useLayoutEffect로 교체하여 테마 하이드레이션 버그 수정
c977ec4 fix: hydration 시 localStorage 덮어쓰기 방지 — applyThemeToDOM 분리
```

→ 4단계에 걸친 점진적 버그 수정. SSR + 테마 전환의 복잡성을 실전에서 학습.

---

## 4. 에러 처리 3단계 구조

### 핵심 파일
- `src/app/global-error.tsx` — 앱 전체 에러
- `src/app/error.tsx` — 페이지 레벨 에러
- `src/components/FeatureBoundary.tsx` — 피처 레벨 (ErrorBoundary + Suspense + Skeleton)

### 학습 포인트
1. **ErrorBoundary 중첩**: 에러가 상위로 전파되지 않도록 격리
2. **FeatureBoundary = ErrorBoundary + Suspense + Skeleton**: 3가지 관심사를 하나의 래퍼로 통합
3. **WebGL 폴백**: 브라우저가 WebGL 미지원 시 ErrorCard로 대체 UI 렌더링

---

## 5. 콘텐츠 렌더링 (MDX)

### 핵심 패턴: 서버 사이드 MDX + 커스텀 컴포넌트

```
<MDXRemote
  source={markdown}
  components={mdxComponents}  // h2~h4, a, table 커스텀
  options={{
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, rehypePrettyCode]
  }}
/>
```

### 학습 포인트
1. **rehype-pretty-code**: Shiki 기반 서버 사이드 구문 강조 — 클라이언트 JS 제로
2. **rehypeSlug**: 제목에 자동 ID 생성 → 앵커 링크 가능
3. **커스텀 MDX 컴포넌트**: 마크다운 렌더링을 디자인 시스템에 맞춤
4. **remarkGfm**: GitHub Flavored Markdown (테이블, 체크리스트 등)

---

## 종합 학습 정리

### 이 프로젝트에서 가장 많이 배운 3가지
1. **SSR/CSR 하이브리드의 복잡성**: hydration, 테마 깜빡임, WebGL 서버 실행 방지 등
2. **빌드 타임 검증의 위력**: Zod + 참조 무결성 검사로 런타임 에러 제거
3. **THREE.js 메모리 최적화**: 캐싱, LOD, 물리 시뮬레이션 워밍업

### 다음 프로젝트에 즉시 적용할 패턴
- useSyncExternalStore로 외부 상태 동기화
- Zod 스키마 기반 빌드 타임 검증
- FeatureBoundary (ErrorBoundary + Suspense + Skeleton) 조합
- prebuild 스크립트로 정적 데이터 생성

## 심화 탐구 가이드

### 이 회고를 더 깊이 파고들 때 확인할 것
- [ ] useGraph3DRenderer 훅의 THREE.js 메모리 프로파일링 (Chrome DevTools Memory 탭)
- [ ] MDX 커스텀 컴포넌트의 접근성 검증 (스크린리더 테스트)
- [ ] useSyncExternalStore의 서버/클라이언트 동기화 edge case 탐색
- [ ] 콘텐츠 파이프라인의 빌드 타임 성능 (21개 vs 50개 노드 벤치마크)

### 관련 소스 파일
- `src/features/graph/hooks/useGraph3DRenderer.ts` — 3D 렌더링 핵심
- `src/features/content/utils/pipeline.ts` — 콘텐츠 로딩/파싱
- `src/features/theme/hooks/useTheme.ts` — 테마 동기화
- `src/features/content/components/MdxRenderer.tsx` — MDX 렌더링

### 관련 회고 문서
- [04-architecture-maturity](./04-architecture-maturity.md) — 이 코드가 놓인 아키텍처 맥락
- [12-error-handling-patterns](./12-error-handling-patterns.md) — hydration 버그 해결 상세
- [08-performance-bundle](./08-performance-bundle.md) — 성능 관점의 코드 분석

## 액션 아이템

- [ ] 핵심 코드 패턴을 개인 지식 노드로 추가 검토
- [ ] three.js 성능 최적화 기법 심화 학습
- [ ] MDX 커스텀 컴포넌트 확장 (인터랙티브 다이어그램 등)
- [ ] useSyncExternalStore 패턴을 범용 훅으로 추출 검토
