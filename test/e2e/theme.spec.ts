import { test, expect, type Page } from "@playwright/test";

async function getBodyBgHex(page: Page): Promise<string> {
  return page.evaluate(() => {
    const bg = getComputedStyle(document.body).backgroundColor;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    const hex = (n: number) => n.toString(16).padStart(2, "0");
    return `#${hex(data[0] ?? 0)}${hex(data[1] ?? 0)}${hex(data[2] ?? 0)}`;
  });
}

test.describe("테마 전환", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("[data-theme-toggle]").waitFor();
  });

  test("토글 버튼 클릭 시 html.dark 클래스가 전환된다", async ({ page }) => {
    const html = page.locator("html");
    const toggle = page.locator("[data-theme-toggle]");

    const initialDark = await html.evaluate((el) =>
      el.classList.contains("dark"),
    );

    await toggle.click();

    if (initialDark) {
      await expect(html).not.toHaveClass(/dark/);
    } else {
      await expect(html).toHaveClass(/dark/);
    }

    await toggle.click();

    if (initialDark) {
      await expect(html).toHaveClass(/dark/);
    } else {
      await expect(html).not.toHaveClass(/dark/);
    }
  });

  test("다크 모드 배경색이 #111111이다", async ({ page }) => {
    const html = page.locator("html");
    const toggle = page.locator("[data-theme-toggle]");

    const isDark = await html.evaluate((el) => el.classList.contains("dark"));
    if (!isDark) {
      await toggle.click();
      await expect(html).toHaveClass(/dark/);
    }

    await expect.poll(() => getBodyBgHex(page)).toBe("#111111");
  });

  test("라이트 모드 배경색이 #F7F7F7이다", async ({ page }) => {
    const html = page.locator("html");
    const toggle = page.locator("[data-theme-toggle]");

    const isDark = await html.evaluate((el) => el.classList.contains("dark"));
    if (isDark) {
      await toggle.click();
      await expect(html).not.toHaveClass(/dark/);
    }

    await expect.poll(() => getBodyBgHex(page)).toBe("#f7f7f7");
  });

  test("테마 선택이 localStorage에 저장된다", async ({ page }) => {
    const html = page.locator("html");
    const toggle = page.locator("[data-theme-toggle]");

    await toggle.click();
    const firstTheme = (await html.evaluate((el) =>
      el.classList.contains("dark"),
    ))
      ? "dark"
      : "light";

    const stored = await page.evaluate(() => localStorage.getItem("theme"));
    expect(stored).toBe(firstTheme);

    await toggle.click();
    const secondTheme = firstTheme === "dark" ? "light" : "dark";

    const storedAfter = await page.evaluate(() =>
      localStorage.getItem("theme"),
    );
    expect(storedAfter).toBe(secondTheme);
  });

  test("새로고침 후에도 테마가 유지된다", async ({ page }) => {
    const html = page.locator("html");
    const toggle = page.locator("[data-theme-toggle]");

    const isDark = await html.evaluate((el) => el.classList.contains("dark"));
    if (!isDark) {
      await toggle.click();
      await expect(html).toHaveClass(/dark/);
    }

    await page.reload();
    await page.locator("[data-theme-toggle]").waitFor();

    await expect(html).toHaveClass(/dark/);

    await expect.poll(() => getBodyBgHex(page)).toBe("#111111");
  });
});
