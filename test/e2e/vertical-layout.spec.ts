import { test, expect } from "@playwright/test";

test.describe("Vertical Layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("그래프 섹션이 viewport 높이 - 56px를 차지한다", async ({ page }) => {
    const graphSection = page.locator('[data-testid="graph-section"]');
    await expect(graphSection).toBeVisible();

    const box = await graphSection.boundingBox();
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    expect(box).not.toBeNull();
    expect(box!.height).toBeCloseTo(viewportHeight - 56, 1);
  });

  test("콘텐츠 미선택 시 content-grid 높이가 0이다", async ({ page }) => {
    const gridHeight = await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="content-grid"]');
      if (!grid) return -1;
      return grid.getBoundingClientRect().height;
    });

    expect(gridHeight).toBeLessThan(1);
  });

  test("수평 오버플로가 없다", async ({ page }) => {
    const hasOverflow = await page.evaluate(
      () => document.body.scrollWidth > window.innerWidth,
    );
    expect(hasOverflow).toBe(false);
  });
});
