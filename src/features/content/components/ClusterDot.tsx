import { CLUSTERS, type ClusterId } from "@/constants/cluster";

interface ClusterDotProps {
  cluster: ClusterId;
}

export default function ClusterDot({ cluster }: ClusterDotProps) {
  return (
    <span
      className="inline-block size-2 shrink-0 rounded-full"
      style={{ backgroundColor: CLUSTERS[cluster].color }}
    />
  );
}
