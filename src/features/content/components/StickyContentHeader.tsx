"use client";

import { useEffect, useRef } from "react";
import type { ClusterId } from "@/constants/cluster";
import ClusterBadge from "./ClusterBadge";

interface StickyContentHeaderProps {
  title: string;
  cluster: ClusterId;
}

export default function StickyContentHeader({
  title,
  cluster,
}: StickyContentHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty(
        "--sticky-content-h",
        `${h}px`,
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--sticky-content-h");
    };
  }, []);

  return (
    <div
      ref={ref}
      className="sticky top-[3.75rem] z-30 border-b border-[var(--border)] bg-[var(--background)]"
    >
      <div className="flex flex-col gap-3 pb-6 pt-2">
        <ClusterBadge cluster={cluster} />
        <h1 className="text-2xl font-semibold leading-snug text-[var(--foreground)]">
          {title}
        </h1>
      </div>
    </div>
  );
}
