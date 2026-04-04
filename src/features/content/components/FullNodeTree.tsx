"use client";

import { useMemo } from "react";
import { CLUSTER_IDS, CLUSTERS } from "@/constants/cluster";
import type { GraphData } from "@/types/graph";
import { buildNodeConnectionMap } from "../utils/node-connections";
import { groupByCluster } from "../utils/group-by-cluster";
import ClusterDot from "./ClusterDot";
import CollapsibleGroup from "./CollapsibleGroup";
import NodeWithEdges from "./NodeWithEdges";

interface FullNodeTreeProps {
  graphData: GraphData;
}

export default function FullNodeTree({
  graphData,
}: FullNodeTreeProps): React.ReactElement {
  const clusterGroups = useMemo(
    () => groupByCluster(graphData.nodes),
    [graphData.nodes],
  );

  const nodeConnectionMap = useMemo(
    () => buildNodeConnectionMap(graphData),
    [graphData],
  );

  return (
    <div className="px-6 pt-4 pb-8">
      <div className="space-y-1">
        {CLUSTER_IDS.map((clusterId) => {
          const nodes = clusterGroups.get(clusterId);
          if (!nodes || nodes.length === 0) return null;

          return (
            <CollapsibleGroup
              key={clusterId}
              defaultOpen={false}
              label={CLUSTERS[clusterId].label}
              leading={<ClusterDot cluster={clusterId} />}
              trailing={
                <span className="text-[10px] text-[var(--muted)]">
                  {nodes.length}
                </span>
              }
            >
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-[var(--border)] pb-1">
                {nodes.map((node) => (
                  <NodeWithEdges
                    key={node.id}
                    node={node}
                    connections={nodeConnectionMap.get(node.id) ?? []}
                  />
                ))}
              </div>
            </CollapsibleGroup>
          );
        })}
      </div>
    </div>
  );
}
