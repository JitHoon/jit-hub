import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { NodeSearch } from "@/features/graph/components/NodeSearch";
import type { GraphData } from "@/types/graph";
import InteractiveGraphZone from "./InteractiveGraphZone";

interface HomeLayoutProps {
  graphData: GraphData;
}

export default function HomeLayout({
  graphData,
}: HomeLayoutProps): React.ReactElement {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col">
      <SiteHeader>
        <NodeSearch nodes={graphData.nodes} />
      </SiteHeader>
      <main className="flex flex-1 flex-col pb-16">
        <div className="px-6 pt-6 text-center">
          <h1 className="font-display text-xl font-semibold text-[var(--foreground)]">
            GIS × Frontend
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Interactive 3D GIS Knowledge Graph
          </p>
        </div>
        <Suspense>
          <InteractiveGraphZone graphData={graphData} />
        </Suspense>
      </main>
      <SiteFooter />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
        <div className="mx-auto max-w-3xl px-6">
          <div className="flex justify-end pb-8">
            <ScrollToTopButton />
          </div>
        </div>
      </div>
    </div>
  );
}
