"use client";

import "./globals.css";
import ErrorCard from "@/components/error/ErrorCard";

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
  return (
    <html lang="ko">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans bg-background text-foreground">
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 text-center">
            <ErrorCard
              variant="fatal"
              title="예기치 않은 오류가 발생했습니다"
              description={error.digest ?? error.message}
              onRetry={reset}
            />
          </div>
        </div>
      </body>
    </html>
  );
}
