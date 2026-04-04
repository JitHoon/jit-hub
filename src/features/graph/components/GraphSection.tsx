"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import ErrorCard from "@/components/error/ErrorCard";
import type { GraphData, GraphNode } from "../types/graph";
import { useWebGLSupport } from "../hooks/useWebGLSupport";

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

  return (
    <div className={`flex flex-col items-center ${className ?? ""}`}>
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
            <Suspense fallback={null}>
              <GraphCanvas3D
                graphData={graphData}
                onNodeHoverChange={onNodeHoverChange}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
