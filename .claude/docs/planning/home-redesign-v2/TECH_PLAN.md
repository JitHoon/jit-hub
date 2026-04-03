# 기술 구현 계획: 홈페이지 리디자인 v2 (세로 스크롤 구조)

## 기술 스택

현재 스택 유지. 추가/변경 사항:
- **신규 의존성 없음** -- react-force-graph-2d(또는 현재 사용 중인 react-force-graph-3d) 그대로 유지
- **레이아웃 변경** -- 좌우 분할(`flex h-screen`) → 세로 스크롤(`flex flex-col, overflow-y-auto`)

## 영향 범위

### 수정 파일
- `src/app/layout.tsx` -- ThemeToggle을 body 직접 자식에서 제거 (헤더로 이동)
- `src/app/page.tsx` -- HomeLayout에 전달하는 props 구조 변경
- `src/app/HomeLayout.tsx` -- 좌우 분할 → 세로 스크롤 구조로 전면 재작성
- `src/components/ThemeToggle.tsx` -- `fixed` 포지셔닝 제거, 헤더 내 인라인 배치용으로 수정
- `src/features/graph/components/GraphSection.tsx` -- 높이 계산 방식 조정 (100vh → calc(100vh - 56px))

### 신규 파일
- `src/components/SiteHeader.tsx` -- sticky 상단 헤더 컴포넌트
- `src/app/nodes/[slug]/page.tsx` -- SEO용 정적 노드 페이지 (현재 미구현, 이번에 추가)

### 삭제/대체 파일
- `src/features/content/components/ContentPanelWrapper.tsx` -- 좌우 분할용 래퍼, 새 구조에서 불필요 (삭제 또는 대체)
- `src/features/content/components/ContentPanel.tsx` -- 새 ContentSection으로 대체
- `src/features/content/components/CloseButton.tsx` -- 세로 스크롤 구조에서 닫기 버튼 불필요 (삭제)
- `src/features/content/components/PanelHeader.tsx` -- 새 구조의 ContentHeader로 대체

### 스키마 변경
없음. 기존 `GraphData`, `GraphNode`, `GraphEdge` 타입 그대로 사용.

## API 설계

별도 API 엔드포인트 없음. 모든 데이터는 빌드 타임에 생성된 `graph-data.json`에서 정적 import.

| 데이터 흐름 | 소스 | 소비자 |
|------------|------|--------|
| 그래프 구조 | `public/graph-data.json` (빌드 생성) | GraphCanvas3D (이름은 3D이지만 실제 2D 렌더링) |
| 노드 콘텐츠 | `contents/nodes/*.md` (MDX 파이프라인) | ContentSection (서버 컴포넌트에서 렌더링) |
| 클러스터 메타 | `src/constants/cluster.ts` | SiteHeader (선택적), ContentHeader |
| 테마 상태 | `useTheme()` | GraphCanvas3D, SiteHeader |

## 데이터 모델

기존 타입 재사용. 변경되는 타입:

```typescript
// src/features/graph/types/layout.ts -- 수정
// GraphMode에서 "split" 제거, 항상 풀 너비
// 선택 상태만 관리
interface GraphLayoutState {
  selectedNodeId: string | null;
}
```

## 핵심 구현 패턴

### 세로 스크롤 레이아웃

```
[SiteHeader]              -- sticky top-0, h-14, z-50
[HeroGraphSection]        -- h-[calc(100vh-56px)], 그래프 캔버스
[ContentSection]          -- 조건부 렌더링, 슬라이드 다운
```

- `HomeLayout`은 더 이상 `flex h-screen overflow-hidden`이 아니라 `flex flex-col min-h-screen`
- 페이지 전체가 세로 스크롤 가능
- 그래프는 항상 풀 너비 (좌우 분할 없음)

### 슬라이드 다운 구현 방식

CSS `grid-template-rows` 트릭을 활용한 height 애니메이션:
```css
/* 접힌 상태 */
.content-wrapper { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 350ms var(--ease-out); }
.content-inner { overflow: hidden; }

/* 펼친 상태 */
.content-wrapper.open { grid-template-rows: 1fr; }
```

이 방식은 `max-height` 해킹보다 안정적이며, `height: auto`로의 자연스러운 전환을 지원한다.

### 자동 스크롤

```typescript
// 노드 클릭 시
const contentRef = useRef<HTMLElement>(null);

function handleNodeClick(slug: string) {
  selectNode(slug);
  // 약간의 딜레이 후 스크롤 (슬라이드 다운 시작 후)
  requestAnimationFrame(() => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
```

### 콘텐츠 전환 (다른 노드 클릭)

서버 컴포넌트에서 MDX를 렌더링하므로, 다른 노드 클릭 시 `router.push('/?node=newSlug')`로 서버 컴포넌트 리렌더를 트리거한다. 전환 시 콘텐츠 영역 상단으로 스크롤한다.

## 구현 태스크 (체크리스트)

- [ ] **단계 1: SiteHeader 컴포넌트 생성** -- sticky top 헤더. 왼쪽 로고("JIT-Hub", `/` 링크), 오른쪽 Projects 링크(`/projects`) + ThemeToggle. 완료 기준: 헤더 렌더링 정상, sticky 동작, 반응형 px-6/px-4.

- [ ] **단계 2: ThemeToggle 위치 변경** -- `src/components/ThemeToggle.tsx`에서 `fixed` 포지셔닝 제거. `layout.tsx`에서 ThemeToggle 직접 렌더링 제거. SiteHeader 내부에서 렌더링. 완료 기준: 헤더 우측에서 테마 토글 정상 동작, 기존 fixed 버튼 사라짐.

- [ ] **단계 3: 세로 스크롤 레이아웃 전환** -- `HomeLayout.tsx` 전면 재작성. `flex h-screen overflow-hidden` → `flex flex-col min-h-screen`. 그래프 영역 `h-[calc(100vh-56px)]`. 좌우 분할 코드 제거. 완료 기준: 그래프가 헤더 아래 뷰포트 전체를 채움, 세로 스크롤 가능.

- [ ] **단계 4: 콘텐츠 슬라이드 다운 구현** -- 노드 선택 시 그래프 아래에 콘텐츠 영역 펼침. `grid-template-rows` 기반 height 애니메이션. 자동 스크롤(`scrollIntoView`). 완료 기준: 노드 클릭 → 콘텐츠 슬라이드 다운 + 자동 스크롤, 350ms ease-out.

- [ ] **단계 5: 콘텐츠 전환 처리** -- 다른 노드 클릭 시 본문 교체 + 본문 상단 스크롤. 이미 펼쳐진 상태에서 다른 노드 클릭 시 슬라이드 다운 재실행 없이 내용만 교체. 완료 기준: 콘텐츠 깜빡임 없이 전환, 상단 스크롤.

- [ ] **단계 6: 기존 분할 뷰 코드 정리** -- ContentPanelWrapper, ContentPanel, CloseButton 등 좌우 분할용 컴포넌트 삭제 또는 리팩토링. PanelHeader를 ContentHeader로 변환. 완료 기준: 불필요한 파일 제거, 빌드 에러 없음.

- [ ] **단계 7: /nodes/[slug] SEO 페이지** -- 정적 페이지 생성. `generateStaticParams`로 모든 노드 slug 프리렌더. 완료 기준: `/nodes/[slug]` 접속 시 정적 페이지 표시, `bun run build` 성공.

- [ ] **단계 8: 반응형 + 접근성 마무리** -- 모바일에서 헤더/그래프/콘텐츠 정상 동작 확인. aria-label, 키보드 탐색, 포커스 관리. 완료 기준: 768px 미만 정상 동작, 키보드로 헤더 탐색 가능.

## 기술적 리스크

| 리스크 | 영향도 | 완화 방안 |
|--------|--------|---------|
| `height: auto` 애니메이션 | 중 | `grid-template-rows: 0fr → 1fr` 기법 사용. `max-height` 해킹 회피. |
| 그래프 리사이즈 시 캔버스 깨짐 | 중 | 세로 스크롤에서 그래프 높이는 고정(`calc(100vh - 56px)`)이므로 리사이즈 빈도 낮음. ResizeObserver로 안정적 대응. |
| 서버 컴포넌트 MDX 렌더링 + 클라이언트 전환 | 중 | `page.tsx`가 서버 컴포넌트이므로 `?node=slug` 변경 시 서버 리렌더 발생. Next.js 16의 부분 렌더링으로 그래프 리렌더 최소화. |
| 슬라이드 다운 + 자동 스크롤 타이밍 | 하 | `requestAnimationFrame` 또는 `setTimeout`으로 애니메이션 시작 후 스크롤 트리거. 타이밍 미세 조정 필요할 수 있음. |
| ThemeToggle 위치 변경 시 기존 테스트 깨짐 | 하 | `data-theme-toggle` 셀렉터 유지하면 E2E 테스트 호환. |
