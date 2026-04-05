import { cn } from "@/lib/cn";

interface GraphSkeletonProps {
  className?: string;
}

export function GraphSkeleton({
  className,
}: GraphSkeletonProps): React.ReactElement {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-[var(--color-graph-bg)]",
        className,
      )}
      role="status"
      aria-label="그래프 로딩 중"
    >
      <div className="h-3 w-3 animate-pulse rounded-full bg-[var(--color-graph-dot)]" />
    </div>
  );
}
