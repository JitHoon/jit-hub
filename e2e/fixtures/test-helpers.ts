import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * 그래프 canvas가 렌더링될 때까지 대기하고 크기를 검증한다.
 */
export async function waitForGraphReady(page: Page): Promise<void> {
  const canvas = page.locator('[data-testid="graph-container"] canvas');
  await canvas.waitFor();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(100);
  expect(box!.height).toBeGreaterThan(100);
}

/**
 * URL 쿼리 파라미터로 노드를 선택한다.
 * canvas 내부 클릭보다 안정적이다.
 */
export async function selectNode(page: Page, slug: string): Promise<void> {
  await page.goto(`/?node=${slug}`);
  await page.locator('[data-testid="node-panel"]').waitFor();
}

/**
 * 분할 뷰가 열려 있는지 확인한다.
 */
export async function assertSplitView(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="split-view"]')).toBeVisible();
  await expect(page.locator('[data-testid="node-panel"]')).toBeVisible();
}
