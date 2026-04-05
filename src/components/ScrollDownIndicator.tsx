"use client";

import { useEffect, useState, type RefObject } from "react";
import { cn } from "@/lib/cn";

interface ScrollDownIndicatorProps {
  targetRef: RefObject<HTMLElement | null>;
}

export default function ScrollDownIndicator({
  targetRef,
}: ScrollDownIndicatorProps): React.ReactElement {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisible(!entries[0]?.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef]);

  function handleClick() {
    targetRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="본문으로 스크롤"
      className={cn(
        "pointer-events-auto cursor-pointer",
        "flex flex-col items-center justify-center gap-0",
        "text-[var(--foreground)]",
        "transition-all duration-200",
        visible
          ? "opacity-70 translate-y-0"
          : "opacity-0 translate-y-2 pointer-events-none",
      )}
    >
      <svg
        width="24"
        height="14"
        viewBox="0 0 24 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="animate-[bounce-down-top_1.8s_ease-in-out_infinite]"
      >
        <polyline points="6 2 12 10 18 2" />
      </svg>
      <svg
        width="24"
        height="14"
        viewBox="0 0 24 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="animate-[bounce-down-bottom_1.8s_ease-in-out_infinite]"
      >
        <polyline points="6 2 12 10 18 2" />
      </svg>
    </button>
  );
}
