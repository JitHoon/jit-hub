import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { GraphData } from "@/types/graph";
import { getAllSlugs, getNodeBySlug } from "@/features/content/utils/pipeline";
import { SITE_URL, SITE_NAME } from "@/constants/site";
import { buildConnectedNodes } from "@/features/content/utils/connected-nodes";
import { buildTechArticleJsonLd } from "@/features/content/utils/structured-data";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import HeaderNodeSearch from "@/components/HeaderNodeSearch";
import SiteFooter from "@/components/SiteFooter";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import ExpandIcon from "@/components/icons/ExpandIcon";
import ContentHeader from "@/features/content/components/ContentHeader";
import ConnectionTree from "@/features/content/components/ConnectionTree";
import HistoryBackButton from "@/features/content/components/HistoryBackButton";
import MdxRenderer from "@/features/content/components/MdxRenderer";
import ReadingProgressBar from "@/features/content/components/ReadingProgressBar";

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

  const description = tags.join(", ");

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/nodes/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${SITE_URL}/nodes/${slug}`,
      locale: "ko_KR",
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function NodePage({ params }: PageProps) {
  const { slug } = await params;
  const node = getNodeBySlug(slug);

  if (!node) {
    notFound();
  }

  const { title, cluster, tags } = node.frontmatter;
  const techArticleJsonLd = buildTechArticleJsonLd(slug, title, tags);

  const graphDataPath = path.join(process.cwd(), "graph-data.json");
  const graphData = JSON.parse(
    fs.readFileSync(graphDataPath, "utf-8"),
  ) as GraphData;
  const nodeMap = new Map(
    graphData.nodes.map((n) => [n.id, { title: n.title, cluster: n.cluster }]),
  );
  const connectedNodes = buildConnectedNodes(node.frontmatter, nodeMap);

  return (
    <div className="mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(techArticleJsonLd),
        }}
      />
      <SiteHeader>
        <HeaderNodeSearch nodes={graphData.nodes} />
      </SiteHeader>
      <ReadingProgressBar cluster={cluster} />
      <main className="px-6 py-12">
        <ContentHeader title={title} cluster={cluster} />
        <div className="mt-8">
          <MdxRenderer source={node.content} />
        </div>
        {connectedNodes.length > 0 && (
          <ConnectionTree
            currentTitle={title}
            currentCluster={cluster}
            nodes={connectedNodes}
            className="mt-10 border-t border-[var(--border)] pt-8"
            defaultOpen={true}
            linkMode="seo"
            backButtonPosition="bottom"
            backButton={
              <>
                <HistoryBackButton />
                <Link
                  href="/"
                  className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-[var(--muted)] transition-colors duration-fast hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
                >
                  <ExpandIcon size={12} />
                  <span>전체 노드</span>
                </Link>
              </>
            }
          />
        )}
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
