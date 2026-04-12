"use client";

import ExpandIcon from "@/components/icons/ExpandIcon";
import { useNodeSelection } from "@/hooks/useNodeSelection";

export default function BackToFullTreeButton(): React.ReactElement {
  const { clearSelection } = useNodeSelection();

  return (
    <button
      type="button"
      onClick={clearSelection}
      className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-1 text-xs text-[var(--muted)] transition-colors duration-fast hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
    >
      <ExpandIcon size={12} />
      <span>전체 노드</span>
    </button>
  );
}
