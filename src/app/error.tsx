"use client";

import ErrorCard from "@/components/error/ErrorCard";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <ErrorCard
      variant="fatal"
      title="페이지를 불러올 수 없습니다"
      description={error.digest ?? error.message}
      onRetry={reset}
    />
  );
}
