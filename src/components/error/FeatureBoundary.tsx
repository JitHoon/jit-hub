"use client";

import { Suspense, type ErrorInfo, type ReactNode } from "react";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import ErrorCard from "@/components/error/ErrorCard";

interface FeatureBoundaryProps {
  children: ReactNode;
  skeleton: ReactNode;
  errorTitle?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  className?: string;
}

export default function FeatureBoundary({
  children,
  skeleton,
  errorTitle = "오류가 발생했습니다",
  onError,
  className,
}: FeatureBoundaryProps) {
  return (
    <div className={className}>
      <ErrorBoundary
        fallback={(error, reset) => (
          <ErrorCard
            variant="panel"
            title={errorTitle}
            description={error.message}
            onRetry={reset}
          />
        )}
        onError={onError}
      >
        <Suspense fallback={skeleton}>{children}</Suspense>
      </ErrorBoundary>
    </div>
  );
}
