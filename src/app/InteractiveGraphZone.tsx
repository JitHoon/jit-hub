"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ExpandIcon from "@/components/icons/ExpandIcon";
import ScrollDownIndicator from "@/components/ScrollDownIndicator";
import { GraphSection } from "@/features/graph/components/GraphSection";
import ReadingProgressBar from "@/features/content/components/ReadingProgressBar";
import ConnectionTree from "@/features/content/components/ConnectionTree";
import FullNodeTree from "@/features/content/components/FullNodeTree";
import ClientContentSection from "@/features/content/components/ClientContentSection";
import ContentSkeleton from "@/features/content/components/ContentSkeleton";
import { buildConnectedNodesFromGraph } from "@/features/content/utils/connected-nodes";
import { getSerializedContent } from "@/features/content/actions/getSerializedContent";
import type { ClusterId } from "@/constants/cluster";
import type { GraphData, GraphNode } from "@/types/graph";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";

interface InteractiveGraphZoneProps {
  graphData: GraphData;
}

interface ContentState {
  title: string;
  cluster: ClusterId;
  mdxResult: MDXRemoteSerializeResult;
}

export default function InteractiveGraphZone({
  graphData: graphDataProp,
}: InteractiveGraphZoneProps): React.ReactElement {
  const [graphData] = useState(graphDataProp);
  const searchParams = useSearchParams();
  const contentKey = searchParams.get("node") ?? undefined;

  const contentRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [content, setContent] = useState<{
    key: string;
    data: ContentState;
  } | null>(null);

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

  useEffect(() => {
    if (!contentKey) return;

    let cancelled = false;

    getSerializedContent(contentKey).then((result) => {
      if (cancelled) return;
      if (result) {
        setContent({ key: contentKey, data: result });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [contentKey]);

  const currentContent =
    contentKey && content?.key === contentKey ? content.data : null;
  const showContentArea = contentKey != null;

  return (
    <>
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
        <div className="mb-4 flex justify-end px-6">
          <Link
            href={`/nodes/${contentKey}`}
            className="text-[var(--muted)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--foreground)]"
            aria-label="상세 페이지로 이동"
          >
            <ExpandIcon size={18} />
          </Link>
        </div>
      )}
      {showContentArea && (
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
          {currentContent ? (
            <ClientContentSection
              title={currentContent.title}
              cluster={currentContent.cluster}
              mdxResult={currentContent.mdxResult}
            />
          ) : (
            <ContentSkeleton />
          )}
        </div>
      )}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
        <div className="mx-auto max-w-3xl px-6">
          {currentContent != null && (
            <div className="flex justify-center pb-8">
              <ScrollDownIndicator targetRef={contentRef} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
