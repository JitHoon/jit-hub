import Link from "next/link";
import type { ClusterId } from "@/constants/cluster";
import type { GraphNode } from "@/features/graph/types/graph";
import type { NodeConnection } from "../utils/node-connections";
import { EDGE_TYPE_LABELS, EDGE_TYPE_ORDER } from "../utils/edge-type";
import ClusterDot from "./ClusterDot";
import CollapsibleGroup from "./CollapsibleGroup";

interface NodeWithEdgesProps {
  node: GraphNode;
  connections: NodeConnection[];
}

function NodeLink({
  id,
  title,
  cluster,
}: {
  id: string;
  title: string;
  cluster: ClusterId;
}): React.ReactElement {
  return (
    <Link
      href={`/?node=${id}`}
      scroll={false}
      className="group inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors duration-[var(--duration-fast)] hover:bg-[var(--surface-alt)]"
    >
      <ClusterDot cluster={cluster} />
      <span className="text-sm text-[var(--foreground)] group-hover:text-[var(--accent)]">
        {title}
      </span>
    </Link>
  );
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

  const grouped = new Map<NodeConnection["edgeType"], NodeConnection[]>();
  for (const conn of connections) {
    const list = grouped.get(conn.edgeType) ?? [];
    list.push(conn);
    grouped.set(conn.edgeType, list);
  }

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
                defaultOpen={true}
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
