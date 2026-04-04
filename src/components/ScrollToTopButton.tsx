"use client";

import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 200;

export default function ScrollToTopButton(): React.ReactElement {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleClick() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      data-testid="scroll-to-top"
      onClick={handleClick}
      aria-label="페이지 상단으로 이동"
      className={[
        "pointer-events-auto",
        "h-11 w-11 rounded-full",
        "bg-[var(--surface-elevated)] border border-[var(--border)]",
        "shadow-[var(--shadow-md)]",
        "flex items-center justify-center",
        "text-[var(--muted)] hover:text-[var(--foreground)]",
        "hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-lg)]",
        "transition-all duration-200",
        visible
          ? "opacity-100 scale-100"
          : "opacity-0 scale-90 pointer-events-none",
      ].join(" ")}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
