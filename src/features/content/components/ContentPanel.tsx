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
  mounted: boolean;
  closing: boolean;
  bodyVisible: boolean;
}

export default function ContentPanel({
  title,
  cluster,
  difficulty,
  source,
  onClose,
  mounted,
  closing,
  bodyVisible,
}: ContentPanelProps) {
  const visibleClass = closing
    ? "translate-x-full opacity-0 transition-all duration-[300ms] ease-[cubic-bezier(0.4,0,1,1)]"
    : mounted
      ? "translate-x-0 opacity-100 transition-all duration-[400ms] delay-[100ms] ease-[cubic-bezier(0,0,0.2,1)]"
      : "translate-x-full opacity-0";

  return (
    <aside
      className={`flex flex-col h-full bg-[var(--surface-elevated)] shadow-[var(--shadow-lg)] border-l border-[var(--border)] ${visibleClass}`}
    >
      <PanelHeader
        title={title}
        cluster={cluster}
        difficulty={difficulty}
        onClose={onClose}
      />
      <div
        className={`flex-1 overflow-y-auto px-6 py-6 transition-opacity duration-[300ms] ${bodyVisible ? "opacity-100" : "opacity-0"}`}
      >
        <MdxRenderer source={source} />
      </div>
    </aside>
  );
}
