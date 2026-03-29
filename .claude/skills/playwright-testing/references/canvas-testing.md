# canvas 기반 컴포넌트 E2E 테스트

## 문제

react-force-graph-2d는 HTML Canvas API로 그래프를 렌더링한다.
Canvas 내부 요소는 DOM 트리에 존재하지 않으므로 `page.locator()`로 개별 노드를 선택할 수 없다.

## 전략

### 1. 렌더링 검증 — canvas 요소 존재 + 크기

```ts
const canvas = page.locator('[data-testid="graph-container"] canvas');
await canvas.waitFor();
const box = await canvas.boundingBox();
expect(box).not.toBeNull();
expect(box!.width).toBeGreaterThan(100);
expect(box!.height).toBeGreaterThan(100);
```

### 2. 노드 선택 — URL 파라미터로 우회

canvas 내부 노드를 클릭하는 것은 좌표 기반이라 불안정하다.
대신 URL 쿼리 파라미터로 노드를 선택한다:

```ts
// 직접 canvas 클릭 (불안정) ❌
await canvas.click({ position: { x: 100, y: 200 } });

// URL 파라미터로 노드 선택 (안정적) ✅
await page.goto('/?node=cesium-mouse-events');
await page.locator('[data-testid="node-panel"]').waitFor();
```

### 3. 분할 뷰 검증 — DOM 요소로 확인

노드 선택 후의 결과(분할 뷰, 본문 패널)는 DOM에 존재하므로 일반적인 locator 사용:

```ts
await expect(page.locator('[data-testid="split-view"]')).toBeVisible();
await expect(page.locator('[data-testid="node-panel"]')).toContainText('제목');
```

### 4. 그래프 인터랙션 스모크 테스트

canvas 클릭이 필요한 테스트는 최소한으로 유지하고, 스모크 테스트 수준에서만 사용:

```ts
// canvas 중앙 클릭 — 무언가 반응하는지만 확인
const box = await canvas.boundingBox();
await canvas.click({
  position: { x: box!.width / 2, y: box!.height / 2 }
});
```

## data-testid 규칙

컴포넌트 구현 시 다음 `data-testid`를 포함할 것:

| 요소 | data-testid |
|------|-------------|
| 그래프 컨테이너 | `graph-container` |
| 분할 뷰 | `split-view` |
| 노드 패널 | `node-panel` |
| 다크 모드 토글 | `theme-toggle` |
