"use client";

import { useEffect, useRef } from "react";
import SiteHeader from "@/components/SiteHeader";
import { GraphSection } from "@/features/graph/components/GraphSection";
import type { GraphData } from "@/features/graph/types/graph";

interface HomeLayoutProps {
  graphData: GraphData;
  contentSection?: React.ReactNode;
}

export default function HomeLayout({
  graphData,
  contentSection,
}: HomeLayoutProps): React.ReactElement {
  const hasContent = contentSection != null;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasContent) {
      contentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [hasContent]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <div className="h-[calc(100vh-56px)]">
          <GraphSection graphData={graphData} />
        </div>
        <div
          ref={contentRef}
          className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0,0,0.2,1)]"
          style={{ gridTemplateRows: hasContent ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">{contentSection}</div>
        </div>
      </main>
    </div>
  );
}
