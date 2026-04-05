import type { ClusterId } from "@/constants/cluster";
import type { GraphNode } from "@/types/graph";
import type { NodeConnection } from "../utils/node-connections";
import { EDGE_TYPE_LABELS, EDGE_TYPE_ORDER } from "../utils/edge-type";
import { groupByEdgeType } from "../utils/group-by-edge-type";
import CollapsibleGroup from "./CollapsibleGroup";
import NodeLink from "./NodeLink";

interface NodeWithEdgesProps {
  node: GraphNode;
  connections: NodeConnection[];
}

export default function NodeWithEdges({
  node,
  connections,
}: NodeWithEdgesProps): React.ReactElement {
  const cluster = node.cluster as ClusterId;

  if (connections.length === 0) {
    return (
      <div className="relative ml-3">
        <span className="absolute -left-3 top-[9px] h-px w-2 bg-[var(--border)]" />
        <NodeLink id={node.id} title={node.title} cluster={cluster} />
      </div>
    );
  }

  const grouped = groupByEdgeType(connections);

  return (
    <div className="relative ml-3">
      <span className="absolute -left-3 top-[9px] h-px w-2 bg-[var(--border)]" />
      <NodeLink id={node.id} title={node.title} cluster={cluster} />
      <div className="ml-2 mt-0.5 border-l border-[var(--border)] pb-0.5">
        {EDGE_TYPE_ORDER.map((edgeType) => {
          const group = grouped.get(edgeType);
          if (!group || group.length === 0) return null;

          return (
            <div key={edgeType} className="relative ml-3 mt-0.5">
              <span className="absolute -left-3 top-[9px] h-px w-2 bg-[var(--border)]" />
              <CollapsibleGroup
                defaultOpen={false}
                label={EDGE_TYPE_LABELS[edgeType]}
                trailing={
                  <span className="text-[10px] text-[var(--muted)]">
                    {group.length}
                  </span>
                }
              >
                <div className="ml-2 mt-0.5 border-l border-[var(--border)] pb-0.5">
                  {group.map((conn) => (
                    <div key={conn.slug} className="relative ml-3 mt-0.5">
                      <span className="absolute -left-3 top-[9px] h-px w-2 bg-[var(--border)]" />
                      <NodeLink
                        id={conn.slug}
                        title={conn.title}
                        cluster={conn.cluster as ClusterId}
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
  );
}
