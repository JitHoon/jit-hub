import { lazy, Suspense, type ComponentType } from "react";

export default function dynamic<P extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  opts?: { ssr?: boolean; loading?: () => JSX.Element | null },
) {
  const LazyComponent = lazy(importFn);
  const LoadingFallback = opts?.loading ?? (() => null);

  return function DynamicComponent(props: P) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
