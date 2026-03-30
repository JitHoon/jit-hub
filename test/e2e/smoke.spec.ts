import { test, expect } from "@playwright/test";

test.describe("@smoke", () => {
  test("홈페이지가 정상적으로 로딩된다", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/jit-hub|지식 포트폴리오/i);
  });
});
