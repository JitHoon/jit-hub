export default function ContentSkeleton(): React.ReactElement {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-8">
      <header className="flex flex-col gap-3 border-b border-[var(--border)] pb-6">
        <div className="h-5 w-16 animate-pulse rounded bg-surface-alt" />
        <div className="h-7 w-3/5 animate-pulse rounded bg-surface-alt" />
      </header>
      <div className="mt-8 space-y-4">
        <div className="h-4 w-full animate-pulse rounded bg-surface-alt" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-surface-alt" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-surface-alt" />
        <div className="mt-6 h-4 w-full animate-pulse rounded bg-surface-alt" />
        <div className="h-4 w-3/5 animate-pulse rounded bg-surface-alt" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-surface-alt" />
        <div className="mt-6 h-4 w-2/3 animate-pulse rounded bg-surface-alt" />
        <div className="h-4 w-full animate-pulse rounded bg-surface-alt" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-surface-alt" />
      </div>
    </section>
  );
}
