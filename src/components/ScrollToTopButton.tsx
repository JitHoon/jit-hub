"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollToTopButtonProps {
  targetRef: React.RefObject<Element | null>;
}

export default function ScrollToTopButton({
  targetRef,
}: ScrollToTopButtonProps): React.ReactElement {
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observerRef.current.observe(target);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [targetRef]);

  function handleClick() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="페이지 상단으로 이동"
      className={[
        "fixed bottom-8 right-8 z-50",
        "h-11 w-11 rounded-full",
        "bg-[var(--surface-elevated)] border border-[var(--border)]",
        "shadow-[var(--shadow-md)]",
        "flex items-center justify-center",
        "text-[var(--muted)] hover:text-[var(--foreground)]",
        "hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-lg)]",
        "transition-all duration-200",
        visible
          ? "opacity-100 scale-100 pointer-events-auto"
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
