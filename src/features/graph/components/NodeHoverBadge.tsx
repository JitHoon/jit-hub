"use client";

import { CLUSTERS, type ClusterId } from "@/constants/cluster";
import type { GraphNode } from "../types/graph";

interface NodeHoverBadgeProps {
  node: GraphNode | null;
}

export function NodeHoverBadge({ node }: NodeHoverBadgeProps) {
  const cluster = node?.cluster as ClusterId | undefined;
  const meta = cluster && cluster in CLUSTERS ? CLUSTERS[cluster] : null;

  return (
    <div
      className={`pointer-events-none flex h-6 items-center justify-center gap-1.5 transition-all duration-200 ease-out ${node ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}
    >
      {meta && (
        <span
          className="inline-block size-2 shrink-0 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
      )}
      <span className="text-xs font-medium text-[var(--heading)]">
        {node?.title}
      </span>
      {meta && (
        <span className="text-[10px] text-[var(--text-muted)]">
          {meta.label}
        </span>
      )}
    </div>
  );
}
