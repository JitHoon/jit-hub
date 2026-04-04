import Link from "next/link";
import { CLUSTERS, type ClusterId } from "@/constants/cluster";
import ClusterDot from "./ClusterDot";

interface NodeLinkProps {
  id: string;
  title: string;
  cluster: ClusterId;
  showLabel?: boolean;
}

export default function NodeLink({
  id,
  title,
  cluster,
  showLabel = false,
}: NodeLinkProps): React.ReactElement {
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
      {showLabel && (
        <span className="text-[10px] text-[var(--muted)]">
          {CLUSTERS[cluster].label}
        </span>
      )}
    </Link>
  );
}
