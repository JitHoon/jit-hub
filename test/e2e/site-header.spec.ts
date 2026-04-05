import { test, expect } from "@playwright/test";

test.describe("SiteHeader", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("헤더가 56px 높이로 렌더링된다", async ({ page }) => {
    const header = page.locator('[data-testid="site-header"]');
    await expect(header).toBeVisible();

    const box = await header.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeCloseTo(56, 0);
  });

  test("헤더가 sticky 포지션을 가진다", async ({ page }) => {
    const header = page.locator('[data-testid="site-header"]');
    await header.waitFor();
    const position = await header.evaluate(
      (el) => getComputedStyle(el).position,
    );
    expect(position).toBe("sticky");
  });

  test("JIT-Hub 로고 링크가 홈으로 연결된다", async ({ page }) => {
    const logoLink = page.locator('[data-testid="site-header"] a[href="/"]');
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toHaveText("JIT-Hub");
  });

  test("ThemeToggle이 헤더 내에 존재한다", async ({ page }) => {
    const toggle = page.locator(
      '[data-testid="site-header"] [data-theme-toggle]',
    );
    await expect(toggle).toBeVisible();
  });
});
