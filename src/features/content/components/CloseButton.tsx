"use client";

import XIcon from "@/components/icons/XIcon";

interface CloseButtonProps {
  onClick: () => void;
  "aria-label"?: string;
}

export default function CloseButton({
  onClick,
  "aria-label": ariaLabel = "패널 닫기",
}: CloseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex items-center justify-center rounded p-1.5 text-[var(--muted)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      <XIcon size={18} />
    </button>
  );
}
