import fs from "node:fs";
import path from "node:path";

import type { GraphData } from "@/features/graph/types/graph";
import { getNodeBySlug } from "@/features/content/utils/pipeline";
import ContentSection from "@/features/content/components/ContentSection";
import HomeLayout from "./HomeLayout";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function loadGraphData(): GraphData {
  const filePath = path.join(process.cwd(), "graph-data.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as GraphData;
}

export default async function Home({
  searchParams,
}: PageProps): Promise<React.ReactElement> {
  const graphData = loadGraphData();
  const params = await searchParams;
  const nodeSlug = typeof params.node === "string" ? params.node : undefined;

  const node = nodeSlug ? getNodeBySlug(nodeSlug) : undefined;

  const contentSection = node ? (
    <ContentSection
      title={node.frontmatter.title}
      cluster={node.frontmatter.cluster}
      mdxSource={node.content}
    />
  ) : undefined;

  return (
    <HomeLayout
      graphData={graphData}
      contentSection={contentSection}
      contentKey={nodeSlug}
    />
  );
}
