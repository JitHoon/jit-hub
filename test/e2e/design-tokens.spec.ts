import { test, expect } from "@playwright/test";

const resolveColorScript = `(varName) => {
  const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  if (!val) return '';
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = val;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  const hex = (n) => n.toString(16).padStart(2, '0');
  return '#' + hex(r) + hex(g) + hex(b);
}`;

test.describe("디자인 토큰", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("[data-theme-toggle]").waitFor();
  });

  test("Lexend 폰트 변수가 body에 적용된다", async ({ page }) => {
    const fontFamily = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).getPropertyValue("--font-lexend"));
    expect(fontFamily.trim()).not.toBe("");
  });

  test("Noto Sans KR 폰트 변수가 body에 적용된다", async ({ page }) => {
    const fontFamily = await page
      .locator("body")
      .evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--font-noto-kr"),
      );
    expect(fontFamily.trim()).not.toBe("");
  });

  test("body에 font-family가 설정되어 있다", async ({ page }) => {
    const fontFamily = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(fontFamily).toMatch(/sans-serif/i);
  });

  test("라이트 모드 시맨틱 CSS 변수가 올바르다", async ({ page }) => {
    const html = page.locator("html");
    const toggle = page.locator("[data-theme-toggle]");

    const isDark = await html.evaluate((el) => el.classList.contains("dark"));
    if (isDark) {
      await toggle.click();
      await expect(html).not.toHaveClass(/dark/);
    }

    const resolve = (varName: string) =>
      page.evaluate(
        new Function("varName", `return (${resolveColorScript})(varName)`) as (
          varName: string,
        ) => string,
        varName,
      );

    expect(await resolve("--background")).toBe("#f7f7f7");
    expect(await resolve("--foreground")).toBe("#1a1a1a");
    expect(await resolve("--surface")).toBe("#eeeeee");
    expect(await resolve("--muted")).toBe("#6e6e6e");
    expect(await resolve("--text")).toBe("#666666");
    expect(await resolve("--border")).toBe("#d0d0d0");
  });

  test("다크 모드 시맨틱 CSS 변수가 올바르다", async ({ page }) => {
    const html = page.locator("html");
    const toggle = page.locator("[data-theme-toggle]");

    const isDark = await html.evaluate((el) => el.classList.contains("dark"));
    if (!isDark) {
      await toggle.click();
      await expect(html).toHaveClass(/dark/);
    }

    const resolve = (varName: string) =>
      page.evaluate(
        new Function("varName", `return (${resolveColorScript})(varName)`) as (
          varName: string,
        ) => string,
        varName,
      );

    expect(await resolve("--background")).toBe("#111111");
    expect(await resolve("--foreground")).toBe("#eeeeee");
    expect(await resolve("--surface")).toBe("#1a1a1a");
    expect(await resolve("--muted")).toBe("#878787");
    expect(await resolve("--text")).toBe("#999999");
    expect(await resolve("--border")).toBe("#2e2e2e");
  });

  test("킥 컬러 CSS 변수가 존재한다", async ({ page }) => {
    const resolve = (varName: string) =>
      page.evaluate(
        new Function("varName", `return (${resolveColorScript})(varName)`) as (
          varName: string,
        ) => string,
        varName,
      );

    expect(await resolve("--color-kick-red")).not.toBe("");
    expect(await resolve("--color-kick-blue")).not.toBe("");
    expect(await resolve("--color-kick-green")).not.toBe("");
    expect(await resolve("--color-kick-yellow")).not.toBe("");
  });

  test("클러스터 색상 CSS 변수가 6개 모두 존재한다", async ({ page }) => {
    const clusters = [
      "discovery",
      "data",
      "coordinate",
      "performance",
      "pipeline",
      "feature",
    ];

    const vars = await page.evaluate((names: string[]) => {
      const s = getComputedStyle(document.documentElement);
      return names.map((n) =>
        s.getPropertyValue(`--color-cluster-${n}`).trim(),
      );
    }, clusters);

    for (let i = 0; i < clusters.length; i++) {
      expect(vars[i], `--color-cluster-${clusters[i]} 누락`).not.toBe("");
    }
  });
});
