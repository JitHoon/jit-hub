"use client";

import { useState } from "react";
import { ContentPanelWrapper } from "@/features/content/components";
import { GraphSection } from "@/features/graph/components/GraphSection";
import type { ClusterId } from "@/constants/cluster";
import type { Difficulty } from "@/types/node";
import type { GraphData } from "@/features/graph/types/graph";

interface SelectedNodeData {
  title: string;
  cluster: ClusterId;
  difficulty: Difficulty;
}

interface HomeLayoutProps {
  graphData: GraphData;
  selectedNode: SelectedNodeData | null;
  mdxContent: React.ReactNode;
}

export default function HomeLayout({
  graphData,
  selectedNode,
  mdxContent,
}: HomeLayoutProps): React.ReactElement {
  const [closing, setClosing] = useState(false);

  const [prevNode, setPrevNode] = useState(selectedNode);

  if (selectedNode !== prevNode) {
    setPrevNode(selectedNode);
    setClosing(false);
  }

  const hasNode = !!selectedNode && !closing;
  const expandGraph = !selectedNode || closing;

  return (
    <main className="flex h-screen w-screen overflow-hidden">
      <div
        className={`transition-all ${
          expandGraph
            ? "duration-[350ms] ease-[cubic-bezier(0,0,0.2,1)] w-full"
            : "duration-[400ms] ease-[cubic-bezier(0,0,0.2,1)] w-[38%]"
        }`}
      >
        <GraphSection graphData={graphData} />
      </div>
      {selectedNode && (
        <div
          className={`overflow-hidden transition-all ${
            hasNode
              ? "duration-[400ms] ease-[cubic-bezier(0,0,0.2,1)] w-[62%]"
              : "duration-[300ms] ease-[cubic-bezier(0.4,0,1,1)] w-0"
          }`}
        >
          <ContentPanelWrapper
            title={selectedNode.title}
            cluster={selectedNode.cluster}
            difficulty={selectedNode.difficulty}
            onClosingStart={() => setClosing(true)}
          >
            {mdxContent}
          </ContentPanelWrapper>
        </div>
      )}
    </main>
  );
}
