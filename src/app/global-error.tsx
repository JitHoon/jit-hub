"use client";

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
    <html lang="ko">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily: "sans-serif",
          background: "#0f0f0f",
          color: "#f0f0f0",
        }}
      >
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "28rem",
              borderRadius: "0.5rem",
              border: "1px solid #2a2a2a",
              background: "#1a1a1a",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                marginBottom: "0.5rem",
                fontSize: "1.25rem",
                fontWeight: "bold",
              }}
            >
              예기치 않은 오류가 발생했습니다
            </h1>
            {isDev && (error.digest ?? error.message) && (
              <p
                style={{
                  marginBottom: "1.5rem",
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  color: "#888",
                }}
              >
                {error.digest ?? error.message}
              </p>
            )}
            <button
              type="button"
              onClick={reset}
              style={{
                borderRadius: "0.25rem",
                background: "#0070f3",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
