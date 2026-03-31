interface SkeletonProps {
  className?: string;
  lines?: number;
  variant?: "text" | "block" | "circle";
}

export default function Skeleton({
  className,
  lines = 3,
  variant = "block",
}: SkeletonProps) {
  if (variant === "circle") {
    return (
      <div
        className={`animate-pulse rounded-full bg-surface-alt ${className ?? ""}`}
      />
    );
  }

  if (variant === "text") {
    const widths = ["w-full", "w-4/5", "w-3/5", "w-11/12", "w-2/3"];
    return (
      <div className={`space-y-3 ${className ?? ""}`}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`h-4 animate-pulse rounded bg-surface-alt ${widths[i % widths.length]}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`animate-pulse rounded bg-surface-alt ${className ?? "h-full w-full"}`}
    />
  );
}
