interface LoadingIndicatorProps {
  isLoading: boolean;
}

export default function LoadingIndicator({ isLoading }: LoadingIndicatorProps) {
  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-label="로딩 중"
      className="flex items-center justify-center"
    >
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-text-muted)] border-t-transparent" />
    </div>
  );
}
