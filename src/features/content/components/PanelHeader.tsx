"use client";

import type { ClusterId } from "@/constants/cluster";
import type { Difficulty } from "@/types/node";
import ClusterBadge from "./ClusterBadge";
import CloseButton from "./CloseButton";
import DifficultyLabel from "./DifficultyLabel";

interface PanelHeaderProps {
  title: string;
  cluster: ClusterId;
  difficulty: Difficulty;
  onClose: () => void;
}

export default function PanelHeader({
  title,
  cluster,
  difficulty,
  onClose,
}: PanelHeaderProps) {
  return (
    <header className="flex flex-col gap-2 px-6 py-4 border-b border-[var(--border)]">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-lg font-semibold text-[var(--text)] leading-snug">
          {title}
        </h1>
        <CloseButton onClick={onClose} />
      </div>
      <div className="flex items-center gap-3">
        <ClusterBadge cluster={cluster} />
        <span className="text-[var(--border)]" aria-hidden="true">
          ·
        </span>
        <DifficultyLabel difficulty={difficulty} />
      </div>
    </header>
  );
}
