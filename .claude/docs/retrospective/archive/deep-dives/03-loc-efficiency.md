# LOC 효율성 & 지표 이해

## 이 문서의 위치

> **심화 탐구 워크북** — 01-project-dashboard 리뷰에서 도출
> 현재 문서: **deep-dives/03-loc-efficiency**
> 관련 원본 문서: [01-project-dashboard](../01-project-dashboard.md), [05-core-code-review](../05-core-code-review.md)

## 배경

대시보드 리뷰 포인트 #3 + #8:

- #3: "이 프로젝트에 필요한 LOC 값이 정말 4,644만큼이나 필요한지 의문이 들었고, 이를 극한으로 줄여보고 싶다."
- #8: "'하네스 .md / 소스 LOC' 가 어떤 지표인지 이해가 안 된다."

현재 src/ 디렉토리에 약 5,174줄의 TypeScript/TSX 코드가 있다. 이 중 어디가 가장 크고, 압축 가능한 부분은 어디인지 코드 감사를 수행한다. 또한 "하네스 문서 92개 / 소스 5,174줄 = 소스 56줄당 하네스 문서 1개"라는 비율 지표의 의미와 활용법을 이해한다.

---

## 분석 / 학습 내용

### 1. 전체 LOC 분포 분석

#### 디렉토리별 분포

| 디렉토리 | LOC | 비율 | 성격 |
|----------|-----|------|------|
| `features/graph/hooks/` | 922 | 17.8% | 3D 렌더링·카메라·검색 훅 |
| `features/content/components/` | 608 | 11.8% | MDX 렌더링·연결 트리 |
| `app/` (pages + layouts) | 609 | 11.8% | 라우팅·레이아웃·OG 이미지 |
| `features/graph/components/` | 549 | 10.6% | 3D 캔버스·검색 UI |
| `features/content/utils/` | 502 | 9.7% | 파이프라인·연결 노드 빌드 |
| `components/` (공유) | 281 | 5.4% | 아이콘·에러·ThemeToggle |
| `stories/` | 226 | 4.4% | Storybook 쇼케이스 |
| `features/graph/utils/` | 217 | 4.2% | 그래프 데이터 빌더 |
| `constants/` | 202 | 3.9% | 디자인 토큰·클러스터 |
| `hooks/` | 93 | 1.8% | 공유 훅 |
| `features/content/types/` | 86 | 1.7% | 콘텐츠 타입 정의 |
| `types/` | 53 | 1.0% | 공유 타입 |
| `features/theme/` | 48 | 0.9% | 테마 유틸·훅 |
| `features/graph/types/` | 38 | 0.7% | 그래프 타입 정의 |
| `lib/` | 24 | 0.5% | cn 유틸 등 |

#### 프로덕션 vs 비-프로덕션

```
프로덕션 코드   4,533줄 ████████████████████████████████████████ 87.6%
테스트 (.test)    415줄 ████                                      8.0%
스토리            226줄 ██                                        4.4%
─────────────────────────────────────────────────────────────────
합계            5,174줄                                         100%
```

> **축소 대상은 프로덕션 4,533줄이다.** 테스트와 스토리는 품질 자산이므로 절대 줄이지 않는다.

---

### 2. 상위 14개 파일 축소 계획 요약

| 순위 | 파일 | 현재 | 목표 | 절감 | 난이도 | 핵심 기법 |
|------|------|------|------|------|--------|----------|
| 1 | `useGraph3DRenderer.ts` | 539 | ~390 | ~149 | 어려움 | 애니메이션 통합, ref 축소, 중복 색상 코드 제거 |
| 2 | `GraphCanvas3D.tsx` | 197 | ~155 | ~42 | 보통 | init ref 통합, pointer guard 훅 추출 |
| 3 | `SearchSuggestions.tsx` | 149 | ~120 | ~29 | 쉬움 | scrollIntoView 네이티브, JSX 단순화 |
| 4 | `useNodeSearch.ts` | 135 | ~120 | ~15 | 쉬움 | 2줄 핸들러 인라인화 |
| 5 | `HomeLayout.tsx` | 134 | ~120 | ~14 | 보통 | 상태 파생 단순화 |
| 6 | `nodes/[slug]/page.tsx` | 129 | 129 | 0 | - | 이미 간결, 유지 |
| 7 | `layout.tsx` | 128 | 128 | 0 | - | 메타데이터 필수 코드, 유지 |
| 8 | `connected-nodes.ts` | 123 | ~110 | ~13 | 쉬움 | EDGE_PRIORITY 공유 상수화, resolveEdgeId 통합 |
| 9 | `useCameraControl.ts` | 122 | ~105 | ~17 | 쉬움 | onInteractionEnd 인라인, initCamera/setCameraImmediate 통합 |
| 10 | `opengraph-image.tsx` (slug) | 121 | 121 | 0 | - | 이미지 생성 필수 코드, 유지 |
| 11 | `builder.ts` | 120 | ~110 | ~10 | 쉬움 | EDGE_PRIORITY 공유, seedClusterPositions 간소화 |
| 12 | `tokens.ts` | 110 | 110 | 0 | - | 데이터 정의, 유지 |
| 13 | `ConnectionTree.tsx` | 105 | ~95 | ~10 | 쉬움 | 반복 패턴 정리 |
| 14 | `useScene3D.ts` | 52 | ~30 | ~22 | 쉬움 | applySceneTheme/onEngineReady 중복 제거 |
| - | re-export 데드코드 2개 | 6 | 0 | ~6 | 즉시 | 파일 삭제 |

**총 예상 절감: ~327줄 (프로덕션 코드의 7.2%)**

---

### 3. 파일별 구체적 축소 계획

#### Tier A: 고영향 (3개 파일, ~220줄 절감)

##### A-1. `useGraph3DRenderer.ts` (539줄 → ~390줄, -149줄)

이 파일이 전체 코드의 **10.4%를 차지하는 최대 파일**이다. 5가지 축소 지점이 있다.

**① 애니메이션 tick 함수 통합 (약 -25줄)**

`tickRestore` (L447-459)와 `tickHoverColor` (L506-520)가 거의 동일한 구조다:

```
현재: tickRestore — fromColor → defaultNodeColor, HOVER_COLOR_OUT_MS 사용
현재: tickHoverColor — fromColor → clusterColorObj, HOVER_COLOR_IN_MS 사용
```

→ 제네릭 `animateColorTransition(mat, from, to, durationMs, onComplete)` 함수를 추출하여 두 곳에서 호출.

**② selected-node 색상 적용 3회 반복 (약 -20줄)**

동일한 "mesh에서 material 가져와서 cluster 색상 적용" 패턴이 3곳에 반복:
- L317-327: 캐시 rebuild 후 selected node 색상 복원
- L340-350: 새 group 생성 후 selected node 색상 적용
- L275-281: selection 변경 시 색상 적용

→ `applyClusterColor(group, cluster)` 헬퍼 하나로 통합.

**③ ref 12개 → 구조화 ref 축소 (약 -15줄)**

현재 단순 값 동기화용 useEffect가 4개 존재:
- L197-199: `isDarkRef.current = isDark`
- L201-203: `degreeMapRef.current = degreeMap`
- L220-222: `selectedNodeIdRef.current = selectedNodeId`
- L206-218: `segmentsRef.current = segments` (+ 캐시 클리어)

→ `isDarkRef`, `segmentsRef`, `degreeMapRef`를 단일 `configRef = useRef({ isDark, segments, degreeMap })` 으로 통합. 동기화 useEffect 3개를 1개로 병합. segments 변경 시 캐시 클리어는 조건 분기로 처리.

**④ onNodeHover 내부 분리 (약 -40줄)**

`onNodeHover` 콜백(L395-528)이 133줄이다. 세 관심사가 섞여 있다:
1. 이전 hover 노드 복원 (L399-468)
2. 새 hover 노드의 인접 노드 색상 적용 (L480-497)
3. 새 hover 노드 자체 애니메이션 (L499-524)

→ `restorePrevHoverState(cache, prevId)`, `highlightConnectedNodes(cache, id, adjacencyMap)` 로 분리.

**⑤ buildDegreeMap/buildAdjacencyMap edge 해석 중복 (약 -8줄)**

두 함수 모두 동일한 edge endpoint 해석 코드(L38-45, L58-65)를 갖고 있다. `resolveNodeId`(L79-81)가 이미 존재하지만 이 두 함수에서는 사용하지 않는다.

→ `resolveNodeId`를 일관되게 사용하도록 변경.

---

##### A-2. `GraphCanvas3D.tsx` (197줄 → ~155줄, -42줄)

**① init 상태 ref 3개 통합 (약 -5줄)**

```
현재: hasInitPhysics (L50), hasForcesConfigured (L51), engineReady (L52)
```

→ `const initState = useRef({ physics: false, forces: false, engine: false })` 1개로.

**② console.warn 패치 분리 (약 -7줄)**

Three.js Clock 경고 억제 코드(L17-23)가 컴포넌트 파일 최상단에 위치.

→ `lib/suppress-three-warnings.ts`로 이동. import만 남기면 1줄.

**③ synthetic pointer guard 훅 추출 (약 -20줄)**

L119-139의 pointerup 이벤트 가드가 독립적인 관심사.

→ `useSyntheticPointerGuard(graphRef, engineReady)` 훅으로 추출.

**④ handleNodeHover 내부 단순화 (약 -10줄)**

L141-160에서 node → graphNode 변환 로직이 다소 장황하다. `graphData.nodes.find`를 Map lookup으로 교체하면 간결해진다.

---

##### A-3. `SearchSuggestions.tsx` (149줄 → ~120줄, -29줄)

**① scrollIntoView 수동 계산 → 네이티브 전환 (약 -10줄)**

L44-57의 `offsetTop/scrollTop` 수동 계산 코드:

```
→ el.scrollIntoView({ block: "nearest", behavior: "instant" })
```

1줄로 교체 가능. 모든 모던 브라우저 지원.

**② suggestions 모드 렌더링 평탄화 (약 -10줄)**

L114-148의 `groups.map` 안에서 `group.nodes.map`이 중첩되고, `runningIndex`를 수동 관리한다.

→ `flatItems`와 `activeIndex`를 이미 계산하고 있으므로, groups를 헤더+아이템 평탄 리스트로 변환하면 중첩 제거 가능.

**③ mode별 분기 단순화 (약 -9줄)**

`empty`, `results`, `suggestions` 3개 경로가 각각 별도의 return문을 가진다. `results`와 `suggestions`는 거의 동일한 `<ul>` 래퍼를 공유한다.

→ 조건부 children만 달리하는 단일 return으로 통합.

---

#### Tier B: 중영향 (4개 파일, ~55줄 절감)

##### B-1. `useNodeSearch.ts` (135줄 → ~120줄, -15줄)

- `handleBlur` (L101-106): `setTimeout` 안의 2줄 → 인라인 가능
- `handleFocus` (L108-110): 단일 `setOpen(true)` → prop에서 직접 전달 가능
- `activeItemId` 계산 (L113-116): 삼항 연산자 1줄로 축약 가능

##### B-2. `connected-nodes.ts` (123줄 → ~110줄, -13줄)

- `EDGE_PRIORITY` (L13-17): `builder.ts`의 동일 상수와 **완전 중복**
  → 공유 위치(`types/graph.ts` 또는 `constants/`)로 추출
- `resolveEdgeId` (L83-86)와 `useGraph3DRenderer.ts`의 `resolveNodeId` (L79-81): 동일 로직
  → 하나로 통합하여 공유

##### B-3. `builder.ts` (120줄 → ~110줄, -10줄)

- `EDGE_PRIORITY` (L19-23): connected-nodes.ts와 중복 → 공유 상수화
- `seedClusterPositions` (L77-102): `counters` Map 대신 filter+forEach 인덱스 활용으로 소폭 간소화

##### B-4. `useCameraControl.ts` (122줄 → ~105줄, -17줄)

- `onInteractionEnd` (L110-112): `setAutoRotate(true)` 한 줄짜리 래퍼
  → 호출 측에서 `setAutoRotate(true)` 직접 호출로 대체, 함수 및 return 항목 제거
- `initCamera`(L48-58)와 `setCameraImmediate`(L61-67): 유사한 카메라 위치 설정
  → `initCamera(duration = 0)` 하나로 통합. duration=0이면 즉시 설정, >0이면 트랜지션

---

#### Tier C: 정리 (3개 파일, ~38줄 절감)

##### C-1. re-export 데드코드 삭제 (-6줄, 즉시)

| 파일 | 내용 | 사용처 |
|------|------|--------|
| `features/theme/hooks/useTheme.ts` | `export { useTheme } from "@/hooks/useTheme"` | 미사용 — 실제 import는 `@/hooks/useTheme` 직접 참조 |

→ 파일 삭제. import 경로 변경 불필요 (이미 직접 참조 중).

##### C-2. `useScene3D.ts` (52줄 → ~30줄, -22줄)

`applySceneTheme`(L20-29)과 `onEngineReady`(L31-41)에 **동일한 코드가 반복**된다:

```typescript
// applySceneTheme 내부:
const gray = getGraphGray(isDark);
scene.background = new THREE.Color(gray.bg);
scene.fog = null;

// onEngineReady 내부:
const gray = getGraphGray(isDark);
scene.background = new THREE.Color(gray.bg);
scene.fog = null;
```

→ `onEngineReady`에서 `applySceneTheme(fg.scene())` 호출로 통합. 또는 `useEffect` 하나로 병합.

##### C-3. `ConnectionTree.tsx` (105줄 → ~95줄, -10줄)

edge type별 반복 렌더링 로직의 소폭 정리. 구조 자체는 양호하므로 과도한 축소 불필요.

---

### 4. 교차 파일 중복 패턴

#### 패턴 ①: `EDGE_PRIORITY` 상수 중복

| 파일 | 위치 | 코드 |
|------|------|------|
| `builder.ts` | L19-23 | `const EDGE_PRIORITY: Record<EdgeType, number> = { prerequisite: 0, child: 1, related: 2 }` |
| `connected-nodes.ts` | L13-17 | 동일 |

**해결**: `types/graph.ts` 또는 `constants/edge.ts`에 1회 정의 후 import.

#### 패턴 ②: edge endpoint 해석 (`typeof x === "string" ? x : x.id`)

| 파일 | 출현 횟수 |
|------|-----------|
| `useGraph3DRenderer.ts` | 2회 (buildDegreeMap L38-45, buildAdjacencyMap L58-65) |
| `connected-nodes.ts` | 1회 (resolveEdgeId L83-86) |

`resolveNodeId` (useGraph3DRenderer.ts L79-81)와 `resolveEdgeId` (connected-nodes.ts L83-86)가 동일 로직.

**해결**: 공유 유틸 `resolveEndpointId(ref: string | { id?: string }): string` 1회 정의.

#### 패턴 ③: mesh→material→color 적용 3단계

`useGraph3DRenderer.ts` 내에서 다음 패턴이 **8회 이상** 반복:

```typescript
const mesh = getMeshFromGroup(group);
const mat = getBasicMat(mesh);
mat.color.set(...);
mat.needsUpdate = true;
```

**해결**: `setGroupColor(group: THREE.Group, color: string | THREE.Color): void` 단일 함수.

---

### 5. "하네스 .md / 소스 LOC" 지표 이해

#### 정의

```
하네스 밀도 = 하네스 .md 파일 수 / 소스 LOC
            = 92개 / 5,174줄
            = 소스 56줄당 하네스 문서 1개
```

#### 이 지표가 말해주는 것

**AI 오케스트레이션 투자 밀도**를 나타낸다. 프로덕션 코드 대비 얼마나 많은 AI 협업 인프라(스킬, 커맨드, 훅, 가이드 문서)를 구축했는지의 비율이다.

- 이 프로젝트에서 92개의 .md 파일이 존재하는 이유: 7일 집중 AI 협업 개발에서 **품질 일관성**을 유지하기 위한 의도적 투자
- 하네스 문서는 코드 생성의 "설계도" 역할: 스킬이 구체적일수록 AI 출력 품질이 올라간다

#### 스펙트럼

```
┌──────────────────────────────────────────────────────────────┐
│                    하네스 밀도 스펙트럼                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   1:500+              1:56               1:20                │
│   ◄─────────────────────●─────────────────────►              │
│   저밀도             이 프로젝트           고밀도              │
│   CLAUDE.md만 사용    핵심 스킬+훅+가이드    풀 자동화 파이프라인  │
│                                                              │
│   적합: 단순 스크립트   적합: 중규모 앱       적합: 대규모 팀     │
│   AI = 보조            AI = 페어 프로그래머    AI = 자율 에이전트  │
└──────────────────────────────────────────────────────────────┘
```

#### 주의사항

이 지표는 **독립적인 품질 판단 기준이 아니다**. 하네스 밀도가 높다고 좋은 것이 아니라, 프로젝트의 AI 협업 강도에 비례해야 한다. LOC가 줄어들면 비율이 올라가지만, 그것이 하네스를 줄여야 한다는 의미는 아니다. 하네스는 미래 유지보수와 확장을 위한 투자이기 때문이다.

---

## 결론

### 핵심 답변 #3: 5,174줄이 정말 필요한가?

**~327줄(7.2%)은 중복·비효율 코드이며 제거 가능하다.** 나머지 ~4,850줄은 기능에 필요하다.

- 최대 축소 기회는 `useGraph3DRenderer.ts` 한 파일(-149줄)에 집중되어 있다
- 3D 렌더링 + 콘텐츠 파이프라인 + SEO 이중 경로를 가진 Next.js 앱에서 **~4,850줄은 적정 수준**
- "극한 축소"보다는 **"의미 있는 중복 제거와 가독성 향상"**이 현실적 목표

### 핵심 답변 #8: 하네스 .md / 소스 LOC 비율의 의미

- **1:56 = AI 오케스트레이션 밀도 지표**
- 프로덕션 코드 56줄마다 AI 협업 가이드 문서 1개가 존재한다는 뜻
- 7일 집중 개발에서 품질 일관성을 유지한 핵심 메커니즘
- 코드를 줄여도 하네스는 유지하는 것이 올바른 방향 (미래 가치)

---

## 참조 파일

**Tier A (고영향):**
- `src/features/graph/hooks/useGraph3DRenderer.ts` — 539줄, 최대 파일
- `src/features/graph/components/GraphCanvas3D.tsx` — 197줄
- `src/features/graph/components/SearchSuggestions.tsx` — 149줄

**Tier B (중영향):**
- `src/features/graph/hooks/useNodeSearch.ts` — 135줄
- `src/features/content/utils/connected-nodes.ts` — 123줄
- `src/features/graph/utils/builder.ts` — 120줄
- `src/features/graph/hooks/useCameraControl.ts` — 122줄

**Tier C (정리):**
- `src/features/theme/hooks/useTheme.ts` — 3줄 (re-export, 삭제 대상)
- `src/features/graph/hooks/useScene3D.ts` — 52줄

**교차 중복:**
- `builder.ts` L19-23 ↔ `connected-nodes.ts` L13-17 (EDGE_PRIORITY)
- `useGraph3DRenderer.ts` L79-81 ↔ `connected-nodes.ts` L83-86 (resolveNodeId/resolveEdgeId)

---

## 액션 아이템

파일 하나하나 순차적으로 작업할 수 있도록 5단계 로드맵으로 구성했다.

### Phase 1: 데드 코드 제거 (즉시, ~6줄)

- [ ] `features/theme/hooks/useTheme.ts` — re-export 파일 삭제 (미사용 확인 후)

### Phase 2: 교차 파일 중복 통합 (~20줄)

- [ ] `EDGE_PRIORITY` 공유 상수 추출 → `builder.ts`, `connected-nodes.ts` 양쪽에서 import
- [ ] `resolveNodeId` / `resolveEdgeId` 통합 → 공유 유틸로 추출
- [ ] `useGraph3DRenderer.ts`의 `buildDegreeMap`, `buildAdjacencyMap`에서 `resolveNodeId` 사용

### Phase 3: useGraph3DRenderer.ts 리팩토링 (~149줄)

- [ ] `animateColorTransition` 제네릭 함수 추출 (tickRestore + tickHoverColor 통합)
- [ ] `setGroupColor` 헬퍼 추출 (mesh→material→color 패턴 8회 → 함수 1개)
- [ ] `applyClusterColor` 추출 (selected-node 색상 적용 3회 반복 통합)
- [ ] `configRef` 통합 (isDarkRef + segmentsRef + degreeMapRef → 구조화 ref 1개)
- [ ] 동기화 useEffect 4개 → 1~2개로 병합
- [ ] `onNodeHover` → `restorePrevHoverState` + `highlightConnectedNodes` 분리

### Phase 4: GraphCanvas3D.tsx + useScene3D.ts 정리 (~64줄)

- [ ] `useScene3D.ts`: `onEngineReady` → `applySceneTheme` 재사용으로 중복 제거
- [ ] `GraphCanvas3D.tsx`: console.warn 패치 → `lib/suppress-three-warnings.ts` 분리
- [ ] `GraphCanvas3D.tsx`: init ref 3개 → `initState` ref 1개로 통합
- [ ] `GraphCanvas3D.tsx`: synthetic pointer guard → 커스텀 훅 추출

### Phase 5: 나머지 Tier B/C 파일 (~88줄)

- [ ] `SearchSuggestions.tsx`: scrollIntoView 네이티브 전환
- [ ] `SearchSuggestions.tsx`: mode별 분기 → 단일 return 통합
- [ ] `useCameraControl.ts`: onInteractionEnd 제거 (호출 측 인라인)
- [ ] `useCameraControl.ts`: initCamera/setCameraImmediate 통합
- [ ] `useNodeSearch.ts`: handleBlur/handleFocus 인라인화
- [ ] `connected-nodes.ts`: 공유 상수/유틸 적용 후 정리
- [ ] `builder.ts`: 공유 상수 적용 + seedClusterPositions 간소화
- [ ] `ConnectionTree.tsx`: 반복 패턴 소폭 정리
