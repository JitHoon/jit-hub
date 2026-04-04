import type { ClusterId } from "@/constants/cluster";
import ContentHeader from "./ContentHeader";
import MdxRenderer from "./MdxRenderer";

interface ContentSectionProps {
  title: string;
  cluster: ClusterId;
  mdxSource: string;
}

export default function ContentSection({
  title,
  cluster,
  mdxSource,
}: ContentSectionProps) {
  return (
    <section className="px-6 py-8 max-w-3xl mx-auto w-full">
      <ContentHeader title={title} cluster={cluster} />
      <div className="mt-8">
        <MdxRenderer source={mdxSource} />
      </div>
    </section>
  );
}
