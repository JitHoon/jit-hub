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

  test("JIT-Hub 드롭다운을 열면 홈 링크가 존재한다", async ({ page }) => {
    const dropdownButton = page.locator('[data-testid="site-header"] button', {
      hasText: "JIT-Hub",
    });
    await expect(dropdownButton).toBeVisible();
    await dropdownButton.click();

    const homeLink = page.locator('[data-testid="site-header"] a[href="/"]');
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveText("지식 그래프");
  });

  test("드롭다운에 지식 그래프 링크가 존재한다", async ({ page }) => {
    const dropdownButton = page.locator('[data-testid="site-header"] button', {
      hasText: "JIT-Hub",
    });
    await dropdownButton.click();

    const link = page.locator('[data-testid="site-header"] a', {
      hasText: "지식 그래프",
    });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/");
  });

  test("ThemeToggle이 헤더 내에 존재한다", async ({ page }) => {
    const toggle = page.locator(
      '[data-testid="site-header"] [data-theme-toggle]',
    );
    await expect(toggle).toBeVisible();
  });
});
