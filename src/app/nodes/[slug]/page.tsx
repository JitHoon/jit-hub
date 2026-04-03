import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllSlugs, getNodeBySlug } from "@/features/content/utils/pipeline";
import ContentHeader from "@/features/content/components/ContentHeader";
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

  const { title, cluster, difficulty } = node.frontmatter;

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <ContentHeader title={title} cluster={cluster} difficulty={difficulty} />
      <div className="mt-8">
        <MdxRenderer source={node.content} />
      </div>
    </main>
  );
}
