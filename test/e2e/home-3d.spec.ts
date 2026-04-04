import { test, expect } from "@playwright/test";

test.describe("홈 페이지 3D 그래프 렌더링", () => {
  test("WebGL 미지원 환경에서 폴백 UI가 렌더링되고 canvas가 없다", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        contextId: string,
        ...args: unknown[]
      ) {
        if (contextId === "webgl" || contextId === "webgl2") {
          return null;
        }
        return original.call(this, contextId, ...(args as []));
      };
    });

    await page.goto("/");

    const container = page.locator('[data-testid="graph-container"]');
    await container.waitFor();

    await expect(container).toContainText("3D 그래프를 표시할 수 없습니다");
    await expect(container).toContainText(
      "이 브라우저는 WebGL을 지원하지 않습니다",
    );

    const canvas = container.locator("canvas");
    await expect(canvas).toHaveCount(0);
  });

  test("graph-container가 존재하고 크기가 0보다 크다", async ({ page }) => {
    await page.goto("/");

    const container = page.locator('[data-testid="graph-container"]');
    await container.waitFor();

    const box = await container.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test("URL 파라미터로 노드 선택 시 content-grid에 콘텐츠가 렌더링된다", async ({
    page,
  }) => {
    await page.goto("/?node=lod");

    const contentGrid = page.locator('[data-testid="content-grid"]');
    await contentGrid.waitFor();

    await expect(contentGrid).toContainText("LOD 레벨 오브 디테일");
  });

  test("WebGL 지원 시 canvas 요소가 존재하고 크기가 0보다 크다", async ({
    page,
  }) => {
    await page.goto("/");

    const hasWebGL = await page.evaluate(() => {
      const el = document.createElement("canvas");
      const ctx = el.getContext("webgl2") ?? el.getContext("webgl");
      return ctx !== null;
    });

    if (!hasWebGL) {
      test.skip();
      return;
    }

    const canvas = page.locator('[data-testid="graph-container"] canvas');
    await canvas.waitFor();

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });
});
