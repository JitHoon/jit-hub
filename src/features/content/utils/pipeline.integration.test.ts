import { describe, it, expect } from "vitest";
import matter from "gray-matter";
import { loadAllNodes } from "./pipeline";
import { nodeFrontmatterSchema } from "../types/schema";
import { generateGraphData } from "@/features/graph/utils/builder";
import type { NodeFrontmatter } from "@/types/node";
import type { ParsedNode } from "./pipeline";

function makeFrontmatterYaml(overrides: Record<string, unknown> = {}): string {
  const defaults: Record<string, unknown> = {
    slug: "test-node",
    title: "테스트 노드",
    cluster: "coordinate",
    difficulty: "beginner",
    tags: ["test"],
  };
  const merged = { ...defaults, ...overrides };
  const lines = Object.entries(merged).map(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length === 0) return `${key}: []`;
      if (typeof value[0] === "object") {
        const items = value
          .map(
            (v: Record<string, string>) =>
              `  - slug: "${v.slug}"\n    relationship: "${v.relationship}"`,
          )
          .join("\n");
        return `${key}:\n${items}`;
      }
      return `${key}:\n${value.map((v: string) => `  - "${v}"`).join("\n")}`;
    }
    return `${key}: "${value}"`;
  });
  return `---\n${lines.join("\n")}\n---\n\n본문 내용`;
}

function parseAndValidate(yaml: string): NodeFrontmatter {
  const { data } = matter(yaml);
  const result = nodeFrontmatterSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(", "),
    );
  }
  return result.data;
}

describe("콘텐츠 파이프라인 통합 테스트", () => {
  describe("실제 노드 파일 전체 파이프라인", () => {
    const nodes = loadAllNodes();
    const graphData = generateGraphData(nodes);

    it("모든 노드를 로드한다", () => {
      expect(nodes.length).toBeGreaterThan(0);
    });

    it("모든 노드가 유효한 프론트매터를 가진다", () => {
      for (const node of nodes) {
        expect(node.frontmatter.slug).toBeTruthy();
        expect(node.frontmatter.title).toBeTruthy();
        expect(node.frontmatter.cluster).toBeTruthy();
        expect(node.frontmatter.difficulty).toBeTruthy();
        expect(node.frontmatter.tags.length).toBeGreaterThan(0);
      }
    });

    it("slug이 모두 고유하다", () => {
      const slugs = nodes.map((n) => n.frontmatter.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    });

    it("GraphData의 노드 수가 로드된 노드 수와 일치한다", () => {
      expect(graphData.nodes).toHaveLength(nodes.length);
    });

    it("모든 엣지의 source와 target이 실존하는 노드를 참조한다", () => {
      const nodeIds = new Set(graphData.nodes.map((n) => n.id));
      for (const edge of graphData.edges) {
        expect(nodeIds.has(edge.source)).toBe(true);
        expect(nodeIds.has(edge.target)).toBe(true);
      }
    });

    it("클러스터별 nodeCount 합계가 전체 노드 수와 일치한다", () => {
      const total = graphData.clusters.reduce((sum, c) => sum + c.nodeCount, 0);
      expect(total).toBe(nodes.length);
    });

    it("모든 노드에 3D 좌표가 할당된다", () => {
      for (const node of graphData.nodes) {
        expect(typeof node.x).toBe("number");
        expect(typeof node.y).toBe("number");
        expect(typeof node.z).toBe("number");
      }
    });

    it("엣지 타입이 유효한 값만 포함한다", () => {
      const validTypes = new Set(["prerequisite", "related", "child"]);
      for (const edge of graphData.edges) {
        expect(validTypes.has(edge.type)).toBe(true);
      }
    });
  });

  describe("gray-matter 파싱 → Zod 검증 → 그래프 빌드 통합", () => {
    it("YAML 프론트매터를 파싱하고 Zod로 검증한 결과가 그래프 데이터로 변환된다", () => {
      const yamlA = makeFrontmatterYaml({
        slug: "node-a",
        title: "노드 A",
        cluster: "coordinate",
        prerequisites: ["node-b"],
        tags: ["gis"],
      });
      const yamlB = makeFrontmatterYaml({
        slug: "node-b",
        title: "노드 B",
        cluster: "data",
        tags: ["3d"],
      });

      const parsedNodes: ParsedNode[] = [
        { frontmatter: parseAndValidate(yamlA), content: "본문 A" },
        { frontmatter: parseAndValidate(yamlB), content: "본문 B" },
      ];

      const data = generateGraphData(parsedNodes);

      expect(data.nodes).toHaveLength(2);
      expect(data.edges).toContainEqual({
        source: "node-a",
        target: "node-b",
        type: "prerequisite",
      });
      expect(data.clusters.find((c) => c.id === "coordinate")?.nodeCount).toBe(
        1,
      );
      expect(data.clusters.find((c) => c.id === "data")?.nodeCount).toBe(1);
    });

    it("relatedConcepts 관계가 엣지로 변환된다", () => {
      const yamlA = makeFrontmatterYaml({
        slug: "node-a",
        relatedConcepts: [{ slug: "node-b", relationship: "requires" }],
        tags: ["test"],
      });
      const yamlB = makeFrontmatterYaml({
        slug: "node-b",
        tags: ["test"],
      });

      const parsedNodes: ParsedNode[] = [
        { frontmatter: parseAndValidate(yamlA), content: "" },
        { frontmatter: parseAndValidate(yamlB), content: "" },
      ];

      const data = generateGraphData(parsedNodes);

      expect(data.edges).toContainEqual({
        source: "node-a",
        target: "node-b",
        type: "related",
        relationship: "requires",
      });
    });

    it("고립 노드(관계 없음)도 그래프에 포함된다", () => {
      const yaml = makeFrontmatterYaml({
        slug: "isolated",
        title: "고립 노드",
        tags: ["lonely"],
      });

      const parsedNodes: ParsedNode[] = [
        { frontmatter: parseAndValidate(yaml), content: "" },
      ];

      const data = generateGraphData(parsedNodes);

      expect(data.nodes).toHaveLength(1);
      expect(data.nodes[0]?.id).toBe("isolated");
      expect(data.edges).toHaveLength(0);
    });

    it("동일 소스→타겟에 여러 관계가 있으면 우선순위에 따라 중복 제거된다", () => {
      const yamlA = makeFrontmatterYaml({
        slug: "node-a",
        prerequisites: ["node-b"],
        relatedConcepts: [{ slug: "node-b", relationship: "uses" }],
        tags: ["test"],
      });
      const yamlB = makeFrontmatterYaml({
        slug: "node-b",
        tags: ["test"],
      });

      const parsedNodes: ParsedNode[] = [
        { frontmatter: parseAndValidate(yamlA), content: "" },
        { frontmatter: parseAndValidate(yamlB), content: "" },
      ];

      const data = generateGraphData(parsedNodes);

      const edgesAtoB = data.edges.filter(
        (e) => e.source === "node-a" && e.target === "node-b",
      );
      expect(edgesAtoB).toHaveLength(1);
      expect(edgesAtoB[0]?.type).toBe("prerequisite");
    });
  });

  describe("Zod 검증 실패 케이스", () => {
    it("잘못된 slug 형식을 거부한다", () => {
      const yaml = makeFrontmatterYaml({ slug: "INVALID_SLUG" });
      const { data } = matter(yaml);
      const result = nodeFrontmatterSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("빈 tags 배열을 거부한다", () => {
      const yaml = makeFrontmatterYaml({ tags: [] });
      const { data } = matter(yaml);
      const result = nodeFrontmatterSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("존재하지 않는 cluster를 거부한다", () => {
      const yaml = makeFrontmatterYaml({ cluster: "nonexistent" });
      const { data } = matter(yaml);
      const result = nodeFrontmatterSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("필수 필드 누락을 거부한다", () => {
      const yaml = "---\nslug: test\n---\n";
      const { data } = matter(yaml);
      const result = nodeFrontmatterSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
