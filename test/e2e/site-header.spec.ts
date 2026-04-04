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
    const position = await page.evaluate(() => {
      const header = document.querySelector('[data-testid="site-header"]');
      if (!header) return "";
      return getComputedStyle(header).position;
    });
    expect(position).toBe("sticky");
  });

  test("JIT-Hub 로고가 홈으로 링크된다", async ({ page }) => {
    const logo = page.locator('[data-testid="site-header"] a', {
      hasText: "JIT-Hub",
    });
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("href", "/");
  });

  test("Projects 링크가 존재한다", async ({ page }) => {
    const link = page.locator('[data-testid="site-header"] a', {
      hasText: "Projects",
    });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/projects");
  });

  test("ThemeToggle이 헤더 내에 존재한다", async ({ page }) => {
    const toggle = page.locator(
      '[data-testid="site-header"] [data-theme-toggle]',
    );
    await expect(toggle).toBeVisible();
  });
});
