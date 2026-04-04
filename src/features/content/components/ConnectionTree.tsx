import { Suspense } from "react";
import Link from "next/link";
import { CLUSTERS, type ClusterId } from "@/constants/cluster";
import type { ConnectedNodeInfo } from "../utils/connected-nodes";
import { EDGE_TYPE_LABELS, EDGE_TYPE_ORDER } from "../utils/edge-type";
import BackToFullTreeButton from "./BackToFullTreeButton";
import ClusterDot from "./ClusterDot";
import CollapsibleGroup from "./CollapsibleGroup";

interface ConnectionTreeProps {
  currentTitle: string;
  currentCluster: ClusterId;
  nodes: ConnectedNodeInfo[];
  className?: string;
  defaultOpen?: boolean;
  backButton?: React.ReactNode;
  backButtonPosition?: "top" | "bottom";
}

function groupByEdgeType(
  nodes: ConnectedNodeInfo[],
): Map<ConnectedNodeInfo["edgeType"], ConnectedNodeInfo[]> {
  const groups = new Map<ConnectedNodeInfo["edgeType"], ConnectedNodeInfo[]>();
  for (const node of nodes) {
    const list = groups.get(node.edgeType) ?? [];
    list.push(node);
    groups.set(node.edgeType, list);
  }
  return groups;
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
    <div className="flex justify-end">
      {backButton ?? (
        <Suspense>
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
                        <Link
                          href={`/?node=${node.slug}`}
                          scroll={false}
                          className="group inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors duration-[var(--duration-fast)] hover:bg-[var(--surface-alt)]"
                        >
                          <ClusterDot cluster={node.cluster} />
                          <span className="text-sm text-[var(--foreground)] group-hover:text-[var(--accent)]">
                            {node.title}
                          </span>
                          <span className="text-[10px] text-[var(--muted)]">
                            {CLUSTERS[node.cluster].label}
                          </span>
                        </Link>
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
