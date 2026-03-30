import { test, expect } from "@playwright/test";

function expandHex(hex: string): string {
  const m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(hex);
  if (m) return `#${m[1]}${m[1]}${m[2]}${m[2]}${m[3]}${m[3]}`.toLowerCase();
  return hex.toLowerCase();
}

test.describe("디자인 토큰", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("[data-theme-toggle]").waitFor();
  });

  test("Lexend 폰트 변수가 html에 적용된다", async ({ page }) => {
    const fontFamily = await page
      .locator("html")
      .evaluate((el) => getComputedStyle(el).getPropertyValue("--font-lexend"));
    expect(fontFamily.trim()).not.toBe("");
  });

  test("Noto Sans KR 폰트 변수가 html에 적용된다", async ({ page }) => {
    const fontFamily = await page
      .locator("html")
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

    const vars = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      return {
        background: s.getPropertyValue("--background").trim(),
        foreground: s.getPropertyValue("--foreground").trim(),
        surface: s.getPropertyValue("--surface").trim(),
        muted: s.getPropertyValue("--muted").trim(),
        text: s.getPropertyValue("--text").trim(),
        border: s.getPropertyValue("--border").trim(),
      };
    });

    expect(expandHex(vars.background)).toBe("#f7f7f7");
    expect(expandHex(vars.foreground)).toBe("#1a1a1a");
    expect(expandHex(vars.surface)).toBe("#eeeeee");
    expect(expandHex(vars.muted)).toBe("#888888");
    expect(expandHex(vars.text)).toBe("#666666");
    expect(expandHex(vars.border)).toBe("#d0d0d0");
  });

  test("다크 모드 시맨틱 CSS 변수가 올바르다", async ({ page }) => {
    const html = page.locator("html");
    const toggle = page.locator("[data-theme-toggle]");

    const isDark = await html.evaluate((el) => el.classList.contains("dark"));
    if (!isDark) {
      await toggle.click();
      await expect(html).toHaveClass(/dark/);
    }

    const vars = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      return {
        background: s.getPropertyValue("--background").trim(),
        foreground: s.getPropertyValue("--foreground").trim(),
        surface: s.getPropertyValue("--surface").trim(),
        muted: s.getPropertyValue("--muted").trim(),
        text: s.getPropertyValue("--text").trim(),
        border: s.getPropertyValue("--border").trim(),
      };
    });

    expect(expandHex(vars.background)).toBe("#111111");
    expect(expandHex(vars.foreground)).toBe("#eeeeee");
    expect(expandHex(vars.surface)).toBe("#1a1a1a");
    expect(expandHex(vars.muted)).toBe("#707070");
    expect(expandHex(vars.text)).toBe("#999999");
    expect(expandHex(vars.border)).toBe("#2e2e2e");
  });

  test("킥 컬러 CSS 변수가 존재한다", async ({ page }) => {
    const vars = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      return {
        red: s.getPropertyValue("--color-kick-red").trim(),
        blue: s.getPropertyValue("--color-kick-blue").trim(),
        green: s.getPropertyValue("--color-kick-green").trim(),
        yellow: s.getPropertyValue("--color-kick-yellow").trim(),
      };
    });

    expect(vars.red).not.toBe("");
    expect(vars.blue).not.toBe("");
    expect(vars.green).not.toBe("");
    expect(vars.yellow).not.toBe("");
  });

  test("클러스터 색상 CSS 변수가 9개 모두 존재한다", async ({ page }) => {
    const clusters = [
      "geodesy",
      "graphics",
      "implementation",
      "problem",
      "optimization",
      "infrastructure",
      "frontend",
      "format",
      "decision",
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
