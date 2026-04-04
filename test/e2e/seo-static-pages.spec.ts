import { test, expect } from "@playwright/test";

test.describe("SEO 정적 페이지", () => {
  test("유효한 slug 페이지가 제목과 함께 렌더링된다", async ({ page }) => {
    const response = await page.goto("/nodes/area-calculation");
    expect(response?.status()).toBe(200);

    await expect(page.locator("h1").first()).toContainText(
      "면적 계산 알고리즘",
    );
  });

  test("OG 메타태그가 올바르게 설정된다", async ({ page }) => {
    await page.goto("/nodes/area-calculation");

    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /면적 계산 알고리즘/);
  });

  test("MDX 본문이 렌더링된다", async ({ page }) => {
    await page.goto("/nodes/area-calculation");

    const prose = page.locator("main");
    await expect(prose).toBeVisible();

    const textContent = await prose.textContent();
    expect(textContent?.length).toBeGreaterThan(100);
  });

  test("존재하지 않는 slug는 404를 반환한다", async ({ page }) => {
    const response = await page.goto("/nodes/this-slug-does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("여러 slug가 각각 올바르게 렌더링된다", async ({ page }) => {
    const slugs = [
      { slug: "lod", titleFragment: "LOD" },
      { slug: "coordinate-transform", titleFragment: "좌표" },
    ];

    for (const { slug, titleFragment } of slugs) {
      await page.goto(`/nodes/${slug}`);
      await expect(page.locator("h1").first()).toContainText(titleFragment);
    }
  });
});
