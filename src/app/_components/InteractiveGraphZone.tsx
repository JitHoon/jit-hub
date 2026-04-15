"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ExpandIcon from "@/components/icons/ExpandIcon";
import { GraphSection } from "@/features/graph/components/GraphSection";
import ReadingProgressBar from "@/features/content/components/ReadingProgressBar";
import ConnectionTree from "@/features/content/components/ConnectionTree";
import FullNodeTree from "@/features/content/components/FullNodeTree";
import ClientContentSection from "@/features/content/components/ClientContentSection";
import ContentSkeleton from "@/features/content/components/ContentSkeleton";
import HistoryBackButton from "@/features/content/components/HistoryBackButton";
import BackToFullTreeButton from "@/features/content/components/BackToFullTreeButton";
import { buildConnectedNodesFromGraph } from "@/features/content/utils/connected-nodes";
import { getSerializedContent } from "@/features/content/actions/getSerializedContent";
import type { ClusterId } from "@/constants/cluster";
import type { GraphData } from "@/types/graph";
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
  const [content, setContent] = useState<{
    key: string;
    data: ContentState;
  } | null>(null);

  const selectedGraphNode = useMemo(() => {
    if (!contentKey) return null;
    return graphData.nodes.find((n) => n.id === contentKey) ?? null;
  }, [contentKey, graphData.nodes]);

  const treeData = useMemo(() => {
    if (!selectedGraphNode) return null;
    const nodes = buildConnectedNodesFromGraph(selectedGraphNode.id, graphData);
    if (nodes.length === 0) return null;
    return {
      title: selectedGraphNode.title,
      cluster: selectedGraphNode.cluster,
      nodes,
    };
  }, [selectedGraphNode, graphData]);

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
        <GraphSection graphData={graphData} />
      </div>
      <div data-testid="connection-tree-grid">
        {treeData ? (
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex gap-1">
              <Suspense>
                <HistoryBackButton />
                <BackToFullTreeButton />
              </Suspense>
            </div>
            {contentKey && (
              <Link
                href={`/nodes/${contentKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-[var(--muted)] transition-colors duration-fast hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
                aria-label="상세 페이지로 이동"
              >
                <span>자세히 보기</span>
                <ExpandIcon size={20} />
              </Link>
            )}
          </div>
        ) : (
          <FullNodeTree graphData={graphData} />
        )}
      </div>
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
      {treeData && (
        <ConnectionTree
          currentTitle={treeData.title}
          currentCluster={treeData.cluster as ClusterId}
          nodes={treeData.nodes}
          className="mt-10 border-t border-[var(--border)] px-6 pt-8"
          defaultOpen={true}
          backButtonPosition="bottom"
        />
      )}
    </>
  );
}
