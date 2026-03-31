import { describe, it, expect } from "vitest";
import { nodeFrontmatterSchema } from "./schema";

const validFrontmatter = {
  slug: "test-node",
  title: "테스트 노드",
  cluster: "geodesy",
  difficulty: "intermediate",
  tags: ["test"],
};

describe("nodeFrontmatterSchema", () => {
  it("올바른 프론트매터를 파싱한다", () => {
    const result = nodeFrontmatterSchema.safeParse(validFrontmatter);
    expect(result.success).toBe(true);
  });

  it("대문자가 포함된 slug를 거부한다", () => {
    const result = nodeFrontmatterSchema.safeParse({
      ...validFrontmatter,
      slug: "Test-Node",
    });
    expect(result.success).toBe(false);
  });

  it("빈 title을 거부한다", () => {
    const result = nodeFrontmatterSchema.safeParse({
      ...validFrontmatter,
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("잘못된 cluster를 거부한다", () => {
    const result = nodeFrontmatterSchema.safeParse({
      ...validFrontmatter,
      cluster: "invalid-cluster",
    });
    expect(result.success).toBe(false);
  });

  it("빈 tags 배열을 거부한다", () => {
    const result = nodeFrontmatterSchema.safeParse({
      ...validFrontmatter,
      tags: [],
    });
    expect(result.success).toBe(false);
  });

  it("선택 필드의 기본값이 빈 배열이다", () => {
    const result = nodeFrontmatterSchema.safeParse(validFrontmatter);
    if (!result.success) throw new Error("파싱 실패");
    expect(result.data.prerequisites).toEqual([]);
    expect(result.data.relatedConcepts).toEqual([]);
    expect(result.data.childConcepts).toEqual([]);
  });
});
