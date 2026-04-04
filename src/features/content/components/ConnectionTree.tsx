import { Suspense } from "react";
import { CLUSTERS, type ClusterId } from "@/constants/cluster";
import type { ConnectedNodeInfo } from "../utils/connected-nodes";
import { EDGE_TYPE_LABELS, EDGE_TYPE_ORDER } from "../utils/edge-type";
import { groupByEdgeType } from "../utils/group-by-edge-type";
import BackToFullTreeButton from "./BackToFullTreeButton";
import HistoryBackButton from "./HistoryBackButton";
import ClusterDot from "./ClusterDot";
import CollapsibleGroup from "./CollapsibleGroup";
import NodeLink from "./NodeLink";

interface ConnectionTreeProps {
  currentTitle: string;
  currentCluster: ClusterId;
  nodes: ConnectedNodeInfo[];
  className?: string;
  defaultOpen?: boolean;
  backButton?: React.ReactNode;
  backButtonPosition?: "top" | "bottom";
}

export default function ConnectionTree({
  currentTitle,
  currentCluster,
  nodes,
  className = "px-6 py-4",
  defaultOpen = true,
  backButton,
  backButtonPosition = "top",
}: ConnectionTreeProps): React.ReactElement | null {
  if (nodes.length === 0) return null;

  const groups = groupByEdgeType(nodes);
  const clusterMeta = CLUSTERS[currentCluster];

  const backButtonEl = (
    <div className="flex justify-end gap-1">
      {backButton ?? (
        <Suspense>
          <HistoryBackButton />
          <BackToFullTreeButton />
        </Suspense>
      )}
    </div>
  );

  return (
    <div className={className}>
      {backButtonPosition === "top" && backButtonEl}
      <div className={`ml-4 ${backButtonPosition === "top" ? "mt-3" : ""}`}>
        <div className="flex items-center gap-1.5">
          <ClusterDot cluster={currentCluster} />
          <p className="text-sm font-medium text-[var(--foreground)]">
            {currentTitle}
          </p>
          <span className="text-[10px] text-[var(--muted)]">
            {clusterMeta.label}
          </span>
        </div>

        <div className="mt-2 ml-2 border-l border-[var(--border)]">
          {EDGE_TYPE_ORDER.map((edgeType) => {
            const group = groups.get(edgeType);
            if (!group || group.length === 0) return null;

            return (
              <div key={edgeType} className="relative ml-3 mt-1.5 first:mt-0">
                <span className="absolute -left-3 top-[9px] h-px w-2 bg-[var(--border)]" />
                <CollapsibleGroup
                  label={EDGE_TYPE_LABELS[edgeType]}
                  defaultOpen={defaultOpen}
                >
                  <div className="ml-2 mt-0.5 border-l border-[var(--border)]">
                    {group.map((node, idx) => (
                      <div
                        key={node.slug}
                        className={`relative ml-3 ${idx > 0 ? "mt-0.5" : ""}`}
                      >
                        <span className="absolute -left-3 top-[9px] h-px w-2 bg-[var(--border)]" />
                        <NodeLink
                          id={node.slug}
                          title={node.title}
                          cluster={node.cluster}
                          showLabel
                        />
                      </div>
                    ))}
                  </div>
                </CollapsibleGroup>
              </div>
            );
          })}
        </div>
      </div>

      {backButtonPosition === "bottom" && (
        <div className="mt-4">{backButtonEl}</div>
      )}
    </div>
  );
}
