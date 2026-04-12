"use client";

import { useRouter } from "next/navigation";
import ChevronIcon from "@/components/icons/ChevronIcon";

export default function HistoryBackButton(): React.ReactElement {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-1 text-xs text-[var(--muted)] transition-colors duration-fast hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
    >
      <ChevronIcon size={12} className="rotate-90" />
      <span>뒤로 가기</span>
    </button>
  );
}
