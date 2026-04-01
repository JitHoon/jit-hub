import fs from "node:fs";
import path from "node:path";

import { getNodeBySlug } from "@/features/content/utils/pipeline";
import type { GraphData } from "@/features/graph/types/graph";
import HomeLayout from "./HomeLayout";

function loadGraphData(): GraphData {
  const filePath = path.join(process.cwd(), "graph-data.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as GraphData;
}

interface HomePageProps {
  searchParams: Promise<{ node?: string }>;
}

export default async function Home({
  searchParams,
}: HomePageProps): Promise<React.ReactElement> {
  const graphData = loadGraphData();
  const { node: nodeSlug } = await searchParams;

  const selectedNode = nodeSlug ? getNodeBySlug(nodeSlug) : null;

  return (
    <HomeLayout
      graphData={graphData}
      selectedNode={
        selectedNode
          ? {
              title: selectedNode.frontmatter.title,
              cluster: selectedNode.frontmatter.cluster,
              difficulty: selectedNode.frontmatter.difficulty,
              source: selectedNode.content,
            }
          : null
      }
    />
  );
}
