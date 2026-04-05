"use client";

import { Suspense, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/cn";
import ErrorCard from "@/components/error/ErrorCard";
import type { GraphData, GraphNode } from "../types/graph";
import { useWebGLSupport } from "../hooks/useWebGLSupport";
import { GraphSkeleton } from "./GraphSkeleton";

const GraphCanvas3D = dynamic(
  () => import("./GraphCanvas3D").then((m) => m.GraphCanvas3D),
  { ssr: false },
);

interface GraphSectionProps {
  graphData: GraphData;
  className?: string;
  onNodeHoverChange?: (node: GraphNode | null) => void;
}

export function GraphSection({
  graphData,
  className,
  onNodeHoverChange,
}: GraphSectionProps): React.ReactElement {
  const { supported } = useWebGLSupport();
  const [graphReady, setGraphReady] = useState(false);
  const handleGraphReady = useCallback(() => setGraphReady(true), []);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="h-[100cqmin] w-[100cqmin] overflow-hidden rounded-full border border-border">
        <div
          data-testid="graph-container"
          role="img"
          aria-label="지식 노드 관계를 보여주는 3D 그래프"
          className="relative h-full w-full [clip-path:circle(50%)]"
        >
          {supported === false ? (
            <ErrorCard
              variant="panel"
              title="3D 그래프를 표시할 수 없습니다"
              description="이 브라우저는 WebGL을 지원하지 않습니다"
              alwaysShowDescription
            />
          ) : (
            <>
              <Suspense fallback={<GraphSkeleton />}>
                <GraphCanvas3D
                  graphData={graphData}
                  onNodeHoverChange={onNodeHoverChange}
                  onReady={handleGraphReady}
                />
              </Suspense>
              <div
                className={cn(
                  "absolute inset-0 transition-opacity duration-[var(--duration-slow)] ease-[var(--ease-out)]",
                  graphReady ? "pointer-events-none opacity-0" : "opacity-100",
                )}
              >
                <GraphSkeleton />
              </div>
            </>
          )}
        </div>
      </div>
      <ul className="sr-only">
        {graphData.nodes.map((node) => (
          <li key={node.id}>
            {node.title} — 클러스터: {node.cluster}, 난이도: {node.difficulty}
          </li>
        ))}
      </ul>
    </div>
  );
}
