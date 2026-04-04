"use client";

import { useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { GraphSection } from "@/features/graph/components/GraphSection";
import ConnectionTree from "@/features/content/components/ConnectionTree";
import FullNodeTree from "@/features/content/components/FullNodeTree";
import { buildConnectedNodesFromGraph } from "@/features/content/utils/connected-nodes";
import type { ClusterId } from "@/constants/cluster";
import type { GraphData, GraphNode } from "@/features/graph/types/graph";

interface HomeLayoutProps {
  graphData: GraphData;
  contentSection?: React.ReactNode;
  contentKey?: string;
}

export default function HomeLayout({
  graphData,
  contentSection,
  contentKey,
}: HomeLayoutProps): React.ReactElement {
  const hasContent = contentSection != null;
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  const selectedGraphNode = useMemo(() => {
    if (!contentKey) return null;
    return graphData.nodes.find((n) => n.id === contentKey) ?? null;
  }, [contentKey, graphData.nodes]);

  const activeNode = hoveredNode ?? selectedGraphNode;

  const treeData = useMemo(() => {
    if (!activeNode) return null;
    const nodes = buildConnectedNodesFromGraph(activeNode.id, graphData);
    if (nodes.length === 0) return null;
    return { title: activeNode.title, cluster: activeNode.cluster, nodes };
  }, [activeNode, graphData]);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <div
          data-testid="graph-section"
          className="flex h-[calc(60vh-56px)] items-center justify-center px-6 py-6 [container-type:size]"
        >
          <GraphSection
            graphData={graphData}
            onNodeHoverChange={setHoveredNode}
          />
        </div>
        <div data-testid="connection-tree-grid">
          {treeData ? (
            <ConnectionTree
              currentTitle={treeData.title}
              currentCluster={treeData.cluster as ClusterId}
              nodes={treeData.nodes}
            />
          ) : (
            <FullNodeTree graphData={graphData} />
          )}
        </div>
        <div
          data-testid="content-grid"
          className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0,0,0.2,1)]"
          style={{ gridTemplateRows: hasContent ? "1fr" : "0fr" }}
        >
          <div
            key={contentKey}
            className="overflow-hidden animate-[content-fade-in_var(--duration-slow)_var(--ease-out)]"
          >
            {contentSection}
          </div>
        </div>
      </main>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
        <div className="mx-auto max-w-3xl px-6">
          <div className="flex justify-end pb-8">
            <ScrollToTopButton />
          </div>
        </div>
      </div>
    </div>
  );
}
