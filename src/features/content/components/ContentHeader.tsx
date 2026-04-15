import type { ClusterId } from "@/constants/cluster";
import ClusterBadge from "./ClusterBadge";

interface ContentHeaderProps {
  title: string;
  cluster: ClusterId;
  action?: React.ReactNode;
}

export default function ContentHeader({
  title,
  cluster,
  action,
}: ContentHeaderProps) {
  return (
    <header className="flex flex-col gap-3 pb-6 border-b border-[var(--border)]">
      <div className="flex items-center justify-between">
        <ClusterBadge cluster={cluster} />
        {action}
      </div>
      <h1 className="text-2xl font-semibold text-[var(--foreground)] leading-snug">
        {title}
      </h1>
    </header>
  );
}
