import type { ClusterId } from "@/constants/cluster";
import type { Difficulty } from "@/types/node";
import ContentHeader from "./ContentHeader";
import MdxRenderer from "./MdxRenderer";

interface ContentSectionProps {
  title: string;
  cluster: ClusterId;
  difficulty: Difficulty;
  mdxSource: string;
}

export default function ContentSection({
  title,
  cluster,
  difficulty,
  mdxSource,
}: ContentSectionProps) {
  return (
    <section className="px-6 py-8 max-w-3xl mx-auto w-full">
      <ContentHeader title={title} cluster={cluster} difficulty={difficulty} />
      <div className="mt-8">
        <MdxRenderer source={mdxSource} />
      </div>
    </section>
  );
}
