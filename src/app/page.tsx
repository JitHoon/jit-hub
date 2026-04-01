import fs from "node:fs";
import path from "node:path";

import { ContentPanelWrapper } from "@/features/content/components";
import { getNodeBySlug } from "@/features/content/utils/pipeline";
import { GraphSection } from "@/features/graph/components/GraphSection";
import type { GraphData } from "@/features/graph/types/graph";

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

  const selectedNode = nodeSlug ? getNodeBySlug(nodeSlug) : undefined;

  const hasNode = !!selectedNode;

  return (
    <main className="flex h-screen w-screen overflow-hidden">
      <div className={hasNode ? "w-[38%]" : "w-full"}>
        <GraphSection graphData={graphData} />
      </div>
      {hasNode && (
        <div className="w-[62%] overflow-y-auto">
          <ContentPanelWrapper
            title={selectedNode.frontmatter.title}
            cluster={selectedNode.frontmatter.cluster}
            difficulty={selectedNode.frontmatter.difficulty}
            source={selectedNode.content}
          />
        </div>
      )}
    </main>
  );
}
