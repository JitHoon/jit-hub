"use client";

import LoadingIndicator from "@/components/LoadingIndicator";
import {
  useLoadingSequence,
  REVEALING_DURATION_MS,
} from "../hooks/useLoadingSequence";
import { CameraHint } from "./CameraHint";
import { GraphCanvas3D } from "./GraphCanvas3D";
import type { GraphData } from "../types/graph";

interface GraphSectionProps {
  graphData: GraphData;
  className?: string;
}

export function GraphSection({
  graphData,
  className,
}: GraphSectionProps): React.ReactElement {
  const { phase, onEngineReady } = useLoadingSequence();

  const isLoading = phase === "loading";
  const isReady = phase === "ready";

  const canvasStyle: React.CSSProperties =
    phase === "revealing" || phase === "ready"
      ? {
          opacity: phase === "ready" ? 1 : 0,
          transition: `opacity ${REVEALING_DURATION_MS}ms cubic-bezier(0,0,0.2,1)`,
        }
      : { opacity: 0 };

  return (
    <div className={`relative h-full w-full ${className ?? ""}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingIndicator isLoading={isLoading} />
        </div>
      )}
      <GraphCanvas3D
        graphData={graphData}
        onEngineReady={onEngineReady}
        style={canvasStyle}
      />
      <CameraHint dismissed={!isReady} />
    </div>
  );
}
