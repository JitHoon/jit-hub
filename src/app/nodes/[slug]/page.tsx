import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { GraphData } from "@/features/graph/types/graph";
import { getAllSlugs, getNodeBySlug } from "@/features/content/utils/pipeline";
import { buildConnectedNodes } from "@/features/content/utils/connected-nodes";
import ContentHeader from "@/features/content/components/ContentHeader";
import ConnectionTree from "@/features/content/components/ConnectionTree";
import MdxRenderer from "@/features/content/components/MdxRenderer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const node = getNodeBySlug(slug);

  if (!node) {
    return { title: "Not Found" };
  }

  const { title, tags } = node.frontmatter;

  return {
    title,
    description: tags.join(", "),
    openGraph: {
      title,
      description: tags.join(", "),
      type: "article",
    },
  };
}

export default async function NodePage({ params }: PageProps) {
  const { slug } = await params;
  const node = getNodeBySlug(slug);

  if (!node) {
    notFound();
  }

  const { title, cluster } = node.frontmatter;

  const graphDataPath = path.join(process.cwd(), "graph-data.json");
  const graphData = JSON.parse(
    fs.readFileSync(graphDataPath, "utf-8"),
  ) as GraphData;
  const nodeMap = new Map(
    graphData.nodes.map((n) => [n.id, { title: n.title, cluster: n.cluster }]),
  );
  const connectedNodes = buildConnectedNodes(node.frontmatter, nodeMap);

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <ContentHeader title={title} cluster={cluster} />
      {connectedNodes.length > 0 && (
        <div className="mt-4">
          <ConnectionTree
            currentTitle={title}
            currentCluster={cluster}
            nodes={connectedNodes}
          />
        </div>
      )}
      <div className="mt-8">
        <MdxRenderer source={node.content} />
      </div>
    </main>
  );
}
