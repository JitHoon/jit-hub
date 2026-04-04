import type { ClusterId } from "@/constants/cluster";
import ClusterBadge from "./ClusterBadge";

interface ContentHeaderProps {
  title: string;
  cluster: ClusterId;
}

export default function ContentHeader({ title, cluster }: ContentHeaderProps) {
  return (
    <header className="flex flex-col gap-3 pb-6 border-b border-[var(--border)]">
      <ClusterBadge cluster={cluster} />
      <h1 className="text-2xl font-semibold text-[var(--foreground)] leading-snug">
        {title}
      </h1>
    </header>
  );
}
