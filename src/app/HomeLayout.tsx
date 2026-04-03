"use client";

import SiteHeader from "@/components/SiteHeader";
import { GraphSection } from "@/features/graph/components/GraphSection";
import type { GraphData } from "@/features/graph/types/graph";

interface HomeLayoutProps {
  graphData: GraphData;
}

export default function HomeLayout({
  graphData,
}: HomeLayoutProps): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <GraphSection graphData={graphData} />
      </main>
    </div>
  );
}
