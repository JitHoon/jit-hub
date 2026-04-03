import type { ClusterId } from "@/constants/cluster";
import type { Difficulty } from "@/types/node";
import PanelHeader from "./PanelHeader";

interface ContentPanelProps {
  title: string;
  cluster: ClusterId;
  difficulty: Difficulty;
  children: React.ReactNode;
  onClose: () => void;
  mounted: boolean;
  closing: boolean;
  bodyVisible: boolean;
}

export default function ContentPanel({
  title,
  cluster,
  difficulty,
  children,
  onClose,
  mounted,
  closing,
  bodyVisible,
}: ContentPanelProps) {
  const visibleClass = closing
    ? "opacity-0 transition-opacity duration-[250ms] ease-[cubic-bezier(0.4,0,1,1)]"
    : mounted
      ? "opacity-100 transition-opacity duration-[400ms] delay-[150ms] ease-[cubic-bezier(0,0,0.2,1)]"
      : "opacity-0";

  return (
    <aside className={`flex flex-col h-full bg-background ${visibleClass}`}>
      <PanelHeader
        title={title}
        cluster={cluster}
        difficulty={difficulty}
        onClose={onClose}
      />
      <div
        className={`flex-1 overflow-y-auto px-6 py-6 transition-opacity duration-[300ms] ${bodyVisible ? "opacity-100" : "opacity-0"}`}
      >
        {children}
      </div>
    </aside>
  );
}
