"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import ScrollDownIndicator from "@/components/ScrollDownIndicator";
import ExpandIcon from "@/components/icons/ExpandIcon";
import { GraphSection } from "@/features/graph/components/GraphSection";
import { NodeSearch } from "@/features/graph/components/NodeSearch";
import ReadingProgressBar from "@/features/content/components/ReadingProgressBar";
import ConnectionTree from "@/features/content/components/ConnectionTree";
import FullNodeTree from "@/features/content/components/FullNodeTree";
import { buildConnectedNodesFromGraph } from "@/features/content/utils/connected-nodes";
import type { ClusterId } from "@/constants/cluster";
import type { GraphData, GraphNode } from "@/types/graph";

interface HomeLayoutProps {
  graphData: GraphData;
  contentSection?: React.ReactNode;
  contentKey?: string;
}

export default function HomeLayout({
  graphData: graphDataProp,
  contentSection,
  contentKey,
}: HomeLayoutProps): React.ReactElement {
  const router = useRouter();
  const [graphData] = useState(graphDataProp);
  const hasContent = contentSection != null;
  const contentRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  const handleNodeSelect = useCallback(
    (nodeId: string) => {
      router.push(`/?node=${nodeId}`);
    },
    [router],
  );

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
      <SiteHeader>
        <NodeSearch nodes={graphData.nodes} onSelect={handleNodeSelect} />
      </SiteHeader>
      <main className="flex flex-1 flex-col pb-16">
        <div className="px-6 pt-6 text-center">
          <h1 className="font-display text-xl font-semibold text-[var(--foreground)]">
            GIS × Frontend
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Interactive 3D GIS Knowledge Graph
          </p>
        </div>
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
              defaultOpen={true}
              backButtonPosition="top"
            />
          ) : (
            <FullNodeTree graphData={graphData} />
          )}
        </div>
        {contentKey && (
          <div className="flex justify-end px-6">
            <Link
              href={`/nodes/${contentKey}`}
              className="text-[var(--muted)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--foreground)]"
              aria-label="상세 페이지로 이동"
            >
              <ExpandIcon size={18} />
            </Link>
          </div>
        )}
        {hasContent && (
          <div
            ref={contentRef}
            data-testid="content-grid"
            key={contentKey}
            className="animate-[content-fade-in_var(--duration-slow)_var(--ease-out)]"
          >
            {selectedGraphNode && (
              <ReadingProgressBar
                cluster={selectedGraphNode.cluster as ClusterId}
                targetRef={contentRef}
              />
            )}
            {contentSection}
          </div>
        )}
      </main>
      <SiteFooter />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
        <div className="mx-auto max-w-3xl px-6">
          {hasContent && (
            <div className="flex justify-center pb-4">
              <ScrollDownIndicator targetRef={contentRef} />
            </div>
          )}
          <div className="flex justify-end pb-8">
            <ScrollToTopButton />
          </div>
        </div>
      </div>
    </div>
  );
}
