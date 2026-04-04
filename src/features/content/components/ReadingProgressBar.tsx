"use client";

import { useEffect, useRef } from "react";
import { getClusterColor, type ClusterId } from "@/constants/cluster";

interface ReadingProgressBarProps {
  cluster: ClusterId;
}

export default function ReadingProgressBar({
  cluster,
}: ReadingProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const main = document.querySelector("main");
    if (!bar || !main) return;

    function handleScroll() {
      const { top, height } = main!.getBoundingClientRect();
      const scrollable = height - window.innerHeight;

      const progress =
        scrollable <= 0 ? 0 : Math.min(1, Math.max(0, -top / scrollable));

      bar!.style.transform = `scaleX(${progress})`;
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      className="sticky top-14 z-40 h-1 w-full bg-[var(--background)]"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left will-change-transform"
        style={{
          transform: "scaleX(0)",
          backgroundColor: getClusterColor(cluster),
        }}
      />
    </div>
  );
}
