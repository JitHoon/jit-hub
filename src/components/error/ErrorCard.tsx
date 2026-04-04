"use client";

import AlertIcon from "@/components/icons/AlertIcon";

interface ErrorCardProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  variant: "panel" | "fatal";
  alwaysShowDescription?: boolean;
}

export default function ErrorCard({
  title,
  description,
  onRetry,
  variant,
  alwaysShowDescription = false,
}: ErrorCardProps) {
  const isDev = process.env.NODE_ENV === "development";
  const showDescription = alwaysShowDescription || isDev;

  if (variant === "fatal") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 text-center">
          <AlertIcon
            size={40}
            className="mx-auto mb-4 text-[var(--color-kick-red)]"
          />
          <h1 className="mb-2 font-display text-xl font-bold text-foreground">
            {title}
          </h1>
          {showDescription && description && (
            <p className="mb-6 font-mono text-xs text-muted">{description}</p>
          )}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded bg-[var(--color-kick-blue)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 text-center">
        <AlertIcon
          size={32}
          className="mx-auto mb-3 text-[var(--color-kick-red)]"
        />
        <p className="mb-1 font-sans text-sm font-semibold text-foreground">
          {title}
        </p>
        {showDescription && description && (
          <p className="mb-4 font-mono text-xs text-muted">{description}</p>
        )}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded bg-[var(--color-kick-blue)] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
}
