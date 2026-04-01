import type { ClusterId } from "@/constants/cluster";
import type { Difficulty } from "@/types/node";
import MdxRenderer from "./MdxRenderer";
import PanelHeader from "./PanelHeader";

interface ContentPanelProps {
  title: string;
  cluster: ClusterId;
  difficulty: Difficulty;
  source: string;
  onClose: () => void;
}

export default function ContentPanel({
  title,
  cluster,
  difficulty,
  source,
  onClose,
}: ContentPanelProps) {
  return (
    <aside className="flex flex-col h-full bg-[var(--surface-elevated)] shadow-[var(--shadow-lg)] border-l border-[var(--border)]">
      <PanelHeader
        title={title}
        cluster={cluster}
        difficulty={difficulty}
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <MdxRenderer source={source} />
      </div>
    </aside>
  );
}
