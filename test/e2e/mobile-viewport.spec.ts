import { test, expect } from "@playwright/test";

const MOBILE_VIEWPORT = { width: 375, height: 667 };

test.describe("모바일 뷰포트 (768px 이하)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test("홈페이지가 모바일에서 정상 로딩된다", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/JIT Hub|지식 포트폴리오/i);
  });

  test("수평 오버플로가 없다", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-testid="graph-section"]').waitFor();

    const hasOverflow = await page.evaluate(
      () => document.body.scrollWidth > window.innerWidth,
    );
    expect(hasOverflow).toBe(false);
  });

  test("헤더가 전체 너비를 차지하고 sticky이다", async ({ page }) => {
    await page.goto("/");
    const header = page.locator('[data-testid="site-header"]');
    await expect(header).toBeVisible();

    const box = await header.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeCloseTo(MOBILE_VIEWPORT.width, 0);

    const position = await header.evaluate(
      (el) => getComputedStyle(el).position,
    );
    expect(position).toBe("sticky");
  });

  test("그래프 컨테이너가 뷰포트 너비 안에 렌더링된다", async ({ page }) => {
    await page.goto("/");
    const container = page.locator('[data-testid="graph-container"]');
    await container.waitFor();

    const box = await container.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.width).toBeLessThanOrEqual(MOBILE_VIEWPORT.width);
    expect(box!.height).toBeGreaterThan(0);
  });

  test("URL 파라미터로 노드 선택 시 콘텐츠가 표시된다", async ({ page }) => {
    await page.goto("/?node=lod");
    const contentGrid = page.locator('[data-testid="content-grid"]');
    await contentGrid.waitFor();

    await expect(contentGrid).toContainText("LOD 전략");
  });

  test("노드 선택 시 콘텐츠 영역이 뷰포트 너비를 초과하지 않는다", async ({
    page,
  }) => {
    await page.goto("/?node=lod");
    const contentGrid = page.locator('[data-testid="content-grid"]');
    await contentGrid.waitFor();

    const hasOverflow = await page.evaluate(
      () => document.body.scrollWidth > window.innerWidth,
    );
    expect(hasOverflow).toBe(false);
  });

  test("connection-tree-grid가 모바일에서 표시된다", async ({ page }) => {
    await page.goto("/");
    const treeGrid = page.locator('[data-testid="connection-tree-grid"]');
    await expect(treeGrid).toBeVisible();
  });

  test("ThemeToggle이 모바일에서 접근 가능하다", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator(
      '[data-testid="site-header"] [data-theme-toggle]',
    );
    await expect(toggle).toBeVisible();
  });
});
