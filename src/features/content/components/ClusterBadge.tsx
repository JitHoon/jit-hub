import { CLUSTERS, type ClusterId } from "@/constants/cluster";

interface ClusterBadgeProps {
  cluster: ClusterId;
}

export default function ClusterBadge({ cluster }: ClusterBadgeProps) {
  const { color, label } = CLUSTERS[cluster];

  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-2 w-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-[var(--muted)]">{label}</span>
    </span>
  );
}
