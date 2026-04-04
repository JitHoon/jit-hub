import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * 그래프 canvas가 렌더링될 때까지 대기하고 크기를 검증한다.
 */
export async function waitForGraphReady(page: Page): Promise<void> {
  const canvas = page.locator('[data-testid="graph-container"] canvas');
  await canvas.waitFor({ timeout: 30_000 });
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(100);
  expect(box!.height).toBeGreaterThan(100);
}

/**
 * URL 쿼리 파라미터로 노드를 선택하고 콘텐츠가 표시될 때까지 대기한다.
 */
export async function selectNode(page: Page, slug: string): Promise<void> {
  await page.goto(`/?node=${slug}`);
  await page.locator('[data-testid="content-grid"]').waitFor();
}

/**
 * 콘텐츠 grid 애니메이션이 완료되어 콘텐츠가 보일 때까지 대기한다.
 */
export async function waitForContentVisible(page: Page): Promise<void> {
  await expect
    .poll(
      async () => {
        return page.evaluate(() => {
          const grid = document.querySelector('[data-testid="content-grid"]');
          if (!grid) return "0fr";
          return getComputedStyle(grid).gridTemplateRows;
        });
      },
      { timeout: 5_000 },
    )
    .not.toBe("0fr");
}

/**
 * 페이지가 상단으로 스크롤될 때까지 대기한다.
 */
export async function waitForScrollToTop(
  page: Page,
  timeout = 5_000,
): Promise<void> {
  await expect
    .poll(async () => page.evaluate(() => window.scrollY), { timeout })
    .toBeLessThan(10);
}
