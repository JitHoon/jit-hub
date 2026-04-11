import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

function buildAxeScanner(page: import("@playwright/test").Page) {
  return new AxeBuilder({ page })
    .exclude('[data-testid="graph-container"] canvas')
    .exclude('[data-testid="scroll-to-top"]')
    .exclude(".tracking-wider")
    .disableRules(["scrollable-region-focusable"]);
}

test.describe("접근성 (axe-core)", () => {
  test("홈페이지에 심각한 접근성 위반이 없다", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-testid="graph-section"]').waitFor();

    const results = await buildAxeScanner(page).analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );

    if (critical.length > 0) {
      const summary = critical
        .map(
          (v) =>
            `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length}건)`,
        )
        .join("\n");
      expect(critical, `접근성 위반 발견:\n${summary}`).toHaveLength(0);
    }
  });

  test("노드 상세 페이지에 심각한 접근성 위반이 없다", async ({ page }) => {
    await page.goto("/?node=lod");
    await page.locator('[data-testid="content-grid"]').waitFor();

    const results = await buildAxeScanner(page).analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );

    if (critical.length > 0) {
      const summary = critical
        .map(
          (v) =>
            `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length}건)`,
        )
        .join("\n");
      expect(critical, `접근성 위반 발견:\n${summary}`).toHaveLength(0);
    }
  });

  test("SEO 정적 노드 페이지에 심각한 접근성 위반이 없다", async ({ page }) => {
    await page.goto("/nodes/lod");
    await page.waitForLoadState("domcontentloaded");

    const results = await buildAxeScanner(page).analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );

    if (critical.length > 0) {
      const summary = critical
        .map(
          (v) =>
            `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length}건)`,
        )
        .join("\n");
      expect(critical, `접근성 위반 발견:\n${summary}`).toHaveLength(0);
    }
  });
});
