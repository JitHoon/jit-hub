"use client";

import "./globals.css";

export const dynamic = "force-dynamic";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const themeScript = `
(function(){
  var t = localStorage.getItem('theme');
  if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme:dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-background text-foreground">
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 text-center">
            <h1 className="mb-2 font-display text-xl font-bold text-foreground">
              예기치 않은 오류가 발생했습니다
            </h1>
            {isDev && (error.digest ?? error.message) && (
              <p className="mb-6 font-mono text-xs text-muted">
                {error.digest ?? error.message}
              </p>
            )}
            <button
              type="button"
              onClick={reset}
              className="rounded bg-[var(--color-kick-blue)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
