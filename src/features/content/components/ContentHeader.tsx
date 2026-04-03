import type { ClusterId } from "@/constants/cluster";
import type { Difficulty } from "@/types/node";
import ClusterBadge from "./ClusterBadge";
import DifficultyLabel from "./DifficultyLabel";

interface ContentHeaderProps {
  title: string;
  cluster: ClusterId;
  difficulty: Difficulty;
}

export default function ContentHeader({
  title,
  cluster,
  difficulty,
}: ContentHeaderProps) {
  return (
    <header className="flex flex-col gap-3 pb-6 border-b border-[var(--border)]">
      <div className="flex items-center gap-3">
        <ClusterBadge cluster={cluster} />
        <span className="text-[var(--border)]" aria-hidden="true">
          ·
        </span>
        <DifficultyLabel difficulty={difficulty} />
      </div>
      <h1 className="text-2xl font-semibold text-[var(--text)] leading-snug">
        {title}
      </h1>
    </header>
  );
}
