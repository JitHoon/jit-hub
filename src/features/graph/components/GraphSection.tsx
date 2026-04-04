"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import type { GraphData, GraphNode } from "../types/graph";

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
  return (
    <div className={`flex flex-col items-center ${className ?? ""}`}>
      <div className="h-[100cqmin] w-[100cqmin] overflow-hidden rounded-full border border-border">
        <div
          data-testid="graph-container"
          className="relative h-full w-full [clip-path:circle(50%)]"
        >
          <Suspense fallback={null}>
            <GraphCanvas3D
              graphData={graphData}
              onNodeHoverChange={onNodeHoverChange}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
