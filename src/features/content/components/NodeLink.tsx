"use client";

import Link from "next/link";
import { CLUSTERS, type ClusterId } from "@/constants/cluster";
import ClusterDot from "./ClusterDot";

interface NodeLinkProps {
  id: string;
  title: string;
  cluster: ClusterId;
  showLabel?: boolean;
  linkMode?: "graph" | "seo";
}

export default function NodeLink({
  id,
  title,
  cluster,
  showLabel = false,
  linkMode = "graph",
}: NodeLinkProps): React.ReactElement {
  const href = linkMode === "seo" ? `/nodes/${id}` : `/?node=${id}`;

  return (
    <Link
      href={href}
      scroll={linkMode === "seo"}
      className="group inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors duration-fast hover:bg-[var(--surface-alt)]"
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
